/*
 *   IMPORTS
 ***************************************************************************************************/
import { StateMachine } from '@bkincz/clutch'

/*
 *   TYPES
 ***************************************************************************************************/
export interface UIStateData {
	loading: boolean | string
	authenticated: boolean
}

/*
 *   STATE
 ***************************************************************************************************/
const initialState: UIStateData = {
	loading: false,
	authenticated: false,
}

class UIStateMachine extends StateMachine<UIStateData> {
	constructor() {
		super({
			initialState,
		})
	}

	protected async saveToServer(): Promise<void> {
		return void 0
	}

	protected async loadFromServer(): Promise<UIStateData | null> {
		return null
	}

	/**
	 * Validate user session
	 */
	public async validateSession(): Promise<void> {}

	/**
	 * Set loading state
	 */
	public setLoading(loading: boolean | string): void {
		this.mutate(draft => {
			draft.loading = loading
		}, 'Set Loading')
	}
}

const UIState = new UIStateMachine()
export default UIState
