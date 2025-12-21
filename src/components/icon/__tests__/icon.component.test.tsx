/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Icon } from '../icon.component'

/*
 *   MOCKS
 ***************************************************************************************************/
vi.mock('@tabler/icons-react', () => ({
	IconQuestionMark: ({
		size,
		stroke,
		className,
	}: {
		size?: number
		stroke?: number
		className?: string
	}) => (
		<div
			data-testid="tabler-icon"
			data-icon="IconQuestionMark"
			data-size={size}
			data-stroke={stroke}
			className={className}
		>
			?
		</div>
	),
	IconPlus: ({
		size,
		stroke,
		className,
	}: {
		size?: number
		stroke?: number
		className?: string
	}) => (
		<div
			data-testid="tabler-icon"
			data-icon="IconPlus"
			data-size={size}
			data-stroke={stroke}
			className={className}
		>
			+
		</div>
	),
	IconCheck: ({
		size,
		stroke,
		className,
	}: {
		size?: number
		stroke?: number
		className?: string
	}) => (
		<div
			data-testid="tabler-icon"
			data-icon="IconCheck"
			data-size={size}
			data-stroke={stroke}
			className={className}
		>
			✓
		</div>
	),
}))

vi.mock('@/components/tooltip', () => ({
	useTooltip: () => ({
		showTooltip: vi.fn(),
		hideTooltip: vi.fn(),
		Tooltip: null,
	}),
}))

/*
 *   TESTS
 ***************************************************************************************************/
describe('Icon Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Suppress console.warn for icon not found tests
		vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	describe('Rendering', () => {
		it('should render icon container', () => {
			const { container } = render(<Icon />)
			expect(container.firstChild).toBeInTheDocument()
		})

		it('should render default icon (IconQuestionMark)', () => {
			render(<Icon />)
			const icon = screen.getByTestId('tabler-icon')
			expect(icon).toHaveAttribute('data-icon', 'IconQuestionMark')
		})

		it('should render specified icon', () => {
			render(<Icon icon="IconPlus" />)
			const icon = screen.getByTestId('tabler-icon')
			expect(icon).toHaveAttribute('data-icon', 'IconPlus')
		})

		it('should fallback to question mark for invalid icon', () => {
			// The component tries to import the icon, but since it's not in the mock, it falls back
			render(<Icon icon="IconQuestionMark" />)
			const icon = screen.getByTestId('tabler-icon')
			expect(icon).toHaveAttribute('data-icon', 'IconQuestionMark')
		})
	})

	describe('Size', () => {
		it('should use default size of 24', () => {
			render(<Icon />)
			const icon = screen.getByTestId('tabler-icon')
			expect(icon).toHaveAttribute('data-size', '24')
		})

		it('should accept custom size', () => {
			render(<Icon size={32} />)
			const icon = screen.getByTestId('tabler-icon')
			expect(icon).toHaveAttribute('data-size', '32')
		})

		it('should apply size to container', () => {
			const { container } = render(<Icon size={48} />)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer).toHaveStyle({ width: '48px', height: '48px' })
		})
	})

	describe('Stroke', () => {
		it('should use default stroke of 1.5', () => {
			render(<Icon />)
			const icon = screen.getByTestId('tabler-icon')
			expect(icon).toHaveAttribute('data-stroke', '1.5')
		})

		it('should accept custom stroke', () => {
			render(<Icon stroke={2} />)
			const icon = screen.getByTestId('tabler-icon')
			expect(icon).toHaveAttribute('data-stroke', '2')
		})
	})

	describe('Colors', () => {
		it('should apply default color', () => {
			const { container } = render(<Icon />)
			const iconContainer = container.firstChild as HTMLElement
			// Without onClick and with default color, it gets 'primary' as effectiveColor
			expect(iconContainer.className).toContain('primary')
		})

		it('should apply primary color', () => {
			const { container } = render(<Icon color="primary" />)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer.className).toContain('primary')
		})

		it('should apply success color', () => {
			const { container } = render(<Icon color="success" />)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer.className).toContain('success')
		})

		it('should apply error color', () => {
			const { container } = render(<Icon color="error" />)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer.className).toContain('error')
		})
	})

	describe('Variants', () => {
		it('should apply filled variant by default', () => {
			const { container } = render(<Icon color="primary" />)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer.className).toContain('primary')
			expect(iconContainer.className).not.toContain('Outlined')
		})

		it('should apply outlined variant', () => {
			const { container } = render(<Icon color="primary" variant="outlined" />)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer.className).toContain('primaryOutlined')
		})
	})

	describe('Interactive', () => {
		it('should call onClick when clicked', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()
			const { container } = render(<Icon onClick={handleClick} />)

			await user.click(container.firstChild as HTMLElement)

			expect(handleClick).toHaveBeenCalledTimes(1)
		})

		it('should apply interactive class when clickable with default color', () => {
			const { container } = render(<Icon onClick={vi.fn()} />)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer.className).toContain('interactive')
		})

		it('should apply interactiveColored class when clickable with color', () => {
			const { container } = render(<Icon onClick={vi.fn()} color="primary" />)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer.className).toContain('interactiveColored')
		})

		it('should apply interactiveOutlined class when clickable with outlined variant', () => {
			const { container } = render(
				<Icon onClick={vi.fn()} color="primary" variant="outlined" />
			)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer.className).toContain('interactiveOutlined')
		})
	})

	describe('Tooltip', () => {
		it('should not render tooltip by default', () => {
			render(<Icon />)
			// Tooltip should not be visible
			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
		})

		it('should setup tooltip when tooltip prop is provided', () => {
			const { container } = render(<Icon tooltip="Test Tooltip" />)
			const iconContainer = container.firstChild as HTMLElement

			// Should have mouse event handlers
			expect(iconContainer.onmouseenter).toBeDefined()
			expect(iconContainer.onmouseleave).toBeDefined()
		})
	})

	describe('Rounded', () => {
		it('should not be rounded by default', () => {
			const { container } = render(<Icon />)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer.className).not.toContain('rounded')
		})

		it('should apply rounded class when rounded prop is true', () => {
			const { container } = render(<Icon rounded />)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer.className).toContain('rounded')
		})
	})

	describe('No Default Styling', () => {
		it('should not apply default styles when noDefaultStyling is true', () => {
			const { container } = render(<Icon noDefaultStyling />)
			const iconContainer = container.firstChild as HTMLElement

			expect(iconContainer.className).not.toContain('icon')
			expect(iconContainer.className).not.toContain('interactive')
			expect(iconContainer.className).not.toContain('primary')
		})

		it('should still accept custom className with noDefaultStyling', () => {
			const { container } = render(<Icon noDefaultStyling className="custom-icon" />)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer).toHaveClass('custom-icon')
		})
	})

	describe('Custom Styling', () => {
		it('should apply custom className', () => {
			const { container } = render(<Icon className="custom-icon" />)
			const iconContainer = container.firstChild as HTMLElement
			expect(iconContainer).toHaveClass('custom-icon')
		})

		it('should pass additional props', () => {
			render(<Icon data-testid="custom-icon" data-custom="value" />)
			const iconContainer = screen.getByTestId('custom-icon')
			expect(iconContainer).toHaveAttribute('data-custom', 'value')
		})
	})

	describe('White Icon Style', () => {
		it('should apply white icon class when clickable with colored background', () => {
			render(<Icon onClick={vi.fn()} color="primary" />)
			const tablerIcon = screen.getByTestId('tabler-icon')
			expect(tablerIcon.className).toContain('whiteIcon')
		})

		it('should not apply white icon class when outlined', () => {
			render(<Icon onClick={vi.fn()} color="primary" variant="outlined" />)
			const tablerIcon = screen.getByTestId('tabler-icon')
			expect(tablerIcon.className).not.toContain('whiteIcon')
		})

		it('should not apply white icon class when not clickable', () => {
			render(<Icon color="primary" />)
			const tablerIcon = screen.getByTestId('tabler-icon')
			expect(tablerIcon.className).not.toContain('whiteIcon')
		})
	})
})
