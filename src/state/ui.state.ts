/*
 *   IMPORTS
 ***************************************************************************************************/
import { StateMachine } from '@bkincz/clutch'

/*
 *   TYPES
 ***************************************************************************************************/
interface UIActions {
	validateSession: () => Promise<void>
	setLoading: (loading: boolean | string) => void
}

export interface UIStateData {
	loading: boolean | string
	authenticated: boolean
}

export interface UIStateProps extends UIActions, UIStateData {}

/*
 *   STATE
 ***************************************************************************************************/
const initialState: UIStateProps = {
	loading: false,
	authenticated: false,
	validateSession: () => Promise.resolve(),
	setLoading: () => void 0,
}

class UIStateMachine extends StateMachine<UIStateProps> {
	constructor() {
		super({
			initialState,
		})
	}

	protected async saveToServer(): Promise<void> {
		return void 0
	}

	protected async loadFromServer(): Promise<UIStateProps | null> {
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
