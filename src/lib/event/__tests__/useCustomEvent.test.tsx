/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCustomEvent, useCustomEventEmit } from '../useCustomEvent'
import customEventManager from '../event.manager'

/*
 *   MOCKS
 ***************************************************************************************************/
vi.mock('../event.manager', () => {
	const subscribers = new Map<string, Set<(data: any) => void>>()

	const subscribeImpl = (eventType: string, callback: (data: any) => void) => {
		if (!subscribers.has(eventType)) {
			subscribers.set(eventType, new Set())
		}
		subscribers.get(eventType)!.add(callback)

		return {
			id: `${eventType}_${Date.now()}`,
			unsubscribe: () => {
				subscribers.get(eventType)?.delete(callback)
				if (subscribers.get(eventType)?.size === 0) {
					subscribers.delete(eventType)
				}
			},
		}
	}

	const emitImpl = (eventType: string, data: any) => {
		const eventSubscribers = subscribers.get(eventType)
		if (eventSubscribers) {
			eventSubscribers.forEach(callback => callback(data))
		}
	}

	return {
		default: {
			subscribe: vi.fn(subscribeImpl),
			emit: vi.fn(emitImpl),
			__reset: () => {
				subscribers.clear()
			},
		},
	}
})

/*
 *   TESTS
 ***************************************************************************************************/
describe('useCustomEvent', () => {
	beforeEach(() => {
		;(customEventManager as any).__reset()
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Subscription', () => {
		it('should subscribe to an event on mount', () => {
			const callback = vi.fn()

			renderHook(() => useCustomEvent('test:event', callback))

			expect(customEventManager.subscribe).toHaveBeenCalledWith(
				'test:event',
				expect.any(Function)
			)
		})

		it('should call callback when event is emitted', () => {
			const callback = vi.fn()

			renderHook(() => useCustomEvent('test:event', callback))

			act(() => {
				customEventManager.emit('test:event', { data: 'test' })
			})

			expect(callback).toHaveBeenCalledWith({ data: 'test' })
		})

		it('should unsubscribe on unmount', () => {
			const callback = vi.fn()
			const unsubscribeSpy = vi.fn()

			vi.mocked(customEventManager.subscribe).mockReturnValueOnce({
				id: 'test-id',
				unsubscribe: unsubscribeSpy,
			})

			const { unmount } = renderHook(() => useCustomEvent('test:event', callback))

			unmount()

			expect(unsubscribeSpy).toHaveBeenCalled()
		})

		it('should resubscribe when event type changes', () => {
			const callback = vi.fn()

			const { rerender } = renderHook(
				({ eventType }) => useCustomEvent(eventType, callback),
				{
					initialProps: { eventType: 'event:one' },
				}
			)

			expect(customEventManager.subscribe).toHaveBeenCalledWith(
				'event:one',
				expect.any(Function)
			)

			rerender({ eventType: 'event:two' })

			expect(customEventManager.subscribe).toHaveBeenCalledWith(
				'event:two',
				expect.any(Function)
			)
		})

		it('should use latest callback without resubscribing', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			;(customEventManager as any).__reset()
			vi.clearAllMocks()

			const { rerender } = renderHook(
				({ callback }) => useCustomEvent('test:event', callback),
				{
					initialProps: { callback: callback1 },
				}
			)

			// Clear the initial subscribe call count
			const initialCallCount = vi.mocked(customEventManager.subscribe).mock.calls.length

			// First emit - should call callback1
			act(() => {
				customEventManager.emit('test:event', { data: 'first' })
			})

			expect(callback1).toHaveBeenCalledWith({ data: 'first' })
			expect(callback2).not.toHaveBeenCalled()

			// Change callback
			rerender({ callback: callback2 })

			// Subscribe should not be called again
			expect(vi.mocked(customEventManager.subscribe).mock.calls.length).toBe(initialCallCount)

			// Second emit - should call callback2
			act(() => {
				customEventManager.emit('test:event', { data: 'second' })
			})

			expect(callback1).toHaveBeenCalledTimes(1)
			expect(callback2).toHaveBeenCalledWith({ data: 'second' })
		})
	})

	describe('Disabled Option', () => {
		it('should not subscribe when disabled is true', () => {
			const callback = vi.fn()

			renderHook(() => useCustomEvent('test:event', callback, { disabled: true }))

			expect(customEventManager.subscribe).not.toHaveBeenCalled()
		})

		it('should not call callback when disabled', () => {
			const callback = vi.fn()

			renderHook(() => useCustomEvent('test:event', callback, { disabled: true }))

			act(() => {
				customEventManager.emit('test:event', { data: 'test' })
			})

			expect(callback).not.toHaveBeenCalled()
		})

		it('should subscribe when disabled changes from true to false', () => {
			const callback = vi.fn()

			const { rerender } = renderHook(
				({ disabled }) => useCustomEvent('test:event', callback, { disabled }),
				{
					initialProps: { disabled: true },
				}
			)

			expect(customEventManager.subscribe).not.toHaveBeenCalled()

			rerender({ disabled: false })

			expect(customEventManager.subscribe).toHaveBeenCalledWith(
				'test:event',
				expect.any(Function)
			)
		})

		it('should unsubscribe when disabled changes from false to true', () => {
			const callback = vi.fn()

			const unsubscribeSpy = vi.fn()
			vi.mocked(customEventManager.subscribe).mockReturnValue({
				id: 'test-id',
				unsubscribe: unsubscribeSpy,
			})

			const { rerender } = renderHook(
				({ disabled }) => useCustomEvent('test:event', callback, { disabled }),
				{
					initialProps: { disabled: false },
				}
			)

			expect(customEventManager.subscribe).toHaveBeenCalled()

			rerender({ disabled: true })

			expect(unsubscribeSpy).toHaveBeenCalled()
		})
	})

	describe('Multiple Subscriptions', () => {
		it('should subscribe multiple hooks independently', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			;(customEventManager as any).__reset()

			renderHook(() => useCustomEvent('test:event', callback1))
			renderHook(() => useCustomEvent('test:event', callback2))

			// Verify subscribe was called for each hook
			expect(customEventManager.subscribe).toHaveBeenCalledTimes(2)
		})

		it('should subscribe to different events', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			;(customEventManager as any).__reset()
			vi.clearAllMocks()

			renderHook(() => useCustomEvent('event:one', callback1))
			renderHook(() => useCustomEvent('event:two', callback2))

			expect(customEventManager.subscribe).toHaveBeenCalledWith(
				'event:one',
				expect.any(Function)
			)
			expect(customEventManager.subscribe).toHaveBeenCalledWith(
				'event:two',
				expect.any(Function)
			)
		})
	})
})

describe('useCustomEventEmit', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Emit Function', () => {
		it('should return emit function', () => {
			const { result } = renderHook(() => useCustomEventEmit())

			expect(result.current).toBeInstanceOf(Function)
		})

		it('should call customEventManager.emit', () => {
			const { result } = renderHook(() => useCustomEventEmit())

			act(() => {
				result.current('test:event', { data: 'test' })
			})

			expect(customEventManager.emit).toHaveBeenCalledWith('test:event', { data: 'test' })
		})

		it('should return stable function reference', () => {
			const { result, rerender } = renderHook(() => useCustomEventEmit())

			const firstEmit = result.current

			rerender()

			expect(result.current).toBe(firstEmit)
		})

		it('should handle multiple emits', () => {
			const { result } = renderHook(() => useCustomEventEmit())

			act(() => {
				result.current('event:one', { data: 'one' })
				result.current('event:two', { data: 'two' })
			})

			expect(customEventManager.emit).toHaveBeenCalledWith('event:one', { data: 'one' })
			expect(customEventManager.emit).toHaveBeenCalledWith('event:two', { data: 'two' })
		})

		it('should handle undefined data', () => {
			const { result } = renderHook(() => useCustomEventEmit())

			act(() => {
				result.current('test:event', undefined)
			})

			expect(customEventManager.emit).toHaveBeenCalledWith('test:event', undefined)
		})
	})

	describe('Integration with useCustomEvent', () => {
		it('should call customEventManager.emit with correct args', () => {
			;(customEventManager as any).__reset()
			vi.clearAllMocks()

			const { result } = renderHook(() => useCustomEventEmit())

			act(() => {
				result.current('test:event', { data: 'test' })
			})

			expect(customEventManager.emit).toHaveBeenCalledWith('test:event', { data: 'test' })
		})

		it('should emit typed events correctly', () => {
			;(customEventManager as any).__reset()
			vi.clearAllMocks()

			const { result } = renderHook(() => useCustomEventEmit())

			act(() => {
				result.current('frame:step:change', {
					stepKey: 'step1',
					previousStepKey: 'step0',
				})
			})

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:step:change', {
				stepKey: 'step1',
				previousStepKey: 'step0',
			})
		})
	})
})
