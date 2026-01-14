/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach } from 'vitest'
import StepState from '../step.state'

/*
 *   TESTS
 ***************************************************************************************************/
describe('StepState', () => {
	beforeEach(() => {
		// Reset state before each test
		StepState.endEntering()
		StepState.endExiting()
	})

	describe('Initial State', () => {
		it('should have correct initial state', () => {
			expect(StepState.selectIsExiting()).toBe(false)
			expect(StepState.selectIsEntering()).toBe(false)
			expect(StepState.selectIsInLifecycle()).toBe(false)
		})
	})

	describe('startEntering', () => {
		it('should mark step as entering', () => {
			StepState.startEntering()

			expect(StepState.selectIsEntering()).toBe(true)
			expect(StepState.selectIsExiting()).toBe(false)
		})

		it('should update lifecycle state', () => {
			StepState.startEntering()

			expect(StepState.selectIsInLifecycle()).toBe(true)
		})
	})

	describe('endEntering', () => {
		it('should end entering state', () => {
			StepState.startEntering()
			StepState.endEntering()

			expect(StepState.selectIsEntering()).toBe(false)
		})

		it('should be idempotent', () => {
			StepState.startEntering()
			StepState.endEntering()
			StepState.endEntering()

			expect(StepState.selectIsEntering()).toBe(false)
		})
	})

	describe('startExiting', () => {
		it('should mark step as exiting', () => {
			StepState.startExiting()

			expect(StepState.selectIsExiting()).toBe(true)
			expect(StepState.selectIsEntering()).toBe(false)
		})

		it('should update lifecycle state', () => {
			StepState.startExiting()

			expect(StepState.selectIsInLifecycle()).toBe(true)
		})
	})

	describe('endExiting', () => {
		it('should end exiting state', () => {
			StepState.startExiting()
			StepState.endExiting()

			expect(StepState.selectIsExiting()).toBe(false)
		})

		it('should be idempotent', () => {
			StepState.startExiting()
			StepState.endExiting()
			StepState.endExiting()

			expect(StepState.selectIsExiting()).toBe(false)
		})
	})

	describe('Selectors', () => {
		it('selectIsExiting should return exiting state', () => {
			expect(StepState.selectIsExiting()).toBe(false)

			StepState.startExiting()
			expect(StepState.selectIsExiting()).toBe(true)

			StepState.endExiting()
			expect(StepState.selectIsExiting()).toBe(false)
		})

		it('selectIsEntering should return entering state', () => {
			expect(StepState.selectIsEntering()).toBe(false)

			StepState.startEntering()
			expect(StepState.selectIsEntering()).toBe(true)

			StepState.endEntering()
			expect(StepState.selectIsEntering()).toBe(false)
		})

		it('selectIsInLifecycle should return true when exiting', () => {
			StepState.startExiting()

			expect(StepState.selectIsInLifecycle()).toBe(true)
		})

		it('selectIsInLifecycle should return true when entering', () => {
			StepState.startEntering()

			expect(StepState.selectIsInLifecycle()).toBe(true)
		})

		it('selectIsInLifecycle should return true when both entering and exiting', () => {
			// This is an edge case - both should not be true simultaneously in normal use
			StepState.startEntering()
			StepState.startExiting()

			expect(StepState.selectIsInLifecycle()).toBe(true)
		})

		it('selectIsInLifecycle should return false when neither entering nor exiting', () => {
			expect(StepState.selectIsInLifecycle()).toBe(false)
		})
	})

	describe('Lifecycle Sequences', () => {
		it('should handle enter-exit sequence', () => {
			StepState.startEntering()
			expect(StepState.selectIsInLifecycle()).toBe(true)

			StepState.endEntering()
			expect(StepState.selectIsInLifecycle()).toBe(false)

			StepState.startExiting()
			expect(StepState.selectIsInLifecycle()).toBe(true)

			StepState.endExiting()
			expect(StepState.selectIsInLifecycle()).toBe(false)
		})

		it('should handle multiple cycles', () => {
			for (let i = 0; i < 3; i++) {
				StepState.startEntering()
				StepState.endEntering()

				StepState.startExiting()
				StepState.endExiting()
			}

			expect(StepState.selectIsInLifecycle()).toBe(false)
			expect(StepState.selectIsEntering()).toBe(false)
			expect(StepState.selectIsExiting()).toBe(false)
		})

		it('should allow starting entering while exiting', () => {
			StepState.startExiting()
			StepState.startEntering()

			expect(StepState.selectIsExiting()).toBe(true)
			expect(StepState.selectIsEntering()).toBe(true)
			expect(StepState.selectIsInLifecycle()).toBe(true)
		})

		it('should allow starting exiting while entering', () => {
			StepState.startEntering()
			StepState.startExiting()

			expect(StepState.selectIsEntering()).toBe(true)
			expect(StepState.selectIsExiting()).toBe(true)
			expect(StepState.selectIsInLifecycle()).toBe(true)
		})
	})

	describe('State Transitions', () => {
		it('should transition from idle to entering', () => {
			expect(StepState.selectIsInLifecycle()).toBe(false)

			StepState.startEntering()

			expect(StepState.selectIsInLifecycle()).toBe(true)
			expect(StepState.selectIsEntering()).toBe(true)
		})

		it('should transition from entering to idle', () => {
			StepState.startEntering()
			expect(StepState.selectIsInLifecycle()).toBe(true)

			StepState.endEntering()

			expect(StepState.selectIsInLifecycle()).toBe(false)
		})

		it('should transition from idle to exiting', () => {
			expect(StepState.selectIsInLifecycle()).toBe(false)

			StepState.startExiting()

			expect(StepState.selectIsInLifecycle()).toBe(true)
			expect(StepState.selectIsExiting()).toBe(true)
		})

		it('should transition from exiting to idle', () => {
			StepState.startExiting()
			expect(StepState.selectIsInLifecycle()).toBe(true)

			StepState.endExiting()

			expect(StepState.selectIsInLifecycle()).toBe(false)
		})
	})
})
