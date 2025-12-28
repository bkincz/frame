/*
 *   IMPORTS
 **********************************************************************************************************/
import { Button } from '@/components/button'

/*
 *   COMPONENT
 **********************************************************************************************************/
export const ButtonShowcase = () => (
	<div>
		<h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
			Button Components
		</h2>
		<p style={{ marginBottom: '32px', color: '#666' }}>
			Test and develop button components with different variants, states, and configurations.
		</p>

		<div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
			{/* VARIANTS */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
					Variants
				</h3>
				<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
					<Button variant="solid" color="primary">
						Solid Button
					</Button>
					<Button variant="outlined" color="primary">
						Outlined Button
					</Button>
					<Button variant="text" color="primary">
						Text Button
					</Button>
				</div>
			</section>

			{/* COLORS */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Colors</h3>
				<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
					<Button variant="solid" color="primary">
						Primary
					</Button>
					<Button variant="solid" color="success">
						Success
					</Button>
					<Button variant="solid" color="error">
						Error
					</Button>
				</div>
			</section>

			{/* SIZES */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Sizes</h3>
				<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
					<Button variant="solid" color="primary" size="small">
						Small
					</Button>
					<Button variant="solid" color="primary" size="medium">
						Medium
					</Button>
					<Button variant="solid" color="primary" size="large">
						Large
					</Button>
				</div>
			</section>

			{/* STATES */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>States</h3>
				<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
					<Button variant="solid" color="primary">
						Default
					</Button>
					<Button variant="solid" color="primary" disabled>
						Disabled
					</Button>
					<Button variant="solid" color="primary" loading>
						Loading
					</Button>
				</div>
			</section>

			{/* ICON BUTTONS */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
					Icon Buttons
				</h3>
				<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
					<Button
						variant="iconSolid"
						color="primary"
						adornment={{
							position: 'start',
							name: 'IconPlus',
							size: 20,
							stroke: 2,
						}}
					/>
					<Button
						variant="iconSolid"
						color="success"
						adornment={{
							position: 'start',
							name: 'IconCheck',
							size: 20,
							stroke: 2,
						}}
					/>
					<Button
						variant="iconSolid"
						color="error"
						adornment={{
							position: 'start',
							name: 'IconTrash',
							size: 20,
							stroke: 2,
						}}
					/>
					<Button
						variant="iconOutlined"
						color="primary"
						adornment={{
							position: 'start',
							name: 'IconPlus',
							size: 20,
							stroke: 2,
						}}
					/>
					<Button
						variant="iconOutlined"
						color="success"
						adornment={{
							position: 'start',
							name: 'IconCheck',
							size: 20,
							stroke: 2,
						}}
					/>
					<Button
						variant="iconOutlined"
						color="error"
						adornment={{
							position: 'start',
							name: 'IconTrash',
							size: 20,
							stroke: 2,
						}}
					/>
				</div>
			</section>

			{/* WITH ADORNMENTS */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
					With Adornments
				</h3>
				<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
					<Button
						variant="solid"
						color="primary"
						adornment={{
							position: 'start',
							name: 'IconPlus',
							size: 18,
							stroke: 2,
						}}
					>
						Add Item
					</Button>
					<Button
						variant="outlined"
						color="success"
						adornment={{
							position: 'start',
							name: 'IconCheck',
							size: 18,
							stroke: 2,
						}}
					>
						Save
					</Button>
					<Button
						variant="outlined"
						color="error"
						adornment={{
							position: 'end',
							name: 'IconTrash',
							size: 18,
							stroke: 2,
						}}
					>
						Delete
					</Button>
				</div>
			</section>

			{/* COMBINATIONS */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
					Combinations
				</h3>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
					<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
						<Button
							variant="outlined"
							color="primary"
							size="small"
							adornment={{
								position: 'start',
								name: 'IconDownload',
								size: 16,
								stroke: 2,
							}}
						>
							Download
						</Button>
						<Button
							variant="solid"
							color="success"
							size="medium"
							adornment={{
								position: 'end',
								name: 'IconArrowRight',
								size: 18,
								stroke: 2,
							}}
						>
							Continue
						</Button>
						<Button
							variant="text"
							color="error"
							size="large"
							adornment={{
								position: 'start',
								name: 'IconX',
								size: 20,
								stroke: 2,
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			</section>
		</div>
	</div>
)
