/*
 *   CUSTOM EVENT MANAGER
 *   Centralized system for managing custom application events (non-DOM)
 ***************************************************************************************************/
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
	private subscribers: Map<string, CustomEventSubscriber[]> = new Map()
	private debug: boolean = true

	/**
	 * Subscribe to a custom event
	 * @param eventType - The custom event type (e.g., 'cart:loading', 'cart:complete')
	 * @param callback - The callback function
	 */
	subscribe<T = any>(
		eventType: string,
		callback: CustomEventCallback<T>
	): CustomEventSubscription {
		const id = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

		// Add subscriber
		if (!this.subscribers.has(eventType)) {
			this.subscribers.set(eventType, [])
		}

		const subscriber: CustomEventSubscriber<T> = {
			id,
			callback: callback as CustomEventCallback,
		}

		const subscriberList = this.subscribers.get(eventType)
		if (subscriberList) {
			subscriberList.push(subscriber)
		}

		if (this.debug) {
			const totalSubscribers = this.subscribers.get(eventType)?.length || 0
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
	emit<T = any>(eventType: string, data: T): void {
		const subscribers = this.subscribers.get(eventType)

		if (this.debug) {
			console.groupCollapsed(
				`%c📤 Event Emit%c ${eventType}`,
				'color: #f59e0b; font-weight: bold;',
				'color: #6366f1; font-weight: normal;'
			)
			console.log('%cData:', 'color: #64748b;', data)
			console.log('%cSubscribers notified:', 'color: #64748b;', subscribers?.length || 0)
			console.groupEnd()
		}

		if (!subscribers) return

		subscribers.forEach(subscriber => {
			subscriber.callback(data)
		})
	}

	/**
	 * Unsubscribe from a custom event
	 */
	private unsubscribe(eventType: string, subscriberId: string): void {
		const subscribers = this.subscribers.get(eventType)
		if (!subscribers) return

		const index = subscribers.findIndex(sub => sub.id === subscriberId)
		if (index !== -1) {
			subscribers.splice(index, 1)

			if (this.debug) {
				console.groupCollapsed(
					`%c📤 Event Unsubscribe%c ${eventType}`,
					'color: #ef4444; font-weight: bold;',
					'color: #6366f1; font-weight: normal;'
				)
				console.log('%cSubscription ID:', 'color: #64748b;', subscriberId)
				console.log('%cRemaining subscribers:', 'color: #64748b;', subscribers.length)
				console.groupEnd()
			}

			// Clean up empty subscriber arrays
			if (subscribers.length === 0) {
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
		this.subscribers.forEach((subs, eventType) => {
			counts[eventType] = subs.length
		})
		return counts
	}
}

// Singleton instance
const customEventManager = new CustomEventManager()

export default customEventManager
