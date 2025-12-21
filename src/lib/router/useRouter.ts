/*
 *   USE ROUTER HOOK
 *   React hook for accessing route manager functionality
 ***************************************************************************************************/

import { useEffect, useState, useCallback, useMemo } from 'react'
import type { RouteParams } from './route.manager'
import routeManager from './route.manager'

export interface UseRouterConfig {
	/**
	 * List of param names to watch
	 * If not provided, watches all params
	 */
	params?: string[]
	/**
	 * Enable debug logging
	 */
	debug?: boolean
}

export interface UseRouterReturn {
	/**
	 * Current route params
	 */
	params: RouteParams
	/**
	 * Update route params (creates new history entry)
	 */
	updateParams: (params: RouteParams) => void
	/**
	 * Replace route params (replaces current history entry)
	 */
	replaceParams: (params: RouteParams) => void
	/**
	 * Set a single param
	 */
	setParam: (name: string, value: string | null) => void
	/**
	 * Clear specific params
	 */
	clearParams: (paramNames: string[]) => void
	/**
	 * Clear all params
	 */
	clearAllParams: () => void
	/**
	 * Navigate back
	 */
	goBack: () => void
	/**
	 * Navigate forward
	 */
	goForward: () => void
	/**
	 * Current pathname
	 */
	pathname: string
	/**
	 * Current search string
	 */
	search: string
}

export function useRouter(config: UseRouterConfig = {}): UseRouterReturn {
	const { params: watchParams, debug = false } = config

	// Get initial params
	const [params, setParams] = useState<RouteParams>(() => routeManager.getParams(watchParams))
	const [pathname, setPathname] = useState(routeManager.getPathname())
	const [search, setSearch] = useState(routeManager.getSearch())

	/**
	 * Update local state when route changes
	 */
	const handleRouteChange = useCallback(() => {
		setParams(routeManager.getParams(watchParams))
		setPathname(routeManager.getPathname())
		setSearch(routeManager.getSearch())

		if (debug) {
			console.log('[useRouter] Route changed', {
				params: routeManager.getParams(watchParams),
				pathname: routeManager.getPathname(),
			})
		}
	}, [watchParams, debug])

	/**
	 * Subscribe to route changes
	 */
	useEffect(() => {
		const unsubscribe = routeManager.subscribe(handleRouteChange)
		return unsubscribe
	}, [handleRouteChange])

	/**
	 * Memoized methods
	 */
	const updateParams = useCallback((newParams: RouteParams) => {
		routeManager.updateParams(newParams)
	}, [])

	const replaceParams = useCallback((newParams: RouteParams) => {
		routeManager.replaceParams(newParams)
	}, [])

	const setParam = useCallback((name: string, value: string | null) => {
		routeManager.setParam(name, value)
	}, [])

	const clearParams = useCallback((paramNames: string[]) => {
		routeManager.clearParams(paramNames)
	}, [])

	const clearAllParams = useCallback(() => {
		routeManager.clearAllParams()
	}, [])

	const goBack = useCallback(() => {
		routeManager.goBack()
	}, [])

	const goForward = useCallback(() => {
		routeManager.goForward()
	}, [])

	return useMemo(
		() => ({
			params,
			updateParams,
			replaceParams,
			setParam,
			clearParams,
			clearAllParams,
			goBack,
			goForward,
			pathname,
			search,
		}),
		[
			params,
			updateParams,
			replaceParams,
			setParam,
			clearParams,
			clearAllParams,
			goBack,
			goForward,
			pathname,
			search,
		]
	)
}
