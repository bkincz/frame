/*
 *   BASE
 **********************************************************************************************************/
import { createContext, useCallback, useState, useEffect } from 'react'

/*
 *   TYPES
 **********************************************************************************************************/
export interface QueryParams {
	[key: string]: string | null | undefined
}

export interface QueryParamsInput {
	[key: string]: string | number | null | undefined
}

interface QueryParamContextProps {
	queryParams: QueryParams
	clearAllFilters: () => void
	onBulkParamChange: (params: Partial<QueryParams>) => void
	onParamChange: (key: string, value: string | null) => void
	isFiltered: boolean
	isSearched: string | null
}

/*
 *   HELPER FUNCTIONS
 **********************************************************************************************************/
function convertToQueryParams(input: Partial<QueryParamsInput>): Partial<QueryParams> {
	const result: Partial<QueryParams> = {}
	Object.entries(input).forEach(([key, value]) => {
		if (value === null) {
			result[key] = null
		} else if (value === undefined) {
			result[key] = undefined
		} else {
			result[key] = String(value)
		}
	})
	return result
}

/*
 *   CONSTANTS
 **********************************************************************************************************/
const nonFilterParams = ['page', 'offset', 'pageSize', 'limit', 'q']

export const QueryParamContext = createContext<QueryParamContextProps | null>(null)

/*
 *   FUNCTION VARIATION (No Hooks)
 **********************************************************************************************************/
export function getQueryParams(defaultParams: Partial<QueryParamsInput> = {}) {
	const stringifiedDefaults = convertToQueryParams(defaultParams)
	const searchParams = new URLSearchParams(window.location.search)

	const urlParams: Partial<QueryParams> = {}
	searchParams.forEach((value, key) => {
		urlParams[key] = value
	})

	const queryParams = {
		...stringifiedDefaults,
		...urlParams,
	} as QueryParams

	const updateURL = (params: QueryParams) => {
		const newParams = new URLSearchParams()

		Object.entries(params).forEach(([key, value]) => {
			if (
				value !== null &&
				value !== undefined &&
				(!(key in stringifiedDefaults) || value !== stringifiedDefaults[key])
			) {
				newParams.set(key, String(value))
			}
		})

		const search = newParams.toString()
		const query = search ? `?${search}` : ''
		const newUrl = `${window.location.pathname}${query}`

		window.history.pushState({}, '', newUrl)
	}

	const onParamChange = (key: string, value: string | null) => {
		const newParams: QueryParams = { ...queryParams }

		if (value === undefined || value === '') {
			newParams[key] = null
		} else {
			newParams[key] = value
		}

		if (!nonFilterParams.includes(key) && 'page' in stringifiedDefaults) {
			newParams.page = stringifiedDefaults.page || '1'
		}

		updateURL(newParams)
		return newParams
	}

	return {
		queryParams,
		onParamChange,
		updateURL,
	}
}

/*
 *   HOOK
 **********************************************************************************************************/
export function useQueryParams(defaultParams: Partial<QueryParamsInput> = {}) {
	const stringifiedDefaults = convertToQueryParams(defaultParams)
	const [pathname, setPathname] = useState(window.location.pathname)
	const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search))
	const initialSearchParams = new URLSearchParams(window.location.search)

	const initialUrlParams: Partial<QueryParams> = {}
	initialSearchParams.forEach((value, key) => {
		initialUrlParams[key] = value
	})

	const ensuredInitialParams = {
		...stringifiedDefaults,
		...initialUrlParams,
	}

	const [queryParams, setQueryParams] = useState<QueryParams>(ensuredInitialParams as QueryParams)

	useEffect(() => {
		const handlePopState = () => {
			const newSearchParams = new URLSearchParams(window.location.search)
			const newPathname = window.location.pathname

			setPathname(newPathname)
			setSearchParams(newSearchParams)

			const urlParams: Partial<QueryParams> = {}
			newSearchParams.forEach((value, key) => {
				urlParams[key] = value
			})

			setQueryParams(
				() =>
					({
						...stringifiedDefaults,
						...urlParams,
					}) as QueryParams
			)
		}

		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [stringifiedDefaults])

	const searchParamsString = searchParams.toString()

	useEffect(() => {
		// Recreate URLSearchParams from string to avoid stale closure
		const currentSearchParams = new URLSearchParams(searchParamsString)
		const urlParams: Partial<QueryParams> = {}

		currentSearchParams.forEach((value, key) => {
			urlParams[key] = value
		})

		if (Object.keys(urlParams).length > 0) {
			setQueryParams(prev => {
				const updated = { ...prev, ...urlParams }
				return updated
			})
		}
	}, [searchParamsString])

	const updateURL = useCallback(
		(params: QueryParams) => {
			const newParams = new URLSearchParams()

			Object.entries(params).forEach(([key, value]) => {
				if (
					value !== null &&
					value !== undefined &&
					(!(key in stringifiedDefaults) || value !== stringifiedDefaults[key])
				) {
					newParams.set(key, String(value))
				}
			})

			const search = newParams.toString()
			const query = search ? `?${search}` : ''
			const newUrl = `${pathname}${query}`

			window.history.pushState({}, '', newUrl)
			setSearchParams(newParams)
		},
		[pathname, stringifiedDefaults]
	)

	const onParamChange = useCallback(
		(key: string, value: string | null) => {
			setQueryParams(prev => {
				const newParams: QueryParams = { ...prev }

				if (value === undefined || value === '') {
					newParams[key] = null
				} else {
					newParams[key] = value
				}

				if (!nonFilterParams.includes(key) && 'page' in stringifiedDefaults) {
					newParams.page = stringifiedDefaults.page || '1'
				}

				setTimeout(() => updateURL(newParams), 0)
				return newParams
			})
		},
		[updateURL, stringifiedDefaults]
	)

	const onBulkParamChange = useCallback(
		(params: Partial<QueryParams>) => {
			setQueryParams(prev => {
				const newParams: QueryParams = { ...prev }

				Object.entries(params).forEach(([key, value]) => {
					if (value === undefined || value === '') {
						newParams[key] = null
					} else {
						newParams[key] = value
					}
				})

				setTimeout(() => updateURL(newParams), 0)
				return newParams
			})
		},
		[updateURL]
	)

	const clearAllFilters = useCallback(() => {
		setQueryParams(prev => {
			const newParams = { ...stringifiedDefaults }

			Object.keys(prev).forEach(key => {
				if (nonFilterParams.includes(key) && key in stringifiedDefaults) {
					newParams[key] = stringifiedDefaults[key]
				}
			})

			setTimeout(() => updateURL(newParams as QueryParams), 0)
			return newParams as QueryParams
		})
	}, [updateURL, stringifiedDefaults])

	const isFiltered = Object.keys(queryParams).some(
		key =>
			!nonFilterParams.includes(key) &&
			queryParams[key] !== null &&
			!(key in stringifiedDefaults)
	)

	return {
		queryParams,
		clearAllFilters,
		onBulkParamChange,
		onParamChange,
		isFiltered,
		isSearched: queryParams.q || null,
	}
}
