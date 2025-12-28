/*
 *   IMPORTS
 **********************************************************************************************************/
import { Icon } from '@/components/icon'

/*
 *   COMPONENT
 **********************************************************************************************************/
export const IconShowcase = () => (
	<div>
		<h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
			Icon Components
		</h2>
		<p style={{ marginBottom: '32px', color: '#666' }}>
			Test and develop icon components with different sizes, stroke widths, and fill styles.
		</p>

		<div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
			{/* SIZES */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Sizes</h3>
				<div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
					<Icon icon="IconCheck" size={16} stroke={2} />
					<Icon icon="IconCheck" size={24} stroke={2} />
					<Icon icon="IconCheck" size={32} stroke={2} />
					<Icon icon="IconCheck" size={48} stroke={2} />
				</div>
			</section>

			{/* STROKE WIDTH */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
					Stroke Width
				</h3>
				<div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
					<Icon icon="IconHeart" size={32} stroke={1} />
					<Icon icon="IconHeart" size={32} stroke={1.5} />
					<Icon icon="IconHeart" size={32} stroke={2} />
					<Icon icon="IconHeart" size={32} stroke={2.5} />
				</div>
			</section>

			{/* FILL */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Fill</h3>
				<div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
					<Icon icon="IconStar" size={32} stroke={2} fill="none" />
					<Icon icon="IconStar" size={32} stroke={2} fill="filled" />
					<Icon icon="IconHeart" size={32} stroke={2} fill="none" />
					<Icon icon="IconHeart" size={32} stroke={2} fill="filled" />
					<Icon icon="IconCircle" size={32} stroke={2} fill="none" />
					<Icon icon="IconCircle" size={32} stroke={2} fill="filled" />
				</div>
			</section>

			{/* COMMON ICONS */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
					Common Icons
				</h3>
				<div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
					<Icon icon="IconHome" size={24} stroke={2} />
					<Icon icon="IconSearch" size={24} stroke={2} />
					<Icon icon="IconMail" size={24} stroke={2} />
					<Icon icon="IconBell" size={24} stroke={2} />
					<Icon icon="IconUser" size={24} stroke={2} />
					<Icon icon="IconSettings" size={24} stroke={2} />
					<Icon icon="IconDownload" size={24} stroke={2} />
					<Icon icon="IconUpload" size={24} stroke={2} />
					<Icon icon="IconTrash" size={24} stroke={2} />
					<Icon icon="IconEdit" size={24} stroke={2} />
					<Icon icon="IconPlus" size={24} stroke={2} />
					<Icon icon="IconX" size={24} stroke={2} />
					<Icon icon="IconCheck" size={24} stroke={2} />
					<Icon icon="IconChevronRight" size={24} stroke={2} />
					<Icon icon="IconChevronLeft" size={24} stroke={2} />
					<Icon icon="IconChevronDown" size={24} stroke={2} />
					<Icon icon="IconChevronUp" size={24} stroke={2} />
					<Icon icon="IconArrowRight" size={24} stroke={2} />
					<Icon icon="IconArrowLeft" size={24} stroke={2} />
				</div>
			</section>

			{/* CUSTOM STYLING */}
			<section>
				<h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
					Custom Styling
				</h3>
				<p style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
					Icons can be styled using className or style props for custom colors and effects.
				</p>
				<div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
					<Icon
						icon="IconStar"
						size={32}
						stroke={2}
						style={{ color: '#e32f9b' }}
					/>
					<Icon
						icon="IconHeart"
						size={32}
						stroke={2}
						fill="filled"
						style={{ color: '#4caf50' }}
					/>
					<Icon
						icon="IconBell"
						size={32}
						stroke={2}
						style={{ color: '#2196f3' }}
					/>
					<Icon
						icon="IconAlertCircle"
						size={32}
						stroke={2}
						style={{ color: '#f44336' }}
					/>
				</div>
			</section>
		</div>
	</div>
)
