/*
 *   CUSTOM EVENT MANAGER
 *   Centralized system for managing custom application events (non-DOM)
 ***************************************************************************************************/
import type { EventType, EventData } from './event.types'

export type CustomEventCallback<T = any> = (data: T) => void

export interface CustomEventSubscription {
	id: string
	unsubscribe: () => void
}

interface CustomEventSubscriber<T = any> {
	id: string
	callback: CustomEventCallback<T>
}

class CustomEventManager {
	private subscribers: Map<string, Map<string, CustomEventSubscriber>> = new Map()
	private debug: boolean = process.env.NODE_ENV !== 'production'

	/**
	 * Subscribe to a custom event
	 * @param eventType - The custom event type (e.g., 'cart:loading', 'cart:complete')
	 * @param callback - The callback function
	 */
	subscribe<T extends EventType>(
		eventType: T,
		callback: CustomEventCallback<EventData<T>>
	): CustomEventSubscription
	subscribe<T = any>(eventType: string, callback: CustomEventCallback<T>): CustomEventSubscription
	subscribe<T = any>(
		eventType: string,
		callback: CustomEventCallback<T>
	): CustomEventSubscription {
		const id = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

		// Add subscriber
		if (!this.subscribers.has(eventType)) {
			this.subscribers.set(eventType, new Map())
		}

		const subscriber: CustomEventSubscriber<T> = {
			id,
			callback: callback as CustomEventCallback,
		}

		const subscriberMap = this.subscribers.get(eventType)
		if (subscriberMap) {
			subscriberMap.set(id, subscriber)
		}

		if (this.debug) {
			const totalSubscribers = this.subscribers.get(eventType)?.size || 0
			console.groupCollapsed(
				`%c📥 Event Subscribe%c ${eventType}`,
				'color: #10b981; font-weight: bold;',
				'color: #6366f1; font-weight: normal;'
			)
			console.log('%cSubscription ID:', 'color: #64748b;', id)
			console.log('%cTotal subscribers:', 'color: #64748b;', totalSubscribers)
			console.groupEnd()
		}

		return {
			id,
			unsubscribe: () => this.unsubscribe(eventType, id),
		}
	}

	/**
	 * Emit a custom event to all subscribers
	 * @param eventType - The event type to emit
	 * @param data - The data to pass to subscribers
	 */
	emit<T extends EventType>(eventType: T, data: EventData<T>): void
	emit<T = any>(eventType: string, data: T): void
	emit<T = any>(eventType: string, data?: T): void {
		const subscriberMap = this.subscribers.get(eventType)

		if (this.debug) {
			console.groupCollapsed(
				`%c📤 Event Emit%c ${eventType}`,
				'color: #f59e0b; font-weight: bold;',
				'color: #6366f1; font-weight: normal;'
			)
			console.log('%cData:', 'color: #64748b;', data)
			console.log('%cSubscribers notified:', 'color: #64748b;', subscriberMap?.size || 0)
			console.groupEnd()
		}

		if (!subscriberMap) return

		subscriberMap.forEach(subscriber => {
			subscriber.callback(data)
		})
	}

	/**
	 * Unsubscribe from a custom event
	 */
	private unsubscribe(eventType: string, subscriberId: string): void {
		const subscriberMap = this.subscribers.get(eventType)
		if (!subscriberMap) return

		const deleted = subscriberMap.delete(subscriberId)
		if (deleted) {
			if (this.debug) {
				console.groupCollapsed(
					`%c📤 Event Unsubscribe%c ${eventType}`,
					'color: #ef4444; font-weight: bold;',
					'color: #6366f1; font-weight: normal;'
				)
				console.log('%cSubscription ID:', 'color: #64748b;', subscriberId)
				console.log('%cRemaining subscribers:', 'color: #64748b;', subscriberMap.size)
				console.groupEnd()
			}

			// Clean up empty subscriber maps
			if (subscriberMap.size === 0) {
				this.subscribers.delete(eventType)
			}
		}
	}

	/**
	 * Clean up all subscriptions (useful for testing or app teardown)
	 */
	cleanup(): void {
		this.subscribers.clear()
	}

	/**
	 * Get current subscription count for debugging
	 */
	getSubscriptionCount(): Record<string, number> {
		const counts: Record<string, number> = {}
		this.subscribers.forEach((subscriberMap, eventType) => {
			counts[eventType] = subscriberMap.size
		})
		return counts
	}
}

// Singleton instance
const customEventManager = new CustomEventManager()

export default customEventManager
