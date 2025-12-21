/*
 *   USE CUSTOM EVENT HOOK
 *   React hook for subscribing to custom application events
 ***************************************************************************************************/

import { useEffect, useCallback, useRef } from 'react'
import customEventManager, {
	type CustomEventCallback,
	type CustomEventSubscription,
} from './event.manager'

export interface UseCustomEventOptions {
	disabled?: boolean
}

/**
 * Hook for subscribing to custom application events
 * @param eventType - The custom event type to listen for
 * @param callback - The callback function to execute
 * @param options - Optional configuration
 */
export function useCustomEvent<T = any>(
	eventType: string,
	callback: CustomEventCallback<T>,
	options?: UseCustomEventOptions
): void {
	const callbackRef = useRef(callback)
	const subscriptionRef = useRef<CustomEventSubscription | null>(null)

	// Update callback ref when it changes
	callbackRef.current = callback

	// Stable wrapper that calls the current callback
	const stableCallback = useCallback((data: T) => {
		callbackRef.current(data)
	}, [])

	useEffect(() => {
		if (options?.disabled) return

		// Subscribe to the event
		subscriptionRef.current = customEventManager.subscribe(eventType, stableCallback)

		// Cleanup on unmount or dependency change
		return () => {
			subscriptionRef.current?.unsubscribe()
			subscriptionRef.current = null
		}
	}, [eventType, stableCallback, options?.disabled])
}

/**
 * Hook for emitting custom events
 */
export function useCustomEventEmit() {
	return useCallback(<T = any>(eventType: string, data: T) => {
		customEventManager.emit(eventType, data)
	}, [])
}
