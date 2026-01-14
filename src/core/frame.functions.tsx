/*
 *   HELPER FUNCTIONS
 **************************************************************************************************/
import { getFlowRegistry, type FlowRegistryEntry } from './frame.registry'
import type { FlowDefinition } from '@/flows/flow.types'
import FrameState from '@/state/frame.state'

/*
 *   REGISTRY HELPERS
 **************************************************************************************************/

/**
 * Retrieves a flow entry from the registry by name.
 *
 * @param flowName - The name of the flow to retrieve
 * @returns The flow registry entry if found, null otherwise
 *
 * @example
 * ```tsx
 * const entry = getFlowEntry('checkout')
 * if (entry) {
 *   console.log(entry.title, entry.description)
 * }
 * ```
 */
export function getFlowEntry(flowName: string): FlowRegistryEntry | null {
	const registry = getFlowRegistry()
	return registry[flowName] || null
}

/**
 * Checks if a flow exists in the registry.
 *
 * @param flowName - The name of the flow to check
 * @returns True if the flow exists in the registry, false otherwise
 *
 * @example
 * ```tsx
 * if (flowExists('checkout')) {
 *   // Safe to open the flow
 * }
 * ```
 */
export function flowExists(flowName: string): boolean {
	const registry = getFlowRegistry()
	return flowName in registry
}

/**
 * Returns an array of all registered flow names.
 *
 * @returns Array of flow names
 *
 * @example
 * ```tsx
 * const flows = getAvailableFlows()
 * // ['checkout', 'login', 'onboarding']
 * ```
 */
export function getAvailableFlows(): string[] {
	const registry = getFlowRegistry()
	return Object.keys(registry)
}

/**
 * Retrieves metadata (title and description) for a flow.
 *
 * @param flowName - The name of the flow
 * @returns Object containing title and description, or null if flow not found
 *
 * @example
 * ```tsx
 * const metadata = getFlowMetadata('checkout')
 * if (metadata) {
 *   console.log(metadata.title) // "Checkout Flow"
 * }
 * ```
 */
export function getFlowMetadata(
	flowName: string
): Pick<FlowRegistryEntry, 'title' | 'description'> | null {
	const entry = getFlowEntry(flowName)
	if (!entry) return null

	return {
		title: entry.title,
		description: entry.description,
	}
}

/*
 *   FLOW DEFINITION HELPERS
 **************************************************************************************************/

/**
 * Creates a flow definition by calling the flow's factory function.
 * Note: Consider using getOrCreateFlowDefinition() for better performance with caching.
 *
 * @param flowName - The name of the flow to create
 * @returns The flow definition, or null if flow not found or factory fails
 *
 * @example
 * ```tsx
 * const flowDef = createFlowDefinition('checkout')
 * if (flowDef) {
 *   console.log(Object.keys(flowDef.flow)) // ['cart', 'payment', 'confirmation']
 * }
 * ```
 */
export function createFlowDefinition(flowName: string): FlowDefinition | null {
	const entry = getFlowEntry(flowName)
	if (!entry) return null

	try {
		return entry.factory()
	} catch (error) {
		console.error(`[Frame] Error creating flow "${flowName}":`, error)
		return null
	}
}

/**
 * Gets a flow definition from cache or creates it if not cached.
 * This is the recommended way to get flow definitions for better performance.
 *
 * @param flowName - The name of the flow
 * @returns The cached or newly created flow definition, or null if flow not found
 *
 * @example
 * ```tsx
 * const flowDef = getOrCreateFlowDefinition('checkout')
 * ```
 */
export function getOrCreateFlowDefinition(flowName: string): FlowDefinition | null {
	// Try to get from cache first
	let flowDef = FrameState.getFlowDefinition(flowName)

	// If not cached, create and cache it
	if (!flowDef) {
		flowDef = createFlowDefinition(flowName)
		if (flowDef) {
			FrameState.cacheFlowDefinition(flowName, flowDef)
		}
	}

	return flowDef
}

/*
 *   STEP HELPERS
 **************************************************************************************************/

/**
 * Gets the step keys for the currently active flow from state.
 *
 * @returns Array of step keys for the current flow
 *
 * @example
 * ```tsx
 * const stepKeys = getCurrentFlowStepKeys()
 * // ['cart', 'payment', 'confirmation']
 * ```
 */
export function getCurrentFlowStepKeys(): string[] {
	return FrameState.selectStepKeys()
}

/**
 * Gets all step keys for a specific flow.
 *
 * @param flowName - The name of the flow
 * @returns Array of step keys, or empty array if flow not found
 *
 * @example
 * ```tsx
 * const stepKeys = getFlowStepKeys('checkout')
 * // ['cart', 'payment', 'confirmation']
 * ```
 */
export function getFlowStepKeys(flowName: string): string[] {
	const flowDef = getOrCreateFlowDefinition(flowName)
	if (!flowDef) return []
	return Object.keys(flowDef.flow)
}

/**
 * Checks if a step key is valid for a given flow.
 *
 * @param flowName - The name of the flow
 * @param stepKey - The step key to validate
 * @returns True if the step key exists in the flow, false otherwise
 *
 * @example
 * ```tsx
 * if (isValidStepKey('checkout', 'payment')) {
 *   // Safe to navigate to this step
 * }
 * ```
 */
export function isValidStepKey(flowName: string, stepKey: string): boolean {
	const stepKeys = getFlowStepKeys(flowName)
	return stepKeys.includes(stepKey)
}

/**
 * Gets the first step key of a flow.
 *
 * @param flowName - The name of the flow
 * @returns The first step key, or null if flow not found or has no steps
 *
 * @example
 * ```tsx
 * const firstStep = getFirstStepKey('checkout')
 * // 'cart'
 * ```
 */
export function getFirstStepKey(flowName: string): string | null {
	const stepKeys = getFlowStepKeys(flowName)
	return stepKeys.length > 0 ? stepKeys[0] : null
}

/**
 * Gets the next step key in a flow relative to the current step.
 *
 * @param flowName - The name of the flow
 * @param currentStepKey - The current step key
 * @returns The next step key, or null if on last step or current step not found
 *
 * @example
 * ```tsx
 * const nextStep = getNextStepKey('checkout', 'cart')
 * // 'payment'
 * ```
 */
export function getNextStepKey(flowName: string, currentStepKey: string): string | null {
	const stepKeys = getFlowStepKeys(flowName)
	const currentIndex = stepKeys.indexOf(currentStepKey)

	if (currentIndex === -1 || currentIndex === stepKeys.length - 1) {
		return null // Current step not found or is last step
	}

	return stepKeys[currentIndex + 1]
}

/**
 * Gets the previous step key in a flow relative to the current step.
 *
 * @param flowName - The name of the flow
 * @param currentStepKey - The current step key
 * @returns The previous step key, or null if on first step or current step not found
 *
 * @example
 * ```tsx
 * const prevStep = getPreviousStepKey('checkout', 'payment')
 * // 'cart'
 * ```
 */
export function getPreviousStepKey(flowName: string, currentStepKey: string): string | null {
	const stepKeys = getFlowStepKeys(flowName)
	const currentIndex = stepKeys.indexOf(currentStepKey)

	if (currentIndex <= 0) {
		return null // Current step not found or is first step
	}

	return stepKeys[currentIndex - 1]
}

/*
 *   NAVIGATION EDGE CASE HELPERS
 **************************************************************************************************/

/**
 * Checks if currently on the first step of the root flow (no flow history).
 * When true, going back should close the frame instead of navigating.
 *
 * @returns True if on first step of root flow, false otherwise
 *
 * @example
 * ```tsx
 * if (isFirstStepOfRootFlow()) {
 *   // Back button should close frame
 * }
 * ```
 */
export function isFirstStepOfRootFlow(): boolean {
	const { currentFlow, currentStepKey, flowHistory } = FrameState.getState()

	// Not in a flow at all
	if (!currentFlow || !currentStepKey) {
		return false
	}

	// Has flow history means we're in a chained flow, not the root
	if (flowHistory.length > 0) {
		return false
	}

	// Check if we're on the first step - use cached flow definition
	const flowDef = FrameState.getFlowDefinition(currentFlow)
	if (!flowDef) return false

	const stepKeys = Object.keys(flowDef.flow)
	const currentIndex = stepKeys.indexOf(currentStepKey)

	return currentIndex === 0
}

/**
 * Checks if currently on the last step of the leaf flow (no more steps).
 * When true, going next should close the frame instead of navigating.
 *
 * @returns True if on last step of leaf flow, false otherwise
 *
 * @example
 * ```tsx
 * if (isLastStepOfLeafFlow()) {
 *   // Next button should close frame or show "Done"
 * }
 * ```
 */
export function isLastStepOfLeafFlow(): boolean {
	const { currentFlow, currentStepKey } = FrameState.getState()

	// Not in a flow at all
	if (!currentFlow || !currentStepKey) {
		return false
	}

	// Check if we're on the last step - use cached flow definition
	const flowDef = FrameState.getFlowDefinition(currentFlow)
	if (!flowDef) return false

	const stepKeys = Object.keys(flowDef.flow)
	const currentIndex = stepKeys.indexOf(currentStepKey)

	return currentIndex === stepKeys.length - 1
}
