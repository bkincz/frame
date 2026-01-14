/*
 *   IMPORTS
 **********************************************************************************************************/
import { StepOne } from './components/step.one'
import { StepTwoA, StepTwoB } from './components/step.two'
import { StepThree } from './components/step.three'
import { StepFour } from './components/step.four'
import { FlowChainingDemo } from './components/flow.chaining.demo'
import { DefaultFrameLayout } from '@/core'

/*
 *   TYPES
 **********************************************************************************************************/
import type { FlowDefinition } from '@/types/flow.types'

/*
 *   LIFECYCLE CALLBACKS
 *   Defined outside factory for stable references
 **********************************************************************************************************/
const handleStepTwoEnter = () => {
	// Do something before we load and mount this step.
	console.log('onEnter: step-two')
}

const handleStepThreeEnter = () => {
	console.log('onEnter: step-three')
}

const handleStepThreeExit = () => {
	// Do something when we are leaving and unmounting this step.
	console.log('onExit: step-three')
}

const handleFlowEnter = () => {
	// We can do something when we enter a flow, and before we load a step.
	console.log('onEnter: example-flow')
}

const handleFlowExit = () => {
	// We can do something when we exit a flow. This could be clean up, fetching data or anything else.
	console.log('onExit: example-flow')
}

/*
 *   FLOW FACTORY
 **********************************************************************************************************/
export const createExampleFlow = (): FlowDefinition => {
	// Flow-level config
	const config = {
		animations: {
			animateSidebar: false,
		},
		layout: DefaultFrameLayout,
		// There can be any number of config options in the future...
	}

	const flow = {
		'step-one': {
			heading: 'Step One',
			subheading: 'This is a subheading for step one.',
			components: [StepOne],
			config: {
				sidebar: false,
			},
		},
		'step-two': {
			onEnter: handleStepTwoEnter,
			heading: 'Step Two',
			subheading: 'This is a subheading for step two.',
			components: [StepTwoA, StepTwoB],
		},
		'step-three': {
			onEnter: handleStepThreeEnter,
			heading: 'Step Three',
			subheading: 'This is a subheading for step three. It will not animate.',
			components: [StepThree],
			onExit: handleStepThreeExit,
			config: {
				layout: DefaultFrameLayout,
			},
		},
		'step-four': {
			heading: 'Step Four - Component Demos',
			subheading: 'Test various component features and navigation.',
			components: [StepFour, FlowChainingDemo],
			config: {
				sidebar: true,
				variant: 'modal' as const,
				inert: {
					enabled: true,
					excludeSelectors: ['#persistent-header', '.always-accessible'],
				},
			},
		},
	}

	return {
		flow,
		config,
		onEnter: handleFlowEnter,
		onExit: handleFlowExit,
	}
}
