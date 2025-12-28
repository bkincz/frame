/*
 *   FLOW SYSTEM TYPES
 *   Type definitions for the factory-based flow system
 **********************************************************************************************************/

/**
 * Configuration for footer component
 */
export interface FooterConfig {
	hidePricing?: boolean
	hideNext?: boolean
	hideBack?: boolean
	hideStepIndicator?: boolean
}

/**
 * Configuration for sidebar component
 */
export interface SidebarConfig {
	hidePromo?: boolean
	hideTotal?: boolean
}

/**
 * Configuration for animations
 */
export interface AnimationConfig {
	animateSidebar?: boolean
	animateSteps?: boolean
}

/**
 * Configuration for main content area
 */
export interface MainConfig {}

/**
 * Frame variant types
 */
export type FrameVariant = 'modal' | 'fullscreen'

/**
 * Step-level configuration
 * Can override flow-level config
 */
export interface StepConfig {
	footer?: Partial<FooterConfig>
	sidebar?: Partial<SidebarConfig> | boolean // false = completely hide sidebar, true = show with defaults
	animations?: Partial<AnimationConfig>
	main?: Partial<MainConfig>
	variant?: FrameVariant // 'modal' = centered modal with overlay, 'fullscreen' = full viewport
	// Extensible for future config options
	[key: string]: unknown
}

/**
 * Flow-level configuration
 */
export interface FlowConfig extends StepConfig {
	// Flow config is the same as step config, but provides defaults
}

/**
 * Individual step definition
 */
export interface Step {
	/** Step heading (displayed at top) */
	heading: string

	/** Step subheading - string only for simplicity and performance */
	subheading: string

	/** Array of component types to render for this step (use component references, not JSX elements) */
	components: Array<React.ComponentType>

	/** Step-level config overrides */
	config?: StepConfig

	/** Called when entering this step (before mount) */
	onEnter?: () => void | Promise<void>

	/** Called when exiting this step (before unmount) */
	onExit?: () => void | Promise<void>

	/** Any additional custom properties */
	[key: string]: unknown
}

/**
 * Flow definition - map of step keys to step definitions
 */
export interface Flow {
	[stepKey: string]: Step
}

/**
 * Return type from flow factory function
 */
export interface FlowDefinition {
	/** The flow steps definition */
	flow: Flow

	/** Flow-level configuration */
	config: FlowConfig

	/** Called when flow is entered (before any step) */
	onEnter?: () => void | Promise<void>

	/** Called when flow is exited */
	onExit?: () => void | Promise<void>
}

/**
 * Flow factory function type
 */
export type FlowFactory = () => FlowDefinition

/**
 * Helper type for extracting step keys from a flow
 */
export type StepKeys<T extends Flow> = keyof T & string

/**
 * Helper type for getting a specific step from a flow
 */
export type GetStep<T extends Flow, K extends StepKeys<T>> = T[K]
