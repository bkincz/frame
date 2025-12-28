/*
 *   IMPORTS
 **********************************************************************************************************/
import { ButtonShowcase } from './components/button.showcase'
import { IconShowcase } from './components/icon.showcase'
import { TooltipShowcase } from './components/tooltip.showcase'

/*
 *   TYPES
 **********************************************************************************************************/
import type { FlowDefinition } from '../flow.types'

/*
 *   FLOW FACTORY
 **********************************************************************************************************/
export const createShowcaseFlow = (): FlowDefinition => {
	// Flow-level config
	const config = {
		footer: {
			hidePricing: true,
			hideStepIndicator: false,
		},
		sidebar: false,
		variant: 'fullscreen' as const,
	}

	const flow = {
		buttons: {
			heading: 'Button Components',
			subheading: 'Test and develop button components',
			components: [ButtonShowcase],
		},
		icons: {
			heading: 'Icon Components',
			subheading: 'Test and develop icon components',
			components: [IconShowcase],
		},
		tooltips: {
			heading: 'Tooltip Components',
			subheading: 'Test and develop tooltip components',
			components: [TooltipShowcase],
		},
	}

	return {
		flow,
		config,
	}
}
