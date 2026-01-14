/*
 *   IMPORTS
 **********************************************************************************************************/
import type { FlowDefinition } from '../flow.types'

/*
 *   STEP COMPONENTS
 **********************************************************************************************************/
const ModalStepOne = () => (
	<div>
		<p style={{ marginBottom: '16px' }}>
			This flow uses the <strong>modal</strong> variant, which displays the content in a
			centered modal dialog with:
		</p>
		<ul style={{ marginLeft: '24px', lineHeight: '1.8' }}>
			<li>Maximum width of 600px</li>
			<li>Centered positioning</li>
			<li>Semi-transparent overlay</li>
			<li>Rounded corners and shadow</li>
			<li>Scrollable content if needed</li>
		</ul>
		<p style={{ marginTop: '16px' }}>Click the overlay or press ESC to close.</p>
	</div>
)

const ModalStepTwo = () => (
	<div>
		<p>
			You can navigate between steps using the Back/Next buttons. Each step can override the
			variant if needed.
		</p>
	</div>
)

/*
 *   FLOW FACTORY
 **********************************************************************************************************/
export const createModalFlow = (): FlowDefinition => {
	// Flow-level config with modal variant
	const config = {
		variant: 'modal' as const,
		footer: {
			hidePricing: true,
			hideStepIndicator: true,
		},
		sidebar: false,
	}

	const flow = {
		'step-one': {
			heading: 'Modal Example',
			subheading: 'This is displayed in a centered modal with an overlay.',
			components: [ModalStepOne],
		},
		'step-two': {
			heading: 'Step Two',
			subheading: 'Navigation works the same in modal mode.',
			components: [ModalStepTwo],
		},
	}

	return {
		flow,
		config,
	}
}
