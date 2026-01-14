/*
 *   FLOW SYSTEM TYPES
 *   Type definitions for the factory-based flow system
 **********************************************************************************************************/

import type { FrameRenderFunction } from '@/core/frame.types'

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
 * Configuration for inert management (modal mode only)
 */
export interface InertConfig {
	/** Enable/disable inert management (default: true in modal mode) */
	enabled?: boolean
	/** CSS selectors for elements to exclude from being made inert */
	excludeSelectors?: string[]
}

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
	sidebar?: Partial<SidebarConfig> | boolean
	animations?: Partial<AnimationConfig>
	main?: Partial<MainConfig>
	variant?: FrameVariant
	layout?: FrameRenderFunction
	inert?: Partial<InertConfig>
	[key: string]: unknown
}

/**
 * Flow-level configuration
 */
export interface FlowConfig extends StepConfig {}

/**
 * Individual step definition
 */
export interface Step {
	heading: string
	subheading: string
	components: Array<React.ComponentType>
	config?: StepConfig
	onEnter?: () => void | Promise<void>
	onExit?: () => void | Promise<void>
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
	flow: Flow
	config: FlowConfig
	onEnter?: () => void | Promise<void>
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
