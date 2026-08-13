/*
 *   IMPORTS
 ***************************************************************************************************/
import { createMachine, devtools } from '@bkincz/clutch'

/*
 *   TYPES
 ***************************************************************************************************/
export type AnimationType = 'step' | 'flow' | 'frame-in' | 'frame-out' | null

export interface AnimationStateData {
	isAnimating: boolean
	animationType: AnimationType
	direction?: 'forward' | 'backward'
}

/*
 *   ANIMATION STATE
 ***************************************************************************************************/
const machine = createMachine<AnimationStateData>({
	initialState: {
		isAnimating: false,
		animationType: null,
		direction: undefined,
	},
})

if (process.env.NODE_ENV !== 'production') {
	machine.with(devtools({ name: 'FrameState/Animation' }))
}

const AnimationState = Object.assign(machine, {
	startAnimation(type: AnimationType, direction?: 'forward' | 'backward'): boolean {
		const { isAnimating, animationType } = machine.getState()

		if (isAnimating) {
			console.warn(`[AnimationState] Already animating: ${animationType}`)
			return false
		}

		machine.mutate(draft => {
			draft.isAnimating = true
			draft.animationType = type
			draft.direction = direction
		}, 'Start Animation')

		return true
	},

	endAnimation(): void {
		machine.mutate(draft => {
			draft.isAnimating = false
			draft.animationType = null
			draft.direction = undefined
		}, 'End Animation')
	},

	selectIsAnimating(): boolean {
		return machine.getState().isAnimating
	},

	selectAnimationType(): AnimationType {
		return machine.getState().animationType
	},

	selectDirection(): 'forward' | 'backward' | undefined {
		return machine.getState().direction
	},
})

export default AnimationState
