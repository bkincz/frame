/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach } from 'vitest'
import UIState from '../ui.state'

/*
 *   TESTS
 ***************************************************************************************************/
describe('UIState', () => {
	beforeEach(() => {
		// Reset state before each test
		UIState.setLoading(false)
	})

	describe('Initial State', () => {
		it('should have correct initial state', () => {
			expect(UIState.getState().loading).toBe(false)
			expect(UIState.getState().authenticated).toBe(false)
		})
	})

	describe('setLoading', () => {
		it('should set loading to true', () => {
			UIState.setLoading(true)

			expect(UIState.getState().loading).toBe(true)
		})

		it('should set loading to false', () => {
			UIState.setLoading(true)
			UIState.setLoading(false)

			expect(UIState.getState().loading).toBe(false)
		})

		it('should set loading to string message', () => {
			UIState.setLoading('Loading user data...')

			expect(UIState.getState().loading).toBe('Loading user data...')
		})

		it('should update loading message', () => {
			UIState.setLoading('Loading...')
			UIState.setLoading('Almost done...')

			expect(UIState.getState().loading).toBe('Almost done...')
		})

		it('should handle multiple loading state changes', () => {
			UIState.setLoading(true)
			expect(UIState.getState().loading).toBe(true)

			UIState.setLoading('Processing...')
			expect(UIState.getState().loading).toBe('Processing...')

			UIState.setLoading(false)
			expect(UIState.getState().loading).toBe(false)
		})

		it('should handle empty string', () => {
			UIState.setLoading('')

			expect(UIState.getState().loading).toBe('')
		})

		it('should override previous loading state', () => {
			UIState.setLoading('First message')
			UIState.setLoading('Second message')

			expect(UIState.getState().loading).toBe('Second message')
		})
	})

	describe('Loading State Types', () => {
		it('should support boolean false', () => {
			UIState.setLoading(false)
			expect(UIState.getState().loading).toBe(false)
			expect(typeof UIState.getState().loading).toBe('boolean')
		})

		it('should support boolean true', () => {
			UIState.setLoading(true)
			expect(UIState.getState().loading).toBe(true)
			expect(typeof UIState.getState().loading).toBe('boolean')
		})

		it('should support string messages', () => {
			UIState.setLoading('Loading data')
			expect(UIState.getState().loading).toBe('Loading data')
			expect(typeof UIState.getState().loading).toBe('string')
		})
	})

	describe('Authenticated State', () => {
		it('should maintain authenticated state independently', () => {
			// Note: authenticated doesn't have a setter in the current implementation
			// This test just verifies it exists and maintains its value
			expect(UIState.getState().authenticated).toBe(false)

			UIState.setLoading(true)
			expect(UIState.getState().authenticated).toBe(false)
		})
	})
})
