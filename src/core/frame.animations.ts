/*
 *   IMPORTS
 ***************************************************************************************************/
import gsap from 'gsap'

/*
 *   TYPES
 ***************************************************************************************************/
export interface FrameAnimationConfig {
	duration?: number
	ease?: string
}

export type StepDirection = 'forward' | 'backward'

/*
 *   DEFAULT CONFIG
 ***************************************************************************************************/
const DEFAULT_CONFIG: Required<FrameAnimationConfig> = {
	duration: 0.3,
	ease: 'power2.out',
}

/*
 *   ANIMATION FUNCTIONS
 ***************************************************************************************************/

export function animateFrameIn(
	element: HTMLElement,
	config: FrameAnimationConfig = {}
): gsap.core.Timeline {
	const { duration, ease } = { ...DEFAULT_CONFIG, ...config }

	const timeline = gsap.timeline()

	// Animate in (initial state set via CSS)
	timeline.to(element, {
		opacity: 1,
		scale: 1,
		duration,
		ease,
	})

	return timeline
}

export function animateFrameOut(
	element: HTMLElement,
	config: FrameAnimationConfig = {}
): gsap.core.Timeline {
	const { duration } = { ...DEFAULT_CONFIG, ...config }

	const timeline = gsap.timeline()

	// Animate out
	timeline.to(element, {
		opacity: 0,
		scale: 0.95,
		duration,
		ease: 'power2.in',
	})

	return timeline
}

export function animateOverlayIn(
	element: HTMLElement,
	config: FrameAnimationConfig = {}
): gsap.core.Timeline {
	const { duration } = { ...DEFAULT_CONFIG, ...config }

	const timeline = gsap.timeline()

	// Animate in (initial state set via CSS)
	timeline.to(element, {
		opacity: 1,
		duration: duration * 0.8, // Slightly faster than content
		ease: 'none',
	})

	return timeline
}

export function animateOverlayOut(
	element: HTMLElement,
	config: FrameAnimationConfig = {}
): gsap.core.Timeline {
	const { duration } = { ...DEFAULT_CONFIG, ...config }

	const timeline = gsap.timeline()

	// Animate out
	timeline.to(element, {
		opacity: 0,
		duration: duration * 0.8,
		ease: 'none',
	})

	return timeline
}

export function animateFullFrameIn(
	overlayElement: HTMLElement,
	contentElement: HTMLElement,
	config: FrameAnimationConfig = {}
): gsap.core.Timeline {
	const masterTimeline = gsap.timeline()

	// Animate overlay and content in parallel (overlay starts first)
	masterTimeline.add(animateOverlayIn(overlayElement, config), 0)
	masterTimeline.add(animateFrameIn(contentElement, config), 0.05) // Slight delay for polish

	return masterTimeline
}

export function animateFullFrameOut(
	overlayElement: HTMLElement,
	contentElement: HTMLElement,
	config: FrameAnimationConfig = {}
): gsap.core.Timeline {
	const masterTimeline = gsap.timeline()

	// Animate content and overlay out in parallel (content finishes first)
	masterTimeline.add(animateFrameOut(contentElement, config), 0)
	masterTimeline.add(animateOverlayOut(overlayElement, config), 0)

	return masterTimeline
}

export function animateStepOut(
	element: HTMLElement,
	direction: StepDirection,
	config: FrameAnimationConfig = {}
): gsap.core.Timeline {
	const { duration } = { ...DEFAULT_CONFIG, ...config }

	const timeline = gsap.timeline()

	// Forward: slide out to the left, backward: slide out to the right
	const xOffset = direction === 'forward' ? -30 : 30

	timeline.to(element, {
		opacity: 0,
		x: xOffset,
		duration,
		ease: 'power2.in',
	})

	return timeline
}

export function animateStepIn(
	element: HTMLElement,
	direction: StepDirection,
	config: FrameAnimationConfig = {}
): gsap.core.Timeline {
	const { duration, ease } = { ...DEFAULT_CONFIG, ...config }

	const timeline = gsap.timeline()

	// Forward: slide in from the right, backward: slide in from the left
	const xFrom = direction === 'forward' ? 30 : -30

	// Set initial state
	gsap.set(element, { opacity: 0, x: xFrom })

	// Animate in
	timeline.to(element, {
		opacity: 1,
		x: 0,
		duration,
		ease,
	})

	return timeline
}

export function animateFlowOut(
	element: HTMLElement,
	config: FrameAnimationConfig = {}
): gsap.core.Timeline {
	const { duration } = { ...DEFAULT_CONFIG, ...config }

	const timeline = gsap.timeline()

	timeline.to(element, {
		opacity: 0,
		scale: 0.97,
		duration,
		ease: 'power2.in',
	})

	return timeline
}

export function animateFlowIn(
	element: HTMLElement,
	config: FrameAnimationConfig = {}
): gsap.core.Timeline {
	const { duration, ease } = { ...DEFAULT_CONFIG, ...config }

	const timeline = gsap.timeline()

	// Set initial state
	gsap.set(element, { opacity: 0, scale: 0.99 })

	// Animate in
	timeline.to(element, {
		opacity: 1,
		scale: 1,
		duration,
		ease,
	})

	return timeline
}
