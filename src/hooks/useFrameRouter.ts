/*
 *   IMPORTS
 ***************************************************************************************************/
import { useEffect, useCallback, useRef } from 'react'
import { useStateMachine } from '@bkincz/clutch'

/*
 *   SHARED
 ***************************************************************************************************/
import FrameState from '@/state/frame.state'
import AnimationState from '@/state/animation.state'
import { flowExists, createFlowDefinition } from '@/core/frame.functions'

import { customEventManager } from '@/lib/event'
import { useRouter } from '@/lib/router'

/*
 *   TYPES
 ***************************************************************************************************/
export interface FrameRouterConfig {
	flowParam?: string
	stepParam?: string
	updateUrl?: boolean
	debug?: boolean
}

interface FrameRouterReturn {
	isOpen: boolean
	currentFlow: string | null
	currentStepKey: string | null
	hasHistory: boolean
	hasStepHistory: boolean
	openFlow: (flow: string, stepKey?: string, params?: Record<string, unknown>) => void
	closeFlow: () => void
	goBackInHistory: () => boolean
	goBackInStepHistory: () => boolean
	setStep: (stepKey: string) => void
	nextStep: () => void
	previousStep: () => void
	goToStep: (stepKey: string) => void
}

/*
 *   HOOK
 ***************************************************************************************************/
export function useFrameRouter(config: FrameRouterConfig = {}): FrameRouterReturn {
	const { flowParam = 'flow', stepParam = 'step', updateUrl = true, debug = false } = config

	// Use the new router hook
	const router = useRouter({
		params: [flowParam, stepParam],
		debug,
	})

	// Subscribe to frame state
	const { state: frameState } = useStateMachine(FrameState)
	const lastProcessedParams = useRef<{ flow: string | null; step: string | null }>({
		flow: null,
		step: null,
	})

	// Refs to store latest callbacks for event listeners
	const openFlowRef = useRef<
		(flow: string, stepKey?: string, params?: Record<string, unknown>) => void
	>(() => {})
	const closeFlowRef = useRef<() => void>(() => {})
	const nextStepRef = useRef<() => void>(() => {})
	const previousStepRef = useRef<() => void>(() => {})
	const goBackRef = useRef<() => void>(() => {})
	const goToStepRef = useRef<(stepKey: string) => void>(() => {})

	const log = useCallback(
		(message: string, data?: unknown) => {
			if (debug) {
				console.log(`[FrameRouter] ${message}`, data || '')
			}
		},
		[debug]
	)

	const ensureFlowCached = useCallback(
		(flowName: string): boolean => {
			// Check if already cached
			if (FrameState.getFlowDefinition(flowName)) {
				return true
			}

			// Create and cache flow definition
			const flowDef = createFlowDefinition(flowName)
			if (!flowDef) {
				console.error(`[FrameRouter] Cannot cache flow "${flowName}": definition not found`)
				return false
			}

			FrameState.cacheFlowDefinition(flowName, flowDef)
			log('Flow cached', { flowName })
			return true
		},
		[log]
	)

	const openFlow = useCallback(
		(flow: string, stepKey?: string, params?: Record<string, unknown>) => {
			if (!flowExists(flow)) {
				console.error(`[FrameRouter] Flow "${flow}" does not exist in registry`)
				return
			}

			// Ensure flow is cached before opening
			if (!ensureFlowCached(flow)) {
				return
			}

			log('Opening flow', { flow, stepKey })

			// Get flow definition to determine step index for URL
			const flowDef = FrameState.getFlowDefinition(flow)
			if (!flowDef) return

			const stepKeys = Object.keys(flowDef.flow)
			const targetStepKey = stepKey || stepKeys[0]
			const stepIndex = stepKeys.indexOf(targetStepKey)

			// Update URL if enabled - use numeric index for URL compatibility
			if (updateUrl) {
				router.updateParams({
					[flowParam]: flow,
					[stepParam]: String(stepIndex + 1), // 1-based for URL
				})
			} else {
				// If not syncing URL, update state directly
				FrameState.openFrame(flow, targetStepKey, undefined, undefined, params)
			}
		},
		[flowParam, stepParam, updateUrl, router, log, ensureFlowCached]
	)

	const closeFlow = useCallback(() => {
		log('Closing flow')

		// Update URL if enabled - this will trigger the query param watcher
		// which will then close the frame state
		if (updateUrl) {
			router.clearParams([flowParam, stepParam])
		} else {
			// If not syncing URL, close state directly
			FrameState.closeFrame()
		}
	}, [flowParam, stepParam, updateUrl, router, log])

	const setStep = useCallback(
		(stepKey: string) => {
			const { currentFlow } = frameState
			const stepKeys = FrameState.selectStepKeys()

			if (!currentFlow) {
				console.warn('[FrameRouter] Cannot set step: no flow is currently active')
				return
			}

			if (!stepKeys.includes(stepKey)) {
				console.warn(
					`[FrameRouter] Invalid step key "${stepKey}" for flow "${currentFlow}". Ignoring.`
				)
				return
			}

			log('Setting step', { stepKey })

			const stepIndex = stepKeys.indexOf(stepKey)

			// Update URL if enabled - use numeric index for URL
			if (updateUrl) {
				router.setParam(stepParam, String(stepIndex + 1)) // 1-based for URL
			} else {
				// If not syncing URL, update state directly
				FrameState.setStepKey(stepKey)
			}
		},
		[frameState, stepParam, updateUrl, router, log]
	)

	const nextStep = useCallback(() => {
		// Check if frame is currently animating
		if (AnimationState.selectIsAnimating()) {
			if (debug) console.log('[FrameRouter] Skipping next step - frame is animating')
			return
		}

		if (updateUrl) {
			// When URL syncing is enabled, emit event then update URL
			const currentStepIndex = FrameState.selectCurrentStepIndex()
			const stepKeys = FrameState.selectStepKeys()
			const { currentFlow, currentStepKey } = FrameState.getState()

			if (currentStepIndex < stepKeys.length - 1 && currentFlow && currentStepKey) {
				const nextStepKey = stepKeys[currentStepIndex + 1]

				// Emit navigation event before URL change
				customEventManager.emit('frame:navigation:next', {
					flow: currentFlow,
					fromStepKey: currentStepKey,
					toStepKey: nextStepKey,
				})

				router.setParam(stepParam, String(currentStepIndex + 2)) // +2 because 1-based and +1 for next
			}
		} else {
			// When URL syncing is disabled, update state directly
			FrameState.nextStep()
		}
	}, [stepParam, updateUrl, router, debug])

	const previousStep = useCallback(() => {
		// Check if frame is currently animating
		if (AnimationState.selectIsAnimating()) {
			if (debug) console.log('[FrameRouter] Skipping previous step - frame is animating')
			return
		}

		if (updateUrl) {
			// When URL syncing is enabled, emit event then update URL
			const currentStepIndex = FrameState.selectCurrentStepIndex()
			const stepKeys = FrameState.selectStepKeys()
			const { currentFlow, currentStepKey } = FrameState.getState()

			if (currentStepIndex > 0 && currentFlow && currentStepKey) {
				const prevStepKey = stepKeys[currentStepIndex - 1]

				// Emit navigation event before URL change
				customEventManager.emit('frame:navigation:previous', {
					flow: currentFlow,
					fromStepKey: currentStepKey,
					toStepKey: prevStepKey,
				})

				router.setParam(stepParam, String(currentStepIndex)) // currentStepIndex is already 0-based, so no -1 needed for 1-based URL
			}
		} else {
			// When URL syncing is disabled, update state directly
			FrameState.previousStep()
		}
	}, [stepParam, updateUrl, router, debug])

	const goBackInHistory = useCallback(() => {
		const didGoBack = FrameState.goBackInHistory()

		if (didGoBack && updateUrl) {
			// Update URL to reflect the flow/step we went back to
			const { currentFlow, currentStepKey } = FrameState.getState()
			if (currentFlow && currentStepKey) {
				const flowDef = FrameState.getFlowDefinition(currentFlow)
				if (flowDef) {
					const stepKeys = Object.keys(flowDef.flow)
					const stepIndex = stepKeys.indexOf(currentStepKey)
					router.updateParams({
						[flowParam]: currentFlow,
						[stepParam]: String(stepIndex + 1),
					})
				}
			}
		}

		return didGoBack
	}, [updateUrl, router, flowParam, stepParam])

	const goToStep = useCallback(
		(stepKey: string) => {
			// Check if frame is currently animating
			if (AnimationState.selectIsAnimating()) {
				if (debug) console.log('[FrameRouter] Skipping go to step - frame is animating')
				return
			}

			const { currentFlow } = FrameState.getState()
			const stepKeys = FrameState.selectStepKeys()

			if (!currentFlow) {
				console.warn('[FrameRouter] Cannot go to step: no flow is currently active')
				return
			}

			if (!stepKeys.includes(stepKey)) {
				console.warn(
					`[FrameRouter] Invalid step key "${stepKey}" for flow "${currentFlow}". Ignoring.`
				)
				return
			}

			log('Going to step', { stepKey })

			// goToStep handles history tracking internally
			FrameState.goToStep(stepKey)

			// Update URL if enabled
			if (updateUrl) {
				const stepIndex = stepKeys.indexOf(stepKey)
				router.setParam(stepParam, String(stepIndex + 1))
			}
		},
		[stepParam, updateUrl, router, log, debug]
	)

	const goBackInStepHistory = useCallback(() => {
		const didGoBack = FrameState.goBackInStepHistory()

		if (didGoBack && updateUrl) {
			// Update URL to reflect the step we went back to
			const { currentStepKey } = FrameState.getState()
			const stepKeys = FrameState.selectStepKeys()
			if (currentStepKey) {
				const stepIndex = stepKeys.indexOf(currentStepKey)
				router.setParam(stepParam, String(stepIndex + 1))
			}
		}

		return didGoBack
	}, [updateUrl, router, stepParam])

	// Update refs with latest callbacks
	openFlowRef.current = openFlow
	closeFlowRef.current = closeFlow
	nextStepRef.current = nextStep
	previousStepRef.current = previousStep
	goBackRef.current = goBackInHistory
	goToStepRef.current = goToStep

	useEffect(() => {
		const flowValue = router.params[flowParam] || null
		const stepValue = router.params[stepParam] || null
		const isBrowserNav = router.isBrowserNavigating()

		log('URL params effect triggered', { flowValue, stepValue, isBrowserNav })

		// Skip if params haven't changed
		if (
			flowValue === lastProcessedParams.current.flow &&
			stepValue === lastProcessedParams.current.step
		) {
			log('Skipping - params unchanged')
			return
		}

		lastProcessedParams.current = { flow: flowValue, step: stepValue }

		log('Processing query params change', {
			flowValue,
			stepValue,
			source: isBrowserNav ? 'browser navigation' : 'programmatic',
		})

		// If flow param is present
		if (flowValue) {
			// Validate flow exists
			if (!flowExists(flowValue)) {
				console.error(`[FrameRouter] Flow "${flowValue}" not found in registry. Ignoring.`)
				// Clear the invalid params from URL
				if (updateUrl) {
					router.clearParams([flowParam, stepParam])
				}
				return
			}

			// Ensure flow is cached
			if (!ensureFlowCached(flowValue)) {
				return
			}

			// Get flow definition to convert numeric step to step key
			const flowDef = FrameState.getFlowDefinition(flowValue)
			if (!flowDef) return

			const stepKeys = Object.keys(flowDef.flow)
			const parsedStepIndex = stepValue ? parseInt(stepValue, 10) - 1 : 0 // Convert 1-based to 0-based
			const stepIndex = isNaN(parsedStepIndex)
				? 0
				: Math.max(0, Math.min(parsedStepIndex, stepKeys.length - 1))
			const stepKey = stepKeys[stepIndex]

			log('Opening frame from URL', { flow: flowValue, stepKey, skipAnimation: isBrowserNav })

			// Open the flow with the specified step key
			// Skip animations for browser navigation for instant updates
			FrameState.openFrame(flowValue, stepKey, undefined, isBrowserNav)

			// Consume the browser navigation flag after using it
			if (isBrowserNav) {
				router.consumeBrowserNavigation()
			}
		} else {
			// No flow param - close the frame if it's open
			if (frameState.isOpen) {
				log('Closing frame - no flow param')
				FrameState.closeFrame()
			}
		}
		// eslint-disable-next-line
	}, [router.params, flowParam, stepParam, updateUrl, frameState.isOpen, log, ensureFlowCached])

	// Note: frame:request:close is handled in FrameContainer to trigger exit animation
	useEffect(() => {
		const openSubscription = customEventManager.subscribe<{
			flow: string
			stepKey?: string
			chain?: boolean
		}>(
			'frame:request:open',
			(data: {
				flow: string
				stepKey?: string
				chain?: boolean
				params?: Record<string, unknown>
			}) => {
				openFlowRef.current(data.flow, data.stepKey, data.params)
			}
		)

		const nextSubscription = customEventManager.subscribe('frame:request:next', () => {
			nextStepRef.current()
		})

		const previousSubscription = customEventManager.subscribe('frame:request:previous', () => {
			previousStepRef.current()
		})

		const backSubscription = customEventManager.subscribe('frame:request:back', () => {
			goBackRef.current()
		})

		const goToStepSubscription = customEventManager.subscribe<{ stepKey: string }>(
			'frame:request:go-to-step',
			(data: { stepKey: string }) => {
				goToStepRef.current(data.stepKey)
			}
		)

		return () => {
			openSubscription.unsubscribe()
			nextSubscription.unsubscribe()
			previousSubscription.unsubscribe()
			backSubscription.unsubscribe()
			goToStepSubscription.unsubscribe()
		}
	}, [])

	return {
		isOpen: frameState.isOpen,
		currentFlow: frameState.currentFlow,
		currentStepKey: frameState.currentStepKey,
		hasHistory: frameState.flowHistory.length > 0,
		hasStepHistory: frameState.stepHistory.length > 0,
		openFlow,
		closeFlow,
		goBackInHistory,
		goBackInStepHistory,
		setStep,
		nextStep,
		previousStep,
		goToStep,
	}
}
