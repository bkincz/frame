/*
 *   IMPORTS
 **************************************************************************************************/
import { customEventManager } from '@/lib/event'
import FrameState from '@/state/frame.state'

/*
 *   PUBLIC API
 *   Convenient functions for controlling flows from components
 **************************************************************************************************/

/**
 * Opens a flow and optionally navigates to a specific step.
 * If a flow is already open, this will chain the new flow to the history.
 *
 * @param flow - The name of the flow to open (must be registered in the flow registry)
 * @param stepKey - Optional step key to navigate to. If not provided, opens at the first step
 *
 * @example
 * ```tsx
 * import { FrameAPI } from '@bkincz/frame'
 *
 * // Open a flow at the first step
 * FrameAPI.openFlow('checkout')
 *
 * // Open a flow at a specific step
 * FrameAPI.openFlow('checkout', 'payment')
 * ```
 */
export function openFlow(flow: string, stepKey?: string): void {
	customEventManager.emit('frame:request:open', { flow, stepKey })
}

/**
 * Replaces the current flow with a new flow, clearing the flow history.
 * Use this when you want to start a fresh flow without preserving navigation history.
 *
 * @param flow - The name of the flow to open (must be registered in the flow registry)
 * @param stepKey - Optional step key to navigate to. If not provided, opens at the first step
 *
 * @example
 * ```tsx
 * import { FrameAPI } from '@bkincz/frame'
 *
 * // Replace current flow with a new one
 * FrameAPI.replaceFlow('login')
 * ```
 */
export function replaceFlow(flow: string, stepKey?: string): void {
	customEventManager.emit('frame:request:open', { flow, stepKey, chain: false })
}

/**
 * Closes the currently open frame.
 * This will trigger the frame exit animation and clear the current flow state.
 *
 * @example
 * ```tsx
 * import { FrameAPI } from '@bkincz/frame'
 *
 * FrameAPI.closeFlow()
 * ```
 */
export function closeFlow(): void {
	customEventManager.emit('frame:request:close', {})
}

/**
 * Navigates back in the flow history.
 * If on the first step of the root flow, this will close the frame.
 * If in a chained flow, this will return to the previous flow.
 *
 * @example
 * ```tsx
 * import { FrameAPI } from '@bkincz/frame'
 *
 * FrameAPI.goBack()
 * ```
 */
export function goBack(): void {
	customEventManager.emit('frame:request:back', {})
}

/**
 * Checks if there is navigation history available.
 * Returns true if the user can navigate back through flow history.
 *
 * @returns True if flow history exists, false otherwise
 *
 * @example
 * ```tsx
 * import { FrameAPI } from '@bkincz/frame'
 *
 * if (FrameAPI.hasHistory()) {
 *   // Show back button
 * }
 * ```
 */
export function hasHistory(): boolean {
	return FrameState.selectHasHistory()
}

/**
 * Navigates to the next step in the current flow.
 * If on the last step, this will close the frame.
 *
 * @example
 * ```tsx
 * import { FrameAPI } from '@bkincz/frame'
 *
 * FrameAPI.nextStep()
 * ```
 */
export function nextStep(): void {
	customEventManager.emit('frame:request:next', {})
}

/**
 * Navigates to the previous step in the current flow.
 * If on the first step of the root flow, this will close the frame.
 *
 * @example
 * ```tsx
 * import { FrameAPI } from '@bkincz/frame'
 *
 * FrameAPI.previousStep()
 * ```
 */
export function previousStep(): void {
	customEventManager.emit('frame:request:previous', {})
}

/**
 * Clears the flow navigation history.
 * This removes all previous flow states, making the current flow the root.
 *
 * @example
 * ```tsx
 * import { FrameAPI } from '@bkincz/frame'
 *
 * FrameAPI.clearHistory()
 * ```
 */
export function clearHistory(): void {
	FrameState.clearFlowHistory()
}
