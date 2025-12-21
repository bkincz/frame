/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Action } from '../action.component'

/*
 *   MOCKS
 ***************************************************************************************************/
vi.mock('@/components/icon', () => ({
	Icon: ({ icon, size }: { icon?: string; size?: number }) => (
		<div data-testid="icon" data-icon={icon} data-size={size}>
			Icon
		</div>
	),
}))

vi.mock('@/lib/functions', () => ({
	genUUID: () => 'test-uuid',
}))

/*
 *   TESTS
 ***************************************************************************************************/
describe('Action Component', () => {
	describe('Rendering', () => {
		it('should render button element', () => {
			render(<Action label="Test Action" />)
			const button = screen.getByRole('button')
			expect(button).toBeInTheDocument()
		})

		it('should render children', () => {
			render(<Action>Test Content</Action>)
			expect(screen.getByText('Test Content')).toBeInTheDocument()
		})

		it('should apply custom className', () => {
			render(<Action className="custom-class" label="Test" />)
			const button = screen.getByRole('button')
			expect(button).toHaveClass('custom-class')
		})

		it('should apply custom styles', () => {
			render(<Action style={{ color: 'red' }} label="Test" />)
			const button = screen.getByRole('button')
			expect(button).toHaveStyle({ color: 'rgb(255, 0, 0)' })
		})
	})

	describe('Button Types', () => {
		it('should default to button type', () => {
			render(<Action label="Test" />)
			const button = screen.getByRole('button')
			expect(button).toHaveAttribute('type', 'button')
		})

		it('should accept submit type', () => {
			render(<Action type="submit" label="Submit" />)
			const button = screen.getByRole('button')
			expect(button).toHaveAttribute('type', 'submit')
		})
	})

	describe('Click Handling', () => {
		it('should call onClick when clicked', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()
			render(<Action onClick={handleClick} label="Click Me" />)

			await user.click(screen.getByRole('button'))

			expect(handleClick).toHaveBeenCalledTimes(1)
		})

		it('should not call onClick when disabled', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()
			render(<Action onClick={handleClick} disabled label="Disabled" />)

			await user.click(screen.getByRole('button'))

			expect(handleClick).not.toHaveBeenCalled()
		})

		it('should not call onClick when loading', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()
			render(<Action onClick={handleClick} loading label="Loading" />)

			await user.click(screen.getByRole('button'))

			expect(handleClick).not.toHaveBeenCalled()
		})
	})

	describe('Disabled State', () => {
		it('should be disabled when disabled prop is true', () => {
			render(<Action disabled label="Disabled" />)
			const button = screen.getByRole('button')
			expect(button).toBeDisabled()
		})

		it('should be disabled when loading is true', () => {
			render(<Action loading label="Loading" />)
			const button = screen.getByRole('button')
			expect(button).toBeDisabled()
		})

		it('should not be disabled by default', () => {
			render(<Action label="Normal" />)
			const button = screen.getByRole('button')
			expect(button).not.toBeDisabled()
		})
	})

	describe('Aria Label', () => {
		it('should set aria-label from label prop', () => {
			render(<Action label="Test Label" />)
			const button = screen.getByRole('button')
			expect(button).toHaveAttribute('aria-label', 'Test Label')
		})

		it('should handle undefined label', () => {
			render(<Action />)
			const button = screen.getByRole('button')
			expect(button).not.toHaveAttribute('aria-label')
		})
	})

	describe('Adornment', () => {
		it('should render adornment when provided', () => {
			render(
				<Action label="With Icon" adornment={{ icon: 'IconPlus' }}>
					<Action.Adornment />
					<Action.Label />
				</Action>
			)

			expect(screen.getByTestId('icon')).toBeInTheDocument()
		})

		it('should not render adornment when not provided', () => {
			render(
				<Action label="No Icon">
					<Action.Label />
				</Action>
			)

			expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
		})

		it('should apply custom className to adornment', () => {
			render(
				<Action label="Test" adornment={{ icon: 'IconPlus' }}>
					<Action.Adornment className="custom-adornment" />
				</Action>
			)

			const adornment = screen.getByTestId('icon').parentElement
			expect(adornment).toHaveClass('custom-adornment')
		})
	})

	describe('Label', () => {
		it('should render label text', () => {
			render(
				<Action label="Test Label">
					<Action.Label />
				</Action>
			)

			expect(screen.getByText('Test Label')).toBeInTheDocument()
		})

		it('should apply custom className to label', () => {
			render(
				<Action label="Test">
					<Action.Label className="custom-label" />
				</Action>
			)

			const label = screen.getByText('Test')
			expect(label).toHaveClass('custom-label')
		})
	})

	describe('Inline Variant', () => {
		it('should apply inline class when inline is true', () => {
			render(<Action inline label="Inline Action" />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('inline')
		})

		it('should pass inline prop to adornment', () => {
			render(
				<Action inline label="Test" adornment={{ icon: 'IconPlus', size: 32 }}>
					<Action.Adornment />
				</Action>
			)

			const icon = screen.getByTestId('icon')
			// When inline, icon size should be 20 regardless of adornment.size
			expect(icon).toHaveAttribute('data-size', '20')
		})
	})

	describe('Icon Only Mode', () => {
		it('should detect icon-only mode', () => {
			render(
				<Action adornment={{ icon: 'IconPlus' }}>
					<Action.Adornment />
				</Action>
			)

			const button = screen.getByRole('button')
			expect(button.className).toContain('iconOnly')
		})

		it('should not be icon-only when label is present', () => {
			render(
				<Action label="With Label" adornment={{ icon: 'IconPlus' }}>
					<Action.Adornment />
					<Action.Label />
				</Action>
			)

			const button = screen.getByRole('button')
			expect(button.className).not.toContain('iconOnly')
		})
	})

	describe('Context Sharing', () => {
		it('should share props through context to sub-components', () => {
			render(
				<Action label="Shared Label" adornment={{ icon: 'IconPlus' }} inline>
					<Action.Adornment />
					<Action.Label />
				</Action>
			)

			// Both sub-components should receive the context props
			expect(screen.getByText('Shared Label')).toBeInTheDocument()
			expect(screen.getByTestId('icon')).toBeInTheDocument()
		})
	})
})
