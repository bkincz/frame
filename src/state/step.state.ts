/*
 *   IMPORTS
 ***************************************************************************************************/
import { createMachine } from '@bkincz/clutch'

/*
 *   TYPES
 ***************************************************************************************************/
export interface StepStateData {
	isExiting: boolean
	isEntering: boolean
}

/*
 *   STEP STATE
 ***************************************************************************************************/
const machine = createMachine<StepStateData>({
	initialState: {
		isExiting: false,
		isEntering: false,
	},
})

const StepState = Object.assign(machine, {
	startEntering(): void {
		machine.mutate(draft => {
			draft.isEntering = true
		}, 'Start Step Enter')
	},

	endEntering(): void {
		machine.mutate(draft => {
			draft.isEntering = false
		}, 'End Step Enter')
	},

	startExiting(): void {
		machine.mutate(draft => {
			draft.isExiting = true
		}, 'Start Step Exit')
	},

	endExiting(): void {
		machine.mutate(draft => {
			draft.isExiting = false
		}, 'End Step Exit')
	},

	selectIsExiting(): boolean {
		return machine.getState().isExiting
	},

	selectIsEntering(): boolean {
		return machine.getState().isEntering
	},

	selectIsInLifecycle(): boolean {
		const { isExiting, isEntering } = machine.getState()
		return isExiting || isEntering
	},
})

export default StepState
