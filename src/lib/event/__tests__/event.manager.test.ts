/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import customEventManager from '../event.manager'

/*
 *   TESTS
 ***************************************************************************************************/
describe('CustomEventManager', () => {
	beforeEach(() => {
		customEventManager.cleanup()
	})

	afterEach(() => {
		customEventManager.cleanup()
		vi.clearAllMocks()
	})

	describe('subscribe', () => {
		it('should subscribe to an event', () => {
			const callback = vi.fn()
			const subscription = customEventManager.subscribe('test:event', callback)

			expect(subscription).toHaveProperty('id')
			expect(subscription).toHaveProperty('unsubscribe')
			expect(subscription.unsubscribe).toBeInstanceOf(Function)
		})

		it('should generate unique subscription IDs', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			const sub1 = customEventManager.subscribe('test:event', callback1)
			const sub2 = customEventManager.subscribe('test:event', callback2)

			expect(sub1.id).not.toBe(sub2.id)
		})

		it('should support multiple subscribers for the same event', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			customEventManager.subscribe('test:event', callback1)
			customEventManager.subscribe('test:event', callback2)

			customEventManager.emit('test:event', { data: 'test' })

			expect(callback1).toHaveBeenCalledWith({ data: 'test' })
			expect(callback2).toHaveBeenCalledWith({ data: 'test' })
		})

		it('should support subscribers to different events', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			customEventManager.subscribe('event:one', callback1)
			customEventManager.subscribe('event:two', callback2)

			customEventManager.emit('event:one', { data: 'one' })

			expect(callback1).toHaveBeenCalledWith({ data: 'one' })
			expect(callback2).not.toHaveBeenCalled()
		})
	})

	describe('emit', () => {
		it('should emit event to all subscribers', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			customEventManager.subscribe('test:event', callback1)
			customEventManager.subscribe('test:event', callback2)

			customEventManager.emit('test:event', { value: 42 })

			expect(callback1).toHaveBeenCalledTimes(1)
			expect(callback1).toHaveBeenCalledWith({ value: 42 })
			expect(callback2).toHaveBeenCalledTimes(1)
			expect(callback2).toHaveBeenCalledWith({ value: 42 })
		})

		it('should not call subscribers of other events', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			customEventManager.subscribe('event:one', callback1)
			customEventManager.subscribe('event:two', callback2)

			customEventManager.emit('event:one', { data: 'test' })

			expect(callback1).toHaveBeenCalled()
			expect(callback2).not.toHaveBeenCalled()
		})

		it('should handle emit with no subscribers', () => {
			expect(() => {
				customEventManager.emit('no:subscribers', { data: 'test' })
			}).not.toThrow()
		})

		it('should handle emit with undefined data', () => {
			const callback = vi.fn()

			customEventManager.subscribe('test:event', callback)
			customEventManager.emit('test:event', undefined)

			expect(callback).toHaveBeenCalledWith(undefined)
		})

		it('should emit typed events correctly', () => {
			const callback = vi.fn()

			customEventManager.subscribe('frame:open', callback)
			customEventManager.emit('frame:open', { flow: 'test', stepKey: 'step1' })

			expect(callback).toHaveBeenCalledWith({ flow: 'test', stepKey: 'step1' })
		})
	})

	describe('unsubscribe', () => {
		it('should unsubscribe from an event', () => {
			const callback = vi.fn()
			const subscription = customEventManager.subscribe('test:event', callback)

			subscription.unsubscribe()

			customEventManager.emit('test:event', { data: 'test' })

			expect(callback).not.toHaveBeenCalled()
		})

		it('should only unsubscribe the specific subscription', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			const sub1 = customEventManager.subscribe('test:event', callback1)
			customEventManager.subscribe('test:event', callback2)

			sub1.unsubscribe()

			customEventManager.emit('test:event', { data: 'test' })

			expect(callback1).not.toHaveBeenCalled()
			expect(callback2).toHaveBeenCalled()
		})

		it('should handle multiple unsubscribe calls gracefully', () => {
			const callback = vi.fn()
			const subscription = customEventManager.subscribe('test:event', callback)

			subscription.unsubscribe()
			subscription.unsubscribe()

			customEventManager.emit('test:event', { data: 'test' })

			expect(callback).not.toHaveBeenCalled()
		})

		it('should clean up empty subscriber maps', () => {
			const callback = vi.fn()
			const subscription = customEventManager.subscribe('test:event', callback)

			subscription.unsubscribe()

			const counts = customEventManager.getSubscriptionCount()

			expect(counts['test:event']).toBeUndefined()
		})
	})

	describe('cleanup', () => {
		it('should remove all subscriptions', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			customEventManager.subscribe('event:one', callback1)
			customEventManager.subscribe('event:two', callback2)

			customEventManager.cleanup()

			customEventManager.emit('event:one', { data: 'test' })
			customEventManager.emit('event:two', { data: 'test' })

			expect(callback1).not.toHaveBeenCalled()
			expect(callback2).not.toHaveBeenCalled()
		})

		it('should reset subscription counts', () => {
			const callback = vi.fn()

			customEventManager.subscribe('test:event', callback)

			customEventManager.cleanup()

			const counts = customEventManager.getSubscriptionCount()

			expect(counts).toEqual({})
		})
	})

	describe('getSubscriptionCount', () => {
		it('should return empty object when no subscriptions', () => {
			const counts = customEventManager.getSubscriptionCount()
			expect(counts).toEqual({})
		})

		it('should return correct count for single event', () => {
			customEventManager.subscribe('test:event', vi.fn())
			customEventManager.subscribe('test:event', vi.fn())

			const counts = customEventManager.getSubscriptionCount()

			expect(counts['test:event']).toBe(2)
		})

		it('should return correct counts for multiple events', () => {
			customEventManager.subscribe('event:one', vi.fn())
			customEventManager.subscribe('event:one', vi.fn())
			customEventManager.subscribe('event:two', vi.fn())

			const counts = customEventManager.getSubscriptionCount()

			expect(counts['event:one']).toBe(2)
			expect(counts['event:two']).toBe(1)
		})

		it('should update counts after unsubscribe', () => {
			const sub1 = customEventManager.subscribe('test:event', vi.fn())
			customEventManager.subscribe('test:event', vi.fn())

			let counts = customEventManager.getSubscriptionCount()
			expect(counts['test:event']).toBe(2)

			sub1.unsubscribe()

			counts = customEventManager.getSubscriptionCount()
			expect(counts['test:event']).toBe(1)
		})
	})

	describe('Debug Mode', () => {
		it('should log subscription in non-production', () => {
			const consoleSpy = vi.spyOn(console, 'groupCollapsed')
			const consoleEndSpy = vi.spyOn(console, 'groupEnd')

			customEventManager.subscribe('test:event', vi.fn())

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Event Subscribe'),
				expect.any(String),
				expect.any(String)
			)
			expect(consoleEndSpy).toHaveBeenCalled()

			consoleSpy.mockRestore()
			consoleEndSpy.mockRestore()
		})

		it('should log emit in non-production', () => {
			const consoleSpy = vi.spyOn(console, 'groupCollapsed')

			customEventManager.subscribe('test:event', vi.fn())
			customEventManager.emit('test:event', { data: 'test' })

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Event Emit'),
				expect.any(String),
				expect.any(String)
			)

			consoleSpy.mockRestore()
		})

		it('should log unsubscribe in non-production', () => {
			const consoleSpy = vi.spyOn(console, 'groupCollapsed')

			const subscription = customEventManager.subscribe('test:event', vi.fn())
			subscription.unsubscribe()

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Event Unsubscribe'),
				expect.any(String),
				expect.any(String)
			)

			consoleSpy.mockRestore()
		})
	})

	describe('Type Safety', () => {
		it('should work with typed events from EventDataMap', () => {
			const callback = vi.fn()

			customEventManager.subscribe('frame:step:change', callback)
			customEventManager.emit('frame:step:change', {
				stepKey: 'step1',
				previousStepKey: 'step0',
			})

			expect(callback).toHaveBeenCalledWith({
				stepKey: 'step1',
				previousStepKey: 'step0',
			})
		})

		it('should work with void event data', () => {
			const callback = vi.fn()

			customEventManager.subscribe('frame:close', callback)
			customEventManager.emit('frame:close', undefined)

			expect(callback).toHaveBeenCalledWith(undefined)
		})
	})

	describe('Edge Cases', () => {
		it('should handle callback errors gracefully', () => {
			const errorCallback = vi.fn(() => {
				throw new Error('Callback error')
			})
			const successCallback = vi.fn()

			customEventManager.subscribe('test:event', errorCallback)
			customEventManager.subscribe('test:event', successCallback)

			expect(() => {
				customEventManager.emit('test:event', { data: 'test' })
			}).toThrow('Callback error')

			expect(errorCallback).toHaveBeenCalled()
			// Due to the throw, subsequent callbacks may not execute
		})

		it('should handle subscription during emit', () => {
			const callback = vi.fn()
			let newSubscription: any

			const initialCallback = vi.fn(() => {
				newSubscription = customEventManager.subscribe('test:event', callback)
			})

			customEventManager.subscribe('test:event', initialCallback)
			customEventManager.emit('test:event', { data: 'test' })

			// Initial callback should have been called
			expect(initialCallback).toHaveBeenCalled()
			// The new subscription added during emit may or may not be called in the same emit
			// This is implementation-dependent, so we'll just verify it works in the next emit

			// Clear previous calls
			callback.mockClear()

			// Next emit should definitely call the new subscription
			customEventManager.emit('test:event', { data: 'test2' })
			expect(callback).toHaveBeenCalledWith({ data: 'test2' })
		})

		it('should handle unsubscribe during emit', () => {
			let subscription: any
			const callback1 = vi.fn(() => {
				subscription?.unsubscribe()
			})
			const callback2 = vi.fn()

			subscription = customEventManager.subscribe('test:event', callback1)
			customEventManager.subscribe('test:event', callback2)

			customEventManager.emit('test:event', { data: 'test' })

			expect(callback1).toHaveBeenCalled()
			expect(callback2).toHaveBeenCalled()

			// Second emit should not call callback1
			customEventManager.emit('test:event', { data: 'test2' })

			expect(callback1).toHaveBeenCalledTimes(1)
			expect(callback2).toHaveBeenCalledTimes(2)
		})
	})
})
