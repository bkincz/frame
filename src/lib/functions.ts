/*
 *   HELPERS
 **********************************************************************************************************/

// Uses crypto.randomUUID() if available (modern browsers), falls back to custom implementation
export const genUUID = (): string => {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID()
	}

	// Fallback implementation for older browsers
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0
		const v = c === 'x' ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})
}

export const capitalize = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export const formatExecutionTime = (ms?: number) => {
	if (ms === undefined) return 'N/A'
	if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`
	if (ms < 1000) return `${ms.toFixed(2)}ms`
	return `${(ms / 1000).toFixed(2)}s`
}

export const formatMemoryUsage = (kb?: number) => {
	if (kb === undefined) return 'N/A'
	if (kb < 1024) return `${kb.toFixed(0)}KB`
	return `${(kb / 1024).toFixed(2)}MB`
}
