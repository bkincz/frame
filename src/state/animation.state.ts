/*
 *   IMPORTS
 ***************************************************************************************************/
import { StateMachine } from '@bkincz/clutch'

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
 *   ANIMATION STATE MACHINE
 *   Manages animation state independently from frame business logic
 ***************************************************************************************************/
class AnimationStateMachine extends StateMachine<AnimationStateData> {
	constructor() {
		super({
			initialState: {
				isAnimating: false,
				animationType: null,
				direction: undefined,
			},
			enableDevTools:
				process.env.NODE_ENV !== 'production' ? { name: 'FrameState/Animation' } : false,
		})
	}

	public startAnimation(type: AnimationType, direction?: 'forward' | 'backward'): boolean {
		if (this.state.isAnimating) {
			console.warn(`[AnimationState] Already animating: ${this.state.animationType}`)
			return false
		}

		this.mutate(draft => {
			draft.isAnimating = true
			draft.animationType = type
			draft.direction = direction
		}, 'Start Animation')

		return true
	}

	public endAnimation(): void {
		this.mutate(draft => {
			draft.isAnimating = false
			draft.animationType = null
			draft.direction = undefined
		}, 'End Animation')
	}

	public selectIsAnimating(): boolean {
		return this.state.isAnimating
	}

	public selectAnimationType(): AnimationType {
		return this.state.animationType
	}

	public selectDirection(): 'forward' | 'backward' | undefined {
		return this.state.direction
	}
}

const AnimationState = new AnimationStateMachine()
export default AnimationState
