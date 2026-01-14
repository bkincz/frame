/*
 *   IMPORTS
 ***************************************************************************************************/
import { StateMachine } from '@bkincz/clutch'

/*
 *   SHARED
 ***************************************************************************************************/
import { customEventManager } from '@/lib/event'
import type { EventDataMap } from '@/lib/event'

/*
 *   TYPES
 ***************************************************************************************************/
import type { FlowDefinition, FrameVariant } from '@/flows/flow.types'

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
	flowLifecycle: FlowLifecycleState
	flowDefinitionCache: Record<string, FlowDefinition>
}

interface FrameActions {
	openFrame: (flow: string, stepKey?: string, chain?: boolean) => void
	closeFrame: () => void
	goBackInHistory: () => boolean
	clearFlowHistory: () => void
	setStepKey: (stepKey: string) => void
	nextStep: () => void
	previousStep: () => void
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
	selectVariant: () => FrameVariant
}

export interface FrameStateProps extends FrameActions, FrameStateData {}

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
export type FrameHistoryBackEventData = EventDataMap['frame:navigation:history-back']

/*
 *   STATE
 ***************************************************************************************************/
const initialState: FrameStateProps = {
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
	flowLifecycle: {
		enteredFlows: [],
		currentStepEntered: false,
	},
	flowDefinitionCache: {},
	openFrame: () => void 0,
	closeFrame: () => void 0,
	goBackInHistory: () => false,
	clearFlowHistory: () => void 0,
	setStepKey: () => void 0,
	nextStep: () => void 0,
	previousStep: () => void 0,
	resetFrame: () => void 0,
	setAnimating: () => void 0,
	cacheFlowDefinition: () => void 0,
	getFlowDefinition: () => null,
	clearFlowCache: () => void 0,
	markFlowEntered: () => void 0,
	markFlowExited: () => void 0,
	markStepEntered: () => void 0,
	markStepExited: () => void 0,
	selectCurrentStepIndex: () => 0,
	selectStepKeys: () => [],
	selectIsFlowEntered: () => false,
	selectHasHistory: () => false,
	selectVariant: () => 'fullscreen',
}

class FrameStateMachine extends StateMachine<FrameStateProps> {
	constructor() {
		super({
			initialState,
		})
	}

	public selectCurrentStepIndex(): number {
		const { currentFlow, currentStepKey, flowDefinitionCache } = this.state
		if (!currentFlow || !currentStepKey) return 0

		const flowDef = flowDefinitionCache[currentFlow]
		if (!flowDef) return 0

		const stepKeys = Object.keys(flowDef.flow)
		return stepKeys.indexOf(currentStepKey)
	}

	public selectStepKeys(): string[] {
		const { currentFlow, flowDefinitionCache } = this.state
		if (!currentFlow) return []

		const flowDef = flowDefinitionCache[currentFlow]
		return flowDef ? Object.keys(flowDef.flow) : []
	}

	public selectIsFlowEntered(flowName: string): boolean {
		return this.state.flowLifecycle.enteredFlows.includes(flowName)
	}

	public selectHasHistory(): boolean {
		return this.state.flowHistory.length > 0
	}

	public selectVariant(): FrameVariant {
		const { currentFlow, currentStepKey, flowDefinitionCache } = this.state
		if (!currentFlow || !currentStepKey) return 'fullscreen'

		const flowDef = flowDefinitionCache[currentFlow]
		if (!flowDef) return 'fullscreen'

		const currentStep = flowDef.flow[currentStepKey]

		// Priority: step config > flow config > default 'fullscreen'
		return currentStep?.config?.variant || flowDef.config?.variant || 'fullscreen'
	}

	public selectHasFrameInit(): boolean {
		return this.state.hasFrameInit
	}

	private updateVariant(): void {
		const newVariant = this.selectVariant()
		if (this.state.variant !== newVariant) {
			this.mutate(draft => {
				draft.variant = newVariant
			}, 'Update Variant')
		}
	}

	public cacheFlowDefinition(flowName: string, definition: FlowDefinition): void {
		this.mutate(draft => {
			draft.flowDefinitionCache[flowName] = definition
		}, 'Cache Flow Definition')
	}

	public getFlowDefinition(flowName: string): FlowDefinition | null {
		return this.state.flowDefinitionCache[flowName] || null
	}

	public clearFlowCache(flowName?: string): void {
		this.mutate(draft => {
			if (flowName) {
				delete draft.flowDefinitionCache[flowName]
			} else {
				draft.flowDefinitionCache = {}
			}
		}, 'Clear Flow Cache')
	}

	public markFlowEntered(flowName: string): void {
		this.mutate(draft => {
			if (!draft.flowLifecycle.enteredFlows.includes(flowName)) {
				draft.flowLifecycle.enteredFlows.push(flowName)
			}
		}, 'Mark Flow Entered')

		customEventManager.emit<FrameFlowEnterEventData>('frame:flow:enter', {
			flow: flowName,
		})
	}

	public markFlowExited(flowName: string): void {
		this.mutate(draft => {
			const index = draft.flowLifecycle.enteredFlows.indexOf(flowName)
			if (index > -1) {
				draft.flowLifecycle.enteredFlows.splice(index, 1)
			}
		}, 'Mark Flow Exited')

		customEventManager.emit<FrameFlowExitEventData>('frame:flow:exit', {
			flow: flowName,
		})
	}

	public markStepEntered(): void {
		const { currentFlow, currentStepKey } = this.state

		this.mutate(draft => {
			draft.flowLifecycle.currentStepEntered = true
		}, 'Mark Step Entered')

		if (currentFlow && currentStepKey) {
			customEventManager.emit<FrameStepEnterEventData>('frame:step:enter', {
				flow: currentFlow,
				stepKey: currentStepKey,
			})
		}
	}

	public markStepExited(): void {
		const { currentFlow, currentStepKey } = this.state

		this.mutate(draft => {
			draft.flowLifecycle.currentStepEntered = false
		}, 'Mark Step Exited')

		if (currentFlow && currentStepKey) {
			customEventManager.emit<FrameStepExitEventData>('frame:step:exit', {
				flow: currentFlow,
				stepKey: currentStepKey,
			})
		}
	}

	/**
	 * @param chain - If true, pushes current flow to history before opening new flow (default: true if frame is already open)
	 * @param skipAnimation - If true, skips emitting navigation events (no animations)
	 */
	public openFrame(
		flow: string,
		stepKey?: string,
		chain?: boolean,
		skipAnimation?: boolean
	): void {
		const { currentFlow, currentStepKey, isOpen } = this.state
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

		this.mutate(draft => {
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
			} else if (!isOpen) {
				// Same flow, but frame was closed - this is a reopen
				draft.flowOpenCount += 1
			}
			// else: same flow, frame already open (step navigation) - don't change count
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
	}

	public goBackInHistory(): boolean {
		const { flowHistory, currentFlow } = this.state

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

		const previousStepKey = this.state.currentStepKey

		this.mutate(draft => {
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
	}

	public clearFlowHistory(): void {
		this.mutate(draft => {
			draft.flowHistory = []
		}, 'Clear Flow History')
	}

	public closeFrame(): void {
		const { currentFlow, currentStepKey } = this.state

		this.mutate(draft => {
			draft.isOpen = false
			draft.hasFrameInit = false
			draft.flowOpenCount = 0
			draft.previousFlow = currentFlow
			draft.previousStepKey = currentStepKey
			draft.currentFlow = null
			draft.currentStepKey = null
			draft.flowHistory = []
			draft.flowLifecycle.currentStepEntered = false
			draft.variant = 'fullscreen' // Reset to default
		}, 'Close Frame')

		customEventManager.emit('frame:close', undefined)
	}

	public setStepKey(stepKey: string): void {
		const stepKeys = this.selectStepKeys()
		const { currentStepKey } = this.state

		if (!stepKeys.includes(stepKey)) {
			console.warn(`[FrameState] Step key "${stepKey}" not found in current flow`)
			return
		}

		this.mutate(draft => {
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
	}

	public nextStep(): void {
		const currentStepIndex = this.selectCurrentStepIndex()
		const stepKeys = this.selectStepKeys()
		const { currentFlow, currentStepKey } = this.state

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
	}

	public previousStep(): void {
		const currentStepIndex = this.selectCurrentStepIndex()
		const stepKeys = this.selectStepKeys()
		const { currentFlow, currentStepKey } = this.state

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
	}

	public setAnimating(isAnimating: boolean): void {
		this.mutate(draft => {
			draft.isAnimating = isAnimating
		}, 'Set Animating')
	}

	public markFrameInit(): void {
		this.mutate(draft => {
			draft.hasFrameInit = true
		}, 'Mark Frame Init')
	}

	public resetFrame(): void {
		this.mutate(draft => {
			draft.isOpen = false
			draft.isAnimating = false
			draft.currentFlow = null
			draft.currentStepKey = null
			draft.previousFlow = null
			draft.previousStepKey = null
			draft.flowHistory = []
			draft.flowLifecycle = {
				enteredFlows: [],
				currentStepEntered: false,
			}
		}, 'Reset Frame')
	}
}

const FrameState = new FrameStateMachine()
export default FrameState
