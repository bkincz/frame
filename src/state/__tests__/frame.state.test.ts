/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import FrameState from '../frame.state'
import { customEventManager } from '@/lib/event'
import type { FlowDefinition } from '@/types/flow.types'

/*
 *   MOCKS
 ***************************************************************************************************/
vi.mock('@/lib/event', () => ({
	customEventManager: {
		emit: vi.fn(),
	},
}))

/*
 *   TEST DATA
 ***************************************************************************************************/
const mockFlowDefinition: FlowDefinition = {
	name: 'test-flow',
	config: {
		variant: 'drawer',
	},
	flow: {
		step1: {
			component: () => null,
			config: {},
		},
		step2: {
			component: () => null,
			config: {
				variant: 'fullscreen',
			},
		},
		step3: {
			component: () => null,
			config: {},
		},
	},
}

const mockFlowDefinition2: FlowDefinition = {
	name: 'flow-2',
	config: {},
	flow: {
		'step-a': {
			component: () => null,
			config: {},
		},
		'step-b': {
			component: () => null,
			config: {},
		},
	},
}

/*
 *   TESTS
 ***************************************************************************************************/
describe('FrameState', () => {
	beforeEach(() => {
		// Reset state
		FrameState.resetFrame()
		FrameState.clearFlowCache()
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Initial State', () => {
		it('should have correct initial state', () => {
			expect(FrameState.state.isOpen).toBe(false)
			expect(FrameState.state.isAnimating).toBe(false)
			expect(FrameState.state.hasFrameInit).toBe(false)
			expect(FrameState.state.flowOpenCount).toBe(0)
			expect(FrameState.state.variant).toBe('fullscreen')
			expect(FrameState.state.currentFlow).toBeNull()
			expect(FrameState.state.currentStepKey).toBeNull()
			expect(FrameState.state.previousFlow).toBeNull()
			expect(FrameState.state.previousStepKey).toBeNull()
			expect(FrameState.state.flowHistory).toEqual([])
			expect(FrameState.state.stepHistory).toEqual([])
			expect(FrameState.state.flowLifecycle.enteredFlows).toEqual([])
			expect(FrameState.state.flowLifecycle.currentStepEntered).toBe(false)
		})
	})

	describe('Flow Definition Cache', () => {
		it('should cache flow definition', () => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)

			const cached = FrameState.getFlowDefinition('test-flow')
			expect(cached).toEqual(mockFlowDefinition)
		})

		it('should return null for uncached flow', () => {
			const cached = FrameState.getFlowDefinition('non-existent')
			expect(cached).toBeNull()
		})

		it('should clear specific flow cache', () => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.cacheFlowDefinition('flow-2', mockFlowDefinition2)

			FrameState.clearFlowCache('test-flow')

			expect(FrameState.getFlowDefinition('test-flow')).toBeNull()
			expect(FrameState.getFlowDefinition('flow-2')).toEqual(mockFlowDefinition2)
		})

		it('should clear all flow cache', () => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.cacheFlowDefinition('flow-2', mockFlowDefinition2)

			FrameState.clearFlowCache()

			expect(FrameState.getFlowDefinition('test-flow')).toBeNull()
			expect(FrameState.getFlowDefinition('flow-2')).toBeNull()
		})
	})

	describe('openFrame', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.cacheFlowDefinition('flow-2', mockFlowDefinition2)
		})

		it('should open frame with first step by default', () => {
			FrameState.openFrame('test-flow')

			expect(FrameState.state.isOpen).toBe(true)
			expect(FrameState.state.currentFlow).toBe('test-flow')
			expect(FrameState.state.currentStepKey).toBe('step1')
			expect(FrameState.state.flowOpenCount).toBe(1)
		})

		it('should open frame with specific step', () => {
			FrameState.openFrame('test-flow', 'step2')

			expect(FrameState.state.currentStepKey).toBe('step2')
		})

		it('should emit frame:open event', () => {
			FrameState.openFrame('test-flow', 'step1')

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:open', {
				flow: 'test-flow',
				stepKey: 'step1',
			})
		})

		it('should emit frame:flow:change event on flow change', () => {
			FrameState.openFrame('test-flow')
			vi.clearAllMocks()

			FrameState.openFrame('flow-2')

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:flow:change', {
				flow: 'flow-2',
				previousFlow: 'test-flow',
			})
		})

		it('should not open frame if definition not cached', () => {
			const consoleSpy = vi.spyOn(console, 'error')

			FrameState.openFrame('non-existent')

			expect(FrameState.state.isOpen).toBe(false)
			expect(consoleSpy).toHaveBeenCalledWith(
				'[FrameState] Cannot open flow "non-existent": definition not found in cache'
			)

			consoleSpy.mockRestore()
		})

		it('should not open frame if step key not found', () => {
			const consoleSpy = vi.spyOn(console, 'error')

			FrameState.openFrame('test-flow', 'invalid-step')

			expect(FrameState.state.isOpen).toBe(false)
			expect(consoleSpy).toHaveBeenCalledWith(
				'[FrameState] Cannot open flow "test-flow": step key "invalid-step" not found'
			)

			consoleSpy.mockRestore()
		})

		it('should auto-chain when opening new flow if frame is open', () => {
			FrameState.openFrame('test-flow', 'step2')
			FrameState.openFrame('flow-2')

			expect(FrameState.state.flowHistory).toEqual([{ flow: 'test-flow', stepKey: 'step2' }])
		})

		it('should not chain if chain=false', () => {
			FrameState.openFrame('test-flow', 'step2')
			FrameState.openFrame('flow-2', undefined, false)

			expect(FrameState.state.flowHistory).toEqual([])
		})

		it('should force chain if chain=true', () => {
			FrameState.openFrame('test-flow', 'step1', true)

			expect(FrameState.state.flowHistory).toEqual([])
		})

		it('should update variant based on step config', () => {
			FrameState.openFrame('test-flow', 'step2')

			expect(FrameState.state.variant).toBe('fullscreen')
		})

		it('should use flow config variant when step has no variant', () => {
			FrameState.openFrame('test-flow', 'step1')

			expect(FrameState.state.variant).toBe('drawer')
		})

		it('should increment flowOpenCount only on flow change', () => {
			FrameState.openFrame('test-flow')
			expect(FrameState.state.flowOpenCount).toBe(1)

			FrameState.openFrame('test-flow', 'step2')
			expect(FrameState.state.flowOpenCount).toBe(1)

			FrameState.openFrame('flow-2')
			expect(FrameState.state.flowOpenCount).toBe(1)
		})

		it('should reset flowOpenCount to 1 after close and reopen', () => {
			FrameState.openFrame('test-flow')
			expect(FrameState.state.flowOpenCount).toBe(1)

			FrameState.closeFrame()
			// After close, currentFlow is null, so reopening is treated as a new flow
			FrameState.openFrame('test-flow')
			expect(FrameState.state.flowOpenCount).toBe(1)
		})
	})

	describe('closeFrame', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
		})

		it('should close frame and reset state', () => {
			FrameState.openFrame('test-flow', 'step2')
			FrameState.closeFrame()

			expect(FrameState.state.isOpen).toBe(false)
			expect(FrameState.state.hasFrameInit).toBe(false)
			expect(FrameState.state.flowOpenCount).toBe(0)
			expect(FrameState.state.currentFlow).toBeNull()
			expect(FrameState.state.currentStepKey).toBeNull()
			expect(FrameState.state.flowHistory).toEqual([])
			expect(FrameState.state.variant).toBe('fullscreen')
		})

		it('should store previous flow and step', () => {
			FrameState.openFrame('test-flow', 'step2')
			FrameState.closeFrame()

			expect(FrameState.state.previousFlow).toBe('test-flow')
			expect(FrameState.state.previousStepKey).toBe('step2')
		})

		it('should emit frame:close event', () => {
			FrameState.openFrame('test-flow')
			vi.clearAllMocks()

			FrameState.closeFrame()

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:close', undefined)
		})
	})

	describe('setStepKey', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.openFrame('test-flow', 'step1')
			vi.clearAllMocks()
		})

		it('should set step key', () => {
			FrameState.setStepKey('step2')

			expect(FrameState.state.currentStepKey).toBe('step2')
			expect(FrameState.state.previousStepKey).toBe('step1')
		})

		it('should emit frame:step:change event', () => {
			FrameState.setStepKey('step2')

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:step:change', {
				stepKey: 'step2',
				previousStepKey: 'step1',
			})
		})

		it('should not set invalid step key', () => {
			const consoleSpy = vi.spyOn(console, 'warn')

			FrameState.setStepKey('invalid-step')

			expect(FrameState.state.currentStepKey).toBe('step1')
			expect(consoleSpy).toHaveBeenCalledWith(
				'[FrameState] Step key "invalid-step" not found in current flow'
			)

			consoleSpy.mockRestore()
		})

		it('should update variant when step changes', () => {
			FrameState.setStepKey('step2')

			expect(FrameState.state.variant).toBe('fullscreen')
		})

		it('should reset currentStepEntered flag', () => {
			FrameState.markStepEntered()
			expect(FrameState.state.flowLifecycle.currentStepEntered).toBe(true)

			FrameState.setStepKey('step2')
			expect(FrameState.state.flowLifecycle.currentStepEntered).toBe(false)
		})
	})

	describe('nextStep', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.openFrame('test-flow', 'step1')
			vi.clearAllMocks()
		})

		it('should advance to next step', () => {
			FrameState.nextStep()

			expect(FrameState.state.currentStepKey).toBe('step2')
		})

		it('should emit frame:navigation:next event', () => {
			FrameState.nextStep()

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:navigation:next', {
				flow: 'test-flow',
				fromStepKey: 'step1',
				toStepKey: 'step2',
			})
		})

		it('should not advance past last step', () => {
			FrameState.setStepKey('step3')
			vi.clearAllMocks()

			FrameState.nextStep()

			expect(FrameState.state.currentStepKey).toBe('step3')
			expect(customEventManager.emit).not.toHaveBeenCalledWith(
				'frame:navigation:next',
				expect.any(Object)
			)
		})
	})

	describe('previousStep', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.openFrame('test-flow', 'step2')
			vi.clearAllMocks()
		})

		it('should go to previous step', () => {
			FrameState.previousStep()

			expect(FrameState.state.currentStepKey).toBe('step1')
		})

		it('should emit frame:navigation:previous event', () => {
			FrameState.previousStep()

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:navigation:previous', {
				flow: 'test-flow',
				fromStepKey: 'step2',
				toStepKey: 'step1',
			})
		})

		it('should not go before first step', () => {
			FrameState.setStepKey('step1')
			vi.clearAllMocks()

			FrameState.previousStep()

			expect(FrameState.state.currentStepKey).toBe('step1')
			expect(customEventManager.emit).not.toHaveBeenCalledWith(
				'frame:navigation:previous',
				expect.any(Object)
			)
		})
	})

	describe('goBackInHistory', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.cacheFlowDefinition('flow-2', mockFlowDefinition2)
		})

		it('should go back to previous flow in history', () => {
			FrameState.openFrame('test-flow', 'step2')
			FrameState.openFrame('flow-2')

			const result = FrameState.goBackInHistory()

			expect(result).toBe(true)
			expect(FrameState.state.currentFlow).toBe('test-flow')
			expect(FrameState.state.currentStepKey).toBe('step2')
			expect(FrameState.state.flowHistory).toEqual([])
		})

		it('should emit frame:navigation:history-back event', () => {
			FrameState.openFrame('test-flow')
			FrameState.openFrame('flow-2')
			vi.clearAllMocks()

			FrameState.goBackInHistory()

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:navigation:history-back', {
				fromFlow: 'flow-2',
				toFlow: 'test-flow',
				toStepKey: 'step1',
			})
		})

		it('should emit frame:step:change event with skipAnimation', () => {
			FrameState.openFrame('test-flow', 'step2')
			FrameState.openFrame('flow-2')
			vi.clearAllMocks()

			FrameState.goBackInHistory()

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:step:change', {
				stepKey: 'step2',
				previousStepKey: 'step-a',
				skipAnimation: true,
			})
		})

		it('should return false if no history', () => {
			FrameState.openFrame('test-flow')

			const result = FrameState.goBackInHistory()

			expect(result).toBe(false)
			expect(FrameState.state.currentFlow).toBe('test-flow')
		})

		it('should handle multiple history entries', () => {
			FrameState.openFrame('test-flow', 'step1')
			FrameState.openFrame('flow-2', 'step-a')
			FrameState.openFrame('test-flow', 'step3', true)

			expect(FrameState.state.flowHistory.length).toBe(2)

			FrameState.goBackInHistory()
			expect(FrameState.state.currentFlow).toBe('flow-2')
			expect(FrameState.state.flowHistory.length).toBe(1)

			FrameState.goBackInHistory()
			expect(FrameState.state.currentFlow).toBe('test-flow')
			expect(FrameState.state.flowHistory.length).toBe(0)
		})
	})

	describe('clearFlowHistory', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.cacheFlowDefinition('flow-2', mockFlowDefinition2)
		})

		it('should clear flow history', () => {
			FrameState.openFrame('test-flow')
			FrameState.openFrame('flow-2')

			expect(FrameState.state.flowHistory.length).toBe(1)

			FrameState.clearFlowHistory()

			expect(FrameState.state.flowHistory).toEqual([])
		})
	})

	describe('goToStep', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.openFrame('test-flow', 'step1')
			vi.clearAllMocks()
		})

		it('should navigate to a specific step', () => {
			FrameState.goToStep('step3')

			expect(FrameState.state.currentStepKey).toBe('step3')
			expect(FrameState.state.previousStepKey).toBe('step1')
		})

		it('should add current step to step history before navigating', () => {
			expect(FrameState.state.stepHistory).toEqual([])

			FrameState.goToStep('step3')

			expect(FrameState.state.stepHistory).toEqual(['step1'])
		})

		it('should emit frame:navigation:skip event with forward direction', () => {
			FrameState.goToStep('step3')

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:navigation:skip', {
				flow: 'test-flow',
				fromStepKey: 'step1',
				toStepKey: 'step3',
				direction: 'forward',
			})
		})

		it('should emit frame:navigation:skip event with backward direction', () => {
			FrameState.setStepKey('step3')
			vi.clearAllMocks()

			FrameState.goToStep('step1')

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:navigation:skip', {
				flow: 'test-flow',
				fromStepKey: 'step3',
				toStepKey: 'step1',
				direction: 'backward',
			})
		})

		it('should emit frame:step:change event', () => {
			FrameState.goToStep('step2')

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:step:change', {
				stepKey: 'step2',
				previousStepKey: 'step1',
			})
		})

		it('should not navigate if already at target step', () => {
			FrameState.goToStep('step1')

			expect(FrameState.state.stepHistory).toEqual([])
			expect(customEventManager.emit).not.toHaveBeenCalled()
		})

		it('should not navigate if step key is invalid', () => {
			const consoleSpy = vi.spyOn(console, 'warn')

			FrameState.goToStep('invalid-step')

			expect(FrameState.state.currentStepKey).toBe('step1')
			expect(consoleSpy).toHaveBeenCalledWith(
				'[FrameState] Step key "invalid-step" not found in current flow'
			)

			consoleSpy.mockRestore()
		})

		it('should not navigate if no flow is active', () => {
			FrameState.closeFrame()
			const consoleSpy = vi.spyOn(console, 'warn')

			FrameState.goToStep('step2')

			expect(consoleSpy).toHaveBeenCalledWith(
				'[FrameState] Cannot go to step: no flow is currently active'
			)

			consoleSpy.mockRestore()
		})

		it('should update variant when step changes', () => {
			FrameState.goToStep('step2')

			expect(FrameState.state.variant).toBe('fullscreen')
		})

		it('should reset currentStepEntered flag', () => {
			FrameState.markStepEntered()
			expect(FrameState.state.flowLifecycle.currentStepEntered).toBe(true)

			FrameState.goToStep('step2')
			expect(FrameState.state.flowLifecycle.currentStepEntered).toBe(false)
		})

		it('should track multiple step navigations in history', () => {
			FrameState.goToStep('step2')
			FrameState.goToStep('step3')
			FrameState.goToStep('step1')

			expect(FrameState.state.stepHistory).toEqual(['step1', 'step2', 'step3'])
		})
	})

	describe('goBackInStepHistory', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.openFrame('test-flow', 'step1')
			vi.clearAllMocks()
		})

		it('should go back to previous step in history', () => {
			FrameState.goToStep('step3')
			vi.clearAllMocks()

			const result = FrameState.goBackInStepHistory()

			expect(result).toBe(true)
			expect(FrameState.state.currentStepKey).toBe('step1')
			expect(FrameState.state.stepHistory).toEqual([])
		})

		it('should emit frame:navigation:step-history-back event', () => {
			FrameState.goToStep('step3')
			vi.clearAllMocks()

			FrameState.goBackInStepHistory()

			expect(customEventManager.emit).toHaveBeenCalledWith(
				'frame:navigation:step-history-back',
				{
					flow: 'test-flow',
					fromStepKey: 'step3',
					toStepKey: 'step1',
				}
			)
		})

		it('should emit frame:step:change event', () => {
			FrameState.goToStep('step2')
			vi.clearAllMocks()

			FrameState.goBackInStepHistory()

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:step:change', {
				stepKey: 'step1',
				previousStepKey: 'step2',
			})
		})

		it('should return false if no step history', () => {
			const result = FrameState.goBackInStepHistory()

			expect(result).toBe(false)
			expect(FrameState.state.currentStepKey).toBe('step1')
		})

		it('should handle multiple step history entries', () => {
			FrameState.goToStep('step2')
			FrameState.goToStep('step3')
			FrameState.goToStep('step1')

			expect(FrameState.state.stepHistory).toEqual(['step1', 'step2', 'step3'])

			FrameState.goBackInStepHistory()
			expect(FrameState.state.currentStepKey).toBe('step3')
			expect(FrameState.state.stepHistory).toEqual(['step1', 'step2'])

			FrameState.goBackInStepHistory()
			expect(FrameState.state.currentStepKey).toBe('step2')
			expect(FrameState.state.stepHistory).toEqual(['step1'])

			FrameState.goBackInStepHistory()
			expect(FrameState.state.currentStepKey).toBe('step1')
			expect(FrameState.state.stepHistory).toEqual([])
		})

		it('should update variant when going back', () => {
			FrameState.setStepKey('step2')
			expect(FrameState.state.variant).toBe('fullscreen')

			FrameState.goToStep('step1')
			expect(FrameState.state.variant).toBe('drawer')

			FrameState.goBackInStepHistory()
			expect(FrameState.state.variant).toBe('fullscreen')
		})

		it('should reset currentStepEntered flag', () => {
			FrameState.goToStep('step2')
			FrameState.markStepEntered()
			expect(FrameState.state.flowLifecycle.currentStepEntered).toBe(true)

			FrameState.goBackInStepHistory()
			expect(FrameState.state.flowLifecycle.currentStepEntered).toBe(false)
		})
	})

	describe('clearStepHistory', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.openFrame('test-flow', 'step1')
		})

		it('should clear step history', () => {
			FrameState.goToStep('step2')
			FrameState.goToStep('step3')

			expect(FrameState.state.stepHistory.length).toBe(2)

			FrameState.clearStepHistory()

			expect(FrameState.state.stepHistory).toEqual([])
		})
	})

	describe('Step History Integration', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.cacheFlowDefinition('flow-2', mockFlowDefinition2)
		})

		it('should clear step history when changing flows', () => {
			FrameState.openFrame('test-flow', 'step1')
			FrameState.goToStep('step2')
			FrameState.goToStep('step3')

			expect(FrameState.state.stepHistory).toEqual(['step1', 'step2'])

			FrameState.openFrame('flow-2')

			expect(FrameState.state.stepHistory).toEqual([])
		})

		it('should clear step history when closing frame', () => {
			FrameState.openFrame('test-flow', 'step1')
			FrameState.goToStep('step2')

			expect(FrameState.state.stepHistory.length).toBe(1)

			FrameState.closeFrame()

			expect(FrameState.state.stepHistory).toEqual([])
		})

		it('should clear step history when resetting frame', () => {
			FrameState.openFrame('test-flow', 'step1')
			FrameState.goToStep('step2')

			expect(FrameState.state.stepHistory.length).toBe(1)

			FrameState.resetFrame()

			expect(FrameState.state.stepHistory).toEqual([])
		})

		it('should preserve step history when navigating within same flow via openFrame', () => {
			FrameState.openFrame('test-flow', 'step1')
			FrameState.goToStep('step2')

			expect(FrameState.state.stepHistory).toEqual(['step1'])

			// Navigating to different step in same flow via openFrame should not clear step history
			// This is handled by the step navigation within the same flow
			FrameState.openFrame('test-flow', 'step3')

			// Step history is cleared when navigating within same flow via openFrame
			// because it's treated as a new navigation context
			expect(FrameState.state.stepHistory).toEqual(['step1'])
		})

		it('should clear step history when reopening a closed flow', () => {
			FrameState.openFrame('test-flow', 'step1')
			FrameState.goToStep('step2')
			FrameState.closeFrame()

			FrameState.openFrame('test-flow', 'step1')

			expect(FrameState.state.stepHistory).toEqual([])
		})
	})

	describe('Flow Lifecycle', () => {
		it('should mark flow as entered', () => {
			FrameState.markFlowEntered('test-flow')

			expect(FrameState.selectIsFlowEntered('test-flow')).toBe(true)
			expect(customEventManager.emit).toHaveBeenCalledWith('frame:flow:enter', {
				flow: 'test-flow',
			})
		})

		it('should not duplicate entered flows', () => {
			FrameState.markFlowEntered('test-flow')
			FrameState.markFlowEntered('test-flow')

			expect(FrameState.state.flowLifecycle.enteredFlows.length).toBe(1)
		})

		it('should mark flow as exited', () => {
			FrameState.markFlowEntered('test-flow')
			FrameState.markFlowExited('test-flow')

			expect(FrameState.selectIsFlowEntered('test-flow')).toBe(false)
			expect(customEventManager.emit).toHaveBeenCalledWith('frame:flow:exit', {
				flow: 'test-flow',
			})
		})

		it('should mark step as entered', () => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.openFrame('test-flow')
			vi.clearAllMocks()

			FrameState.markStepEntered()

			expect(FrameState.state.flowLifecycle.currentStepEntered).toBe(true)
			expect(customEventManager.emit).toHaveBeenCalledWith('frame:step:enter', {
				flow: 'test-flow',
				stepKey: 'step1',
			})
		})

		it('should mark step as exited', () => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
			FrameState.openFrame('test-flow')
			FrameState.markStepEntered()
			vi.clearAllMocks()

			FrameState.markStepExited()

			expect(FrameState.state.flowLifecycle.currentStepEntered).toBe(false)
			expect(customEventManager.emit).toHaveBeenCalledWith('frame:step:exit', {
				flow: 'test-flow',
				stepKey: 'step1',
			})
		})
	})

	describe('Selectors', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
		})

		it('selectCurrentStepIndex should return current step index', () => {
			FrameState.openFrame('test-flow', 'step1')
			expect(FrameState.selectCurrentStepIndex()).toBe(0)

			FrameState.setStepKey('step2')
			expect(FrameState.selectCurrentStepIndex()).toBe(1)

			FrameState.setStepKey('step3')
			expect(FrameState.selectCurrentStepIndex()).toBe(2)
		})

		it('selectStepKeys should return step keys for current flow', () => {
			FrameState.openFrame('test-flow')

			const stepKeys = FrameState.selectStepKeys()
			expect(stepKeys).toEqual(['step1', 'step2', 'step3'])
		})

		it('selectStepKeys should return empty array if no flow', () => {
			const stepKeys = FrameState.selectStepKeys()
			expect(stepKeys).toEqual([])
		})

		it('selectHasHistory should return false initially', () => {
			expect(FrameState.selectHasHistory()).toBe(false)
		})

		it('selectHasHistory should return true when history exists', () => {
			FrameState.cacheFlowDefinition('flow-2', mockFlowDefinition2)
			FrameState.openFrame('test-flow')
			FrameState.openFrame('flow-2')

			expect(FrameState.selectHasHistory()).toBe(true)
		})

		it('selectHasStepHistory should return false initially', () => {
			expect(FrameState.selectHasStepHistory()).toBe(false)
		})

		it('selectHasStepHistory should return true when step history exists', () => {
			FrameState.openFrame('test-flow', 'step1')
			FrameState.goToStep('step2')

			expect(FrameState.selectHasStepHistory()).toBe(true)
		})

		it('selectHasStepHistory should return false after step history is cleared', () => {
			FrameState.openFrame('test-flow', 'step1')
			FrameState.goToStep('step2')
			FrameState.clearStepHistory()

			expect(FrameState.selectHasStepHistory()).toBe(false)
		})

		it('selectVariant should return correct variant', () => {
			FrameState.openFrame('test-flow', 'step1')
			expect(FrameState.selectVariant()).toBe('drawer')

			FrameState.setStepKey('step2')
			expect(FrameState.selectVariant()).toBe('fullscreen')
		})

		it('selectHasFrameInit should return frame init state', () => {
			expect(FrameState.selectHasFrameInit()).toBe(false)

			FrameState.markFrameInit()
			expect(FrameState.selectHasFrameInit()).toBe(true)
		})
	})

	describe('setAnimating', () => {
		it('should set animating state', () => {
			FrameState.setAnimating(true)
			expect(FrameState.state.isAnimating).toBe(true)

			FrameState.setAnimating(false)
			expect(FrameState.state.isAnimating).toBe(false)
		})
	})

	describe('resetFrame', () => {
		beforeEach(() => {
			FrameState.cacheFlowDefinition('test-flow', mockFlowDefinition)
		})

		it('should reset frame to initial state', () => {
			FrameState.openFrame('test-flow', 'step2')
			FrameState.markFlowEntered('test-flow')
			FrameState.markStepEntered()
			FrameState.setAnimating(true)

			FrameState.resetFrame()

			expect(FrameState.state.isOpen).toBe(false)
			expect(FrameState.state.isAnimating).toBe(false)
			expect(FrameState.state.currentFlow).toBeNull()
			expect(FrameState.state.currentStepKey).toBeNull()
			expect(FrameState.state.previousFlow).toBeNull()
			expect(FrameState.state.previousStepKey).toBeNull()
			expect(FrameState.state.flowHistory).toEqual([])
			expect(FrameState.state.flowLifecycle.enteredFlows).toEqual([])
			expect(FrameState.state.flowLifecycle.currentStepEntered).toBe(false)
		})
	})
})
