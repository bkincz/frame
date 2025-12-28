/*
 *   IMPORTS
 **********************************************************************************************************/
import { useTooltip } from '@/components/tooltip'
import { Button } from '@/components/button'

/*
 *   STYLES
 **********************************************************************************************************/
const demoBoxStyle = {
	display: 'inline-block',
	padding: '8px 16px',
	border: '2px solid var(--border01)',
	borderRadius: '8px',
	cursor: 'pointer',
	backgroundColor: 'var(--surface00)',
	fontWeight: '600',
	fontSize: '12px',
	textTransform: 'uppercase' as const,
	fontFamily: '"JetBrains Mono", monospace',
	transition: 'all 0.2s ease-in-out',
}

/*
 *   DEMO COMPONENTS
 **********************************************************************************************************/
const PlacementDemo = () => {
	const topTooltip = useTooltip({ placement: 'top' })
	const bottomTooltip = useTooltip({ placement: 'bottom' })
	const leftTooltip = useTooltip({ placement: 'left' })
	const rightTooltip = useTooltip({ placement: 'right' })
	const autoTooltip = useTooltip({ placement: 'auto' })

	return (
		<>
			<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
				<div
					style={demoBoxStyle}
					onMouseEnter={() => topTooltip.showTooltip('Top placement')}
					onMouseLeave={topTooltip.hideTooltip}
				>
					Top
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() => bottomTooltip.showTooltip('Bottom placement')}
					onMouseLeave={bottomTooltip.hideTooltip}
				>
					Bottom
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() => leftTooltip.showTooltip('Left placement')}
					onMouseLeave={leftTooltip.hideTooltip}
				>
					Left
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() => rightTooltip.showTooltip('Right placement')}
					onMouseLeave={rightTooltip.hideTooltip}
				>
					Right
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() =>
						autoTooltip.showTooltip('Auto placement (smart positioning)')
					}
					onMouseLeave={autoTooltip.hideTooltip}
				>
					Auto
				</div>
			</div>
			{topTooltip.Tooltip}
			{bottomTooltip.Tooltip}
			{leftTooltip.Tooltip}
			{rightTooltip.Tooltip}
			{autoTooltip.Tooltip}
		</>
	)
}

const VariantDemo = () => {
	const defaultTooltip = useTooltip({ variant: 'default' })
	const warningTooltip = useTooltip({ variant: 'warning' })
	const errorTooltip = useTooltip({ variant: 'error' })

	return (
		<>
			<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
				<div
					style={demoBoxStyle}
					onMouseEnter={() => defaultTooltip.showTooltip('Default variant')}
					onMouseLeave={defaultTooltip.hideTooltip}
				>
					Default
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() => warningTooltip.showTooltip('Warning variant')}
					onMouseLeave={warningTooltip.hideTooltip}
				>
					Warning
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() => errorTooltip.showTooltip('Error variant')}
					onMouseLeave={errorTooltip.hideTooltip}
				>
					Error
				</div>
			</div>
			{defaultTooltip.Tooltip}
			{warningTooltip.Tooltip}
			{errorTooltip.Tooltip}
		</>
	)
}

const DelayDemo = () => {
	const noDelayTooltip = useTooltip({ delay: 0 })
	const shortDelayTooltip = useTooltip({ delay: 150 })
	const mediumDelayTooltip = useTooltip({ delay: 350 })
	const longDelayTooltip = useTooltip({ delay: 750 })

	return (
		<>
			<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
				<div
					style={demoBoxStyle}
					onMouseEnter={() => noDelayTooltip.showTooltip('No delay (instant)')}
					onMouseLeave={noDelayTooltip.hideTooltip}
				>
					No Delay
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() => shortDelayTooltip.showTooltip('150ms delay')}
					onMouseLeave={shortDelayTooltip.hideTooltip}
				>
					Short (150ms)
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() => mediumDelayTooltip.showTooltip('350ms delay (default)')}
					onMouseLeave={mediumDelayTooltip.hideTooltip}
				>
					Medium (350ms)
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() => longDelayTooltip.showTooltip('750ms delay')}
					onMouseLeave={longDelayTooltip.hideTooltip}
				>
					Long (750ms)
				</div>
			</div>
			{noDelayTooltip.Tooltip}
			{shortDelayTooltip.Tooltip}
			{mediumDelayTooltip.Tooltip}
			{longDelayTooltip.Tooltip}
		</>
	)
}

const ContentDemo = () => {
	const simpleTooltip = useTooltip()
	const multilineTooltip = useTooltip({ maxWidth: 300 })
	const richTooltip = useTooltip({ maxWidth: 250 })

	return (
		<>
			<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
				<div
					style={demoBoxStyle}
					onMouseEnter={() => simpleTooltip.showTooltip('Simple text tooltip')}
					onMouseLeave={simpleTooltip.hideTooltip}
				>
					Simple Text
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() =>
						multilineTooltip.showTooltip(
							'This is a longer tooltip with multiple lines of text that will wrap to fit the maxWidth constraint.'
						)
					}
					onMouseLeave={multilineTooltip.hideTooltip}
				>
					Multiline
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() =>
						richTooltip.showTooltip(
							<div>
								<strong>Rich Content</strong>
								<p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
									Tooltips can contain JSX elements
								</p>
							</div>
						)
					}
					onMouseLeave={richTooltip.hideTooltip}
				>
					Rich Content
				</div>
			</div>
			{simpleTooltip.Tooltip}
			{multilineTooltip.Tooltip}
			{richTooltip.Tooltip}
		</>
	)
}

const MaxWidthDemo = () => {
	const smallTooltip = useTooltip({ maxWidth: 150 })
	const mediumTooltip = useTooltip({ maxWidth: 200 })
	const largeTooltip = useTooltip({ maxWidth: 300 })

	return (
		<>
			<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
				<div
					style={demoBoxStyle}
					onMouseEnter={() =>
						smallTooltip.showTooltip('This tooltip has a maxWidth of 150px')
					}
					onMouseLeave={smallTooltip.hideTooltip}
				>
					Small (150px)
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() =>
						mediumTooltip.showTooltip('This tooltip has a maxWidth of 200px (default)')
					}
					onMouseLeave={mediumTooltip.hideTooltip}
				>
					Medium (200px)
				</div>
				<div
					style={demoBoxStyle}
					onMouseEnter={() =>
						largeTooltip.showTooltip(
							'This tooltip has a maxWidth of 300px and can contain more text before wrapping'
						)
					}
					onMouseLeave={largeTooltip.hideTooltip}
				>
					Large (300px)
				</div>
			</div>
			{smallTooltip.Tooltip}
			{mediumTooltip.Tooltip}
			{largeTooltip.Tooltip}
		</>
	)
}

const WithButtonsDemo = () => {
	return (
		<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
			<Button
				variant="solid"
				color="primary"
				tooltip="This button has a tooltip too"
				adornment={{
					position: 'start',
					name: 'IconInfoCircle',
					size: 18,
					stroke: 2,
				}}
			>
				Button with Icon Tooltip
			</Button>
			<Button
				variant="outlined"
				color="success"
				tooltip="This button has a tooltip"
				adornment={{
					position: 'end',
					name: 'IconCheck',
					size: 18,
					stroke: 2,
				}}
			>
				Save Changes
			</Button>
			<Button
				variant="iconSolid"
				color="primary"
				adornment={{
					position: 'start',
					name: 'IconHelp',
					size: 20,
					stroke: 2,
				}}
				tooltip="This button has a tooltip"
			/>
		</div>
	)
}

/*
 *   COMPONENT
 **********************************************************************************************************/
export const TooltipShowcase = () => (
	<div>
		<h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
			Tooltip Components
		</h2>
		<p style={{ marginBottom: '32px', color: '#666' }}>
			Test and develop tooltip components with different positions and content.
		</p>

		<div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
			{/* PLACEMENT */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
					Placement
				</h3>
				<PlacementDemo />
			</section>

			{/* VARIANTS */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
					Variants
				</h3>
				<VariantDemo />
			</section>

			{/* DELAY */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Delay</h3>
				<DelayDemo />
			</section>

			{/* CONTENT */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
					Content Types
				</h3>
				<ContentDemo />
			</section>

			{/* MAX WIDTH */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
					Max Width
				</h3>
				<MaxWidthDemo />
			</section>

			{/* WITH BUTTONS */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
					With Buttons
				</h3>
				<p style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
					Icons in buttons already have built-in tooltip support via the tooltip prop.
				</p>
				<WithButtonsDemo />
			</section>
		</div>
	</div>
)
