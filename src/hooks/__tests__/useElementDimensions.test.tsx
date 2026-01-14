/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useElementDimensions } from '../useElementDimensions'

/*
 *   MOCKS
 ***************************************************************************************************/
// Mock ResizeObserver
class MockResizeObserver {
	private callback: ResizeObserverCallback
	public elements: Set<Element> = new Set()

	constructor(callback: ResizeObserverCallback) {
		this.callback = callback
	}

	observe(target: Element) {
		this.elements.add(target)
	}

	unobserve(target: Element) {
		this.elements.delete(target)
	}

	disconnect() {
		this.elements.clear()
	}

	trigger(entries: ResizeObserverEntry[]) {
		this.callback(entries, this)
	}
}

/*
 *   TESTS
 ***************************************************************************************************/
describe('useElementDimensions', () => {
	let mockResizeObserver: MockResizeObserver | null = null

	beforeEach(() => {
		mockResizeObserver = null
		// Mock ResizeObserver as a class constructor
		global.ResizeObserver = class ResizeObserver {
			constructor(callback: ResizeObserverCallback) {
				mockResizeObserver = new MockResizeObserver(callback)
				return mockResizeObserver as any
			}
		} as any
	})

	afterEach(() => {
		vi.clearAllMocks()
		mockResizeObserver = null
	})

	describe('Initial State', () => {
		it('should return ref and initial dimensions', () => {
			const { result } = renderHook(() => useElementDimensions())

			const [ref, dimensions] = result.current

			expect(ref).toBeDefined()
			expect(ref.current).toBeNull()
			expect(dimensions).toEqual({ width: 0, height: 0 })
		})

		it('should support typed elements', () => {
			const { result } = renderHook(() => useElementDimensions<HTMLDivElement>())

			const [ref] = result.current
			expect(ref).toBeDefined()
		})
	})

	describe('ResizeObserver', () => {
		it('should create ResizeObserver when ref is set', () => {
			let currentRef: any = null

			// Create a wrapper that simulates ref assignment
			const { rerender } = renderHook(() => {
				const [ref, dimensions] = useElementDimensions()
				// Simulate ref assignment on first render
				if (!currentRef && ref.current === null) {
					currentRef = ref
					;(ref as any).current = document.createElement('div')
				}
				return { ref, dimensions }
			})

			// Rerender to trigger useEffect with the ref set
			rerender()

			// Verify ResizeObserver was created by checking if our mock was set
			expect(mockResizeObserver).not.toBeNull()
		})

		it('should observe element when ref is set', () => {
			let currentRef: any = null

			const { rerender } = renderHook(() => {
				const [ref, dimensions] = useElementDimensions()
				if (!currentRef && ref.current === null) {
					currentRef = ref
					;(ref as any).current = document.createElement('div')
				}
				return { ref, dimensions }
			})

			rerender()

			expect(mockResizeObserver).toBeDefined()
			expect(mockResizeObserver?.elements.size).toBeGreaterThan(0)
		})

		it('should update dimensions when resize occurs', () => {
			let currentRef: any = null

			const { result, rerender } = renderHook(() => {
				const [ref, dimensions] = useElementDimensions()
				if (!currentRef && ref.current === null) {
					currentRef = ref
					const mockElement = document.createElement('div')
					;(ref as any).current = mockElement
				}
				return { ref, dimensions }
			})

			// Rerender to trigger useEffect
			rerender()

			// Simulate resize
			const mockElement = result.current.ref.current!
			const mockEntry: Partial<ResizeObserverEntry> = {
				contentRect: {
					width: 100,
					height: 200,
					x: 0,
					y: 0,
					top: 0,
					right: 100,
					bottom: 200,
					left: 0,
					toJSON: () => ({}),
				} as DOMRectReadOnly,
				target: mockElement,
			}

			act(() => {
				if (mockResizeObserver) {
					mockResizeObserver.trigger([mockEntry as ResizeObserverEntry])
				}
			})

			expect(result.current.dimensions.width).toBe(100)
			expect(result.current.dimensions.height).toBe(200)
		})

		it('should round dimensions to integers', () => {
			let currentRef: any = null

			const { result, rerender } = renderHook(() => {
				const [ref, dimensions] = useElementDimensions()
				if (!currentRef && ref.current === null) {
					currentRef = ref
					;(ref as any).current = document.createElement('div')
				}
				return { ref, dimensions }
			})

			rerender()

			// Simulate resize with fractional dimensions
			const mockElement = result.current.ref.current!
			const mockEntry: Partial<ResizeObserverEntry> = {
				contentRect: {
					width: 100.7,
					height: 200.3,
					x: 0,
					y: 0,
					top: 0,
					right: 100.7,
					bottom: 200.3,
					left: 0,
					toJSON: () => ({}),
				} as DOMRectReadOnly,
				target: mockElement,
			}

			act(() => {
				if (mockResizeObserver) {
					mockResizeObserver.trigger([mockEntry as ResizeObserverEntry])
				}
			})

			expect(result.current.dimensions.width).toBe(101)
			expect(result.current.dimensions.height).toBe(200)
		})

		it('should disconnect observer on unmount', () => {
			let currentRef: any = null

			const { rerender, unmount } = renderHook(() => {
				const [ref, dimensions] = useElementDimensions()
				if (!currentRef && ref.current === null) {
					currentRef = ref
					;(ref as any).current = document.createElement('div')
				}
				return { ref, dimensions }
			})

			rerender()

			const disconnectSpy = vi.spyOn(mockResizeObserver!, 'disconnect')

			unmount()

			expect(disconnectSpy).toHaveBeenCalled()
		})
	})

	describe('Edge Cases', () => {
		it('should handle null ref', () => {
			const { result } = renderHook(() => useElementDimensions())
			const [ref, dimensions] = result.current

			expect(ref.current).toBeNull()
			expect(dimensions).toEqual({ width: 0, height: 0 })
		})

		it('should handle empty entries array', () => {
			let currentRef: any = null

			const { result, rerender } = renderHook(() => {
				const [ref, dimensions] = useElementDimensions()
				if (!currentRef && ref.current === null) {
					currentRef = ref
					;(ref as any).current = document.createElement('div')
				}
				return { ref, dimensions }
			})

			const initialDimensions = result.current.dimensions

			rerender()

			// Trigger with empty entries
			if (mockResizeObserver) {
				mockResizeObserver.trigger([])
			}

			expect(result.current.dimensions).toEqual(initialDimensions)
		})

		it('should handle zero dimensions', () => {
			let currentRef: any = null

			const { result, rerender } = renderHook(() => {
				const [ref, dimensions] = useElementDimensions()
				if (!currentRef && ref.current === null) {
					currentRef = ref
					;(ref as any).current = document.createElement('div')
				}
				return { ref, dimensions }
			})

			rerender()

			const mockElement = result.current.ref.current!
			const mockEntry: Partial<ResizeObserverEntry> = {
				contentRect: {
					width: 0,
					height: 0,
					x: 0,
					y: 0,
					top: 0,
					right: 0,
					bottom: 0,
					left: 0,
					toJSON: () => ({}),
				} as DOMRectReadOnly,
				target: mockElement,
			}

			act(() => {
				if (mockResizeObserver) {
					mockResizeObserver.trigger([mockEntry as ResizeObserverEntry])
				}
			})

			expect(result.current.dimensions.width).toBe(0)
			expect(result.current.dimensions.height).toBe(0)
		})
	})
})
