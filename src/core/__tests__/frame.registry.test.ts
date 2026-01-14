/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect } from 'vitest'
import { FLOW_REGISTRY } from '../frame.registry'

/*
 *   TESTS
 ***************************************************************************************************/
describe('Frame Registry', () => {
	describe('FLOW_REGISTRY', () => {
		it('should be defined', () => {
			expect(FLOW_REGISTRY).toBeDefined()
			expect(typeof FLOW_REGISTRY).toBe('object')
		})

		it('should contain flow entries with required properties', () => {
			const flowNames = Object.keys(FLOW_REGISTRY)

			expect(flowNames.length).toBeGreaterThan(0)

			flowNames.forEach(flowName => {
				const entry = FLOW_REGISTRY[flowName]

				expect(entry).toBeDefined()
				expect(entry.factory).toBeDefined()
				expect(typeof entry.factory).toBe('function')
				expect(entry.title).toBeDefined()
				expect(typeof entry.title).toBe('string')

				// Description is optional
				if (entry.description) {
					expect(typeof entry.description).toBe('string')
				}
			})
		})

		it('should have factories that return valid flow definitions', () => {
			const flowNames = Object.keys(FLOW_REGISTRY)

			flowNames.forEach(flowName => {
				const entry = FLOW_REGISTRY[flowName]
				const flowDef = entry.factory()

				expect(flowDef).toBeDefined()
				expect(flowDef.flow).toBeDefined()
				expect(typeof flowDef.flow).toBe('object')

				// Verify each step has required properties
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

		it('should contain expected default flows', () => {
			// Verify common flows exist
			expect(FLOW_REGISTRY.example).toBeDefined()
			expect(FLOW_REGISTRY.modal).toBeDefined()
			expect(FLOW_REGISTRY.showcase).toBeDefined()
		})

		it('should have unique flow names', () => {
			const flowNames = Object.keys(FLOW_REGISTRY)
			const uniqueNames = new Set(flowNames)

			expect(uniqueNames.size).toBe(flowNames.length)
		})

		it('should have descriptive titles', () => {
			Object.entries(FLOW_REGISTRY).forEach(([flowName, entry]) => {
				expect(entry.title.length).toBeGreaterThan(0)
				expect(entry.title).not.toBe(flowName) // Title should be different from key
			})
		})
	})
})
