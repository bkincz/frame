/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useNavigationState } from '../useNavigationState'
import AnimationState from '@/state/animation.state'
import StepState from '@/state/step.state'
import FrameState from '@/state/frame.state'
import * as frameFunctions from '@/core/frame.functions'
import type { FlowDefinition } from '@/types/flow.types'

/*
 *   MOCKS
 ***************************************************************************************************/
vi.mock('@/state/animation.state', () => ({
	default: {
		subscribe: vi.fn(() => vi.fn()),
		getState: vi.fn(() => ({ isAnimating: false, animationType: null })),
	},
}))

vi.mock('@/state/step.state', () => ({
	default: {
		subscribe: vi.fn(() => vi.fn()),
		getState: vi.fn(() => ({ isEntering: false, isExiting: false })),
	},
}))

vi.mock('@/state/frame.state', () => ({
	default: {
		subscribe: vi.fn(() => vi.fn()),
		getState: vi.fn(() => ({
			currentFlow: null,
			currentStepKey: null,
			flowHistory: [],
		})),
		getFlowDefinition: vi.fn(() => null),
	},
}))

vi.mock('@/core/frame.functions', () => ({
	isFirstStepOfRootFlow: vi.fn(() => false),
	isLastStepOfLeafFlow: vi.fn(() => false),
}))

/*
 *   TEST DATA
 ***************************************************************************************************/
const mockFlowDefinition: FlowDefinition = {
	name: 'test-flow',
	config: {},
	flow: {
		step1: {
			component: () => null,
			config: {},
		},
		step2: {
			component: () => null,
			config: {},
		},
		step3: {
			component: () => null,
			config: {},
		},
	},
}

/*
 *   TESTS
 ***************************************************************************************************/
describe('useNavigationState', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Reset default mock returns
		vi.mocked(AnimationState.getState).mockReturnValue({
			isAnimating: false,
			animationType: null,
		})
		vi.mocked(StepState.getState).mockReturnValue({
			isEntering: false,
			isExiting: false,
		})
		vi.mocked(FrameState.getState).mockReturnValue({
			currentFlow: null,
			currentStepKey: null,
			flowHistory: [],
		})
		vi.mocked(FrameState.getFlowDefinition).mockReturnValue(null)
		vi.mocked(frameFunctions.isFirstStepOfRootFlow).mockReturnValue(false)
		vi.mocked(frameFunctions.isLastStepOfLeafFlow).mockReturnValue(false)
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Next Button', () => {
		it('should be disabled when no flow is active', () => {
			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(true)
			expect(result.current.canNavigate).toBe(false)
		})

		it('should be enabled on first step', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(false)
			expect(result.current.canNavigate).toBe(true)
		})

		it('should be enabled on middle step', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step2',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(false)
			expect(result.current.canNavigate).toBe(true)
		})

		it('should be enabled on last step (to close frame)', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step3',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)
			vi.mocked(frameFunctions.isLastStepOfLeafFlow).mockReturnValue(true)

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(false)
			expect(result.current.canNavigate).toBe(false) // Can't navigate to next step
		})

		it('should be disabled when animating', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)
			vi.mocked(AnimationState.getState).mockReturnValue({
				isAnimating: true,
				animationType: 'step',
			})

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(true)
		})

		it('should be disabled when step is entering', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)
			vi.mocked(StepState.getState).mockReturnValue({
				isEntering: true,
				isExiting: false,
			})

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(true)
		})

		it('should be disabled when step is exiting', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)
			vi.mocked(StepState.getState).mockReturnValue({
				isEntering: false,
				isExiting: true,
			})

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(true)
		})

		it('should be hidden when step config hides it', () => {
			const flowDefWithHiddenNext: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {
							footer: {
								hideNext: true,
							},
						},
					},
				},
			}

			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(flowDefWithHiddenNext)

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isHidden).toBe(true)
		})

		it('should be hidden when flow config hides it', () => {
			const flowDefWithHiddenNext: FlowDefinition = {
				...mockFlowDefinition,
				config: {
					footer: {
						hideNext: true,
					},
				},
			}

			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(flowDefWithHiddenNext)

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isHidden).toBe(true)
		})

		it('should prefer step config over flow config', () => {
			const flowDefWithMixedConfig: FlowDefinition = {
				...mockFlowDefinition,
				config: {
					footer: {
						hideNext: false,
					},
				},
				flow: {
					step1: {
						component: () => null,
						config: {
							footer: {
								hideNext: true,
							},
						},
					},
				},
			}

			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(flowDefWithMixedConfig)

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isHidden).toBe(true)
		})
	})

	describe('Previous Button', () => {
		it('should be disabled on first step', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)

			const { result } = renderHook(() => useNavigationState({ direction: 'previous' }))

			expect(result.current.isDisabled).toBe(true)
			expect(result.current.canNavigate).toBe(false)
		})

		it('should be enabled on first step of root flow (to close frame)', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)
			vi.mocked(frameFunctions.isFirstStepOfRootFlow).mockReturnValue(true)

			const { result } = renderHook(() => useNavigationState({ direction: 'previous' }))

			expect(result.current.isDisabled).toBe(false)
			expect(result.current.canNavigate).toBe(false) // Can't navigate to previous step
		})

		it('should be enabled on middle step', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step2',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)

			const { result } = renderHook(() => useNavigationState({ direction: 'previous' }))

			expect(result.current.isDisabled).toBe(false)
			expect(result.current.canNavigate).toBe(true)
		})

		it('should be enabled on last step', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step3',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)

			const { result } = renderHook(() => useNavigationState({ direction: 'previous' }))

			expect(result.current.isDisabled).toBe(false)
			expect(result.current.canNavigate).toBe(true)
		})

		it('should be disabled when animating', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step2',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)
			vi.mocked(AnimationState.getState).mockReturnValue({
				isAnimating: true,
				animationType: 'step',
			})

			const { result } = renderHook(() => useNavigationState({ direction: 'previous' }))

			expect(result.current.isDisabled).toBe(true)
		})

		it('should be disabled when step is entering', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step2',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)
			vi.mocked(StepState.getState).mockReturnValue({
				isEntering: true,
				isExiting: false,
			})

			const { result } = renderHook(() => useNavigationState({ direction: 'previous' }))

			expect(result.current.isDisabled).toBe(true)
		})

		it('should be disabled when step is exiting', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step2',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)
			vi.mocked(StepState.getState).mockReturnValue({
				isEntering: false,
				isExiting: true,
			})

			const { result } = renderHook(() => useNavigationState({ direction: 'previous' }))

			expect(result.current.isDisabled).toBe(true)
		})

		it('should be hidden when step config hides it', () => {
			const flowDefWithHiddenBack: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step2: {
						component: () => null,
						config: {
							footer: {
								hideBack: true,
							},
						},
					},
				},
			}

			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step2',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(flowDefWithHiddenBack)

			const { result } = renderHook(() => useNavigationState({ direction: 'previous' }))

			expect(result.current.isHidden).toBe(true)
		})

		it('should be hidden when flow config hides it', () => {
			const flowDefWithHiddenBack: FlowDefinition = {
				...mockFlowDefinition,
				config: {
					footer: {
						hideBack: true,
					},
				},
			}

			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step2',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(flowDefWithHiddenBack)

			const { result } = renderHook(() => useNavigationState({ direction: 'previous' }))

			expect(result.current.isHidden).toBe(true)
		})
	})

	describe('Edge Cases', () => {
		it('should handle missing flow definition', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(null)

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(true)
			expect(result.current.canNavigate).toBe(false)
		})

		it('should handle missing step in flow', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'nonexistent-step',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(true)
			expect(result.current.canNavigate).toBe(false)
		})

		it('should handle empty flow definition', () => {
			const emptyFlowDef: FlowDefinition = {
				name: 'empty-flow',
				config: {},
				flow: {},
			}

			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'empty-flow',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(emptyFlowDef)

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(true)
			expect(result.current.canNavigate).toBe(false)
		})

		it('should handle single step flow - next direction', () => {
			const singleStepFlow: FlowDefinition = {
				name: 'single-step',
				config: {},
				flow: {
					step1: {
						component: () => null,
						config: {},
					},
				},
			}

			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'single-step',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(singleStepFlow)
			vi.mocked(frameFunctions.isLastStepOfLeafFlow).mockReturnValue(true)

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(false)
			expect(result.current.canNavigate).toBe(false)
		})

		it('should handle single step flow - previous direction', () => {
			const singleStepFlow: FlowDefinition = {
				name: 'single-step',
				config: {},
				flow: {
					step1: {
						component: () => null,
						config: {},
					},
				},
			}

			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'single-step',
				currentStepKey: 'step1',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(singleStepFlow)
			vi.mocked(frameFunctions.isFirstStepOfRootFlow).mockReturnValue(true)

			const { result } = renderHook(() => useNavigationState({ direction: 'previous' }))

			expect(result.current.isDisabled).toBe(false)
			expect(result.current.canNavigate).toBe(false)
		})
	})

	describe('State Combinations', () => {
		it('should be disabled when both animating and in lifecycle', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step2',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)
			vi.mocked(AnimationState.getState).mockReturnValue({
				isAnimating: true,
				animationType: 'step',
			})
			vi.mocked(StepState.getState).mockReturnValue({
				isEntering: true,
				isExiting: false,
			})

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(true)
		})

		it('should be enabled when not animating and not in lifecycle with valid navigation', () => {
			vi.mocked(FrameState.getState).mockReturnValue({
				currentFlow: 'test-flow',
				currentStepKey: 'step2',
				flowHistory: [],
			})
			vi.mocked(FrameState.getFlowDefinition).mockReturnValue(mockFlowDefinition)
			vi.mocked(AnimationState.getState).mockReturnValue({
				isAnimating: false,
				animationType: null,
			})
			vi.mocked(StepState.getState).mockReturnValue({
				isEntering: false,
				isExiting: false,
			})

			const { result } = renderHook(() => useNavigationState({ direction: 'next' }))

			expect(result.current.isDisabled).toBe(false)
			expect(result.current.canNavigate).toBe(true)
		})
	})
})
