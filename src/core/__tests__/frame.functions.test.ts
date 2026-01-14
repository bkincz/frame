/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
	getFlowEntry,
	flowExists,
	getAvailableFlows,
	getFlowMetadata,
	createFlowDefinition,
	getOrCreateFlowDefinition,
	getCurrentFlowStepKeys,
	getFlowStepKeys,
	isValidStepKey,
	getFirstStepKey,
	getNextStepKey,
	getPreviousStepKey,
	isFirstStepOfRootFlow,
	isLastStepOfLeafFlow,
} from '../frame.functions'
import { setFlowRegistry, clearFlowRegistry, type FlowRegistry } from '../frame.registry'
import FrameState from '@/state/frame.state'
import type { FlowDefinition } from '@/types/flow.types'

/*
 *   TEST FIXTURES
 ***************************************************************************************************/
const testRegistry: FlowRegistry = {
	'test-flow': {
		factory: vi.fn(() => ({
			flow: {
				'step-1': { components: [] },
				'step-2': { components: [] },
				'step-3': { components: [] },
			},
		})),
		title: 'Test Flow',
		description: 'A test flow for unit testing',
	},
	'another-flow': {
		factory: vi.fn(() => ({
			flow: {
				'step-a': { components: [] },
				'step-b': { components: [] },
			},
		})),
		title: 'Another Flow',
	},
}

/*
 *   MOCKS
 ***************************************************************************************************/
vi.mock('@/state/frame.state', () => ({
	default: {
		getFlowDefinition: vi.fn(),
		cacheFlowDefinition: vi.fn(),
		selectStepKeys: vi.fn(),
		getState: vi.fn(),
	},
}))

/*
 *   TESTS
 ***************************************************************************************************/
describe('Frame Functions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		clearFlowRegistry()
		setFlowRegistry(testRegistry)
	})

	describe('Registry Helpers', () => {
		describe('getFlowEntry', () => {
			it('should return flow entry for existing flow', () => {
				const entry = getFlowEntry('test-flow')

				expect(entry).toBeDefined()
				expect(entry?.title).toBe('Test Flow')
				expect(entry?.description).toBe('A test flow for unit testing')
			})

			it('should return null for non-existent flow', () => {
				const entry = getFlowEntry('non-existent')

				expect(entry).toBeNull()
			})
		})

		describe('flowExists', () => {
			it('should return true for existing flow', () => {
				expect(flowExists('test-flow')).toBe(true)
			})

			it('should return false for non-existent flow', () => {
				expect(flowExists('non-existent')).toBe(false)
			})
		})

		describe('getAvailableFlows', () => {
			it('should return array of flow names', () => {
				const flows = getAvailableFlows()

				expect(flows).toEqual(['test-flow', 'another-flow'])
			})
		})

		describe('getFlowMetadata', () => {
			it('should return title and description for existing flow', () => {
				const metadata = getFlowMetadata('test-flow')

				expect(metadata).toEqual({
					title: 'Test Flow',
					description: 'A test flow for unit testing',
				})
			})

			it('should return null for non-existent flow', () => {
				const metadata = getFlowMetadata('non-existent')

				expect(metadata).toBeNull()
			})
		})
	})

	describe('Flow Definition Helpers', () => {
		describe('createFlowDefinition', () => {
			it('should create flow definition by calling factory', () => {
				const flowDef = createFlowDefinition('test-flow')

				expect(flowDef).toBeDefined()
				expect(flowDef?.flow).toBeDefined()
				expect(Object.keys(flowDef?.flow || {})).toEqual(['step-1', 'step-2', 'step-3'])
			})

			it('should return null for non-existent flow', () => {
				const flowDef = createFlowDefinition('non-existent')

				expect(flowDef).toBeNull()
			})

			it('should handle factory errors gracefully', () => {
				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

				// Mock a failing factory
				vi.doMock('../frame.registry', () => ({
					FLOW_REGISTRY: {
						'failing-flow': {
							factory: () => {
								throw new Error('Factory error')
							},
							title: 'Failing Flow',
						},
					},
				}))

				const flowDef = createFlowDefinition('failing-flow')

				expect(flowDef).toBeNull()

				consoleSpy.mockRestore()
			})
		})

		describe('getOrCreateFlowDefinition', () => {
			it('should return cached flow definition if available', () => {
				const mockFlowDef: FlowDefinition = {
					flow: {
						'cached-step': { components: [] },
					},
				}
				vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDef)

				const flowDef = getOrCreateFlowDefinition('test-flow')

				expect(flowDef).toBe(mockFlowDef)
				expect(FrameState.getFlowDefinition).toHaveBeenCalledWith('test-flow')
				expect(FrameState.cacheFlowDefinition).not.toHaveBeenCalled()
			})

			it('should create and cache flow definition if not cached', () => {
				vi.mocked(FrameState.getFlowDefinition).mockReturnValue(null)

				const flowDef = getOrCreateFlowDefinition('test-flow')

				expect(flowDef).toBeDefined()
				expect(FrameState.cacheFlowDefinition).toHaveBeenCalledWith('test-flow', flowDef)
			})

			it('should return null for non-existent flow', () => {
				vi.mocked(FrameState.getFlowDefinition).mockReturnValue(null)

				const flowDef = getOrCreateFlowDefinition('non-existent')

				expect(flowDef).toBeNull()
				expect(FrameState.cacheFlowDefinition).not.toHaveBeenCalled()
			})
		})
	})

	describe('Step Helpers', () => {
		describe('getCurrentFlowStepKeys', () => {
			it('should return step keys from state', () => {
				vi.mocked(FrameState.selectStepKeys).mockReturnValue(['step-1', 'step-2'])

				const stepKeys = getCurrentFlowStepKeys()

				expect(stepKeys).toEqual(['step-1', 'step-2'])
				expect(FrameState.selectStepKeys).toHaveBeenCalled()
			})
		})

		describe('getFlowStepKeys', () => {
			beforeEach(() => {
				vi.mocked(FrameState.getFlowDefinition).mockReturnValue(null)
			})

			it('should return step keys for existing flow', () => {
				const stepKeys = getFlowStepKeys('test-flow')

				expect(stepKeys).toEqual(['step-1', 'step-2', 'step-3'])
			})

			it('should return empty array for non-existent flow', () => {
				const stepKeys = getFlowStepKeys('non-existent')

				expect(stepKeys).toEqual([])
			})
		})

		describe('isValidStepKey', () => {
			beforeEach(() => {
				vi.mocked(FrameState.getFlowDefinition).mockReturnValue(null)
			})

			it('should return true for valid step key', () => {
				expect(isValidStepKey('test-flow', 'step-2')).toBe(true)
			})

			it('should return false for invalid step key', () => {
				expect(isValidStepKey('test-flow', 'invalid-step')).toBe(false)
			})

			it('should return false for non-existent flow', () => {
				expect(isValidStepKey('non-existent', 'step-1')).toBe(false)
			})
		})

		describe('getFirstStepKey', () => {
			beforeEach(() => {
				vi.mocked(FrameState.getFlowDefinition).mockReturnValue(null)
			})

			it('should return first step key for existing flow', () => {
				const firstStep = getFirstStepKey('test-flow')

				expect(firstStep).toBe('step-1')
			})

			it('should return null for non-existent flow', () => {
				const firstStep = getFirstStepKey('non-existent')

				expect(firstStep).toBeNull()
			})
		})

		describe('getNextStepKey', () => {
			beforeEach(() => {
				vi.mocked(FrameState.getFlowDefinition).mockReturnValue(null)
			})

			it('should return next step key', () => {
				const nextStep = getNextStepKey('test-flow', 'step-1')

				expect(nextStep).toBe('step-2')
			})

			it('should return null when on last step', () => {
				const nextStep = getNextStepKey('test-flow', 'step-3')

				expect(nextStep).toBeNull()
			})

			it('should return null for invalid current step', () => {
				const nextStep = getNextStepKey('test-flow', 'invalid-step')

				expect(nextStep).toBeNull()
			})
		})

		describe('getPreviousStepKey', () => {
			beforeEach(() => {
				vi.mocked(FrameState.getFlowDefinition).mockReturnValue(null)
			})

			it('should return previous step key', () => {
				const prevStep = getPreviousStepKey('test-flow', 'step-2')

				expect(prevStep).toBe('step-1')
			})

			it('should return null when on first step', () => {
				const prevStep = getPreviousStepKey('test-flow', 'step-1')

				expect(prevStep).toBeNull()
			})

			it('should return null for invalid current step', () => {
				const prevStep = getPreviousStepKey('test-flow', 'invalid-step')

				expect(prevStep).toBeNull()
			})
		})
	})

	describe('Navigation Edge Case Helpers', () => {
		describe('isFirstStepOfRootFlow', () => {
			it('should return true when on first step of root flow', () => {
				vi.mocked(FrameState.getState).mockReturnValue({
					currentFlow: 'test-flow',
					currentStepKey: 'step-1',
					flowHistory: [],
				} as any)
				vi.mocked(FrameState.getFlowDefinition).mockReturnValue({
					flow: {
						'step-1': { components: [] },
						'step-2': { components: [] },
					},
				})

				expect(isFirstStepOfRootFlow()).toBe(true)
			})

			it('should return false when not on first step', () => {
				vi.mocked(FrameState.getState).mockReturnValue({
					currentFlow: 'test-flow',
					currentStepKey: 'step-2',
					flowHistory: [],
				} as any)
				vi.mocked(FrameState.getFlowDefinition).mockReturnValue({
					flow: {
						'step-1': { components: [] },
						'step-2': { components: [] },
					},
				})

				expect(isFirstStepOfRootFlow()).toBe(false)
			})

			it('should return false when in chained flow', () => {
				vi.mocked(FrameState.getState).mockReturnValue({
					currentFlow: 'test-flow',
					currentStepKey: 'step-1',
					flowHistory: [{ flow: 'previous-flow', stepKey: 'prev-step' }],
				} as any)

				expect(isFirstStepOfRootFlow()).toBe(false)
			})

			it('should return false when no current flow', () => {
				vi.mocked(FrameState.getState).mockReturnValue({
					currentFlow: null,
					currentStepKey: null,
					flowHistory: [],
				} as any)

				expect(isFirstStepOfRootFlow()).toBe(false)
			})
		})

		describe('isLastStepOfLeafFlow', () => {
			it('should return true when on last step', () => {
				vi.mocked(FrameState.getState).mockReturnValue({
					currentFlow: 'test-flow',
					currentStepKey: 'step-2',
				} as any)
				vi.mocked(FrameState.getFlowDefinition).mockReturnValue({
					flow: {
						'step-1': { components: [] },
						'step-2': { components: [] },
					},
				})

				expect(isLastStepOfLeafFlow()).toBe(true)
			})

			it('should return false when not on last step', () => {
				vi.mocked(FrameState.getState).mockReturnValue({
					currentFlow: 'test-flow',
					currentStepKey: 'step-1',
				} as any)
				vi.mocked(FrameState.getFlowDefinition).mockReturnValue({
					flow: {
						'step-1': { components: [] },
						'step-2': { components: [] },
					},
				})

				expect(isLastStepOfLeafFlow()).toBe(false)
			})

			it('should return false when no current flow', () => {
				vi.mocked(FrameState.getState).mockReturnValue({
					currentFlow: null,
					currentStepKey: null,
				} as any)

				expect(isLastStepOfLeafFlow()).toBe(false)
			})
		})
	})
})
