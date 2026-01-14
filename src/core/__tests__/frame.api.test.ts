/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { customEventManager } from '@/lib/event'
import FrameState from '@/state/frame.state'
import {
	openFlow,
	replaceFlow,
	closeFlow,
	goBack,
	hasHistory,
	nextStep,
	previousStep,
	clearHistory,
} from '../frame.api'

/*
 *   SETUP
 ***************************************************************************************************/
vi.mock('@/lib/event', () => ({
	customEventManager: {
		emit: vi.fn(),
	},
}))

vi.mock('@/state/frame.state', () => ({
	default: {
		selectHasHistory: vi.fn(),
		clearFlowHistory: vi.fn(),
	},
}))

/*
 *   TESTS
 ***************************************************************************************************/
describe('Frame API', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('openFlow', () => {
		it('should emit frame:request:open event with flow name', () => {
			openFlow('test-flow')

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:open', {
				flow: 'test-flow',
				stepKey: undefined,
			})
		})

		it('should emit frame:request:open event with flow name and step key', () => {
			openFlow('test-flow', 'step-1')

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:open', {
				flow: 'test-flow',
				stepKey: 'step-1',
			})
		})
	})

	describe('replaceFlow', () => {
		it('should emit frame:request:open event with chain false', () => {
			replaceFlow('test-flow')

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:open', {
				flow: 'test-flow',
				stepKey: undefined,
				chain: false,
			})
		})

		it('should emit frame:request:open event with flow name, step key, and chain false', () => {
			replaceFlow('test-flow', 'step-2')

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:open', {
				flow: 'test-flow',
				stepKey: 'step-2',
				chain: false,
			})
		})
	})

	describe('closeFlow', () => {
		it('should emit frame:request:close event', () => {
			closeFlow()

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:close', {})
		})
	})

	describe('goBack', () => {
		it('should emit frame:request:back event', () => {
			goBack()

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:back', {})
		})
	})

	describe('hasHistory', () => {
		it('should return true when there is flow history', () => {
			vi.mocked(FrameState.selectHasHistory).mockReturnValue(true)

			const result = hasHistory()

			expect(result).toBe(true)
			expect(FrameState.selectHasHistory).toHaveBeenCalled()
		})

		it('should return false when there is no flow history', () => {
			vi.mocked(FrameState.selectHasHistory).mockReturnValue(false)

			const result = hasHistory()

			expect(result).toBe(false)
			expect(FrameState.selectHasHistory).toHaveBeenCalled()
		})
	})

	describe('nextStep', () => {
		it('should emit frame:request:next event', () => {
			nextStep()

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:next', {})
		})
	})

	describe('previousStep', () => {
		it('should emit frame:request:previous event', () => {
			previousStep()

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:previous', {})
		})
	})

	describe('clearHistory', () => {
		it('should call FrameState.clearFlowHistory', () => {
			clearHistory()

			expect(FrameState.clearFlowHistory).toHaveBeenCalled()
		})
	})
})
