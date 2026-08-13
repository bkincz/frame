/*
 *   IMPORTS
 ***************************************************************************************************/
import { createMachine } from '@bkincz/clutch'

/*
 *   TYPES
 ***************************************************************************************************/
export interface UIStateData {
	loading: boolean | string
	authenticated: boolean
}

/*
 *   UI STATE
 ***************************************************************************************************/
const machine = createMachine<UIStateData>({
	initialState: {
		loading: false,
		authenticated: false,
	},
})

const UIState = Object.assign(machine, {
	setLoading(loading: boolean | string): void {
		machine.mutate(draft => {
			draft.loading = loading
		}, 'Set Loading')
	},
})

export default UIState
