/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFrameParams } from '../useFrameParams'

/*
 *   MOCKS
 ***************************************************************************************************/
const mockFlowParams: Record<string, unknown> = {}

vi.mock('@bkincz/clutch', () => ({
	useStateSlice: vi.fn((_state: unknown, selector: (s: { flowParams: Record<string, unknown> }) => unknown) =>
		selector({ flowParams: mockFlowParams })
	),
}))

vi.mock('@/state/frame.state', () => ({
	default: {},
}))

/*
 *   TESTS
 ***************************************************************************************************/
describe('useFrameParams', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Reset mock params
		Object.keys(mockFlowParams).forEach(key => delete mockFlowParams[key])
	})

	it('should return empty object when no params are set', () => {
		const { result } = renderHook(() => useFrameParams())

		expect(result.current).toEqual({})
	})

	it('should return flowParams from FrameState', () => {
		mockFlowParams.userId = '123'
		mockFlowParams.redirect = '/dashboard'

		const { result } = renderHook(() => useFrameParams())

		expect(result.current).toEqual({ userId: '123', redirect: '/dashboard' })
	})

	it('should be typed correctly with generic', () => {
		mockFlowParams.userId = '123'

		const { result } = renderHook(() => useFrameParams<{ userId: string }>())

		// TypeScript compile-time check — accessing typed property
		expect(result.current.userId).toBe('123')
	})

	it('should return the exact object from state slice', () => {
		const params = { instanceId: 'abc', count: 42 }
		Object.assign(mockFlowParams, params)

		const { result } = renderHook(() => useFrameParams<{ instanceId: string; count: number }>())

		expect(result.current.instanceId).toBe('abc')
		expect(result.current.count).toBe(42)
	})
})
