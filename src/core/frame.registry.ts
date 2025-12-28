/*
 *   IMPORTS
 ***************************************************************************************************/
import { createExampleFlow } from '@/flows/example/example.flow'
import { createModalFlow } from '@/flows/modal/modal.flow'
import { createShowcaseFlow } from '@/flows/showcase/showcase.flow'

/*
 *   TYPES
 ***************************************************************************************************/
import type { FlowFactory } from '@/flows/flow.types'

export interface FlowRegistryEntry {
	factory: FlowFactory
	title: string
	description?: string
}

export type FlowRegistry = Record<string, FlowRegistryEntry>

/*
 *   FLOW REGISTRY
 *   Register all available flows here
 ***************************************************************************************************/
export const FLOW_REGISTRY: FlowRegistry = {
	example: {
		factory: createExampleFlow,
		title: 'Example Flow',
		description: 'A demonstration of the factory-based flow system',
	},
	modal: {
		factory: createModalFlow,
		title: 'Modal Flow',
		description: 'A demonstration of the modal variant with centered content',
	},
	showcase: {
		factory: createShowcaseFlow,
		title: 'Component Showcase',
		description: 'A dedicated space for building and testing components in isolation',
	},
}
