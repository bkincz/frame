/*
 *   STEPS
 **********************************************************************************************************/
import { StepSub } from './components/step.sub'

/*
 *   STEPS
 **********************************************************************************************************/
const useExampleSubFlow = () => {
	const config = {
		footer: {
			hidePricing: true,
		},
	}

	const flow = {
		'sub-step-one': {
			heading: 'Step One',
			subheading: `This is a subheading for step one.`,
			components: [() => <StepSub />],
		},
	}

	return { flow, config }
}

export default useExampleSubFlow
