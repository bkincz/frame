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
