/*
 *   HELPERS
 **********************************************************************************************************/

/**
 * Generates a reliable UUID v4
 * Uses crypto.randomUUID() if available (modern browsers), falls back to custom implementation
 */
export const genUUID = (): string => {
	// Use native crypto.randomUUID() if available (preferred method)
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

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Format an execution time in milliseconds to a human-readable string
 * @param {number} [ms] Execution time in milliseconds
 * @returns {string} Human-readable string representation of the execution time
 * @example
 * formatExecutionTime(0.5) // '500.00µs'
 * formatExecutionTime(500) // '500.00ms'
 * formatExecutionTime(2000) // '2.00s'
 * formatExecutionTime(undefined) // 'N/A'
 */
export const formatExecutionTime = (ms?: number) => {
	if (ms === undefined) return 'N/A'
	if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`
	if (ms < 1000) return `${ms.toFixed(2)}ms`
	return `${(ms / 1000).toFixed(2)}s`
}

/**
 * Format a memory usage in kilobytes to a human-readable string
 * @param {number} [kb] Memory usage in kilobytes
 * @returns {string} Human-readable string representation of the memory usage
 * @example
 * formatMemoryUsage(0.5) // '512.00KB'
 * formatMemoryUsage(500) // '500.00KB'
 * formatMemoryUsage(2000) // '2.00MB'
 * formatMemoryUsage(undefined) // 'N/A'
 */
export const formatMemoryUsage = (kb?: number) => {
	if (kb === undefined) return 'N/A'
	if (kb < 1024) return `${kb.toFixed(0)}KB`
	return `${(kb / 1024).toFixed(2)}MB`
}
