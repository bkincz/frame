/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRouter } from '../useRouter'
import routeManager from '../route.manager'

/*
 *   MOCKS
 ***************************************************************************************************/
vi.mock('../route.manager', () => {
	const subscribers = new Set<() => void>()
	let params: Record<string, string | null> = {}
	let pathname = '/test'
	let search = ''

	return {
		default: {
			getParams: vi.fn((paramNames?: string[]) => {
				if (paramNames) {
					const result: Record<string, string | null> = {}
					paramNames.forEach(name => {
						result[name] = params[name] || null
					})
					return result
				}
				return { ...params }
			}),
			getPathname: vi.fn(() => pathname),
			getSearch: vi.fn(() => search),
			updateParams: vi.fn((newParams: Record<string, string | null>) => {
				params = { ...params, ...newParams }
				subscribers.forEach(cb => cb())
			}),
			replaceParams: vi.fn((newParams: Record<string, string | null>) => {
				params = { ...params, ...newParams }
				subscribers.forEach(cb => cb())
			}),
			setParam: vi.fn((name: string, value: string | null) => {
				params[name] = value
				subscribers.forEach(cb => cb())
			}),
			clearParams: vi.fn((paramNames: string[]) => {
				paramNames.forEach(name => {
					delete params[name]
				})
				subscribers.forEach(cb => cb())
			}),
			clearAllParams: vi.fn(() => {
				params = {}
				subscribers.forEach(cb => cb())
			}),
			goBack: vi.fn(),
			goForward: vi.fn(),
			isBrowserNavigating: vi.fn(() => false),
			consumeBrowserNavigation: vi.fn(),
			subscribe: vi.fn((callback: () => void) => {
				subscribers.add(callback)
				return () => {
					subscribers.delete(callback)
				}
			}),
			// Test helpers
			__setParams: (newParams: Record<string, string | null>) => {
				params = newParams
				subscribers.forEach(cb => cb())
			},
			__setPathname: (newPathname: string) => {
				pathname = newPathname
				subscribers.forEach(cb => cb())
			},
			__setSearch: (newSearch: string) => {
				search = newSearch
				subscribers.forEach(cb => cb())
			},
			__reset: () => {
				params = {}
				pathname = '/test'
				search = ''
				subscribers.clear()
			},
		},
	}
})

/*
 *   TESTS
 ***************************************************************************************************/
describe('useRouter', () => {
	beforeEach(() => {
		;(routeManager as any).__reset()
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Initialization', () => {
		it('should initialize with current route params', () => {
			;(routeManager as any).__setParams({ foo: 'bar' })

			const { result } = renderHook(() => useRouter())

			expect(result.current.params).toEqual({ foo: 'bar' })
		})

		it('should initialize with current pathname', () => {
			;(routeManager as any).__setPathname('/test-path')

			const { result } = renderHook(() => useRouter())

			expect(result.current.pathname).toBe('/test-path')
		})

		it('should initialize with current search', () => {
			;(routeManager as any).__setSearch('?foo=bar')

			const { result } = renderHook(() => useRouter())

			expect(result.current.search).toBe('?foo=bar')
		})
	})

	describe('Watch Params', () => {
		it('should watch specific params when provided', () => {
			;(routeManager as any).__setParams({ foo: 'bar', baz: 'qux' })

			const { result } = renderHook(() => useRouter({ params: ['foo'] }))

			expect(routeManager.getParams).toHaveBeenCalledWith(['foo'])
		})

		it('should watch all params when not specified', () => {
			const { result } = renderHook(() => useRouter())

			expect(routeManager.getParams).toHaveBeenCalledWith(undefined)
		})
	})

	describe('Route Changes', () => {
		it('should update params when route changes', async () => {
			const { result } = renderHook(() => useRouter())

			expect(result.current.params).toEqual({})

			act(() => {
				;(routeManager as any).__setParams({ foo: 'bar' })
			})

			await waitFor(() => {
				expect(result.current.params).toEqual({ foo: 'bar' })
			})
		})

		it('should update pathname when route changes', async () => {
			const { result } = renderHook(() => useRouter())

			expect(result.current.pathname).toBe('/test')

			act(() => {
				;(routeManager as any).__setPathname('/new-path')
			})

			await waitFor(() => {
				expect(result.current.pathname).toBe('/new-path')
			})
		})

		it('should update search when route changes', async () => {
			const { result } = renderHook(() => useRouter())

			expect(result.current.search).toBe('')

			act(() => {
				;(routeManager as any).__setSearch('?foo=bar')
			})

			await waitFor(() => {
				expect(result.current.search).toBe('?foo=bar')
			})
		})
	})

	describe('updateParams', () => {
		it('should call routeManager.updateParams', () => {
			const { result } = renderHook(() => useRouter())

			act(() => {
				result.current.updateParams({ foo: 'bar' })
			})

			expect(routeManager.updateParams).toHaveBeenCalledWith({ foo: 'bar' })
		})
	})

	describe('replaceParams', () => {
		it('should call routeManager.replaceParams', () => {
			const { result } = renderHook(() => useRouter())

			act(() => {
				result.current.replaceParams({ foo: 'bar' })
			})

			expect(routeManager.replaceParams).toHaveBeenCalledWith({ foo: 'bar' })
		})
	})

	describe('setParam', () => {
		it('should call routeManager.setParam', () => {
			const { result } = renderHook(() => useRouter())

			act(() => {
				result.current.setParam('foo', 'bar')
			})

			expect(routeManager.setParam).toHaveBeenCalledWith('foo', 'bar')
		})
	})

	describe('clearParams', () => {
		it('should call routeManager.clearParams', () => {
			const { result } = renderHook(() => useRouter())

			act(() => {
				result.current.clearParams(['foo', 'bar'])
			})

			expect(routeManager.clearParams).toHaveBeenCalledWith(['foo', 'bar'])
		})
	})

	describe('clearAllParams', () => {
		it('should call routeManager.clearAllParams', () => {
			const { result } = renderHook(() => useRouter())

			act(() => {
				result.current.clearAllParams()
			})

			expect(routeManager.clearAllParams).toHaveBeenCalled()
		})
	})

	describe('Navigation', () => {
		it('should call routeManager.goBack', () => {
			const { result } = renderHook(() => useRouter())

			act(() => {
				result.current.goBack()
			})

			expect(routeManager.goBack).toHaveBeenCalled()
		})

		it('should call routeManager.goForward', () => {
			const { result } = renderHook(() => useRouter())

			act(() => {
				result.current.goForward()
			})

			expect(routeManager.goForward).toHaveBeenCalled()
		})
	})

	describe('Browser Navigation', () => {
		it('should call routeManager.isBrowserNavigating', () => {
			const { result } = renderHook(() => useRouter())

			act(() => {
				result.current.isBrowserNavigating()
			})

			expect(routeManager.isBrowserNavigating).toHaveBeenCalled()
		})

		it('should call routeManager.consumeBrowserNavigation', () => {
			const { result } = renderHook(() => useRouter())

			act(() => {
				result.current.consumeBrowserNavigation()
			})

			expect(routeManager.consumeBrowserNavigation).toHaveBeenCalled()
		})
	})

	describe('Subscription', () => {
		it('should subscribe to route changes on mount', () => {
			renderHook(() => useRouter())

			expect(routeManager.subscribe).toHaveBeenCalled()
		})

		it('should unsubscribe on unmount', () => {
			const unsubscribe = vi.fn()
			vi.mocked(routeManager.subscribe).mockReturnValueOnce(unsubscribe)

			const { unmount } = renderHook(() => useRouter())

			unmount()

			expect(unsubscribe).toHaveBeenCalled()
		})
	})

	describe('Debug Mode', () => {
		it('should not log when debug is false', () => {
			const consoleSpy = vi.spyOn(console, 'log')

			renderHook(() => useRouter({ debug: false }))

			act(() => {
				;(routeManager as any).__setParams({ foo: 'bar' })
			})

			expect(consoleSpy).not.toHaveBeenCalled()

			consoleSpy.mockRestore()
		})

		it('should log when debug is true', async () => {
			const consoleSpy = vi.spyOn(console, 'log')

			renderHook(() => useRouter({ debug: true }))

			act(() => {
				;(routeManager as any).__setParams({ foo: 'bar' })
			})

			await waitFor(
				() => {
					expect(consoleSpy).toHaveBeenCalledWith(
						'[useRouter] Route changed',
						expect.objectContaining({
							params: expect.any(Object),
							pathname: expect.any(String),
						})
					)
				},
				{ timeout: 100 }
			)

			consoleSpy.mockRestore()
		})
	})

	describe('Memoization', () => {
		it('should return same function references on re-renders', () => {
			const { result, rerender } = renderHook(() => useRouter())

			const firstUpdateParams = result.current.updateParams
			const firstReplaceParams = result.current.replaceParams
			const firstSetParam = result.current.setParam

			rerender()

			expect(result.current.updateParams).toBe(firstUpdateParams)
			expect(result.current.replaceParams).toBe(firstReplaceParams)
			expect(result.current.setParam).toBe(firstSetParam)
		})

		it('should update return object when params change', async () => {
			const { result } = renderHook(() => useRouter())

			const firstReturnValue = result.current

			act(() => {
				;(routeManager as any).__setParams({ foo: 'bar' })
			})

			await waitFor(
				() => {
					expect(result.current).not.toBe(firstReturnValue)
					expect(result.current.params).toEqual({ foo: 'bar' })
				},
				{ timeout: 100 }
			)
		})
	})
})
