/*
 *   IMPORTS
 ***************************************************************************************************/
import { StateMachine } from '@bkincz/clutch'

/*
 *   SHARED
 ***************************************************************************************************/
import { customEventManager } from '@/lib/event'

/*
 *   TYPES
 ***************************************************************************************************/
import type { FlowDefinition } from '@/flows/flow.types'

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
}

export interface FrameStateProps extends FrameActions, FrameStateData {}

/*
 *   EVENTS
 *
 *   Event Emission Patterns:
 *
 *   Frame Lifecycle:
 *   - openFrame() → OPEN, FLOW_CHANGE (if flow changed)
 *   - closeFrame() → CLOSE
 *
 *   Step Navigation:
 *   - setStepKey() → STEP_CHANGE
 *   - nextStep() → NEXT_STEP, STEP_CHANGE (via setStepKey)
 *   - previousStep() → PREVIOUS_STEP, STEP_CHANGE (via setStepKey)
 *
 *   Flow Navigation:
 *   - goBackInHistory() → HISTORY_BACK, FLOW_CHANGE
 *
 *   Lifecycle Tracking:
 *   - markFlowEntered() → FLOW_ENTER
 *   - markFlowExited() → FLOW_EXIT
 *   - markStepEntered() → STEP_ENTER
 *   - markStepExited() → STEP_EXIT
 ***************************************************************************************************/
export const FRAME_EVENTS = {
	OPEN: 'frame:open',
	CLOSE: 'frame:close',
	STEP_CHANGE: 'frame:step:change',
	FLOW_CHANGE: 'frame:flow:change',
	NEXT_STEP: 'frame:navigation:next',
	PREVIOUS_STEP: 'frame:navigation:previous',
	HISTORY_BACK: 'frame:navigation:history-back',
	STEP_ENTER: 'frame:step:enter',
	STEP_EXIT: 'frame:step:exit',
	FLOW_ENTER: 'frame:flow:enter',
	FLOW_EXIT: 'frame:flow:exit',
} as const

export interface FrameOpenEventData {
	flow: string
	stepKey: string
}

export interface FrameStepChangeEventData {
	stepKey: string
	previousStepKey: string | null
}

export interface FrameFlowChangeEventData {
	flow: string
	previousFlow: string | null
}

export interface FrameStepEnterEventData {
	flow: string
	stepKey: string
}

export interface FrameStepExitEventData {
	flow: string
	stepKey: string
}

export interface FrameFlowEnterEventData {
	flow: string
}

export interface FrameFlowExitEventData {
	flow: string
}

export interface FrameNextStepEventData {
	flow: string
	fromStepKey: string
	toStepKey: string
}

export interface FramePreviousStepEventData {
	flow: string
	fromStepKey: string
	toStepKey: string
}

export interface FrameHistoryBackEventData {
	fromFlow: string
	toFlow: string
	toStepKey: string
}

/*
 *   STATE
 ***************************************************************************************************/
const initialState: FrameStateProps = {
	isOpen: false,
	isAnimating: false,
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
}

class FrameStateMachine extends StateMachine<FrameStateProps> {
	constructor() {
		super({
			initialState,
		})
	}

	protected async saveToServer(): Promise<void> {
		return void 0
	}

	protected async loadFromServer(): Promise<FrameStateProps | null> {
		return null
	}

	/**
	 * Selector: Get current step index (derived)
	 */
	public selectCurrentStepIndex(): number {
		const { currentFlow, currentStepKey, flowDefinitionCache } = this.state
		if (!currentFlow || !currentStepKey) return 0

		const flowDef = flowDefinitionCache[currentFlow]
		if (!flowDef) return 0

		const stepKeys = Object.keys(flowDef.flow)
		return stepKeys.indexOf(currentStepKey)
	}

	/**
	 * Selector: Get step keys for current flow (derived)
	 */
	public selectStepKeys(): string[] {
		const { currentFlow, flowDefinitionCache } = this.state
		if (!currentFlow) return []

		const flowDef = flowDefinitionCache[currentFlow]
		return flowDef ? Object.keys(flowDef.flow) : []
	}

	/**
	 * Selector: Check if flow has been entered
	 */
	public selectIsFlowEntered(flowName: string): boolean {
		return this.state.flowLifecycle.enteredFlows.includes(flowName)
	}

	/**
	 * Selector: Check if there is flow history
	 */
	public selectHasHistory(): boolean {
		return this.state.flowHistory.length > 0
	}

	/**
	 * Cache a flow definition for performance
	 */
	public cacheFlowDefinition(flowName: string, definition: FlowDefinition): void {
		this.mutate(draft => {
			draft.flowDefinitionCache[flowName] = definition
		}, 'Cache Flow Definition')
	}

	/**
	 * Get a cached flow definition
	 */
	public getFlowDefinition(flowName: string): FlowDefinition | null {
		return this.state.flowDefinitionCache[flowName] || null
	}

	/**
	 * Clear flow cache (optionally for specific flow)
	 */
	public clearFlowCache(flowName?: string): void {
		this.mutate(draft => {
			if (flowName) {
				delete draft.flowDefinitionCache[flowName]
			} else {
				draft.flowDefinitionCache = {}
			}
		}, 'Clear Flow Cache')
	}

	/**
	 * Mark a flow as entered (lifecycle tracking)
	 */
	public markFlowEntered(flowName: string): void {
		this.mutate(draft => {
			if (!draft.flowLifecycle.enteredFlows.includes(flowName)) {
				draft.flowLifecycle.enteredFlows.push(flowName)
			}
		}, 'Mark Flow Entered')

		customEventManager.emit<FrameFlowEnterEventData>(FRAME_EVENTS.FLOW_ENTER, {
			flow: flowName,
		})
	}

	/**
	 * Mark a flow as exited (lifecycle tracking)
	 */
	public markFlowExited(flowName: string): void {
		this.mutate(draft => {
			const index = draft.flowLifecycle.enteredFlows.indexOf(flowName)
			if (index > -1) {
				draft.flowLifecycle.enteredFlows.splice(index, 1)
			}
		}, 'Mark Flow Exited')

		customEventManager.emit<FrameFlowExitEventData>(FRAME_EVENTS.FLOW_EXIT, {
			flow: flowName,
		})
	}

	/**
	 * Mark current step as entered
	 */
	public markStepEntered(): void {
		const { currentFlow, currentStepKey } = this.state

		this.mutate(draft => {
			draft.flowLifecycle.currentStepEntered = true
		}, 'Mark Step Entered')

		if (currentFlow && currentStepKey) {
			customEventManager.emit<FrameStepEnterEventData>(FRAME_EVENTS.STEP_ENTER, {
				flow: currentFlow,
				stepKey: currentStepKey,
			})
		}
	}

	/**
	 * Mark current step as exited
	 */
	public markStepExited(): void {
		const { currentFlow, currentStepKey } = this.state

		this.mutate(draft => {
			draft.flowLifecycle.currentStepEntered = false
		}, 'Mark Step Exited')

		if (currentFlow && currentStepKey) {
			customEventManager.emit<FrameStepExitEventData>(FRAME_EVENTS.STEP_EXIT, {
				flow: currentFlow,
				stepKey: currentStepKey,
			})
		}
	}

	/**
	 * Opens the frame with specified flow and step key
	 * @param flow - The flow name to open
	 * @param stepKey - The step key to start at (optional, defaults to first step)
	 * @param chain - If true, pushes current flow to history before opening new flow (default: true if frame is already open)
	 */
	public openFrame(flow: string, stepKey?: string, chain?: boolean): void {
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
		}, 'Open Frame')

		// Emit events
		customEventManager.emit<FrameOpenEventData>(FRAME_EVENTS.OPEN, {
			flow,
			stepKey: targetStepKey,
		})

		if (currentFlow !== flow) {
			customEventManager.emit<FrameFlowChangeEventData>(FRAME_EVENTS.FLOW_CHANGE, {
				flow,
				previousFlow: currentFlow,
			})
		}
	}

	/**
	 * Go back to previous flow in history
	 * Emits: HISTORY_BACK, FLOW_CHANGE
	 * @returns true if went back, false if no history
	 */
	public goBackInHistory(): boolean {
		const { flowHistory, currentFlow } = this.state

		if (flowHistory.length === 0) {
			return false
		}

		// Pop the last entry from history
		const previousEntry = flowHistory[flowHistory.length - 1]

		// Emit navigation event before mutation
		if (currentFlow) {
			customEventManager.emit<FrameHistoryBackEventData>(FRAME_EVENTS.HISTORY_BACK, {
				fromFlow: currentFlow,
				toFlow: previousEntry.flow,
				toStepKey: previousEntry.stepKey,
			})
		}

		this.mutate(draft => {
			draft.flowHistory.pop()
			draft.currentFlow = previousEntry.flow
			draft.currentStepKey = previousEntry.stepKey
		}, 'Go Back In History')

		// Emit flow change event
		customEventManager.emit<FrameFlowChangeEventData>(FRAME_EVENTS.FLOW_CHANGE, {
			flow: previousEntry.flow,
			previousFlow: currentFlow,
		})

		return true
	}

	/**
	 * Clear flow history stack
	 */
	public clearFlowHistory(): void {
		this.mutate(draft => {
			draft.flowHistory = []
		}, 'Clear Flow History')
	}

	/**
	 * Closes the frame and resets state
	 */
	public closeFrame(): void {
		const { currentFlow, currentStepKey } = this.state

		this.mutate(draft => {
			draft.isOpen = false
			draft.previousFlow = currentFlow
			draft.previousStepKey = currentStepKey
			draft.currentFlow = null
			draft.currentStepKey = null
			draft.flowHistory = []
			draft.flowLifecycle.currentStepEntered = false
		}, 'Close Frame')

		customEventManager.emit(FRAME_EVENTS.CLOSE, {})
	}

	/**
	 * Set step by step key
	 */
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

		customEventManager.emit<FrameStepChangeEventData>(FRAME_EVENTS.STEP_CHANGE, {
			stepKey,
			previousStepKey: currentStepKey,
		})
	}

	/**
	 * Advances to the next step
	 * Emits: NEXT_STEP, STEP_CHANGE (via setStepKey)
	 */
	public nextStep(): void {
		const currentStepIndex = this.selectCurrentStepIndex()
		const stepKeys = this.selectStepKeys()
		const { currentFlow, currentStepKey } = this.state

		if (currentStepIndex < stepKeys.length - 1 && currentFlow && currentStepKey) {
			const nextStepKey = stepKeys[currentStepIndex + 1]

			// Emit navigation event
			customEventManager.emit<FrameNextStepEventData>(FRAME_EVENTS.NEXT_STEP, {
				flow: currentFlow,
				fromStepKey: currentStepKey,
				toStepKey: nextStepKey,
			})

			this.setStepKey(nextStepKey)
		}
	}

	/**
	 * Goes back to the previous step
	 * Emits: PREVIOUS_STEP, STEP_CHANGE (via setStepKey)
	 */
	public previousStep(): void {
		const currentStepIndex = this.selectCurrentStepIndex()
		const stepKeys = this.selectStepKeys()
		const { currentFlow, currentStepKey } = this.state

		if (currentStepIndex > 0 && currentFlow && currentStepKey) {
			const prevStepKey = stepKeys[currentStepIndex - 1]

			// Emit navigation event
			customEventManager.emit<FramePreviousStepEventData>(FRAME_EVENTS.PREVIOUS_STEP, {
				flow: currentFlow,
				fromStepKey: currentStepKey,
				toStepKey: prevStepKey,
			})

			this.setStepKey(prevStepKey)
		}
	}

	/**
	 * Set animation state
	 */
	public setAnimating(isAnimating: boolean): void {
		this.mutate(draft => {
			draft.isAnimating = isAnimating
		}, 'Set Animating')
	}

	/**
	 * Resets frame to initial state
	 */
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
