/*
 *   USE HISTORY LOCK
 *   Intercepts browser back navigation while Frame is open.
 *   Works with and without NextJS by using shallow routing when available.
 ***************************************************************************************************/
import { useEffect, useRef, useCallback } from 'react'
import FrameState from '@/state/frame.state'
import { customEventManager } from '@/lib/event'

export function useHistoryLock(isOpen: boolean): void {
	const sentinelActive = useRef(false)

	const pushSentinel = useCallback(() => {
		const next = (window as any).next?.router
		if (next) {
			next.push(window.location.href, undefined, { shallow: true })
		} else {
			window.history.pushState({ __frameLock: true }, '', window.location.href)
		}
		sentinelActive.current = true
	}, [])

	// Push sentinel when frame opens
	useEffect(() => {
		if (isOpen && !sentinelActive.current) {
			pushSentinel()
		}
	}, [isOpen, pushSentinel])

	// Intercept popstate while frame is open
	useEffect(() => {
		if (!isOpen) return

		const handlePopState = (event: PopStateEvent) => {
			if (!sentinelActive.current) return

			// capture: true ensures this fires before NextJS bubble-phase listeners
			event.stopImmediatePropagation()
			sentinelActive.current = false

			customEventManager.emit('frame:request:back', {})

			// Re-push sentinel if frame is still open after going back
			requestAnimationFrame(() => {
				if (FrameState.getState().isOpen) {
					pushSentinel()
				}
			})
		}

		window.addEventListener('popstate', handlePopState, { capture: true })
		return () => window.removeEventListener('popstate', handlePopState, { capture: true })
	}, [isOpen, pushSentinel])

	// User-initiated close (X button, Escape) — consume sentinel cleanly without firing popstate
	useEffect(() => {
		if (!isOpen && sentinelActive.current) {
			const next = (window as any).next?.router
			if (next) {
				next.replace(window.location.href, undefined, { shallow: true })
			} else {
				window.history.replaceState({}, '', window.location.href)
			}
			sentinelActive.current = false
		}
	}, [isOpen])
}
