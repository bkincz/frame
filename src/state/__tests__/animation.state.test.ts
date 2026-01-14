/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, vi } from 'vitest'
import AnimationState from '../animation.state'

/*
 *   TESTS
 ***************************************************************************************************/
describe('AnimationState', () => {
	beforeEach(() => {
		// Reset state before each test
		AnimationState.endAnimation()
	})

	describe('Initial State', () => {
		it('should have correct initial state', () => {
			expect(AnimationState.selectIsAnimating()).toBe(false)
			expect(AnimationState.selectAnimationType()).toBeNull()
			expect(AnimationState.selectDirection()).toBeUndefined()
		})
	})

	describe('startAnimation', () => {
		it('should start step animation', () => {
			const result = AnimationState.startAnimation('step')

			expect(result).toBe(true)
			expect(AnimationState.selectIsAnimating()).toBe(true)
			expect(AnimationState.selectAnimationType()).toBe('step')
			expect(AnimationState.selectDirection()).toBeUndefined()
		})

		it('should start flow animation', () => {
			const result = AnimationState.startAnimation('flow')

			expect(result).toBe(true)
			expect(AnimationState.selectIsAnimating()).toBe(true)
			expect(AnimationState.selectAnimationType()).toBe('flow')
		})

		it('should start frame-in animation', () => {
			const result = AnimationState.startAnimation('frame-in')

			expect(result).toBe(true)
			expect(AnimationState.selectAnimationType()).toBe('frame-in')
		})

		it('should start frame-out animation', () => {
			const result = AnimationState.startAnimation('frame-out')

			expect(result).toBe(true)
			expect(AnimationState.selectAnimationType()).toBe('frame-out')
		})

		it('should set direction when provided', () => {
			AnimationState.startAnimation('step', 'forward')

			expect(AnimationState.selectDirection()).toBe('forward')
		})

		it('should set backward direction', () => {
			AnimationState.startAnimation('step', 'backward')

			expect(AnimationState.selectDirection()).toBe('backward')
		})

		it('should not start animation if already animating', () => {
			const consoleSpy = vi.spyOn(console, 'warn')

			AnimationState.startAnimation('step', 'forward')
			const result = AnimationState.startAnimation('flow', 'backward')

			expect(result).toBe(false)
			expect(AnimationState.selectIsAnimating()).toBe(true)
			expect(AnimationState.selectAnimationType()).toBe('step')
			expect(AnimationState.selectDirection()).toBe('forward')
			expect(consoleSpy).toHaveBeenCalledWith('[AnimationState] Already animating: step')

			consoleSpy.mockRestore()
		})

		it('should handle null animation type', () => {
			const result = AnimationState.startAnimation(null)

			expect(result).toBe(true)
			expect(AnimationState.selectIsAnimating()).toBe(true)
			expect(AnimationState.selectAnimationType()).toBeNull()
		})
	})

	describe('endAnimation', () => {
		it('should end animation and reset state', () => {
			AnimationState.startAnimation('step', 'forward')

			expect(AnimationState.selectIsAnimating()).toBe(true)

			AnimationState.endAnimation()

			expect(AnimationState.selectIsAnimating()).toBe(false)
			expect(AnimationState.selectAnimationType()).toBeNull()
			expect(AnimationState.selectDirection()).toBeUndefined()
		})

		it('should be idempotent', () => {
			AnimationState.startAnimation('step')
			AnimationState.endAnimation()
			AnimationState.endAnimation()

			expect(AnimationState.selectIsAnimating()).toBe(false)
			expect(AnimationState.selectAnimationType()).toBeNull()
		})
	})

	describe('Selectors', () => {
		it('selectIsAnimating should return current animation state', () => {
			expect(AnimationState.selectIsAnimating()).toBe(false)

			AnimationState.startAnimation('step')
			expect(AnimationState.selectIsAnimating()).toBe(true)

			AnimationState.endAnimation()
			expect(AnimationState.selectIsAnimating()).toBe(false)
		})

		it('selectAnimationType should return current animation type', () => {
			expect(AnimationState.selectAnimationType()).toBeNull()

			AnimationState.startAnimation('flow')
			expect(AnimationState.selectAnimationType()).toBe('flow')

			AnimationState.endAnimation()
			expect(AnimationState.selectAnimationType()).toBeNull()
		})

		it('selectDirection should return current direction', () => {
			expect(AnimationState.selectDirection()).toBeUndefined()

			AnimationState.startAnimation('step', 'forward')
			expect(AnimationState.selectDirection()).toBe('forward')

			AnimationState.endAnimation()
			expect(AnimationState.selectDirection()).toBeUndefined()
		})
	})

	describe('Animation Sequences', () => {
		it('should handle multiple animation cycles', () => {
			AnimationState.startAnimation('step', 'forward')
			AnimationState.endAnimation()

			AnimationState.startAnimation('flow', 'backward')
			AnimationState.endAnimation()

			AnimationState.startAnimation('frame-in')
			AnimationState.endAnimation()

			expect(AnimationState.selectIsAnimating()).toBe(false)
			expect(AnimationState.selectAnimationType()).toBeNull()
		})

		it('should require ending animation before starting new one', () => {
			AnimationState.startAnimation('step')

			const result = AnimationState.startAnimation('flow')
			expect(result).toBe(false)

			AnimationState.endAnimation()

			const result2 = AnimationState.startAnimation('flow')
			expect(result2).toBe(true)
			expect(AnimationState.selectAnimationType()).toBe('flow')
		})
	})
})
