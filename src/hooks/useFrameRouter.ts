/*
 *   IMPORTS
 ***************************************************************************************************/
import { useEffect, useCallback, useRef } from 'react'
import { useStateMachine } from '@bkincz/clutch'

/*
 *   SHARED
 ***************************************************************************************************/
import FrameState, { FRAME_EVENTS } from '@/state/frame.state'
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
	openFlow: (flow: string, stepKey?: string) => void
	closeFlow: () => void
	goBackInHistory: () => boolean
	setStep: (stepKey: string) => void
	nextStep: () => void
	previousStep: () => void
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
	const openFlowRef = useRef<(flow: string, stepKey?: string) => void>(() => {})
	const closeFlowRef = useRef<() => void>(() => {})
	const nextStepRef = useRef<() => void>(() => {})
	const previousStepRef = useRef<() => void>(() => {})
	const goBackRef = useRef<() => void>(() => {})

	/**
	 * Log debug messages
	 */
	const log = useCallback(
		(message: string, data?: unknown) => {
			if (debug) {
				console.log(`[FrameRouter] ${message}`, data || '')
			}
		},
		[debug]
	)

	/**
	 * Ensure flow definition is cached
	 */
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

	/**
	 * Open a flow and optionally update URL
	 */
	const openFlow = useCallback(
		(flow: string, stepKey?: string) => {
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
				FrameState.openFrame(flow, targetStepKey)
			}
		},
		[flowParam, stepParam, updateUrl, router, log, ensureFlowCached]
	)

	/**
	 * Close the flow and optionally update URL
	 */
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

	/**
	 * Set the current step and optionally update URL
	 */
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

	/**
	 * Advance to the next step
	 */
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
				customEventManager.emit(FRAME_EVENTS.NEXT_STEP, {
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

	/**
	 * Go back to the previous step
	 */
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
				customEventManager.emit(FRAME_EVENTS.PREVIOUS_STEP, {
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

	/**
	 * Go back to previous flow in history
	 */
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

	// Update refs with latest callbacks
	openFlowRef.current = openFlow
	closeFlowRef.current = closeFlow
	nextStepRef.current = nextStep
	previousStepRef.current = previousStep
	goBackRef.current = goBackInHistory

	/**
	 * Watch URL query params and sync with frame state
	 */
	useEffect(() => {
		const flowValue = router.params[flowParam] || null
		const stepValue = router.params[stepParam] || null

		// Skip if params haven't changed
		if (
			flowValue === lastProcessedParams.current.flow &&
			stepValue === lastProcessedParams.current.step
		) {
			return
		}

		lastProcessedParams.current = { flow: flowValue, step: stepValue }

		log('Query params changed', { flowValue, stepValue })

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

			// Open the flow with the specified step key
			FrameState.openFrame(flowValue, stepKey)
		} else {
			// No flow param - close the frame if it's open
			if (frameState.isOpen) {
				FrameState.closeFrame()
			}
		}
	}, [
		router,
		router.params,
		flowParam,
		stepParam,
		updateUrl,
		frameState.isOpen,
		log,
		ensureFlowCached,
	])

	/**
	 * Listen for custom events to open/navigate frame
	 * Using refs to avoid recreating subscriptions on every render
	 * Note: frame:request:close is handled in FrameContainer to trigger exit animation
	 */
	useEffect(() => {
		const openSubscription = customEventManager.subscribe<{
			flow: string
			stepKey?: string
			chain?: boolean
		}>('frame:request:open', (data: { flow: string; stepKey?: string; chain?: boolean }) => {
			openFlowRef.current(data.flow, data.stepKey)
		})

		const nextSubscription = customEventManager.subscribe('frame:request:next', () => {
			nextStepRef.current()
		})

		const previousSubscription = customEventManager.subscribe('frame:request:previous', () => {
			previousStepRef.current()
		})

		const backSubscription = customEventManager.subscribe('frame:request:back', () => {
			goBackRef.current()
		})

		return () => {
			openSubscription.unsubscribe()
			nextSubscription.unsubscribe()
			previousSubscription.unsubscribe()
			backSubscription.unsubscribe()
		}
	}, [])

	return {
		isOpen: frameState.isOpen,
		currentFlow: frameState.currentFlow,
		currentStepKey: frameState.currentStepKey,
		hasHistory: frameState.flowHistory.length > 0,
		openFlow,
		closeFlow,
		goBackInHistory,
		setStep,
		nextStep,
		previousStep,
	}
}
