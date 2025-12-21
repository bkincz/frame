/*
 *   FLOW UTILITIES
 *   Helper functions for working with flows
 **********************************************************************************************************/
import type { FlowConfig, StepConfig } from './flow.types'

/**
 * Merges flow-level config with step-level config
 * Step config takes precedence over flow config
 *
 * @param flowConfig - Flow-level configuration
 * @param stepConfig - Step-level configuration (optional)
 * @returns Merged configuration
 */
export function mergeConfig(flowConfig: FlowConfig, stepConfig?: StepConfig): FlowConfig {
	if (!stepConfig) return flowConfig

	// Handle sidebar merging
	let mergedSidebar: FlowConfig['sidebar']
	if (stepConfig.sidebar === false) {
		mergedSidebar = false
	} else if (stepConfig.sidebar === true) {
		mergedSidebar = flowConfig.sidebar
	} else if (typeof stepConfig.sidebar === 'object' && stepConfig.sidebar !== null) {
		mergedSidebar = {
			...(typeof flowConfig.sidebar === 'object' ? flowConfig.sidebar : {}),
			...stepConfig.sidebar,
		}
	} else {
		mergedSidebar = flowConfig.sidebar
	}

	return {
		footer: {
			...flowConfig.footer,
			...stepConfig.footer,
		},
		sidebar: mergedSidebar,
		animations: {
			...flowConfig.animations,
			...stepConfig.animations,
		},
	}
}

/**
 * Validates that a flow has at least one step
 *
 * @param flow - Flow definition
 * @throws Error if flow has no steps
 */
export function validateFlow(flow: Record<string, unknown>): void {
	const stepKeys = Object.keys(flow)

	if (stepKeys.length === 0) {
		throw new Error('Flow must have at least one step')
	}
}

/**
 * Validates that a step has required properties
 *
 * @param stepKey - Step identifier
 * @param step - Step definition
 * @throws Error if step is missing required properties
 */
export function validateStep(stepKey: string, step: Record<string, unknown>): void {
	if (!step.heading) {
		throw new Error(`Step "${stepKey}" is missing required property: heading`)
	}

	if (!step.components || !Array.isArray(step.components) || step.components.length === 0) {
		throw new Error(`Step "${stepKey}" must have at least one component`)
	}
}

/**
 * Gets the total number of steps in a flow
 *
 * @param flow - Flow definition
 * @returns Number of steps
 */
export function getStepCount(flow: Record<string, unknown>): number {
	return Object.keys(flow).length
}

/**
 * Gets an array of step keys from a flow
 *
 * @param flow - Flow definition
 * @returns Array of step keys
 */
export function getStepKeys(flow: Record<string, unknown>): string[] {
	return Object.keys(flow)
}

/**
 * Checks if a step key exists in a flow
 *
 * @param flow - Flow definition
 * @param stepKey - Step identifier to check
 * @returns True if step exists
 */
export function hasStep(flow: Record<string, unknown>, stepKey: string): boolean {
	return stepKey in flow
}
