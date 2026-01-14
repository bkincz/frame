/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStepLifecycle } from '../useStepLifecycle'
import FrameState from '@/state/frame.state'
import StepState from '@/state/step.state'
import type { FlowDefinition } from '@/types/flow.types'

/*
 *   MOCKS
 ***************************************************************************************************/
vi.mock('@/state/frame.state', () => ({
	default: {
		markStepEntered: vi.fn(),
		markStepExited: vi.fn(),
	},
}))

vi.mock('@/state/step.state', () => ({
	default: {
		startEntering: vi.fn(),
		endEntering: vi.fn(),
		startExiting: vi.fn(),
		endExiting: vi.fn(),
	},
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
	},
}

/*
 *   TESTS
 ***************************************************************************************************/
describe('useStepLifecycle', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Step onEnter', () => {
		it('should call onEnter when step is rendered', async () => {
			const onEnter = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onEnter,
					},
				},
			}

			renderHook(() => useStepLifecycle('step1', flowDef))

			await waitFor(() => {
				expect(onEnter).toHaveBeenCalled()
			})
		})

		it('should call StepState.startEntering before onEnter', async () => {
			const onEnter = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onEnter,
					},
				},
			}

			renderHook(() => useStepLifecycle('step1', flowDef))

			await waitFor(() => {
				expect(StepState.startEntering).toHaveBeenCalled()
			})
		})

		it('should mark step as entered after onEnter completes', async () => {
			const onEnter = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onEnter,
					},
				},
			}

			renderHook(() => useStepLifecycle('step1', flowDef))

			await waitFor(() => {
				expect(FrameState.markStepEntered).toHaveBeenCalled()
			})
		})

		it('should call StepState.endEntering after marking step entered', async () => {
			const onEnter = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onEnter,
					},
				},
			}

			renderHook(() => useStepLifecycle('step1', flowDef))

			await waitFor(() => {
				expect(StepState.endEntering).toHaveBeenCalled()
			})
		})

		it('should not call onEnter if currentStepKey is null', () => {
			const onEnter = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onEnter,
					},
				},
			}

			renderHook(() => useStepLifecycle(null, flowDef))

			expect(onEnter).not.toHaveBeenCalled()
		})

		it('should not call onEnter if flowDefinition is null', () => {
			renderHook(() => useStepLifecycle('step1', null))

			expect(StepState.startEntering).not.toHaveBeenCalled()
		})

		it('should not call onEnter if step does not exist in flow', () => {
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
					},
				},
			}

			renderHook(() => useStepLifecycle('nonexistent-step', flowDef))

			expect(StepState.startEntering).not.toHaveBeenCalled()
		})

		it('should not call state methods if step has no onEnter', () => {
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
					},
				},
			}

			renderHook(() => useStepLifecycle('step1', flowDef))

			expect(StepState.startEntering).not.toHaveBeenCalled()
			expect(FrameState.markStepEntered).not.toHaveBeenCalled()
			expect(StepState.endEntering).not.toHaveBeenCalled()
		})

		it('should handle async onEnter', async () => {
			const onEnter = vi.fn().mockResolvedValue(undefined)
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onEnter,
					},
				},
			}

			renderHook(() => useStepLifecycle('step1', flowDef))

			await waitFor(() => {
				expect(onEnter).toHaveBeenCalled()
				expect(FrameState.markStepEntered).toHaveBeenCalled()
			})
		})

		it('should handle onEnter errors gracefully', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
			const error = new Error('onEnter error')
			const onEnter = vi.fn().mockRejectedValue(error)
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onEnter,
					},
				},
			}

			renderHook(() => useStepLifecycle('step1', flowDef))

			await waitFor(() => {
				expect(consoleSpy).toHaveBeenCalledWith(
					'[useStepLifecycle] Error in step onEnter:',
					error
				)
			})

			await waitFor(() => {
				expect(StepState.endEntering).toHaveBeenCalled()
			})

			consoleSpy.mockRestore()
		})

		it('should call endEntering even if onEnter throws', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
			const onEnter = vi.fn().mockRejectedValue(new Error('test error'))
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onEnter,
					},
				},
			}

			renderHook(() => useStepLifecycle('step1', flowDef))

			await waitFor(() => {
				expect(StepState.endEntering).toHaveBeenCalled()
			})

			consoleSpy.mockRestore()
		})
	})

	describe('Step onExit', () => {
		it('should call onExit on unmount', async () => {
			const onExit = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onExit,
					},
				},
			}

			const { unmount } = renderHook(() => useStepLifecycle('step1', flowDef))

			unmount()

			await waitFor(() => {
				expect(onExit).toHaveBeenCalled()
			})
		})

		it('should call StepState.startExiting before onExit', async () => {
			const onExit = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onExit,
					},
				},
			}

			const { unmount } = renderHook(() => useStepLifecycle('step1', flowDef))

			unmount()

			await waitFor(() => {
				expect(StepState.startExiting).toHaveBeenCalled()
			})
		})

		it('should mark step as exited after onExit completes', async () => {
			const onExit = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onExit,
					},
				},
			}

			const { unmount } = renderHook(() => useStepLifecycle('step1', flowDef))

			unmount()

			await waitFor(() => {
				expect(FrameState.markStepExited).toHaveBeenCalled()
			})
		})

		it('should call StepState.endExiting after marking step exited', async () => {
			const onExit = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onExit,
					},
				},
			}

			const { unmount } = renderHook(() => useStepLifecycle('step1', flowDef))

			unmount()

			await waitFor(() => {
				expect(StepState.endExiting).toHaveBeenCalled()
			})
		})

		it('should not call onExit if step has no onExit', () => {
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
					},
				},
			}

			const { unmount } = renderHook(() => useStepLifecycle('step1', flowDef))

			unmount()

			expect(StepState.startExiting).not.toHaveBeenCalled()
		})

		it('should handle async onExit', async () => {
			const onExit = vi.fn().mockResolvedValue(undefined)
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onExit,
					},
				},
			}

			const { unmount } = renderHook(() => useStepLifecycle('step1', flowDef))

			unmount()

			await waitFor(() => {
				expect(onExit).toHaveBeenCalled()
				expect(FrameState.markStepExited).toHaveBeenCalled()
			})
		})

		it('should handle onExit errors gracefully', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
			const error = new Error('onExit error')
			const onExit = vi.fn().mockRejectedValue(error)
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onExit,
					},
				},
			}

			const { unmount } = renderHook(() => useStepLifecycle('step1', flowDef))

			unmount()

			await waitFor(() => {
				expect(consoleSpy).toHaveBeenCalledWith(
					'[useStepLifecycle] Error in step onExit:',
					error
				)
			})

			await waitFor(() => {
				expect(StepState.endExiting).toHaveBeenCalled()
			})

			consoleSpy.mockRestore()
		})

		it('should call endExiting even if onExit throws', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
			const onExit = vi.fn().mockRejectedValue(new Error('test error'))
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onExit,
					},
				},
			}

			const { unmount } = renderHook(() => useStepLifecycle('step1', flowDef))

			unmount()

			await waitFor(() => {
				expect(StepState.endExiting).toHaveBeenCalled()
			})

			consoleSpy.mockRestore()
		})
	})

	describe('Step Changes', () => {
		it('should handle step changes within same flow', async () => {
			const onEnter1 = vi.fn()
			const onExit1 = vi.fn()
			const onEnter2 = vi.fn()

			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onEnter: onEnter1,
						onExit: onExit1,
					},
					step2: {
						component: () => null,
						config: {},
						onEnter: onEnter2,
					},
				},
			}

			const { rerender } = renderHook(
				({ stepKey }) => useStepLifecycle(stepKey, flowDef),
				{
					initialProps: { stepKey: 'step1' },
				}
			)

			await waitFor(() => {
				expect(onEnter1).toHaveBeenCalled()
			})

			rerender({ stepKey: 'step2' })

			await waitFor(() => {
				expect(onExit1).toHaveBeenCalled()
				expect(onEnter2).toHaveBeenCalled()
			})
		})

		it('should not re-run onEnter if flowDefinition reference changes but step stays same', () => {
			const onEnter = vi.fn()
			const flowDef1: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onEnter,
					},
				},
			}

			const flowDef2: FlowDefinition = {
				...mockFlowDefinition,
				flow: {
					step1: {
						component: () => null,
						config: {},
						onEnter,
					},
				},
			}

			const { rerender } = renderHook(
				({ flowDef }) => useStepLifecycle('step1', flowDef),
				{
					initialProps: { flowDef: flowDef1 },
				}
			)

			expect(onEnter).toHaveBeenCalledTimes(1)

			rerender({ flowDef: flowDef2 })

			// Should not call onEnter again since currentStepKey hasn't changed
			expect(onEnter).toHaveBeenCalledTimes(1)
		})
	})
})
