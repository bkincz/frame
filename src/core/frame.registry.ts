/*
 *   TYPES
 ***************************************************************************************************/
import type { FlowFactory } from '@/types/flow.types'

export interface FlowRegistryEntry {
	factory: FlowFactory
	title: string
	description?: string
}

export type FlowRegistry = Record<string, FlowRegistryEntry>

/*
 *   REGISTRY MANAGEMENT
 *   Developers should create their own registry and pass it to Frame
 ***************************************************************************************************/
// Internal registry storage (can be set by developers)
let _registry: FlowRegistry = {}

/**
 * Set the flow registry for the Frame
 * This should be called once in your application before using Frame
 *
 * @example
 * ```tsx
 * import { setFlowRegistry } from '@bkincz/frame'
 * import { createMyFlow } from './flows/my-flow'
 *
 * setFlowRegistry({
 *   myFlow: {
 *     factory: createMyFlow,
 *     title: 'My Flow',
 *     description: 'Description of my flow'
 *   }
 * })
 * ```
 */
export function setFlowRegistry(registry: FlowRegistry): void {
	_registry = registry
}

export function getFlowRegistry(): FlowRegistry {
	return _registry
}

export function registerFlow(flowName: string, entry: FlowRegistryEntry): void {
	_registry[flowName] = entry
}

export function unregisterFlow(flowName: string): void {
	delete _registry[flowName]
}

export function clearFlowRegistry(): void {
	_registry = {}
}
