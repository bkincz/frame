/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHistoryLock } from '../useHistoryLock'
import FrameState from '@/state/frame.state'
import { customEventManager } from '@/lib/event'

/*
 *   MOCKS
 ***************************************************************************************************/
vi.mock('@/state/frame.state', () => ({
	default: {
		getState: vi.fn(() => ({ isOpen: false })),
	},
}))

vi.mock('@/lib/event', () => ({
	customEventManager: {
		emit: vi.fn(),
	},
}))

/*
 *   TESTS
 ***************************************************************************************************/
describe('useHistoryLock', () => {
	let pushStateSpy: ReturnType<typeof vi.spyOn>
	let replaceStateSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		vi.clearAllMocks()
		pushStateSpy = vi.spyOn(window.history, 'pushState').mockImplementation(() => {})
		replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
		delete (window as any).next
	})

	afterEach(() => {
		pushStateSpy.mockRestore()
		replaceStateSpy.mockRestore()
	})

	describe('Sentinel push on open', () => {
		it('should push sentinel when frame opens', () => {
			renderHook(() => useHistoryLock(true))

			expect(pushStateSpy).toHaveBeenCalledWith({ __frameLock: true }, '', window.location.href)
		})

		it('should not push sentinel when frame is closed', () => {
			renderHook(() => useHistoryLock(false))

			expect(pushStateSpy).not.toHaveBeenCalled()
		})

		it('should not push duplicate sentinel when already active', () => {
			const { rerender } = renderHook(({ isOpen }) => useHistoryLock(isOpen), {
				initialProps: { isOpen: true },
			})

			rerender({ isOpen: true })

			expect(pushStateSpy).toHaveBeenCalledTimes(1)
		})
	})

	describe('NextJS compatibility', () => {
		it('should use next.router.push when available', () => {
			const mockNextRouter = { push: vi.fn(), replace: vi.fn() }
			;(window as any).next = { router: mockNextRouter }

			renderHook(() => useHistoryLock(true))

			expect(mockNextRouter.push).toHaveBeenCalledWith(
				window.location.href,
				undefined,
				{ shallow: true }
			)
			expect(pushStateSpy).not.toHaveBeenCalled()
		})

		it('should fall back to history.pushState without NextJS', () => {
			renderHook(() => useHistoryLock(true))

			expect(pushStateSpy).toHaveBeenCalledWith({ __frameLock: true }, '', window.location.href)
		})

		it('should use next.router.replace on user-initiated close', () => {
			const mockNextRouter = { push: vi.fn(), replace: vi.fn() }
			;(window as any).next = { router: mockNextRouter }

			const { rerender } = renderHook(({ isOpen }) => useHistoryLock(isOpen), {
				initialProps: { isOpen: true },
			})

			rerender({ isOpen: false })

			expect(mockNextRouter.replace).toHaveBeenCalledWith(
				window.location.href,
				undefined,
				{ shallow: true }
			)
		})

		it('should use history.replaceState on user-initiated close without NextJS', () => {
			const { rerender } = renderHook(({ isOpen }) => useHistoryLock(isOpen), {
				initialProps: { isOpen: true },
			})

			rerender({ isOpen: false })

			expect(replaceStateSpy).toHaveBeenCalledWith({}, '', window.location.href)
		})
	})

	describe('Popstate interception', () => {
		it('should emit frame:request:back on popstate when sentinel is active', () => {
			renderHook(() => useHistoryLock(true))

			window.dispatchEvent(new PopStateEvent('popstate', {}))

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:back', {})
		})

		it('should not emit frame:request:back when frame is closed', () => {
			renderHook(() => useHistoryLock(false))

			window.dispatchEvent(new PopStateEvent('popstate', {}))

			expect(customEventManager.emit).not.toHaveBeenCalledWith('frame:request:back', {})
		})

		it('should re-push sentinel if frame stays open after popstate', async () => {
			vi.mocked(FrameState.getState).mockReturnValue({ isOpen: true } as any)

			renderHook(() => useHistoryLock(true))

			// Clear calls from initial open
			pushStateSpy.mockClear()

			window.dispatchEvent(new PopStateEvent('popstate', {}))

			// Wait for requestAnimationFrame
			await act(async () => {
				await new Promise(resolve => setTimeout(resolve, 50))
			})

			// Sentinel should have been re-pushed after popstate when frame stays open
			expect(pushStateSpy).toHaveBeenCalledWith({ __frameLock: true }, '', window.location.href)
		})

		it('should not re-push sentinel if frame closes after popstate', async () => {
			vi.mocked(FrameState.getState).mockReturnValue({ isOpen: false } as any)

			renderHook(() => useHistoryLock(true))

			expect(pushStateSpy).toHaveBeenCalledTimes(1)

			window.dispatchEvent(new PopStateEvent('popstate', {}))

			await act(async () => {
				await new Promise(resolve => setTimeout(resolve, 50))
			})

			expect(pushStateSpy).toHaveBeenCalledTimes(1)
		})

		it('should not emit frame:request:back when sentinel is not active', () => {
			vi.mocked(FrameState.getState).mockReturnValue({ isOpen: true } as any)

			renderHook(() => useHistoryLock(true))

			// First popstate consumes the sentinel
			window.dispatchEvent(new PopStateEvent('popstate', {}))

			vi.clearAllMocks()

			// Second popstate fires before RAF re-pushes (sentinel is inactive)
			window.dispatchEvent(new PopStateEvent('popstate', {}))

			expect(customEventManager.emit).not.toHaveBeenCalledWith('frame:request:back', {})
		})

		it('should remove popstate listener on unmount', () => {
			const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

			const { unmount } = renderHook(() => useHistoryLock(true))

			unmount()

			expect(removeEventListenerSpy).toHaveBeenCalledWith(
				'popstate',
				expect.any(Function),
				{ capture: true }
			)

			removeEventListenerSpy.mockRestore()
		})
	})

	describe('User-initiated close', () => {
		it('should consume sentinel and not fire popstate when frame closes', () => {
			const { rerender } = renderHook(({ isOpen }) => useHistoryLock(isOpen), {
				initialProps: { isOpen: true },
			})

			rerender({ isOpen: false })

			expect(replaceStateSpy).toHaveBeenCalledWith({}, '', window.location.href)
		})

		it('should not call replaceState if sentinel was never pushed', () => {
			const { rerender } = renderHook(({ isOpen }) => useHistoryLock(isOpen), {
				initialProps: { isOpen: false },
			})

			rerender({ isOpen: false })

			expect(replaceStateSpy).not.toHaveBeenCalled()
		})
	})
})
