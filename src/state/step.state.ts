/*
 *   IMPORTS
 ***************************************************************************************************/
import { StateMachine } from '@bkincz/clutch'

/*
 *   TYPES
 ***************************************************************************************************/
export interface StepStateData {
	isExiting: boolean
	isEntering: boolean
}

/*
 *   STEP STATE MACHINE
 *   Manages step operations (onEnter/onExit) independently
 ***************************************************************************************************/
class StepStateMachine extends StateMachine<StepStateData> {
	constructor() {
		super({
			initialState: {
				isExiting: false,
				isEntering: false,
			},
		})
	}

	/**
	 * Mark step as entering
	 */
	public startEntering(): void {
		this.mutate(draft => {
			draft.isEntering = true
		}, 'Start Step Enter')
	}

	/**
	 * Mark step enter complete
	 */
	public endEntering(): void {
		this.mutate(draft => {
			draft.isEntering = false
		}, 'End Step Enter')
	}

	/**
	 * Mark step as exiting
	 */
	public startExiting(): void {
		this.mutate(draft => {
			draft.isExiting = true
		}, 'Start Step Exit')
	}

	/**
	 * Mark step exit complete
	 */
	public endExiting(): void {
		this.mutate(draft => {
			draft.isExiting = false
		}, 'End Step Exit')
	}

	/**
	 * Selectors
	 */
	public selectIsExiting(): boolean {
		return this.state.isExiting
	}

	public selectIsEntering(): boolean {
		return this.state.isEntering
	}

	public selectIsInLifecycle(): boolean {
		return this.state.isExiting || this.state.isEntering
	}
}

const StepState = new StepStateMachine()
export default StepState
