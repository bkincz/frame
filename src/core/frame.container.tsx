/*
 *   IMPORTS
 ***************************************************************************************************/
import { useEffect, useCallback, useRef, useState } from 'react'
import { useStateSlice } from '@bkincz/clutch'

/*
 *   SHARED
 ***************************************************************************************************/
import { Frame } from './frame.component'
import { useFrameRouter } from '@/hooks/useFrameRouter'
import { useFrameAnimations } from '@/hooks/useFrameAnimations'
import FrameState from '@/state/frame.state'
import StepState from '@/state/step.state'
import { customEventManager } from '@/lib/event'

/*
 *   TYPES
 ***************************************************************************************************/
export interface FrameContainerProps {
	debug?: boolean
}

/*
 *   FRAME CONTAINER
 *   Smart component that orchestrates the frame routing and rendering
 ***************************************************************************************************/
export function FrameContainer({ debug = false }: FrameContainerProps) {
	const { isOpen, currentFlow, currentStepKey, closeFlow } = useFrameRouter({
		debug,
	})

	// Subscribe to frame init state
	const hasFrameInit = useStateSlice(FrameState, state => state.hasFrameInit)

	// Refs for animation
	const overlayRef = useRef<HTMLDivElement | null>(null)
	const contentRef = useRef<HTMLDivElement | null>(null)
	const stepWrapperRef = useRef<HTMLDivElement | null>(null)

	// Track the current rendered step and flow for transitions
	const [renderedStepKey, setRenderedStepKey] = useState<string | null>(currentStepKey)
	const [renderedFlow, setRenderedFlow] = useState<string | null>(currentFlow)
	const [flowOpenCount, setFlowOpenCount] = useState(0)

	// Animation hook
	const { animateFrameEntrance, animateFrameExit, animateFlowTransition } = useFrameAnimations(
		stepWrapperRef,
		overlayRef,
		contentRef,
		{
			debug,
			onStepChange: setRenderedStepKey,
			onFlowChange: (flowName, stepKey) => {
				setRenderedFlow(flowName)
				if (stepKey) setRenderedStepKey(stepKey)
			},
		}
	)

	// Get flow definition from state cache
	// Use currentFlow for definition lookup (that's what's cached)
	// But use renderedFlow/renderedStepKey for determining what to display
	const currentFlowDefinition = currentFlow ? FrameState.getFlowDefinition(currentFlow) : null
	const renderedFlowDefinition = renderedFlow ? FrameState.getFlowDefinition(renderedFlow) : null

	// Use rendered flow definition for display, fall back to current if not available
	const flowDefinition = renderedFlowDefinition || currentFlowDefinition

	// Get current step (use renderedStepKey for smooth transitions)
	const currentStep =
		flowDefinition && renderedStepKey ? flowDefinition.flow[renderedStepKey] : null

	// Determine variant (step config > flow config > default 'fullscreen')
	const variant = currentStep?.config?.variant || flowDefinition?.config?.variant || 'fullscreen'
	const showOverlay = variant === 'modal'

	// Determine if sidebar should be shown (step config > flow config > default true)
	const sidebarConfig = currentStep?.config?.sidebar ?? flowDefinition?.config?.sidebar ?? true
	const showSidebar = sidebarConfig !== false

	/**
	 * Handle flow lifecycle: onEnter when flow opens
	 */
	useEffect(() => {
		if (!isOpen || !currentFlow || !flowDefinition) {
			return
		}

		// Check if flow already entered via selector
		const isFlowEntered = FrameState.selectIsFlowEntered(currentFlow)

		if (isFlowEntered) {
			return
		}

		const runFlowEnter = async () => {
			if (flowDefinition.onEnter) {
				try {
					await flowDefinition.onEnter()
					FrameState.markFlowEntered(currentFlow)
				} catch (error) {
					console.error(`[FrameContainer] Error in flow onEnter:`, error)
				}
			} else {
				FrameState.markFlowEntered(currentFlow)
			}
		}

		runFlowEnter()
	}, [isOpen, currentFlow, flowDefinition])

	/**
	 * Handle flow lifecycle: onExit when flow closes
	 */
	useEffect(() => {
		return () => {
			if (!currentFlow || !flowDefinition?.onExit) return

			// Check if flow was entered via selector
			const isFlowEntered = FrameState.selectIsFlowEntered(currentFlow)

			// Only call onExit if the flow was entered
			if (isFlowEntered) {
				const runFlowExit = async () => {
					try {
						if (flowDefinition.onExit) {
							await flowDefinition.onExit()
						}
						FrameState.markFlowExited(currentFlow)
					} catch (error) {
						console.error(`[FrameContainer] Error in flow onExit:`, error)
					}
				}

				runFlowExit()
			}
		}
	}, [currentFlow, flowDefinition])

	/**
	 * Handle step lifecycle: onEnter when step changes
	 */
	useEffect(() => {
		if (!currentStepKey) return

		// Get fresh step from state on each run
		const step = flowDefinition?.flow[currentStepKey]
		if (!step) return

		const runStepEnter = async () => {
			if (step.onEnter) {
				try {
					StepState.startEntering()
					await step.onEnter()
					FrameState.markStepEntered()
					StepState.endEntering()
				} catch (error) {
					console.error(`[FrameContainer] Error in step onEnter:`, error)
					StepState.endEntering()
				}
			}
		}

		runStepEnter()

		// Handle step lifecycle: onExit when step unmounts
		return () => {
			const runStepExit = async () => {
				if (step.onExit) {
					try {
						StepState.startExiting()
						await step.onExit()
						FrameState.markStepExited()
						StepState.endExiting()
					} catch (error) {
						console.error(`[FrameContainer] Error in step onExit:`, error)
						StepState.endExiting()
					}
				}
			}

			runStepExit()
		}
		// Only depend on currentStepKey - prevents re-runs if flow definition reference changes
		// flowDefinition is cached and stable, so accessing it inside effect is safe
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStepKey])

	/**
	 * Handle frame entrance animation
	 */
	useEffect(() => {
		if (!isOpen) return

		const cleanup = animateFrameEntrance(variant)
		return cleanup
	}, [isOpen, variant, animateFrameEntrance])

	/**
	 * Track flow changes to detect reopens
	 */
	const previousFlowRef = useRef<string | null>(null)

	useEffect(() => {
		// Detect when flow actually changes or reopens (not just step changes)
		if (currentFlow && currentFlow !== previousFlowRef.current) {
			setFlowOpenCount(prev => prev + 1)
			previousFlowRef.current = currentFlow
		} else if (!currentFlow && previousFlowRef.current) {
			// Flow closed, reset the previous flow and count
			previousFlowRef.current = null
			setFlowOpenCount(0)
		}
	}, [currentFlow])

	/**
	 * Handle flow transitions with fade and scale animation
	 */
	useEffect(() => {
		// Only sync without animation if one of them is null (initial open or close)
		const isInitialOpen = !renderedFlow && currentFlow
		const isClosing = renderedFlow && !currentFlow

		if (isInitialOpen || isClosing) {
			if (debug) {
				console.log('[FrameContainer] Flow state sync (no animation):', {
					from: renderedFlow,
					to: currentFlow,
					reason: isInitialOpen ? 'initial open' : 'closing',
				})
			}
			setRenderedFlow(currentFlow)
			setRenderedStepKey(currentStepKey)
			return
		}

		// Don't run transition animations until frame has been initialized
		if (!hasFrameInit) return

		// Detect flow change or same-flow reopen (after initialization)
		const isFlowChange = currentFlow && renderedFlow && currentFlow !== renderedFlow
		const isSameFlowReopen = currentFlow && renderedFlow === currentFlow && flowOpenCount > 1

		if (isFlowChange || isSameFlowReopen) {
			if (debug) {
				console.log('[FrameContainer] Flow transition triggered:', {
					type: isFlowChange ? 'flow change' : 'same flow reopen',
					from: renderedFlow,
					to: currentFlow,
				})
			}

			// Use hook to animate flow transition
			animateFlowTransition(currentFlow, currentStepKey)
		}
	}, [currentFlow, renderedFlow, currentStepKey, flowOpenCount, hasFrameInit, debug, animateFlowTransition])

	/**
	 * Trigger close with animation
	 */
	const triggerClose = useCallback(() => {
		animateFrameExit(closeFlow)
	}, [animateFrameExit, closeFlow])

	/**
	 * Handle frame:request:close event to trigger animated close
	 */
	useEffect(() => {
		if (!isOpen) return

		const closeSubscription = customEventManager.subscribe('frame:request:close', () => {
			triggerClose()
		})

		return () => {
			closeSubscription.unsubscribe()
		}
	}, [isOpen, triggerClose])

	/**
	 * Handle keyboard events
	 */
	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				triggerClose()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, triggerClose])

	/**
	 * Handle background overlay click
	 */
	const handleOverlayClick = useCallback(() => {
		triggerClose()
	}, [triggerClose])

	/**
	 * Prevent clicks inside content from closing
	 */
	const handleContentClick = useCallback((event: React.MouseEvent) => {
		event.stopPropagation()
	}, [])

	// Don't render if not open
	if (!isOpen || !currentFlow) {
		return null
	}

	// Flow not found in cache
	if (!flowDefinition) {
		console.error(`[FrameContainer] Flow "${currentFlow}" not found in state cache`)
		return null
	}

	// No valid step key
	if (!currentStepKey) {
		console.error(`[FrameContainer] No valid step key in flow "${currentFlow}"`)
		return null
	}

	return (
		<Frame>
			{showOverlay && <Frame.Overlay ref={overlayRef} onClick={handleOverlayClick} />}
			<Frame.Content
				ref={contentRef}
				onClick={handleContentClick}
				data-step-key={renderedStepKey || ''}
				variant={variant}
			>
				<Frame.Close />
				<Frame.Grid className={!showSidebar ? 'noSidebar' : undefined}>
					<Frame.Main ref={stepWrapperRef}>
						{currentStep ? (
							<>
								{currentStep.heading && (
									<Frame.Heading>{currentStep.heading}</Frame.Heading>
								)}
								{currentStep.subheading && (
									<Frame.Subheading>{currentStep.subheading}</Frame.Subheading>
								)}
								<Frame.Step step={currentStep} />
							</>
						) : (
							<Frame.NotFound stepKey={renderedStepKey || ''} />
						)}
					</Frame.Main>
					{showSidebar && <Frame.Sidebar />}
					<Frame.Navigation />
				</Frame.Grid>
			</Frame.Content>
		</Frame>
	)
}
