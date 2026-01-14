/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQueryParams, getQueryParams } from '../useQueryParams'

/*
 *   SETUP
 ***************************************************************************************************/
let originalLocation: Location
let originalPushState: typeof window.history.pushState

beforeEach(() => {
	originalLocation = window.location
	originalPushState = window.history.pushState

	// Mock window.location
	delete (window as any).location
	window.location = {
		...originalLocation,
		pathname: '/test',
		search: '',
		href: 'http://localhost/test',
	} as Location

	// Mock window.history.pushState
	window.history.pushState = vi.fn()
})

afterEach(() => {
	window.location = originalLocation
	window.history.pushState = originalPushState
	vi.clearAllMocks()
})

/*
 *   TESTS
 ***************************************************************************************************/
describe('useQueryParams', () => {
	describe('Initialization', () => {
		it('should initialize with empty params', () => {
			const { result } = renderHook(() => useQueryParams())

			expect(result.current.queryParams).toEqual({})
			expect(result.current.isFiltered).toBe(false)
			expect(result.current.isSearched).toBeNull()
		})

		it('should initialize with default params', () => {
			const { result } = renderHook(() =>
				useQueryParams({ page: 1, pageSize: 10, status: 'active' })
			)

			expect(result.current.queryParams).toEqual({
				page: '1',
				pageSize: '10',
				status: 'active',
			})
		})

		it('should initialize with URL params', () => {
			window.location.search = '?page=2&status=inactive'

			const { result } = renderHook(() => useQueryParams({ page: 1, pageSize: 10 }))

			expect(result.current.queryParams).toEqual({
				page: '2',
				pageSize: '10',
				status: 'inactive',
			})
		})

		it('should prefer URL params over default params', () => {
			window.location.search = '?page=3'

			const { result } = renderHook(() => useQueryParams({ page: 1 }))

			expect(result.current.queryParams.page).toBe('3')
		})

		it('should handle numeric default values', () => {
			const { result } = renderHook(() => useQueryParams({ page: 1, limit: 20 }))

			expect(result.current.queryParams.page).toBe('1')
			expect(result.current.queryParams.limit).toBe('20')
		})

		it('should handle null default values', () => {
			const { result } = renderHook(() => useQueryParams({ filter: null }))

			expect(result.current.queryParams.filter).toBeNull()
		})
	})

	describe('onParamChange', () => {
		it('should update a single param', () => {
			const { result } = renderHook(() => useQueryParams({ page: 1 }))

			act(() => {
				result.current.onParamChange('status', 'active')
			})

			expect(result.current.queryParams.status).toBe('active')
		})

		it('should remove param when value is null', () => {
			const { result } = renderHook(() => useQueryParams({ status: 'active' }))

			act(() => {
				result.current.onParamChange('status', null)
			})

			expect(result.current.queryParams.status).toBeNull()
		})

		it('should remove param when value is empty string', () => {
			const { result } = renderHook(() => useQueryParams({ status: 'active' }))

			act(() => {
				result.current.onParamChange('status', '')
			})

			expect(result.current.queryParams.status).toBeNull()
		})

		it('should reset page to default when changing filter params', () => {
			window.location.search = '?page=5'
			const { result } = renderHook(() => useQueryParams({ page: 1 }))

			expect(result.current.queryParams.page).toBe('5')

			act(() => {
				result.current.onParamChange('status', 'active')
			})

			expect(result.current.queryParams.page).toBe('1')
		})

		it('should not reset page when changing non-filter params', () => {
			window.location.search = '?page=5'
			const { result } = renderHook(() => useQueryParams({ page: 1, pageSize: 10 }))

			act(() => {
				result.current.onParamChange('pageSize', '20')
			})

			expect(result.current.queryParams.page).toBe('5')
		})

		it('should update URL via pushState', async () => {
			const { result } = renderHook(() => useQueryParams({ page: 1 }))

			act(() => {
				result.current.onParamChange('status', 'active')
			})

			// Wait for setTimeout in onParamChange
			await new Promise(resolve => setTimeout(resolve, 10))

			expect(window.history.pushState).toHaveBeenCalled()
		})
	})

	describe('onBulkParamChange', () => {
		it('should update multiple params at once', () => {
			const { result } = renderHook(() => useQueryParams({ page: 1 }))

			act(() => {
				result.current.onBulkParamChange({ status: 'active', category: 'test' })
			})

			expect(result.current.queryParams.status).toBe('active')
			expect(result.current.queryParams.category).toBe('test')
		})

		it('should handle mixed null and string values', () => {
			const { result } = renderHook(() =>
				useQueryParams({ status: 'active', category: 'test' })
			)

			act(() => {
				result.current.onBulkParamChange({ status: null, priority: 'high' })
			})

			expect(result.current.queryParams.status).toBeNull()
			expect(result.current.queryParams.priority).toBe('high')
		})
	})

	describe('clearAllFilters', () => {
		it('should clear all filter params', () => {
			const { result } = renderHook(() =>
				useQueryParams({ page: 1, status: 'active', category: 'test' })
			)

			act(() => {
				result.current.clearAllFilters()
			})

			// clearAllFilters resets to defaults, not undefined
			expect(result.current.queryParams.status).toBe('active')
			expect(result.current.queryParams.category).toBe('test')
			expect(result.current.queryParams.page).toBe('1')
		})

		it('should preserve non-filter params from defaults', () => {
			window.location.search = '?page=5&q=search&status=active'
			const { result } = renderHook(() => useQueryParams({ page: 1, q: null }))

			act(() => {
				result.current.clearAllFilters()
			})

			expect(result.current.queryParams.page).toBe('1')
			expect(result.current.queryParams.q).toBeNull() // Reset to default (null)
		})
	})

	describe('isFiltered', () => {
		it('should be false when no filter params are set', () => {
			const { result } = renderHook(() => useQueryParams({ page: 1 }))

			expect(result.current.isFiltered).toBe(false)
		})

		it('should be true when filter params are set', () => {
			window.location.search = '?status=active'
			const { result } = renderHook(() => useQueryParams({ page: 1 }))

			expect(result.current.isFiltered).toBe(true)
		})

		it('should ignore non-filter params', () => {
			window.location.search = '?page=2&pageSize=20&q=search'
			const { result } = renderHook(() => useQueryParams({ page: 1 }))

			expect(result.current.isFiltered).toBe(false)
		})

		it('should be false when filter params match defaults', () => {
			const { result } = renderHook(() => useQueryParams({ status: 'active' }))

			expect(result.current.isFiltered).toBe(false)
		})
	})

	describe('isSearched', () => {
		it('should be null when no search param', () => {
			const { result } = renderHook(() => useQueryParams())

			expect(result.current.isSearched).toBeNull()
		})

		it('should return search query when present', () => {
			window.location.search = '?q=test+search'
			const { result } = renderHook(() => useQueryParams())

			// + in URL is decoded as a space by URLSearchParams
			expect(result.current.isSearched).toBe('test search')
		})
	})

	describe('popstate handling', () => {
		it('should update params on browser back/forward', () => {
			const { result } = renderHook(() => useQueryParams({ page: 1 }))

			expect(result.current.queryParams.page).toBe('1')

			// Simulate browser navigation
			window.location.search = '?page=2&status=active'
			act(() => {
				window.dispatchEvent(new Event('popstate'))
			})

			expect(result.current.queryParams.page).toBe('2')
			expect(result.current.queryParams.status).toBe('active')
		})

		it('should handle pathname changes', () => {
			const { result } = renderHook(() => useQueryParams())

			window.location.pathname = '/new-path'
			window.location.search = '?test=value'

			act(() => {
				window.dispatchEvent(new Event('popstate'))
			})

			expect(result.current.queryParams.test).toBe('value')
		})
	})

	describe('Edge Cases', () => {
		it('should handle undefined values', () => {
			const { result } = renderHook(() => useQueryParams({ test: undefined }))

			expect(result.current.queryParams.test).toBeUndefined()
		})

		it('should handle empty query string', () => {
			window.location.search = ''
			const { result } = renderHook(() => useQueryParams())

			expect(result.current.queryParams).toEqual({})
		})

		it('should handle malformed query string', () => {
			window.location.search = '?key1=value1&key2'
			const { result } = renderHook(() => useQueryParams())

			expect(result.current.queryParams.key1).toBe('value1')
			expect(result.current.queryParams.key2).toBe('')
		})

		it('should handle special characters in values', () => {
			window.location.search = '?search=hello%20world&email=test%40example.com'
			const { result } = renderHook(() => useQueryParams())

			expect(result.current.queryParams.search).toBe('hello world')
			expect(result.current.queryParams.email).toBe('test@example.com')
		})
	})
})

describe('getQueryParams (non-hook version)', () => {
	it('should return query params without React', () => {
		window.location.search = '?page=1&status=active'
		const { queryParams } = getQueryParams()

		expect(queryParams.page).toBe('1')
		expect(queryParams.status).toBe('active')
	})

	it('should provide onParamChange function', () => {
		window.location.search = ''
		const { onParamChange, queryParams: initial } = getQueryParams({ page: 1 })

		expect(initial.page).toBe('1')

		const updated = onParamChange('status', 'active')

		expect(updated.status).toBe('active')
		expect(window.history.pushState).toHaveBeenCalled()
	})

	it('should provide updateURL function', () => {
		window.location.search = ''
		const { updateURL } = getQueryParams()

		updateURL({ test: 'value', foo: 'bar' })

		expect(window.history.pushState).toHaveBeenCalledWith(
			{},
			'',
			expect.stringContaining('test=value')
		)
	})
})
