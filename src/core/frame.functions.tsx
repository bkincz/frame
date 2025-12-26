/*
 *   HELPER FUNCTIONS
 ***************************************************************************************************/
import { FLOW_REGISTRY, type FlowRegistryEntry } from './frame.registry'
import type { FlowDefinition } from '@/flows/flow.types'
import FrameState from '@/state/frame.state'

/*
 *   REGISTRY HELPERS
 ***************************************************************************************************/

/**
 * Get a flow registry entry by name
 */
export function getFlowEntry(flowName: string): FlowRegistryEntry | null {
	return FLOW_REGISTRY[flowName] || null
}

/**
 * Check if a flow exists in the registry
 */
export function flowExists(flowName: string): boolean {
	return flowName in FLOW_REGISTRY
}

/**
 * Get all available flow names from registry
 */
export function getAvailableFlows(): string[] {
	return Object.keys(FLOW_REGISTRY)
}

/**
 * Get flow metadata (title, description) from registry
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
 ***************************************************************************************************/

/**
 * Create a flow definition by calling its factory
 * Note: Consider using state cache (FrameState.getFlowDefinition) for better performance
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
 * Get or create a flow definition with caching
 * This is the preferred method for getting flow definitions
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
 ***************************************************************************************************/
export function getCurrentFlowStepKeys(): string[] {
	return FrameState.selectStepKeys()
}

/**
 * Get all step keys for a flow (uses cache if available)
 */
export function getFlowStepKeys(flowName: string): string[] {
	const flowDef = getOrCreateFlowDefinition(flowName)
	if (!flowDef) return []
	return Object.keys(flowDef.flow)
}

/**
 * Validate if a step key is valid for a given flow
 */
export function isValidStepKey(flowName: string, stepKey: string): boolean {
	const stepKeys = getFlowStepKeys(flowName)
	return stepKeys.includes(stepKey)
}

/**
 * Get the first step key for a flow
 */
export function getFirstStepKey(flowName: string): string | null {
	const stepKeys = getFlowStepKeys(flowName)
	return stepKeys.length > 0 ? stepKeys[0] : null
}

/**
 * Get the next step key in a flow
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
 * Get the previous step key in a flow
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
 ***************************************************************************************************/

/**
 * Check if we're on the first step of the root flow (no flow history)
 * This means going back should close the frame instead of navigate
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

	// Check if we're on the first step
	const stepKeys = getFlowStepKeys(currentFlow)
	const currentIndex = stepKeys.indexOf(currentStepKey)

	return currentIndex === 0
}

/**
 * Check if we're on the last step of the leaf flow (no more steps)
 * This means going next should close the frame instead of navigate
 */
export function isLastStepOfLeafFlow(): boolean {
	const { currentFlow, currentStepKey } = FrameState.getState()

	// Not in a flow at all
	if (!currentFlow || !currentStepKey) {
		return false
	}

	// Check if we're on the last step
	const stepKeys = getFlowStepKeys(currentFlow)
	const currentIndex = stepKeys.indexOf(currentStepKey)

	return currentIndex === stepKeys.length - 1
}
