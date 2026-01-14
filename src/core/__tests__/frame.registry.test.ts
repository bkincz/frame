/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach } from 'vitest'
import {
	setFlowRegistry,
	getFlowRegistry,
	registerFlow,
	unregisterFlow,
	clearFlowRegistry,
	type FlowRegistry,
} from '../frame.registry'

/*
 *   TEST FIXTURES
 ***************************************************************************************************/
const mockFlowFactory = () => ({
	flow: {
		step1: { components: [] },
		step2: { components: [] },
	},
})

const testRegistry: FlowRegistry = {
	testFlow: {
		factory: mockFlowFactory,
		title: 'Test Flow',
		description: 'A test flow',
	},
	anotherFlow: {
		factory: mockFlowFactory,
		title: 'Another Flow',
	},
}

/*
 *   TESTS
 ***************************************************************************************************/
describe('Frame Registry', () => {
	beforeEach(() => {
		// Clear registry before each test
		clearFlowRegistry()
	})

	describe('setFlowRegistry', () => {
		it('should set the flow registry', () => {
			setFlowRegistry(testRegistry)
			const registry = getFlowRegistry()

			expect(registry).toEqual(testRegistry)
		})

		it('should replace existing registry', () => {
			setFlowRegistry(testRegistry)
			const newRegistry: FlowRegistry = {
				newFlow: {
					factory: mockFlowFactory,
					title: 'New Flow',
				},
			}

			setFlowRegistry(newRegistry)
			const registry = getFlowRegistry()

			expect(registry).toEqual(newRegistry)
			expect(registry.testFlow).toBeUndefined()
		})
	})

	describe('getFlowRegistry', () => {
		it('should return empty object when no registry set', () => {
			const registry = getFlowRegistry()
			expect(registry).toEqual({})
		})

		it('should return the current registry', () => {
			setFlowRegistry(testRegistry)
			const registry = getFlowRegistry()

			expect(registry).toBe(testRegistry)
		})
	})

	describe('registerFlow', () => {
		it('should add a flow to the registry', () => {
			const flowEntry = {
				factory: mockFlowFactory,
				title: 'Dynamic Flow',
			}

			registerFlow('dynamicFlow', flowEntry)
			const registry = getFlowRegistry()

			expect(registry.dynamicFlow).toEqual(flowEntry)
		})

		it('should add to existing registry', () => {
			setFlowRegistry(testRegistry)

			const newFlow = {
				factory: mockFlowFactory,
				title: 'New Flow',
			}

			registerFlow('newFlow', newFlow)
			const registry = getFlowRegistry()

			expect(registry.newFlow).toEqual(newFlow)
			expect(registry.testFlow).toEqual(testRegistry.testFlow)
		})

		it('should overwrite existing flow with same name', () => {
			setFlowRegistry(testRegistry)

			const updatedFlow = {
				factory: mockFlowFactory,
				title: 'Updated Test Flow',
			}

			registerFlow('testFlow', updatedFlow)
			const registry = getFlowRegistry()

			expect(registry.testFlow).toEqual(updatedFlow)
		})
	})

	describe('unregisterFlow', () => {
		it('should remove a flow from the registry', () => {
			setFlowRegistry(testRegistry)

			unregisterFlow('testFlow')
			const registry = getFlowRegistry()

			expect(registry.testFlow).toBeUndefined()
			expect(registry.anotherFlow).toBeDefined()
		})

		it('should do nothing if flow does not exist', () => {
			setFlowRegistry(testRegistry)

			unregisterFlow('nonexistent')
			const registry = getFlowRegistry()

			expect(registry).toEqual(testRegistry)
		})
	})

	describe('clearFlowRegistry', () => {
		it('should clear all flows', () => {
			setFlowRegistry(testRegistry)

			clearFlowRegistry()
			const registry = getFlowRegistry()

			expect(registry).toEqual({})
		})
	})

	describe('Flow Entry Structure', () => {
		it('should contain required properties', () => {
			setFlowRegistry(testRegistry)
			const registry = getFlowRegistry()

			Object.entries(registry).forEach(([, entry]) => {
				expect(entry.factory).toBeDefined()
				expect(typeof entry.factory).toBe('function')
				expect(entry.title).toBeDefined()
				expect(typeof entry.title).toBe('string')
			})
		})

		it('should have factories that return valid flow definitions', () => {
			setFlowRegistry(testRegistry)
			const registry = getFlowRegistry()

			Object.entries(registry).forEach(([, entry]) => {
				const flowDef = entry.factory()

				expect(flowDef).toBeDefined()
				expect(flowDef.flow).toBeDefined()
				expect(typeof flowDef.flow).toBe('object')

				const stepKeys = Object.keys(flowDef.flow)
				expect(stepKeys.length).toBeGreaterThan(0)

				stepKeys.forEach(stepKey => {
					const step = flowDef.flow[stepKey]
					expect(step).toBeDefined()
					expect(step.components).toBeDefined()
					expect(Array.isArray(step.components)).toBe(true)
				})
			})
		})
	})
})
