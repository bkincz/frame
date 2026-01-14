/*
 *   USE INERT MANAGEMENT HOOK
 *   Manages making background elements inert when frame is in modal mode
 ***************************************************************************************************/
import { useEffect, useRef } from 'react'
import type { InertConfig } from '@/types/flow.types'

interface UseInertManagementProps {
	/** Whether the frame is open */
	isOpen: boolean
	/** Whether the frame is in modal variant */
	isModal: boolean
	/** Inert configuration */
	config?: Partial<InertConfig>
	/** Debug mode */
	debug?: boolean
}

interface InertState {
	elements: Array<{
		element: HTMLElement
		originalInert: boolean
		originalAriaHidden: string | null
		originalTabIndex: string | null
	}>
}

/**
 * Hook to manage inert state of background elements in modal mode.
 * Makes all elements outside the frame non-interactive and hidden from screen readers.
 *
 * @param props - Configuration options
 * @returns void
 *
 * @example
 * ```tsx
 * useInertManagement({
 *   isOpen: true,
 *   isModal: true,
 *   config: {
 *     enabled: true,
 *     excludeSelectors: ['#header', '.persistent-nav']
 *   },
 *   debug: false
 * })
 * ```
 */
export function useInertManagement({
	isOpen,
	isModal,
	config = {},
	debug = false,
}: UseInertManagementProps) {
	const stateRef = useRef<InertState>({ elements: [] })

	useEffect(() => {
		const enabled = config.enabled !== false
		const shouldApplyInert = isOpen && isModal && enabled

		if (!shouldApplyInert) {
			if (stateRef.current.elements.length > 0) {
				restoreInertState(stateRef.current, debug)
				stateRef.current.elements = []
			}
			return
		}

		const frameElement = document.querySelector('[class*="frame_frame"]')
		if (!frameElement) {
			if (debug) {
				console.warn('[useInertManagement] Frame element not found')
			}
			return
		}

		const bodyChildren = Array.from(document.body.children) as HTMLElement[]
		const inertElements: InertState['elements'] = []

		bodyChildren.forEach(element => {
			if (element.contains(frameElement)) {
				return
			}

			if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
				return
			}

			if (config.excludeSelectors && config.excludeSelectors.length > 0) {
				const isExcluded = config.excludeSelectors.some(selector => {
					try {
						return element.matches(selector)
					} catch (error) {
						if (debug) {
							console.warn(
								`[useInertManagement] Invalid selector: ${selector}`,
								error
							)
						}
						return false
					}
				})

				if (isExcluded) {
					if (debug) {
						console.log(
							`[useInertManagement] Excluding element from inert:`,
							element
						)
					}
					return
				}
			}

			// Store original state
			const originalState = {
				element,
				originalInert: element.inert || false,
				originalAriaHidden: element.getAttribute('aria-hidden'),
				originalTabIndex: element.getAttribute('tabindex'),
			}

			inertElements.push(originalState)

			element.inert = true
			element.setAttribute('aria-hidden', 'true')

			if (debug) {
				console.log(`[useInertManagement] Made element inert:`, element)
			}
		})

		stateRef.current.elements = inertElements

		if (debug) {
			console.log(
				`[useInertManagement] Applied inert to ${inertElements.length} elements`
			)
		}

		return () => {
			restoreInertState(stateRef.current, debug)
			stateRef.current.elements = []
		}
	}, [isOpen, isModal, config.enabled, config.excludeSelectors, debug])
}

/**
 * Restores the original inert state of elements
 */
function restoreInertState(state: InertState, debug: boolean) {
	state.elements.forEach(({ element, originalInert, originalAriaHidden, originalTabIndex }) => {
		if (!document.body.contains(element)) {
			return
		}

		element.inert = originalInert

		if (originalAriaHidden === null) {
			element.removeAttribute('aria-hidden')
		} else {
			element.setAttribute('aria-hidden', originalAriaHidden)
		}

		if (originalTabIndex === null) {
			element.removeAttribute('tabindex')
		} else {
			element.setAttribute('tabindex', originalTabIndex)
		}

		if (debug) {
			console.log(`[useInertManagement] Restored element:`, element)
		}
	})

	if (debug && state.elements.length > 0) {
		console.log(`[useInertManagement] Restored ${state.elements.length} elements`)
	}
}
