/*
 *   ROUTE MANAGER
 *   Centralized routing and history management
 ***************************************************************************************************/

export interface RouteParams {
	[key: string]: string | null
}

export interface RouteManagerConfig {
	debug?: boolean
}

export class RouteManager {
	private debug: boolean
	private listeners: Set<() => void> = new Set()
	private navigationId: number = 0
	private lastBrowserNavigationId: number = 0

	constructor(config: RouteManagerConfig = {}) {
		this.debug = config.debug || false
		this.setupListeners()
	}

	/**
	 * Setup browser history listeners
	 */
	private setupListeners(): void {
		window.addEventListener('popstate', this.handlePopState)
	}

	/**
	 * Cleanup listeners
	 */
	public cleanup(): void {
		window.removeEventListener('popstate', this.handlePopState)
		this.listeners.clear()
	}

	/**
	 * Handle browser back/forward
	 */
	private handlePopState = (): void => {
		this.log('Browser navigation detected')
		this.lastBrowserNavigationId = ++this.navigationId
		this.notifyListeners()
	}

	/**
	 * Subscribe to route changes
	 */
	public subscribe(callback: () => void): () => void {
		this.listeners.add(callback)
		return () => {
			this.listeners.delete(callback)
		}
	}

	/**
	 * Notify all listeners
	 */
	private notifyListeners(): void {
		this.listeners.forEach(callback => callback())
	}

	/**
	 * Check if the last navigation was triggered by browser back/forward
	 * Returns true if current navigation ID matches the last browser navigation
	 */
	public isBrowserNavigating(): boolean {
		return (
			this.navigationId === this.lastBrowserNavigationId && this.lastBrowserNavigationId > 0
		)
	}

	/**
	 * Mark that we've consumed the browser navigation flag
	 * This should be called after handling the navigation
	 */
	public consumeBrowserNavigation(): void {
		// Increment navigationId so future checks return false
		this.navigationId++
	}

	/**
	 * Get current route params
	 */
	public getParams(paramNames?: string[]): RouteParams {
		const searchParams = new URLSearchParams(window.location.search)
		const params: RouteParams = {}

		if (paramNames) {
			// Get specific params
			paramNames.forEach(name => {
				params[name] = searchParams.get(name)
			})
		} else {
			// Get all params
			searchParams.forEach((value, key) => {
				params[key] = value
			})
		}

		return params
	}

	/**
	 * Get a single param value
	 */
	public getParam(name: string): string | null {
		const searchParams = new URLSearchParams(window.location.search)
		return searchParams.get(name)
	}

	/**
	 * Update route params (creates new history entry)
	 */
	public updateParams(params: RouteParams): void {
		const newParams = new URLSearchParams(window.location.search)

		// Update params
		Object.entries(params).forEach(([key, value]) => {
			if (value === null || value === undefined) {
				newParams.delete(key)
			} else {
				newParams.set(key, value)
			}
		})

		const search = newParams.toString()
		const query = search ? `?${search}` : ''
		const newUrl = `${window.location.pathname}${query}`

		this.log('Updating route', { url: newUrl, params })

		window.history.pushState({}, '', newUrl)
		this.notifyListeners()
	}

	/**
	 * Replace current route params (replaces history entry)
	 */
	public replaceParams(params: RouteParams): void {
		const newParams = new URLSearchParams(window.location.search)

		// Update params
		Object.entries(params).forEach(([key, value]) => {
			if (value === null || value === undefined) {
				newParams.delete(key)
			} else {
				newParams.set(key, value)
			}
		})

		const search = newParams.toString()
		const query = search ? `?${search}` : ''
		const newUrl = `${window.location.pathname}${query}`

		this.log('Replacing route', { url: newUrl, params })

		window.history.replaceState({}, '', newUrl)
		this.notifyListeners()
	}

	/**
	 * Set a single param
	 */
	public setParam(name: string, value: string | null): void {
		this.updateParams({ [name]: value })
	}

	/**
	 * Clear specific params
	 */
	public clearParams(paramNames: string[]): void {
		const params: RouteParams = {}
		paramNames.forEach(name => {
			params[name] = null
		})
		this.updateParams(params)
	}

	/**
	 * Clear all params
	 */
	public clearAllParams(): void {
		this.log('Clearing all params')
		window.history.pushState({}, '', window.location.pathname)
		this.notifyListeners()
	}

	/**
	 * Navigate back in history
	 */
	public goBack(): void {
		this.log('Going back')
		window.history.back()
	}

	/**
	 * Navigate forward in history
	 */
	public goForward(): void {
		this.log('Going forward')
		window.history.forward()
	}

	/**
	 * Go to specific history position
	 */
	public go(delta: number): void {
		this.log('Going to position', { delta })
		window.history.go(delta)
	}

	/**
	 * Get current URL
	 */
	public getCurrentUrl(): string {
		return window.location.href
	}

	/**
	 * Get current pathname
	 */
	public getPathname(): string {
		return window.location.pathname
	}

	/**
	 * Get current search string
	 */
	public getSearch(): string {
		return window.location.search
	}

	/**
	 * Log debug messages
	 */
	private log(message: string, data?: unknown): void {
		if (this.debug) {
			console.log(`[RouteManager] ${message}`, data || '')
		}
	}
}

// Singleton instance
const routeManager = new RouteManager()
export default routeManager
