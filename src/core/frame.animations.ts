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

/**
 * Animate frame entrance (fade in from center)
 * @param element - The frame element to animate
 * @param config - Animation configuration
 * @returns GSAP timeline
 */
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

/**
 * Animate frame exit (fade out to center)
 * @param element - The frame element to animate
 * @param config - Animation configuration
 * @returns GSAP timeline
 */
export function animateFrameOut(
	element: HTMLElement,
	config: FrameAnimationConfig = {}
): gsap.core.Timeline {
	const { duration } = { ...DEFAULT_CONFIG, ...config }

	const timeline = gsap.timeline()

	// Animate out
	timeline.to(element, {
		opacity: 0,
		scale: 0.99,
		duration,
		ease: 'power2.in',
	})

	return timeline
}

/**
 * Animate overlay entrance (fade in)
 * @param element - The overlay element to animate
 * @param config - Animation configuration
 * @returns GSAP timeline
 */
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

/**
 * Animate overlay exit (fade out)
 * @param element - The overlay element to animate
 * @param config - Animation configuration
 * @returns GSAP timeline
 */
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

/**
 * Animate full frame (overlay + content) in
 * @param overlayElement - The overlay element
 * @param contentElement - The content element
 * @param config - Animation configuration
 * @returns GSAP timeline
 */
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

/**
 * Animate full frame (overlay + content) out
 * @param overlayElement - The overlay element
 * @param contentElement - The content element
 * @param config - Animation configuration
 * @returns GSAP timeline
 */
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
