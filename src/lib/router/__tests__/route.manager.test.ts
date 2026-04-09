/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { RouteManager } from '../route.manager'

/*
 *   TESTS
 ***************************************************************************************************/
describe('RouteManager', () => {
	let routeManager: RouteManager
	let originalLocation: Location
	let pushStateMock: ReturnType<typeof vi.fn>
	let replaceStateMock: ReturnType<typeof vi.fn>
	let backMock: ReturnType<typeof vi.fn>
	let forwardMock: ReturnType<typeof vi.fn>
	let goMock: ReturnType<typeof vi.fn>

	beforeEach(() => {
		// Save original location
		originalLocation = window.location

		// Mock window.location
		delete (window as any).location
		// @ts-ignore
		window.location = {
			...originalLocation,
			pathname: '/test',
			search: '',
			href: 'http://localhost/test',
		} as Location

		// Mock history methods
		pushStateMock = vi.fn()
		replaceStateMock = vi.fn()
		backMock = vi.fn()
		forwardMock = vi.fn()
		goMock = vi.fn()

		window.history.pushState = pushStateMock
		window.history.replaceState = replaceStateMock
		window.history.back = backMock
		window.history.forward = forwardMock
		window.history.go = goMock

		routeManager = new RouteManager()
	})

	afterEach(() => {
		routeManager.cleanup()
		// @ts-ignore
		window.location = originalLocation
		vi.clearAllMocks()
	})

	describe('Initialization', () => {
		it('should initialize with default config', () => {
			const manager = new RouteManager()
			expect(manager).toBeDefined()
			manager.cleanup()
		})

		it('should initialize with debug config', () => {
			const manager = new RouteManager({ debug: true })
			expect(manager).toBeDefined()
			manager.cleanup()
		})
	})

	describe('getParams', () => {
		it('should return empty object when no params', () => {
			window.location.search = ''
			const params = routeManager.getParams()
			expect(params).toEqual({})
		})

		it('should return all params when no param names specified', () => {
			window.location.search = '?foo=bar&baz=qux'
			const params = routeManager.getParams()
			expect(params).toEqual({ foo: 'bar', baz: 'qux' })
		})

		it('should return specific params when param names provided', () => {
			window.location.search = '?foo=bar&baz=qux&test=value'
			const params = routeManager.getParams(['foo', 'baz'])
			expect(params).toEqual({ foo: 'bar', baz: 'qux' })
		})

		it('should return null for missing params', () => {
			window.location.search = '?foo=bar'
			const params = routeManager.getParams(['foo', 'missing'])
			expect(params).toEqual({ foo: 'bar', missing: null })
		})
	})

	describe('getParam', () => {
		it('should return param value', () => {
			window.location.search = '?foo=bar'
			const value = routeManager.getParam('foo')
			expect(value).toBe('bar')
		})

		it('should return null for missing param', () => {
			window.location.search = ''
			const value = routeManager.getParam('missing')
			expect(value).toBeNull()
		})
	})

	describe('updateParams', () => {
		it('should add new params', () => {
			window.location.search = ''
			routeManager.updateParams({ foo: 'bar' })

			expect(pushStateMock).toHaveBeenCalledWith({}, '', '/test?foo=bar')
		})

		it('should update existing params', () => {
			window.location.search = '?foo=bar'
			routeManager.updateParams({ foo: 'updated' })

			expect(pushStateMock).toHaveBeenCalledWith({}, '', '/test?foo=updated')
		})

		it('should remove params when value is null', () => {
			window.location.search = '?foo=bar&baz=qux'
			routeManager.updateParams({ foo: null })

			expect(pushStateMock).toHaveBeenCalledWith({}, '', '/test?baz=qux')
		})

		it('should handle multiple param updates', () => {
			window.location.search = '?foo=bar'
			routeManager.updateParams({ foo: 'updated', baz: 'new' })

			expect(pushStateMock).toHaveBeenCalledWith(
				{},
				'',
				'/test?foo=updated&baz=new'
			)
		})

		it('should notify listeners', () => {
			const listener = vi.fn()
			routeManager.subscribe(listener)

			routeManager.updateParams({ foo: 'bar' })

			expect(listener).toHaveBeenCalledTimes(1)
		})
	})

	describe('replaceParams', () => {
		it('should replace params without creating history entry', () => {
			window.location.search = ''
			routeManager.replaceParams({ foo: 'bar' })

			expect(replaceStateMock).toHaveBeenCalledWith({}, '', '/test?foo=bar')
			expect(pushStateMock).not.toHaveBeenCalled()
		})

		it('should remove params when value is null', () => {
			window.location.search = '?foo=bar&baz=qux'
			routeManager.replaceParams({ foo: null })

			expect(replaceStateMock).toHaveBeenCalledWith({}, '', '/test?baz=qux')
		})

		it('should notify listeners', () => {
			const listener = vi.fn()
			routeManager.subscribe(listener)

			routeManager.replaceParams({ foo: 'bar' })

			expect(listener).toHaveBeenCalledTimes(1)
		})
	})

	describe('setParam', () => {
		it('should set single param', () => {
			window.location.search = ''
			routeManager.setParam('foo', 'bar')

			expect(pushStateMock).toHaveBeenCalledWith({}, '', '/test?foo=bar')
		})

		it('should remove param when value is null', () => {
			window.location.search = '?foo=bar'
			routeManager.setParam('foo', null)

			expect(pushStateMock).toHaveBeenCalledWith({}, '', '/test')
		})
	})

	describe('clearParams', () => {
		it('should clear specific params', () => {
			window.location.search = '?foo=bar&baz=qux&test=value'
			routeManager.clearParams(['foo', 'baz'])

			expect(pushStateMock).toHaveBeenCalledWith({}, '', '/test?test=value')
		})

		it('should handle empty param names array', () => {
			window.location.search = '?foo=bar'
			routeManager.clearParams([])

			expect(pushStateMock).toHaveBeenCalledWith({}, '', '/test?foo=bar')
		})
	})

	describe('clearAllParams', () => {
		it('should clear all params', () => {
			window.location.search = '?foo=bar&baz=qux'
			routeManager.clearAllParams()

			expect(pushStateMock).toHaveBeenCalledWith({}, '', '/test')
		})

		it('should notify listeners', () => {
			const listener = vi.fn()
			routeManager.subscribe(listener)

			routeManager.clearAllParams()

			expect(listener).toHaveBeenCalledTimes(1)
		})
	})

	describe('Navigation', () => {
		it('should navigate back', () => {
			routeManager.goBack()
			expect(backMock).toHaveBeenCalled()
		})

		it('should navigate forward', () => {
			routeManager.goForward()
			expect(forwardMock).toHaveBeenCalled()
		})

		it('should navigate to specific position', () => {
			routeManager.go(-2)
			expect(goMock).toHaveBeenCalledWith(-2)
		})
	})

	describe('Browser Navigation Detection', () => {
		it('should detect browser navigation', () => {
			// Simulate popstate event
			const popstateEvent = new PopStateEvent('popstate')
			window.dispatchEvent(popstateEvent)

			expect(routeManager.isBrowserNavigating()).toBe(true)
		})

		it('should return false initially', () => {
			expect(routeManager.isBrowserNavigating()).toBe(false)
		})

		it('should consume browser navigation flag', () => {
			const popstateEvent = new PopStateEvent('popstate')
			window.dispatchEvent(popstateEvent)

			expect(routeManager.isBrowserNavigating()).toBe(true)

			routeManager.consumeBrowserNavigation()

			expect(routeManager.isBrowserNavigating()).toBe(false)
		})

		it('should notify listeners on popstate', () => {
			const listener = vi.fn()
			routeManager.subscribe(listener)

			const popstateEvent = new PopStateEvent('popstate')
			window.dispatchEvent(popstateEvent)

			expect(listener).toHaveBeenCalledTimes(1)
		})

		it('should notify listeners on direct pushState calls', () => {
			const listener = vi.fn()
			routeManager.subscribe(listener)

			window.history.pushState({}, '', '/test?flow=example')

			expect(listener).toHaveBeenCalledTimes(1)
			expect(pushStateMock).toHaveBeenCalledWith({}, '', '/test?flow=example')
		})

		it('should notify listeners on direct replaceState calls', () => {
			const listener = vi.fn()
			routeManager.subscribe(listener)

			window.history.replaceState({}, '', '/test?flow=example&step=entry')

			expect(listener).toHaveBeenCalledTimes(1)
			expect(replaceStateMock).toHaveBeenCalledWith(
				{},
				'',
				'/test?flow=example&step=entry'
			)
		})
	})

	describe('Subscription', () => {
		it('should subscribe to route changes', () => {
			const listener = vi.fn()
			const unsubscribe = routeManager.subscribe(listener)

			expect(unsubscribe).toBeInstanceOf(Function)
		})

		it('should unsubscribe from route changes', () => {
			const listener = vi.fn()
			const unsubscribe = routeManager.subscribe(listener)

			routeManager.updateParams({ foo: 'bar' })
			expect(listener).toHaveBeenCalledTimes(1)

			unsubscribe()

			routeManager.updateParams({ foo: 'baz' })
			expect(listener).toHaveBeenCalledTimes(1)
		})

		it('should support multiple subscribers', () => {
			const listener1 = vi.fn()
			const listener2 = vi.fn()

			routeManager.subscribe(listener1)
			routeManager.subscribe(listener2)

			routeManager.updateParams({ foo: 'bar' })

			expect(listener1).toHaveBeenCalledTimes(1)
			expect(listener2).toHaveBeenCalledTimes(1)
		})
	})

	describe('URL Getters', () => {
		it('should get current URL', () => {
			const url = routeManager.getCurrentUrl()
			expect(url).toBe('http://localhost/test')
		})

		it('should get current pathname', () => {
			const pathname = routeManager.getPathname()
			expect(pathname).toBe('/test')
		})

		it('should get current search string', () => {
			window.location.search = '?foo=bar'
			const search = routeManager.getSearch()
			expect(search).toBe('?foo=bar')
		})
	})

	describe('Cleanup', () => {
		it('should remove event listeners on cleanup', () => {
			const listener = vi.fn()
			routeManager.subscribe(listener)

			routeManager.cleanup()

			const popstateEvent = new PopStateEvent('popstate')
			window.dispatchEvent(popstateEvent)

			// Listener should not be called after cleanup
			expect(listener).not.toHaveBeenCalled()
		})

		it('should clear all listeners on cleanup', () => {
			const listener1 = vi.fn()
			const listener2 = vi.fn()

			routeManager.subscribe(listener1)
			routeManager.subscribe(listener2)

			routeManager.cleanup()

			routeManager.updateParams({ foo: 'bar' })

			expect(listener1).not.toHaveBeenCalled()
			expect(listener2).not.toHaveBeenCalled()
		})
	})
})
