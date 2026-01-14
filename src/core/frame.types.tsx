/*
 *   TYPES FOR FRAME CUSTOMIZATION
 ***************************************************************************************************/
import type { RefObject } from 'react'
import type { Step, FrameVariant } from '@/types/flow.types'
import type { Frame as FrameComponent } from './frame.component'

/**
 * Refs that must be attached to specific Frame elements for animations and functionality
 */
export interface FrameRefs {
	/** Ref for the overlay element (used in modal variant) */
	overlay: RefObject<HTMLDivElement | null>
	/** Ref for the content container element */
	content: RefObject<HTMLDivElement | null>
	/** Ref for the step wrapper element (for step transitions) */
	stepWrapper: RefObject<HTMLDivElement | null>
}

/**
 * Event handlers provided by FrameContainer
 */
export interface FrameHandlers {
	/** Handler to close the frame (with animation) */
	closeFrame: () => void
	/** Handler to stop event propagation (for content clicks) */
	stopPropagation: (event: React.MouseEvent) => void
	/** Handler for overlay clicks (closes frame) */
	handleOverlayClick: () => void
}

/**
 * Current state of the frame
 */
export interface FrameState {
	/** Whether the frame is currently open */
	isOpen: boolean
	/** The current flow name */
	currentFlow: string | null
	/** The current step key */
	currentStepKey: string | null
	/** The rendered step key (for transitions) */
	renderedStepKey: string | null
	/** The current step definition */
	currentStep: Step | null
	/** The variant of the frame (modal or fullscreen) */
	variant: FrameVariant
	/** Whether to show the overlay (modal variant only) */
	showOverlay: boolean
	/** Whether to show the sidebar */
	showSidebar: boolean
}

/**
 * Props provided to the render function
 */
export interface FrameRenderProps {
	/** Required refs that must be attached to Frame elements */
	refs: FrameRefs
	/** Event handlers for frame interactions */
	handlers: FrameHandlers
	/** Current state of the frame */
	state: FrameState
	/** The Frame component with all its sub-components */
	Frame: typeof FrameComponent
}

/**
 * Render function type for custom layouts
 */
export type FrameRenderFunction = (props: FrameRenderProps) => React.ReactElement | null
