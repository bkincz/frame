/*
 *   TESTS FOR USE INERT MANAGEMENT HOOK
 ***************************************************************************************************/
import { renderHook, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useInertManagement } from '../useInertManagement'

describe('useInertManagement', () => {
	beforeEach(() => {
		// Setup DOM structure
		document.body.innerHTML = `
			<div id="app">App Content</div>
			<div id="header">Header Content</div>
			<div class="frame_frame">
				<div>Frame Content</div>
			</div>
			<script>console.log('test')</script>
			<style>.test { color: red; }</style>
		`

		// Initialize inert property for all elements (JSDOM doesn't support it natively)
		const elements = document.querySelectorAll('*')
		elements.forEach(element => {
			if (!('inert' in element)) {
				Object.defineProperty(element, 'inert', {
					value: false,
					writable: true,
					configurable: true,
				})
			}
		})
	})

	afterEach(() => {
		cleanup()
		document.body.innerHTML = ''
	})

	test('should not apply inert when frame is closed', () => {
		const appElement = document.getElementById('app')!
		const headerElement = document.getElementById('header')!

		renderHook(() =>
			useInertManagement({
				isOpen: false,
				isModal: true,
				config: { enabled: true },
				debug: false,
			})
		)

		expect(appElement.inert).toBe(false)
		expect(headerElement.inert).toBe(false)
		expect(appElement.getAttribute('aria-hidden')).toBeNull()
		expect(headerElement.getAttribute('aria-hidden')).toBeNull()
	})

	test('should not apply inert when frame is in fullscreen mode', () => {
		const appElement = document.getElementById('app')!
		const headerElement = document.getElementById('header')!

		renderHook(() =>
			useInertManagement({
				isOpen: true,
				isModal: false,
				config: { enabled: true },
				debug: false,
			})
		)

		expect(appElement.inert).toBe(false)
		expect(headerElement.inert).toBe(false)
		expect(appElement.getAttribute('aria-hidden')).toBeNull()
		expect(headerElement.getAttribute('aria-hidden')).toBeNull()
	})

	test('should apply inert when frame is open in modal mode', () => {
		const appElement = document.getElementById('app')!
		const headerElement = document.getElementById('header')!

		renderHook(() =>
			useInertManagement({
				isOpen: true,
				isModal: true,
				config: { enabled: true },
				debug: false,
			})
		)

		expect(appElement.inert).toBe(true)
		expect(headerElement.inert).toBe(true)
		expect(appElement.getAttribute('aria-hidden')).toBe('true')
		expect(headerElement.getAttribute('aria-hidden')).toBe('true')
	})

	test('should not apply inert when explicitly disabled', () => {
		const appElement = document.getElementById('app')!
		const headerElement = document.getElementById('header')!

		renderHook(() =>
			useInertManagement({
				isOpen: true,
				isModal: true,
				config: { enabled: false },
				debug: false,
			})
		)

		expect(appElement.inert).toBe(false)
		expect(headerElement.inert).toBe(false)
		expect(appElement.getAttribute('aria-hidden')).toBeNull()
		expect(headerElement.getAttribute('aria-hidden')).toBeNull()
	})

	test('should exclude elements matching exclusion selectors', () => {
		const appElement = document.getElementById('app')!
		const headerElement = document.getElementById('header')!

		renderHook(() =>
			useInertManagement({
				isOpen: true,
				isModal: true,
				config: {
					enabled: true,
					excludeSelectors: ['#header'],
				},
				debug: false,
			})
		)

		expect(appElement.inert).toBe(true)
		expect(appElement.getAttribute('aria-hidden')).toBe('true')

		expect(headerElement.inert).toBe(false)
		expect(headerElement.getAttribute('aria-hidden')).toBeNull()
	})

	test('should exclude elements matching multiple exclusion selectors', () => {
		const appElement = document.getElementById('app')!
		const headerElement = document.getElementById('header')!

		renderHook(() =>
			useInertManagement({
				isOpen: true,
				isModal: true,
				config: {
					enabled: true,
					excludeSelectors: ['#header', '#app'],
				},
				debug: false,
			})
		)

		expect(appElement.inert).toBe(false)
		expect(headerElement.inert).toBe(false)
		expect(appElement.getAttribute('aria-hidden')).toBeNull()
		expect(headerElement.getAttribute('aria-hidden')).toBeNull()
	})

	test('should skip script and style elements', () => {
		const scriptElement = document.querySelector('script')!
		const styleElement = document.querySelector('style')!

		renderHook(() =>
			useInertManagement({
				isOpen: true,
				isModal: true,
				config: { enabled: true },
				debug: false,
			})
		)

		expect(scriptElement.inert).toBe(false)
		expect(styleElement.inert).toBe(false)
	})

	test('should restore original inert state when unmounted', () => {
		const appElement = document.getElementById('app')!
		const headerElement = document.getElementById('header')!

		// Pre-set some initial state
		appElement.inert = false
		headerElement.setAttribute('aria-hidden', 'false')

		const { unmount } = renderHook(() =>
			useInertManagement({
				isOpen: true,
				isModal: true,
				config: { enabled: true },
				debug: false,
			})
		)

		expect(appElement.inert).toBe(true)
		expect(headerElement.inert).toBe(true)

		unmount()

		expect(appElement.inert).toBe(false)
		expect(headerElement.inert).toBe(false)
		expect(appElement.getAttribute('aria-hidden')).toBeNull()
		expect(headerElement.getAttribute('aria-hidden')).toBe('false')
	})

	test('should restore state when switching from modal to fullscreen', () => {
		const appElement = document.getElementById('app')!
		const headerElement = document.getElementById('header')!

		const { rerender } = renderHook(
			({ isModal }) =>
				useInertManagement({
					isOpen: true,
					isModal,
					config: { enabled: true },
					debug: false,
				}),
			{ initialProps: { isModal: true } }
		)

		expect(appElement.inert).toBe(true)
		expect(headerElement.inert).toBe(true)

		rerender({ isModal: false })

		expect(appElement.inert).toBe(false)
		expect(headerElement.inert).toBe(false)
		expect(appElement.getAttribute('aria-hidden')).toBeNull()
		expect(headerElement.getAttribute('aria-hidden')).toBeNull()
	})

	test('should handle invalid selectors gracefully', () => {
		const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

		const appElement = document.getElementById('app')!

		renderHook(() =>
			useInertManagement({
				isOpen: true,
				isModal: true,
				config: {
					enabled: true,
					excludeSelectors: [':::invalid:::'],
				},
				debug: true,
			})
		)

		expect(appElement.inert).toBe(true)
		expect(consoleSpy).toHaveBeenCalled()

		consoleSpy.mockRestore()
	})

	test('should log debug information when debug is enabled', () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

		renderHook(() =>
			useInertManagement({
				isOpen: true,
				isModal: true,
				config: { enabled: true },
				debug: true,
			})
		)

		expect(consoleSpy).toHaveBeenCalled()
		expect(consoleSpy.mock.calls.some(call => call[0].includes('[useInertManagement]'))).toBe(
			true
		)

		consoleSpy.mockRestore()
	})

	test('should not apply inert to frame container element', () => {
		const frameElement = document.querySelector('.frame_frame') as HTMLElement

		renderHook(() =>
			useInertManagement({
				isOpen: true,
				isModal: true,
				config: { enabled: true },
				debug: false,
			})
		)

		expect(frameElement.inert).toBe(false)
		expect(frameElement.getAttribute('aria-hidden')).toBeNull()
	})
})
