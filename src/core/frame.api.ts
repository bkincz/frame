/*
 *   IMPORTS
 ***************************************************************************************************/
import { customEventManager } from '@/lib/event'
import FrameState from '@/state/frame.state'

/*
 *   PUBLIC API
 *   Convenient functions for controlling flows from components
 ***************************************************************************************************/

/**
 * Open a flow (chains if frame is already open)
 * @param flow - Flow name to open
 * @param stepKey - Optional step key to start at
 * @example
 * ```tsx
 * import { Frame } from '@/core'
 *
 * function MyComponent() {
 *   return (
 *     <button onClick={() => Frame.openFlow('checkout')}>
 *       Go to Checkout
 *     </button>
 *   )
 * }
 * ```
 */
export function openFlow(flow: string, stepKey?: string): void {
	customEventManager.emit('frame:request:open', { flow, stepKey })
}

/**
 * Open a flow without chaining (replaces current flow)
 * @param flow - Flow name to open
 * @param stepKey - Optional step key to start at
 */
export function replaceFlow(flow: string, stepKey?: string): void {
	customEventManager.emit('frame:request:open', { flow, stepKey, chain: false })
}

/**
 * Close the current flow
 */
export function closeFlow(): void {
	customEventManager.emit('frame:request:close', {})
}

/**
 * Go back to previous flow in history
 * Returns true if went back, false if no history
 */
export function goBack(): void {
	customEventManager.emit('frame:request:back', {})
}

/**
 * Check if there is flow history
 */
export function hasHistory(): boolean {
	return FrameState.selectHasHistory()
}

/**
 * Advance to next step in current flow
 */
export function nextStep(): void {
	customEventManager.emit('frame:request:next', {})
}

/**
 * Go back to previous step in current flow
 */
export function previousStep(): void {
	customEventManager.emit('frame:request:previous', {})
}

/**
 * Clear flow history
 */
export function clearHistory(): void {
	FrameState.clearFlowHistory()
}
