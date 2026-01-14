/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFlowLifecycle } from '../useFlowLifecycle'
import FrameState from '@/state/frame.state'
import type { FlowDefinition } from '@/flows/flow.types'

/*
 *   MOCKS
 ***************************************************************************************************/
vi.mock('@/state/frame.state', () => ({
	default: {
		selectIsFlowEntered: vi.fn(() => false),
		markFlowEntered: vi.fn(),
		markFlowExited: vi.fn(),
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
	},
}

/*
 *   TESTS
 ***************************************************************************************************/
describe('useFlowLifecycle', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(FrameState.selectIsFlowEntered).mockReturnValue(false)
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Flow onEnter', () => {
		it('should call onEnter when flow opens', async () => {
			const onEnter = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onEnter,
			}

			renderHook(() => useFlowLifecycle(true, 'test-flow', flowDef))

			await waitFor(() => {
				expect(onEnter).toHaveBeenCalled()
			})
		})

		it('should mark flow as entered after onEnter completes', async () => {
			const onEnter = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onEnter,
			}

			renderHook(() => useFlowLifecycle(true, 'test-flow', flowDef))

			await waitFor(() => {
				expect(FrameState.markFlowEntered).toHaveBeenCalledWith('test-flow')
			})
		})

		it('should not call onEnter if flow is not open', () => {
			const onEnter = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onEnter,
			}

			renderHook(() => useFlowLifecycle(false, 'test-flow', flowDef))

			expect(onEnter).not.toHaveBeenCalled()
		})

		it('should not call onEnter if flow is null', () => {
			const onEnter = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onEnter,
			}

			renderHook(() => useFlowLifecycle(true, null, flowDef))

			expect(onEnter).not.toHaveBeenCalled()
		})

		it('should not call onEnter if flowDefinition is null', () => {
			renderHook(() => useFlowLifecycle(true, 'test-flow', null))

			expect(FrameState.markFlowEntered).not.toHaveBeenCalled()
		})

		it('should not call onEnter if flow already entered', () => {
			vi.mocked(FrameState.selectIsFlowEntered).mockReturnValue(true)

			const onEnter = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onEnter,
			}

			renderHook(() => useFlowLifecycle(true, 'test-flow', flowDef))

			expect(onEnter).not.toHaveBeenCalled()
		})

		it('should mark flow as entered even without onEnter', async () => {
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
			}

			renderHook(() => useFlowLifecycle(true, 'test-flow', flowDef))

			await waitFor(() => {
				expect(FrameState.markFlowEntered).toHaveBeenCalledWith('test-flow')
			})
		})

		it('should handle async onEnter', async () => {
			const onEnter = vi.fn().mockResolvedValue(undefined)
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onEnter,
			}

			renderHook(() => useFlowLifecycle(true, 'test-flow', flowDef))

			await waitFor(() => {
				expect(onEnter).toHaveBeenCalled()
				expect(FrameState.markFlowEntered).toHaveBeenCalledWith('test-flow')
			})
		})

		it('should handle onEnter errors gracefully', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
			const error = new Error('onEnter error')
			const onEnter = vi.fn().mockRejectedValue(error)
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onEnter,
			}

			renderHook(() => useFlowLifecycle(true, 'test-flow', flowDef))

			await waitFor(() => {
				expect(consoleSpy).toHaveBeenCalledWith(
					'[useFlowLifecycle] Error in flow onEnter:',
					error
				)
			})

			consoleSpy.mockRestore()
		})
	})

	describe('Flow onExit', () => {
		it('should call onExit on unmount', async () => {
			vi.mocked(FrameState.selectIsFlowEntered).mockReturnValue(true)

			const onExit = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onExit,
			}

			const { unmount } = renderHook(() => useFlowLifecycle(true, 'test-flow', flowDef))

			unmount()

			await waitFor(() => {
				expect(onExit).toHaveBeenCalled()
			})
		})

		it('should mark flow as exited after onExit completes', async () => {
			vi.mocked(FrameState.selectIsFlowEntered).mockReturnValue(true)

			const onExit = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onExit,
			}

			const { unmount } = renderHook(() => useFlowLifecycle(true, 'test-flow', flowDef))

			unmount()

			await waitFor(() => {
				expect(FrameState.markFlowExited).toHaveBeenCalledWith('test-flow')
			})
		})

		it('should not call onExit if flow was not entered', () => {
			vi.mocked(FrameState.selectIsFlowEntered).mockReturnValue(false)

			const onExit = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onExit,
			}

			const { unmount } = renderHook(() => useFlowLifecycle(true, 'test-flow', flowDef))

			unmount()

			expect(onExit).not.toHaveBeenCalled()
		})

		it('should not call onExit if flow is null', () => {
			const onExit = vi.fn()
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onExit,
			}

			const { unmount } = renderHook(() => useFlowLifecycle(true, null, flowDef))

			unmount()

			expect(onExit).not.toHaveBeenCalled()
		})

		it('should handle async onExit', async () => {
			vi.mocked(FrameState.selectIsFlowEntered).mockReturnValue(true)

			const onExit = vi.fn().mockResolvedValue(undefined)
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onExit,
			}

			const { unmount } = renderHook(() => useFlowLifecycle(true, 'test-flow', flowDef))

			unmount()

			await waitFor(() => {
				expect(onExit).toHaveBeenCalled()
				expect(FrameState.markFlowExited).toHaveBeenCalledWith('test-flow')
			})
		})

		it('should handle onExit errors gracefully', async () => {
			vi.mocked(FrameState.selectIsFlowEntered).mockReturnValue(true)

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
			const error = new Error('onExit error')
			const onExit = vi.fn().mockRejectedValue(error)
			const flowDef: FlowDefinition = {
				...mockFlowDefinition,
				onExit,
			}

			const { unmount } = renderHook(() => useFlowLifecycle(true, 'test-flow', flowDef))

			unmount()

			await waitFor(() => {
				expect(consoleSpy).toHaveBeenCalledWith(
					'[useFlowLifecycle] Error in flow onExit:',
					error
				)
			})

			consoleSpy.mockRestore()
		})
	})

	describe('Flow Changes', () => {
		it('should handle flow changes', async () => {
			const onEnter1 = vi.fn()
			const flowDef1: FlowDefinition = {
				...mockFlowDefinition,
				name: 'flow-1',
				onEnter: onEnter1,
			}

			const onEnter2 = vi.fn()
			const flowDef2: FlowDefinition = {
				...mockFlowDefinition,
				name: 'flow-2',
				onEnter: onEnter2,
			}

			const { rerender } = renderHook(
				({ flow, flowDef }) => useFlowLifecycle(true, flow, flowDef),
				{
					initialProps: { flow: 'flow-1', flowDef: flowDef1 },
				}
			)

			await waitFor(() => {
				expect(onEnter1).toHaveBeenCalled()
			})

			rerender({ flow: 'flow-2', flowDef: flowDef2 })

			await waitFor(() => {
				expect(onEnter2).toHaveBeenCalled()
			})
		})
	})
})
