/*
 *   IMPORTS
 ***************************************************************************************************/
import { createMachine, devtools, type Machine } from '@bkincz/clutch'

/*
 *   SHARED
 ***************************************************************************************************/
import { customEventManager, type EventDataMap } from '@/lib/event'

/*
 *   TYPES
 ***************************************************************************************************/
import type { FlowDefinition, FrameVariant } from '@/types/flow.types'

export interface FlowLifecycleState {
	enteredFlows: string[]
	currentStepEntered: boolean
}

export interface FlowHistoryEntry {
	flow: string
	stepKey: string
}

export interface FrameStateData {
	isOpen: boolean
	isAnimating: boolean
	hasFrameInit: boolean
	flowOpenCount: number
	variant: FrameVariant
	currentFlow: string | null
	currentStepKey: string | null
	previousFlow: string | null
	previousStepKey: string | null
	flowHistory: FlowHistoryEntry[]
	stepHistory: string[]
	flowLifecycle: FlowLifecycleState
	flowDefinitionCache: Record<string, FlowDefinition>
	flowParams: Record<string, unknown>
}

interface FrameActions {
	openFrame: (
		flow: string,
		stepKey?: string,
		chain?: boolean,
		skipAnimation?: boolean,
		params?: Record<string, unknown>
	) => void
	closeFrame: () => void
	goBackInHistory: () => boolean
	clearFlowHistory: () => void
	setStepKey: (stepKey: string) => void
	nextStep: () => void
	previousStep: () => void
	goToStep: (stepKey: string) => void
	goBackInStepHistory: () => boolean
	clearStepHistory: () => void
	resetFrame: () => void
	setAnimating: (isAnimating: boolean) => void
	cacheFlowDefinition: (flowName: string, definition: FlowDefinition) => void
	getFlowDefinition: (flowName: string) => FlowDefinition | null
	clearFlowCache: (flowName?: string) => void
	markFlowEntered: (flowName: string) => void
	markFlowExited: (flowName: string) => void
	markStepEntered: () => void
	markStepExited: () => void
	selectCurrentStepIndex: () => number
	selectStepKeys: () => string[]
	selectIsFlowEntered: (flowName: string) => boolean
	selectHasHistory: () => boolean
	selectHasStepHistory: () => boolean
	selectVariant: () => FrameVariant
}

export type FrameStateProps = Machine<FrameStateData> & FrameActions

/*
 *   EVENT DATA TYPES
 *
 *   Event Emission Patterns:
 *
 *   Frame Lifecycle:
 *   - openFrame() → frame:open, frame:flow:change (if flow changed)
 *   - closeFrame() → frame:close
 *
 *   Step Navigation:
 *   - setStepKey() → frame:step:change
 *   - nextStep() → frame:navigation:next, frame:step:change (via setStepKey)
 *   - previousStep() → frame:navigation:previous, frame:step:change (via setStepKey)
 *
 *   Flow Navigation:
 *   - goBackInHistory() → frame:navigation:history-back, frame:flow:change
 *
 *   Lifecycle Tracking:
 *   - markFlowEntered() → frame:flow:enter
 *   - markFlowExited() → frame:flow:exit
 *   - markStepEntered() → frame:step:enter
 *   - markStepExited() → frame:step:exit
 ***************************************************************************************************/
// Use EventDataMap as single source of truth for event types
export type FrameOpenEventData = EventDataMap['frame:open']
export type FrameStepChangeEventData = EventDataMap['frame:step:change']
export type FrameFlowChangeEventData = EventDataMap['frame:flow:change']
export type FrameStepEnterEventData = EventDataMap['frame:step:enter']
export type FrameStepExitEventData = EventDataMap['frame:step:exit']
export type FrameFlowEnterEventData = EventDataMap['frame:flow:enter']
export type FrameFlowExitEventData = EventDataMap['frame:flow:exit']
export type FrameNextStepEventData = EventDataMap['frame:navigation:next']
export type FramePreviousStepEventData = EventDataMap['frame:navigation:previous']
export type FrameSkipStepEventData = EventDataMap['frame:navigation:skip']
export type FrameStepHistoryBackEventData = EventDataMap['frame:navigation:step-history-back']
export type FrameHistoryBackEventData = EventDataMap['frame:navigation:history-back']

/*
 *   STATE
 ***************************************************************************************************/
const initialState: FrameStateData = {
	isOpen: false,
	isAnimating: false,
	hasFrameInit: false,
	flowOpenCount: 0,
	variant: 'fullscreen',
	currentFlow: null,
	currentStepKey: null,
	previousFlow: null,
	previousStepKey: null,
	flowHistory: [],
	stepHistory: [],
	flowLifecycle: {
		enteredFlows: [],
		currentStepEntered: false,
	},
	flowDefinitionCache: {},
	flowParams: {},
}

const machine = createMachine<FrameStateData>({ initialState })

if (process.env.NODE_ENV !== 'production') {
	machine.with(devtools({ name: 'FrameState' }))
}

const FrameState = Object.assign(machine, {
	selectCurrentStepIndex(): number {
		const { currentFlow, currentStepKey, flowDefinitionCache } = machine.getState()
		if (!currentFlow || !currentStepKey) return 0

		const flowDef = flowDefinitionCache[currentFlow]
		if (!flowDef) return 0

		const stepKeys = Object.keys(flowDef.flow)
		return stepKeys.indexOf(currentStepKey)
	},

	selectStepKeys(): string[] {
		const { currentFlow, flowDefinitionCache } = machine.getState()
		if (!currentFlow) return []

		const flowDef = flowDefinitionCache[currentFlow]
		return flowDef ? Object.keys(flowDef.flow) : []
	},

	selectIsFlowEntered(flowName: string): boolean {
		return machine.getState().flowLifecycle.enteredFlows.includes(flowName)
	},

	selectHasHistory(): boolean {
		return machine.getState().flowHistory.length > 0
	},

	selectHasStepHistory(): boolean {
		return machine.getState().stepHistory.length > 0
	},

	selectVariant(): FrameVariant {
		const { currentFlow, currentStepKey, flowDefinitionCache } = machine.getState()
		if (!currentFlow || !currentStepKey) return 'fullscreen'

		const flowDef = flowDefinitionCache[currentFlow]
		if (!flowDef) return 'fullscreen'

		const currentStep = flowDef.flow[currentStepKey]

		// Priority: step config > flow config > default 'fullscreen'
		return currentStep?.config?.variant || flowDef.config?.variant || 'fullscreen'
	},

	selectHasFrameInit(): boolean {
		return machine.getState().hasFrameInit
	},

	updateVariant(): void {
		const newVariant = this.selectVariant()
		if (machine.getState().variant !== newVariant) {
			machine.mutate(draft => {
				draft.variant = newVariant
			}, 'Update Variant')
		}
	},

	cacheFlowDefinition(flowName: string, definition: FlowDefinition): void {
		machine.mutate(draft => {
			draft.flowDefinitionCache[flowName] = definition
		}, 'Cache Flow Definition')
	},

	getFlowDefinition(flowName: string): FlowDefinition | null {
		return machine.getState().flowDefinitionCache[flowName] || null
	},

	clearFlowCache(flowName?: string): void {
		machine.mutate(draft => {
			if (flowName) {
				delete draft.flowDefinitionCache[flowName]
			} else {
				draft.flowDefinitionCache = {}
			}
		}, 'Clear Flow Cache')
	},

	markFlowEntered(flowName: string): void {
		machine.mutate(draft => {
			if (!draft.flowLifecycle.enteredFlows.includes(flowName)) {
				draft.flowLifecycle.enteredFlows.push(flowName)
			}
		}, 'Mark Flow Entered')

		customEventManager.emit<FrameFlowEnterEventData>('frame:flow:enter', {
			flow: flowName,
		})
	},

	markFlowExited(flowName: string): void {
		machine.mutate(draft => {
			const index = draft.flowLifecycle.enteredFlows.indexOf(flowName)
			if (index > -1) {
				draft.flowLifecycle.enteredFlows.splice(index, 1)
			}
		}, 'Mark Flow Exited')

		customEventManager.emit<FrameFlowExitEventData>('frame:flow:exit', {
			flow: flowName,
		})
	},

	markStepEntered(): void {
		const { currentFlow, currentStepKey } = machine.getState()

		machine.mutate(draft => {
			draft.flowLifecycle.currentStepEntered = true
		}, 'Mark Step Entered')

		if (currentFlow && currentStepKey) {
			customEventManager.emit<FrameStepEnterEventData>('frame:step:enter', {
				flow: currentFlow,
				stepKey: currentStepKey,
			})
		}
	},

	markStepExited(): void {
		const { currentFlow, currentStepKey } = machine.getState()

		machine.mutate(draft => {
			draft.flowLifecycle.currentStepEntered = false
		}, 'Mark Step Exited')

		if (currentFlow && currentStepKey) {
			customEventManager.emit<FrameStepExitEventData>('frame:step:exit', {
				flow: currentFlow,
				stepKey: currentStepKey,
			})
		}
	},

	/**
	 * @param chain - If true, pushes current flow to history before opening new flow (default: true if frame is already open)
	 * @param skipAnimation - If true, skips emitting navigation events (no animations)
	 */
	openFrame(
		flow: string,
		stepKey?: string,
		chain?: boolean,
		skipAnimation?: boolean,
		params?: Record<string, unknown>
	): void {
		const { currentFlow, currentStepKey, isOpen } = machine.getState()
		const flowDef = this.getFlowDefinition(flow)

		if (!flowDef) {
			console.error(`[FrameState] Cannot open flow "${flow}": definition not found in cache`)
			return
		}

		// Get step keys from flow definition
		const stepKeys = Object.keys(flowDef.flow)
		const targetStepKey = stepKey || stepKeys[0]

		if (!stepKeys.includes(targetStepKey)) {
			console.error(
				`[FrameState] Cannot open flow "${flow}": step key "${targetStepKey}" not found`
			)
			return
		}

		// Auto-chain if frame is already open and chain not explicitly disabled
		const shouldChain = chain ?? (isOpen && currentFlow !== null)

		machine.mutate(draft => {
			// If chaining and frame is open, push current flow to history
			if (shouldChain && currentFlow && currentStepKey) {
				draft.flowHistory.push({
					flow: currentFlow,
					stepKey: currentStepKey,
				})
			}

			draft.isOpen = true
			draft.previousFlow = currentFlow
			draft.currentFlow = flow
			draft.currentStepKey = targetStepKey

			// Track flow open count - only increment when flow changes or frame was closed
			// Don't increment for step navigation within same flow
			if (currentFlow !== flow) {
				draft.flowOpenCount = 1
				// Clear step history when switching to a different flow
				draft.stepHistory = []
			} else if (!isOpen) {
				// Same flow, but frame was closed - this is a reopen
				draft.flowOpenCount += 1
				draft.stepHistory = []
			}
			// else: same flow, frame already open (step navigation) - don't change count or step history

			// Merge or replace flow params
			if (shouldChain) {
				draft.flowParams = { ...draft.flowParams, ...(params ?? {}) }
			} else {
				draft.flowParams = params ?? {}
			}
		}, 'Open Frame')

		// Update variant based on new flow/step
		this.updateVariant()

		// Emit events
		customEventManager.emit<FrameOpenEventData>('frame:open', {
			flow,
			stepKey: targetStepKey,
		})

		if (currentFlow !== flow) {
			customEventManager.emit<FrameFlowChangeEventData>('frame:flow:change', {
				flow,
				previousFlow: currentFlow,
			})
		}

		// Emit step change and navigation events if step changed within same flow
		if (currentFlow === flow && currentStepKey !== targetStepKey && currentStepKey) {
			const stepKeys = Object.keys(flowDef.flow)
			const fromIndex = stepKeys.indexOf(currentStepKey)
			const toIndex = stepKeys.indexOf(targetStepKey)

			// Emit step change event with skipAnimation flag
			customEventManager.emit<FrameStepChangeEventData>('frame:step:change', {
				stepKey: targetStepKey,
				previousStepKey: currentStepKey,
				skipAnimation,
			})

			// Only emit navigation events if we want animations
			if (!skipAnimation) {
				// Emit appropriate navigation event for animations
				if (toIndex > fromIndex) {
					customEventManager.emit<FrameNextStepEventData>('frame:navigation:next', {
						flow,
						fromStepKey: currentStepKey,
						toStepKey: targetStepKey,
					})
				} else if (toIndex < fromIndex) {
					customEventManager.emit<FramePreviousStepEventData>(
						'frame:navigation:previous',
						{
							flow,
							fromStepKey: currentStepKey,
							toStepKey: targetStepKey,
						}
					)
				}
			}
		}
	},

	goBackInHistory(): boolean {
		const { flowHistory, currentFlow } = machine.getState()

		if (flowHistory.length === 0) {
			return false
		}

		// Pop the last entry from history
		const previousEntry = flowHistory[flowHistory.length - 1]

		// Emit navigation event before mutation
		if (currentFlow) {
			customEventManager.emit<FrameHistoryBackEventData>('frame:navigation:history-back', {
				fromFlow: currentFlow,
				toFlow: previousEntry.flow,
				toStepKey: previousEntry.stepKey,
			})
		}

		const previousStepKey = machine.getState().currentStepKey

		machine.mutate(draft => {
			draft.flowHistory.pop()
			draft.currentFlow = previousEntry.flow
			draft.currentStepKey = previousEntry.stepKey
		}, 'Go Back In History')

		// Update variant based on new flow/step
		this.updateVariant()

		// Emit flow change event
		customEventManager.emit<FrameFlowChangeEventData>('frame:flow:change', {
			flow: previousEntry.flow,
			previousFlow: currentFlow,
		})

		// Emit step change event (no animation for history navigation)
		customEventManager.emit<FrameStepChangeEventData>('frame:step:change', {
			stepKey: previousEntry.stepKey,
			previousStepKey,
			skipAnimation: true,
		})

		return true
	},

	clearFlowHistory(): void {
		machine.mutate(draft => {
			draft.flowHistory = []
		}, 'Clear Flow History')
	},

	closeFrame(): void {
		const { currentFlow, currentStepKey } = machine.getState()

		machine.mutate(draft => {
			draft.isOpen = false
			draft.hasFrameInit = false
			draft.flowOpenCount = 0
			draft.previousFlow = currentFlow
			draft.previousStepKey = currentStepKey
			draft.currentFlow = null
			draft.currentStepKey = null
			draft.flowHistory = []
			draft.stepHistory = []
			draft.flowParams = {}
			draft.flowLifecycle.currentStepEntered = false
			draft.variant = 'fullscreen' // Reset to default
		}, 'Close Frame')

		customEventManager.emit('frame:close', undefined)
	},

	setStepKey(stepKey: string): void {
		const stepKeys = this.selectStepKeys()
		const { currentStepKey } = machine.getState()

		if (!stepKeys.includes(stepKey)) {
			console.warn(`[FrameState] Step key "${stepKey}" not found in current flow`)
			return
		}

		machine.mutate(draft => {
			draft.previousStepKey = currentStepKey
			draft.currentStepKey = stepKey
			draft.flowLifecycle.currentStepEntered = false
		}, 'Set Step Key')

		// Update variant based on new step
		this.updateVariant()

		customEventManager.emit<FrameStepChangeEventData>('frame:step:change', {
			stepKey,
			previousStepKey: currentStepKey,
		})
	},

	nextStep(): void {
		const currentStepIndex = this.selectCurrentStepIndex()
		const stepKeys = this.selectStepKeys()
		const { currentFlow, currentStepKey } = machine.getState()

		if (currentStepIndex < stepKeys.length - 1 && currentFlow && currentStepKey) {
			const nextStepKey = stepKeys[currentStepIndex + 1]

			// Emit navigation event
			customEventManager.emit<FrameNextStepEventData>('frame:navigation:next', {
				flow: currentFlow,
				fromStepKey: currentStepKey,
				toStepKey: nextStepKey,
			})

			this.setStepKey(nextStepKey)
		}
	},

	previousStep(): void {
		const currentStepIndex = this.selectCurrentStepIndex()
		const stepKeys = this.selectStepKeys()
		const { currentFlow, currentStepKey } = machine.getState()

		if (currentStepIndex > 0 && currentFlow && currentStepKey) {
			const prevStepKey = stepKeys[currentStepIndex - 1]

			// Emit navigation event
			customEventManager.emit<FramePreviousStepEventData>('frame:navigation:previous', {
				flow: currentFlow,
				fromStepKey: currentStepKey,
				toStepKey: prevStepKey,
			})

			this.setStepKey(prevStepKey)
		}
	},

	/**
	 * Navigate to any step in the current flow, tracking history for accurate back navigation.
	 * This allows skipping steps in any direction while maintaining the navigation path.
	 */
	goToStep(stepKey: string): void {
		const stepKeys = this.selectStepKeys()
		const { currentFlow, currentStepKey } = machine.getState()

		if (!currentFlow || !currentStepKey) {
			console.warn('[FrameState] Cannot go to step: no flow is currently active')
			return
		}

		if (!stepKeys.includes(stepKey)) {
			console.warn(`[FrameState] Step key "${stepKey}" not found in current flow`)
			return
		}

		if (stepKey === currentStepKey) {
			return // Already at this step
		}

		const fromIndex = stepKeys.indexOf(currentStepKey)
		const toIndex = stepKeys.indexOf(stepKey)
		const direction = toIndex > fromIndex ? 'forward' : 'backward'

		// Push current step to history before navigating
		machine.mutate(draft => {
			draft.stepHistory.push(currentStepKey)
		}, 'Push Step History')

		// Emit skip navigation event for animations
		customEventManager.emit<FrameSkipStepEventData>('frame:navigation:skip', {
			flow: currentFlow,
			fromStepKey: currentStepKey,
			toStepKey: stepKey,
			direction,
		})

		// Update the step
		machine.mutate(draft => {
			draft.previousStepKey = currentStepKey
			draft.currentStepKey = stepKey
			draft.flowLifecycle.currentStepEntered = false
		}, 'Go To Step')

		// Update variant based on new step
		this.updateVariant()

		customEventManager.emit<FrameStepChangeEventData>('frame:step:change', {
			stepKey,
			previousStepKey: currentStepKey,
		})
	},

	/**
	 * Navigate back through step history.
	 * Returns true if navigation occurred, false if no history exists.
	 */
	goBackInStepHistory(): boolean {
		const { stepHistory, currentFlow, currentStepKey } = machine.getState()

		if (stepHistory.length === 0 || !currentFlow || !currentStepKey) {
			return false
		}

		// Pop the last step from history
		const previousStepKey = stepHistory[stepHistory.length - 1]

		// Emit step history back event
		customEventManager.emit<FrameStepHistoryBackEventData>(
			'frame:navigation:step-history-back',
			{
				flow: currentFlow,
				fromStepKey: currentStepKey,
				toStepKey: previousStepKey,
			}
		)

		machine.mutate(draft => {
			draft.stepHistory.pop()
			draft.previousStepKey = currentStepKey
			draft.currentStepKey = previousStepKey
			draft.flowLifecycle.currentStepEntered = false
		}, 'Go Back In Step History')

		// Update variant based on new step
		this.updateVariant()

		customEventManager.emit<FrameStepChangeEventData>('frame:step:change', {
			stepKey: previousStepKey,
			previousStepKey: currentStepKey,
		})

		return true
	},

	/**
	 * Clear the step navigation history.
	 */
	clearStepHistory(): void {
		machine.mutate(draft => {
			draft.stepHistory = []
		}, 'Clear Step History')
	},

	setAnimating(isAnimating: boolean): void {
		machine.mutate(draft => {
			draft.isAnimating = isAnimating
		}, 'Set Animating')
	},

	markFrameInit(): void {
		machine.mutate(draft => {
			draft.hasFrameInit = true
		}, 'Mark Frame Init')
	},

	resetFrame(): void {
		machine.mutate(draft => {
			draft.isOpen = false
			draft.isAnimating = false
			draft.currentFlow = null
			draft.currentStepKey = null
			draft.previousFlow = null
			draft.previousStepKey = null
			draft.flowHistory = []
			draft.stepHistory = []
			draft.flowParams = {}
			draft.flowLifecycle = {
				enteredFlows: [],
				currentStepEntered: false,
			}
		}, 'Reset Frame')
	},
})

export default FrameState
