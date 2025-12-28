/*
 *   IMPORTS
 ***************************************************************************************************/
import { useEffect, useCallback, type RefObject } from 'react'

/*
 *   SHARED
 ***************************************************************************************************/
import {
	animateFrameIn,
	animateFrameOut,
	animateFullFrameIn,
	animateFullFrameOut,
	animateStepIn,
	animateStepOut,
	animateFlowIn,
	animateFlowOut,
} from '@/core/frame.animations'
import AnimationState from '@/state/animation.state'
import FrameState from '@/state/frame.state'
import { customEventManager } from '@/lib/event'
import type { FrameNextStepEventData, FramePreviousStepEventData } from '@/state/frame.state'

/*
 *   TYPES
 ***************************************************************************************************/
export interface UseFrameAnimationsConfig {
	debug?: boolean
	onStepChange: (stepKey: string) => void
	onFlowChange: (flowName: string | null, stepKey: string | null) => void
}

export interface UseFrameAnimationsReturn {
	isAnimating: boolean
	animateFrameEntrance: (variant: 'modal' | 'fullscreen') => (() => void) | undefined
	animateFrameExit: (onComplete: () => void) => void
	animateFlowTransition: (flowName: string | null, stepKey: string | null) => void
}

/*
 *   HOOK
 ***************************************************************************************************/
export function useFrameAnimations(
	stepWrapperRef: RefObject<HTMLDivElement | null>,
	overlayRef: RefObject<HTMLDivElement | null>,
	contentRef: RefObject<HTMLDivElement | null>,
	config: UseFrameAnimationsConfig
): UseFrameAnimationsReturn {
	const { debug = false, onStepChange, onFlowChange } = config

	/**
	 * Handle step transition animations
	 */
	const animateStepTransition = useCallback(
		(
			data: FrameNextStepEventData | FramePreviousStepEventData,
			direction: 'forward' | 'backward'
		) => {
			if (!stepWrapperRef.current) {
				if (debug) console.log('[useFrameAnimations] No step wrapper ref')
				return
			}

			// Try to start animation
			if (!AnimationState.startAnimation('step', direction)) {
				if (debug)
					console.log('[useFrameAnimations] Skipping step animation - already animating')
				return
			}

			if (debug) console.log(`[useFrameAnimations] Animating step ${direction}:`, data)

			// Animate current step out
			const exitTimeline = animateStepOut(stepWrapperRef.current, direction)

			exitTimeline.eventCallback('onComplete', () => {
				// Update rendered step after exit animation
				onStepChange(data.toStepKey)

				// Animate new step in on next tick (after DOM updates)
				requestAnimationFrame(() => {
					if (stepWrapperRef.current) {
						const enterTimeline = animateStepIn(stepWrapperRef.current, direction)
						enterTimeline.eventCallback('onComplete', () => {
							AnimationState.endAnimation()
							if (debug)
								console.log(`[useFrameAnimations] ${direction} animation complete`)
						})
					} else {
						AnimationState.endAnimation()
					}
				})
			})
		},
		[stepWrapperRef, onStepChange, debug]
	)

	/**
	 * Handle flow transition animations
	 */
	const animateFlowTransition = useCallback(
		(flowName: string | null, stepKey: string | null) => {
			if (!stepWrapperRef.current) {
				if (debug)
					console.log('[useFrameAnimations] No step wrapper ref for flow transition')
				return
			}

			// Try to start animation
			if (!AnimationState.startAnimation('flow')) {
				if (debug)
					console.log('[useFrameAnimations] Skipping flow animation - already animating')
				return
			}

			if (debug)
				console.log('[useFrameAnimations] Animating flow transition:', {
					flowName,
					stepKey,
				})

			// Animate current flow out
			const exitTimeline = animateFlowOut(stepWrapperRef.current)

			exitTimeline.eventCallback('onComplete', () => {
				// Update rendered flow and step after exit animation
				onFlowChange(flowName, stepKey)

				// Animate new flow in on next tick (after DOM updates)
				requestAnimationFrame(() => {
					if (stepWrapperRef.current) {
						const enterTimeline = animateFlowIn(stepWrapperRef.current)
						enterTimeline.eventCallback('onComplete', () => {
							AnimationState.endAnimation()
							if (debug) console.log('[useFrameAnimations] Flow transition complete')
						})
					} else {
						AnimationState.endAnimation()
					}
				})
			})
		},
		[stepWrapperRef, onFlowChange, debug]
	)

	/**
	 * Handle frame entrance animation
	 */
	const animateFrameEntrance = useCallback(
		(variant: 'modal' | 'fullscreen') => {
			if (!contentRef.current) return

			// For modal variant, wait for overlay ref to be ready
			if (variant === 'modal' && !overlayRef.current) return

			// Try to start animation
			if (!AnimationState.startAnimation('frame-in')) {
				if (debug) console.log('[useFrameAnimations] Skipping frame-in - already animating')
				return
			}

			// Animate in - only animate overlay if it exists (modal variant)
			const timeline = overlayRef.current
				? animateFullFrameIn(overlayRef.current, contentRef.current)
				: animateFrameIn(contentRef.current)

			timeline.eventCallback('onComplete', () => {
				AnimationState.endAnimation()
				FrameState.markFrameInit()
			})

			return () => {
				timeline.kill()
			}
		},
		[overlayRef, contentRef, debug]
	)

	/**
	 * Handle frame exit animation
	 */
	const animateFrameExit = useCallback(
		(onComplete: () => void) => {
			if (!contentRef.current) return

			// Try to start animation
			if (!AnimationState.startAnimation('frame-out')) {
				if (debug)
					console.log('[useFrameAnimations] Skipping frame-out - already animating')
				return
			}

			// Animate out - only animate overlay if it exists (modal variant)
			const timeline = overlayRef.current
				? animateFullFrameOut(overlayRef.current, contentRef.current)
				: animateFrameOut(contentRef.current)

			timeline.eventCallback('onComplete', () => {
				AnimationState.endAnimation()
				onComplete()
			})
		},
		[overlayRef, contentRef, debug]
	)

	/**
	 * Subscribe to step navigation events
	 */
	useEffect(() => {
		const nextSub = customEventManager.subscribe<FrameNextStepEventData>(
			'frame:navigation:next',
			data => animateStepTransition(data, 'forward')
		)

		const prevSub = customEventManager.subscribe<FramePreviousStepEventData>(
			'frame:navigation:previous',
			data => animateStepTransition(data, 'backward')
		)

		return () => {
			nextSub.unsubscribe()
			prevSub.unsubscribe()
		}
	}, [animateStepTransition])

	return {
		isAnimating: AnimationState.selectIsAnimating(),
		animateFrameEntrance,
		animateFrameExit,
		animateFlowTransition,
	}
}
