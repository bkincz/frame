/*
 *   IMPORTS
 ***************************************************************************************************/
import { useEffect, useCallback, useRef } from 'react'

/*
 *   SHARED
 ***************************************************************************************************/
import { Frame } from './frame.component'
import {
	animateFrameIn,
	animateFrameOut,
	animateFullFrameIn,
	animateFullFrameOut,
} from './frame.animations'

import { useFrameRouter } from '@/hooks/useFrameRouter'
import FrameState from '@/state/frame.state'

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

	// Refs for animation
	const overlayRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const isAnimatingOut = useRef(false)

	// Get flow definition from state cache
	const flowDefinition = currentFlow ? FrameState.getFlowDefinition(currentFlow) : null

	// Get current step
	const currentStep =
		flowDefinition && currentStepKey ? flowDefinition.flow[currentStepKey] : null

	// Determine variant (step config > flow config > default 'fullscreen')
	const variant = currentStep?.config?.variant || flowDefinition?.config?.variant || 'fullscreen'
	const showOverlay = variant === 'modal'

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
					await step.onEnter()
					FrameState.markStepEntered()
				} catch (error) {
					console.error(`[FrameContainer] Error in step onEnter:`, error)
				}
			}
		}

		runStepEnter()

		// Handle step lifecycle: onExit when step unmounts
		return () => {
			const runStepExit = async () => {
				if (step.onExit) {
					try {
						await step.onExit()
						FrameState.markStepExited()
					} catch (error) {
						console.error(`[FrameContainer] Error in step onExit:`, error)
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
		if (!isOpen || !contentRef.current) return

		// For modal variant, wait for overlay ref to be ready
		if (variant === 'modal' && !overlayRef.current) return

		// Set animating state
		FrameState.setAnimating(true)

		// Animate in - only animate overlay if it exists (modal variant)
		const timeline = overlayRef.current
			? animateFullFrameIn(overlayRef.current, contentRef.current)
			: animateFrameIn(contentRef.current)

		timeline.eventCallback('onComplete', () => {
			FrameState.setAnimating(false)
		})

		return () => {
			timeline.kill()
		}
	}, [isOpen, variant])

	/**
	 * Trigger close with animation
	 */
	const triggerClose = useCallback(() => {
		if (isAnimatingOut.current || !contentRef.current) return

		isAnimatingOut.current = true
		FrameState.setAnimating(true)

		// Animate out - only animate overlay if it exists (modal variant)
		const timeline = overlayRef.current
			? animateFullFrameOut(overlayRef.current, contentRef.current)
			: animateFrameOut(contentRef.current)

		timeline.eventCallback('onComplete', () => {
			isAnimatingOut.current = false
			FrameState.setAnimating(false)
			closeFlow()
		})
	}, [closeFlow])

	/**
	 * Handle keyboard events
	 */
	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (event: KeyboardEvent) => {
			// ESC key to close with animation
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
				data-step-key={currentStepKey}
				variant={variant}
			>
				<Frame.Close />
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
					<Frame.NotFound stepKey={currentStepKey} />
				)}
			</Frame.Content>
		</Frame>
	)
}
