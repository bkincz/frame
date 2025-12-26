/*
 *   IMPORTS
 **********************************************************************************************************/
import { StepOne } from './components/step.one'
import { StepTwoA, StepTwoB } from './components/step.two'
import { StepThree } from './components/step.three'
import { StepFour } from './components/step.four'
import { FlowChainingDemo } from './components/flow.chaining.demo'
import { IconActionDemo } from './components/icon.action.demo'

/*
 *   TYPES
 **********************************************************************************************************/
import type { FlowDefinition } from '../flow.types'

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
		footer: {
			hidePricing: true,
			hideStepIndicator: true,
		},
		sidebar: {
			hidePromo: true,
			hideTotal: true,
		},
		animations: {
			animateSidebar: false,
		},
		// There can be any number of config options in the future...
	}

	const flow = {
		'step-one': {
			heading: 'Step One',
			subheading: 'This is a subheading for step one.',
			components: [<StepOne key="step-one-component" />],
			config: {
				// We can override any of the config that was defined above but at a step level instead.
				// Step configs will always override the flow level config.
				// In this case, the sidebar will be hidden for this step
				sidebar: false,
			},
		},
		'step-two': {
			onEnter: handleStepTwoEnter,
			heading: 'Step Two',
			subheading: 'This is a subheading for step two.',
			components: [<StepTwoA key="step-two-a" />, <StepTwoB key="step-two-b" />],
		},
		'step-three': {
			onEnter: handleStepThreeEnter,
			heading: 'Step Three',
			subheading: 'This is a subheading for step three. It will not animate.',
			components: [<StepThree key="step-three-component" />],
			onExit: handleStepThreeExit,
			config: {
				animations: {
					// We can disable/manage the animations for when we enter, or leave this step specifically.
					animateSteps: false,
				},
			},
		},
		'step-four': {
			heading: 'Step Four - Component Demos',
			subheading: 'Test various component features and navigation.',
			components: [
				<StepFour key="step-four-component" />,
				<FlowChainingDemo key="flow-chaining-demo" />,
				<IconActionDemo key="icon-action-demo" />,
			],
		},
	}

	return {
		flow,
		config,
		onEnter: handleFlowEnter,
		onExit: handleFlowExit,
	}
}
