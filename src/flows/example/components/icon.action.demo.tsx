/*
 *   IMPORTS
 ***************************************************************************************************/
import { Button } from '@/components/button'
import { Icon } from '@/components/icon'

/*
 *   COMPONENT
 ***************************************************************************************************/
export const IconActionDemo = () => {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px' }}>
			<h2>Button Component - All Variations</h2>

			{/* SOLID VARIANT */}
			<section>
				<h3>Solid Variant (Default)</h3>

				<div style={{ marginBottom: '16px' }}>
					<h4>Colors</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" onClick={() => console.log('Primary solid')}>
							Primary
						</Button>
						<Button color="success" onClick={() => console.log('Success solid')}>
							Success
						</Button>
						<Button color="error" onClick={() => console.log('Error solid')}>
							Error
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>Sizes</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" size="small">
							Small
						</Button>
						<Button color="primary" size="medium">
							Medium
						</Button>
						<Button color="primary" size="large">
							Large
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>With Start Adornment</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" startAdornment={<Icon icon="IconPlus" />}>
							Add Item
						</Button>
						<Button color="success" startAdornment={<Icon icon="IconCheck" />}>
							Confirm
						</Button>
						<Button color="error" startAdornment={<Icon icon="IconTrash" />}>
							Delete
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>With End Adornment</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" endAdornment={<Icon icon="IconArrowRight" />}>
							Next
						</Button>
						<Button color="primary" endAdornment={<Icon icon="IconExternalLink" />}>
							Open Link
						</Button>
						<Button color="primary" endAdornment={<Icon icon="IconChevronDown" />}>
							Dropdown
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>With Both Adornments</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="primary"
							startAdornment={<Icon icon="IconDownload" />}
							endAdornment={<Icon icon="IconExternalLink" />}
						>
							Download
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>Disabled & Loading States</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" disabled>
							Disabled
						</Button>
						<Button color="primary" loading>
							Loading
						</Button>
						<Button color="primary" disabled startAdornment={<Icon icon="IconSettings" />}>
							Disabled with Icon
						</Button>
					</div>
				</div>

				<div>
					<h4>New Adornment Pattern</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="primary"
							variant="solid"
							adornment={{
								position: 'start',
								name: 'IconCheck',
								size: 20,
								stroke: 2,
							}}
						/>
						<Button
							color="success"
							variant="solid"
							adornment={{
								position: 'end',
								name: 'IconArrowRight',
								size: 20,
								stroke: 2,
							}}
						/>
					</div>
				</div>
			</section>

			{/* OUTLINED VARIANT */}
			<section>
				<h3>Outlined Variant</h3>

				<div style={{ marginBottom: '16px' }}>
					<h4>Colors</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="primary"
							variant="outlined"
							onClick={() => console.log('Primary outlined')}
						>
							Primary
						</Button>
						<Button
							color="success"
							variant="outlined"
							onClick={() => console.log('Success outlined')}
						>
							Success
						</Button>
						<Button
							color="error"
							variant="outlined"
							onClick={() => console.log('Error outlined')}
						>
							Error
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>Sizes</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" variant="outlined" size="small">
							Small
						</Button>
						<Button color="primary" variant="outlined" size="medium">
							Medium
						</Button>
						<Button color="primary" variant="outlined" size="large">
							Large
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>With Adornments</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="primary"
							variant="outlined"
							startAdornment={<Icon icon="IconHeart" />}
						>
							Favorite
						</Button>
						<Button
							color="success"
							variant="outlined"
							startAdornment={<Icon icon="IconCheck" />}
						>
							Approve
						</Button>
						<Button color="error" variant="outlined" startAdornment={<Icon icon="IconX" />}>
							Reject
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>Disabled State</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" variant="outlined" disabled>
							Disabled
						</Button>
						<Button
							color="primary"
							variant="outlined"
							disabled
							startAdornment={<Icon icon="IconSettings" />}
						>
							Disabled with Icon
						</Button>
					</div>
				</div>

				<div>
					<h4>New Adornment Pattern</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="error"
							variant="outlined"
							adornment={{
								position: 'start',
								name: 'IconTrash',
								size: 20,
								stroke: 2,
							}}
						/>
						<Button
							color="primary"
							variant="outlined"
							adornment={{
								position: 'start',
								name: 'IconEdit',
								size: 20,
								stroke: 2,
							}}
						/>
					</div>
				</div>
			</section>

			{/* TEXT VARIANT */}
			<section>
				<h3>Text Variant</h3>

				<div style={{ marginBottom: '16px' }}>
					<h4>Colors</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" variant="text" onClick={() => console.log('Primary text')}>
							Primary
						</Button>
						<Button
							color="success"
							variant="text"
							onClick={() => console.log('Success text')}
						>
							Success
						</Button>
						<Button color="error" variant="text" onClick={() => console.log('Error text')}>
							Error
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>With Adornments</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="primary"
							variant="text"
							startAdornment={<Icon icon="IconPlus" />}
						>
							Add Item
						</Button>
						<Button color="error" variant="text" startAdornment={<Icon icon="IconTrash" />}>
							Delete
						</Button>
						<Button
							color="primary"
							variant="text"
							endAdornment={<Icon icon="IconExternalLink" />}
						>
							Learn More
						</Button>
					</div>
				</div>

				<div>
					<h4>Disabled State</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" variant="text" disabled>
							Disabled
						</Button>
						<Button
							color="primary"
							variant="text"
							disabled
							startAdornment={<Icon icon="IconSettings" />}
						>
							Disabled with Icon
						</Button>
					</div>
				</div>
			</section>

			{/* ICON VARIANT */}
			<section>
				<h3>Icon Variant</h3>

				<div style={{ marginBottom: '16px' }}>
					<h4>Colors (Traditional Syntax)</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="primary"
							variant="iconSolid"
							onClick={() => console.log('Primary icon')}
						>
							<Icon icon="IconHeart" />
						</Button>
						<Button
							color="success"
							variant="iconSolid"
							onClick={() => console.log('Success icon')}
						>
							<Icon icon="IconCheck" />
						</Button>
						<Button color="error" variant="iconSolid" onClick={() => console.log('Error icon')}>
							<Icon icon="IconX" />
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>Sizes (Traditional Syntax)</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" variant="iconSolid" size="small">
							<Icon icon="IconSettings" size={18} />
						</Button>
						<Button color="primary" variant="iconSolid" size="medium">
							<Icon icon="IconSettings" size={24} />
						</Button>
						<Button color="primary" variant="iconSolid" size="large">
							<Icon icon="IconSettings" size={28} />
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>Various Icons (Traditional Syntax)</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" variant="iconSolid">
							<Icon icon="IconPlus" />
						</Button>
						<Button color="primary" variant="iconSolid">
							<Icon icon="IconMinus" />
						</Button>
						<Button color="primary" variant="iconSolid">
							<Icon icon="IconEdit" />
						</Button>
						<Button color="primary" variant="iconSolid">
							<Icon icon="IconTrash" />
						</Button>
						<Button color="primary" variant="iconSolid">
							<Icon icon="IconDownload" />
						</Button>
						<Button color="primary" variant="iconSolid">
							<Icon icon="IconUpload" />
						</Button>
						<Button color="primary" variant="iconSolid">
							<Icon icon="IconSearch" />
						</Button>
						<Button color="primary" variant="iconSolid">
							<Icon icon="IconSettings" />
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>Disabled State (Traditional Syntax)</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" variant="iconSolid" disabled>
							<Icon icon="IconSettings" />
						</Button>
						<Button color="success" variant="iconSolid" disabled>
							<Icon icon="IconCheck" />
						</Button>
						<Button color="error" variant="iconSolid" disabled>
							<Icon icon="IconX" />
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>New Adornment Pattern - Colors</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="primary"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconHeart',
								size: 24,
								stroke: 2,
							}}
							onClick={() => console.log('Primary icon')}
						/>
						<Button
							color="success"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconCheck',
								size: 24,
								stroke: 2,
							}}
							onClick={() => console.log('Success icon')}
						/>
						<Button
							color="error"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconX',
								size: 24,
								stroke: 2,
							}}
							onClick={() => console.log('Error icon')}
						/>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>New Adornment Pattern - Sizes</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="primary"
							variant="iconSolid"
							size="small"
							adornment={{
								position: 'start',
								name: 'IconSettings',
								size: 18,
								stroke: 2,
							}}
						/>
						<Button
							color="primary"
							variant="iconSolid"
							size="medium"
							adornment={{
								position: 'start',
								name: 'IconSettings',
								size: 24,
								stroke: 2,
							}}
						/>
						<Button
							color="primary"
							variant="iconSolid"
							size="large"
							adornment={{
								position: 'start',
								name: 'IconSettings',
								size: 28,
								stroke: 2,
							}}
						/>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>New Adornment Pattern - Navigation Icons</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="primary"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconArrowLeft',
								size: 24,
								stroke: 2,
							}}
							onClick={() => console.log('Back')}
						/>
						<Button
							color="primary"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconArrowRight',
								size: 24,
								stroke: 2,
							}}
							onClick={() => console.log('Forward')}
						/>
						<Button
							color="primary"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconArrowUp',
								size: 24,
								stroke: 2,
							}}
							onClick={() => console.log('Up')}
						/>
						<Button
							color="primary"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconArrowDown',
								size: 24,
								stroke: 2,
							}}
							onClick={() => console.log('Down')}
						/>
						<Button
							color="primary"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconHome',
								size: 24,
								stroke: 2,
							}}
							onClick={() => console.log('Home')}
						/>
					</div>
				</div>

				<div>
					<h4>New Adornment Pattern - Disabled</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="primary"
							variant="iconSolid"
							disabled
							adornment={{
								position: 'start',
								name: 'IconSettings',
								size: 24,
								stroke: 2,
							}}
						/>
						<Button
							color="success"
							variant="iconSolid"
							disabled
							adornment={{
								position: 'start',
								name: 'IconCheck',
								size: 24,
								stroke: 2,
							}}
						/>
						<Button
							color="error"
							variant="iconSolid"
							disabled
							adornment={{
								position: 'start',
								name: 'IconX',
								size: 24,
								stroke: 2,
							}}
						/>
					</div>
				</div>
			</section>

			{/* COMPARISON SECTION */}
			<section>
				<h3>Pattern Comparison</h3>

				<div style={{ marginBottom: '16px' }}>
					<h4>Traditional vs New Adornment Pattern</h4>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '24px',
						}}
					>
						<div>
							<p>
								<strong>Traditional (with children):</strong>
							</p>
							<div
								style={{
									display: 'flex',
									gap: '12px',
									alignItems: 'center',
									flexWrap: 'wrap',
								}}
							>
								<Button color="primary" variant="iconSolid">
									<Icon icon="IconPlus" />
								</Button>
								<Button color="primary" startAdornment={<Icon icon="IconPlus" />}>
									Add
								</Button>
							</div>
						</div>

						<div>
							<p>
								<strong>New (self-closing):</strong>
							</p>
							<div
								style={{
									display: 'flex',
									gap: '12px',
									alignItems: 'center',
									flexWrap: 'wrap',
								}}
							>
								<Button
									color="primary"
									variant="iconSolid"
									adornment={{
										position: 'start',
										name: 'IconPlus',
										size: 24,
										stroke: 2,
									}}
								/>
								<Button
									color="primary"
									variant="solid"
									adornment={{
										position: 'start',
										name: 'IconPlus',
										size: 20,
										stroke: 2,
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* MIXED USAGE SECTION */}
			<section>
				<h3>Common UI Patterns</h3>

				<div style={{ marginBottom: '16px' }}>
					<h4>Dialog Actions</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" variant="text">
							Cancel
						</Button>
						<Button color="error" variant="outlined">
							Delete
						</Button>
						<Button color="success">Confirm</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>Form Actions</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button color="primary" variant="outlined">
							Reset
						</Button>
						<Button color="primary" type="submit">
							Submit
						</Button>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<h4>Toolbar Actions</h4>
					<div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="primary"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconEdit',
								size: 20,
								stroke: 2,
							}}
						/>
						<Button
							color="primary"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconCopy',
								size: 20,
								stroke: 2,
							}}
						/>
						<Button
							color="error"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconTrash',
								size: 20,
								stroke: 2,
							}}
						/>
						<div style={{ width: '1px', height: '24px', background: '#ccc' }} />
						<Button
							color="primary"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconDownload',
								size: 20,
								stroke: 2,
							}}
						/>
						<Button
							color="primary"
							variant="iconSolid"
							adornment={{
								position: 'start',
								name: 'IconShare',
								size: 20,
								stroke: 2,
							}}
						/>
					</div>
				</div>

				<div>
					<h4>Navigation</h4>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
						<Button
							color="primary"
							variant="outlined"
							startAdornment={<Icon icon="IconArrowLeft" />}
						>
							Back
						</Button>
						<Button color="primary" endAdornment={<Icon icon="IconArrowRight" />}>
							Next
						</Button>
					</div>
				</div>
			</section>
		</div>
	)
}
