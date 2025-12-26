/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button.component'

/*
 *   MOCKS
 ***************************************************************************************************/
vi.mock('@/lib/functions', () => ({
	genUUID: () => 'test-uuid',
}))

/*
 *   TESTS
 ***************************************************************************************************/
describe('Button Component', () => {
	describe('Rendering', () => {
		it('should render button element', () => {
			render(<Button label="Test Button" />)
			const button = screen.getByRole('button')
			expect(button).toBeInTheDocument()
		})

		it('should render label text', () => {
			render(<Button label="Click Me" />)
			expect(screen.getByText('Click Me')).toBeInTheDocument()
		})

		it('should render children when provided', () => {
			render(<Button>Child Content</Button>)
			expect(screen.getByText('Child Content')).toBeInTheDocument()
		})

		it('should prefer label over children for display', () => {
			render(<Button label="Label Text">Child Text</Button>)
			expect(screen.getByText('Label Text')).toBeInTheDocument()
			expect(screen.queryByText('Child Text')).not.toBeInTheDocument()
		})
	})

	describe('Button Types', () => {
		it('should default to button type', () => {
			render(<Button label="Test" />)
			const button = screen.getByRole('button')
			expect(button).toHaveAttribute('type', 'button')
		})

		it('should accept submit type', () => {
			render(<Button type="submit" label="Submit" />)
			const button = screen.getByRole('button')
			expect(button).toHaveAttribute('type', 'submit')
		})
	})

	describe('Variants', () => {
		it('should apply solid variant by default', () => {
			render(<Button label="Test" />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('Solid')
		})

		it('should apply outlined variant', () => {
			render(<Button variant="outlined" label="Test" />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('Outlined')
		})

		it('should apply text variant', () => {
			render(<Button variant="text" label="Test" />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('Text')
		})

		it('should apply icon variant', () => {
			render(<Button variant="icon">Icon</Button>)
			const button = screen.getByRole('button')
			expect(button.className).toContain('Icon')
		})
	})

	describe('Colors', () => {
		it('should apply primary color by default', () => {
			render(<Button label="Test" />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('colorPrimary')
		})

		it('should apply success color', () => {
			render(<Button color="success" label="Test" />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('colorSuccess')
		})

		it('should apply error color', () => {
			render(<Button color="error" label="Test" />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('colorError')
		})
	})

	describe('Sizes', () => {
		it('should apply medium size by default', () => {
			render(<Button label="Test" />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('sizeMedium')
		})

		it('should apply small size', () => {
			render(<Button size="small" label="Test" />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('sizeSmall')
		})

		it('should apply large size', () => {
			render(<Button size="large" label="Test" />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('sizeLarge')
		})
	})

	describe('Click Handling', () => {
		it('should call onClick when clicked', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()
			render(<Button onClick={handleClick} label="Click Me" />)

			await user.click(screen.getByRole('button'))

			expect(handleClick).toHaveBeenCalledTimes(1)
		})

		it('should not call onClick when disabled', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()
			render(<Button onClick={handleClick} disabled label="Disabled" />)

			await user.click(screen.getByRole('button'))

			expect(handleClick).not.toHaveBeenCalled()
		})

		it('should not call onClick when loading', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()
			render(<Button onClick={handleClick} loading label="Loading" />)

			await user.click(screen.getByRole('button'))

			expect(handleClick).not.toHaveBeenCalled()
		})

		it('should receive event object in onClick', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()
			render(<Button onClick={handleClick} label="Test" />)

			await user.click(screen.getByRole('button'))

			expect(handleClick).toHaveBeenCalledWith(expect.any(Object))
		})
	})

	describe('Disabled State', () => {
		it('should be disabled when disabled prop is true', () => {
			render(<Button disabled label="Disabled" />)
			const button = screen.getByRole('button')
			expect(button).toBeDisabled()
		})

		it('should be disabled when loading is true', () => {
			render(<Button loading label="Loading" />)
			const button = screen.getByRole('button')
			expect(button).toBeDisabled()
		})

		it('should apply disabled color variant when disabled', () => {
			render(<Button disabled label="Disabled" />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('colorDisabled')
		})

		it('should apply disabled color variant when loading', () => {
			render(<Button loading label="Loading" />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('colorDisabled')
		})
	})

	describe('Adornments', () => {
		it('should render start adornment', () => {
			render(
				<Button label="Test" startAdornment={<span data-testid="start-icon">Start</span>} />
			)
			expect(screen.getByTestId('start-icon')).toBeInTheDocument()
		})

		it('should render end adornment', () => {
			render(<Button label="Test" endAdornment={<span data-testid="end-icon">End</span>} />)
			expect(screen.getByTestId('end-icon')).toBeInTheDocument()
		})

		it('should render both start and end adornments', () => {
			render(
				<Button
					label="Test"
					startAdornment={<span data-testid="start-icon">Start</span>}
					endAdornment={<span data-testid="end-icon">End</span>}
				/>
			)
			expect(screen.getByTestId('start-icon')).toBeInTheDocument()
			expect(screen.getByTestId('end-icon')).toBeInTheDocument()
		})

		it('should render multiple start adornments', () => {
			render(
				<Button
					label="Test"
					startAdornment={[
						<span key="1" data-testid="start-1">
							Start 1
						</span>,
						<span key="2" data-testid="start-2">
							Start 2
						</span>,
					]}
				/>
			)
			expect(screen.getByTestId('start-1')).toBeInTheDocument()
			expect(screen.getByTestId('start-2')).toBeInTheDocument()
		})

		it('should apply hasStartAdornment class', () => {
			render(
				<Button label="Test" startAdornment={<span data-testid="start-icon">Start</span>} />
			)
			const button = screen.getByRole('button')
			expect(button.className).toContain('hasStartAdornment')
		})

		it('should apply hasEndAdornment class', () => {
			render(<Button label="Test" endAdornment={<span data-testid="end-icon">End</span>} />)
			const button = screen.getByRole('button')
			expect(button.className).toContain('hasEndAdornment')
		})
	})

	describe('Icon Variant', () => {
		it('should render only children in icon variant', () => {
			render(
				<Button variant="icon" label="Label">
					<span data-testid="icon-child">Icon</span>
				</Button>
			)

			// Label should not be rendered in icon variant
			expect(screen.queryByText('Label')).not.toBeInTheDocument()
			// Children should be rendered
			expect(screen.getByTestId('icon-child')).toBeInTheDocument()
		})

		it('should not render button label wrapper in icon variant', () => {
			render(
				<Button variant="icon" label="Test">
					Icon Content
				</Button>
			)

			// Button label wrapper should not exist
			const buttonLabel = document.querySelector('.buttonLabel')
			expect(buttonLabel).not.toBeInTheDocument()
		})
	})

	describe('Styling', () => {
		it('should apply custom className', () => {
			render(<Button className="custom-button" label="Test" />)
			const button = screen.getByRole('button')
			expect(button).toHaveClass('custom-button')
		})

		it('should apply custom styles', () => {
			render(<Button style={{ marginTop: '10px' }} label="Test" />)
			const button = screen.getByRole('button')
			expect(button).toHaveStyle({ marginTop: '10px' })
		})
	})

	describe('Aria Label', () => {
		it('should set aria-label from label prop', () => {
			render(<Button label="Test Label" />)
			const button = screen.getByRole('button')
			expect(button).toHaveAttribute('aria-label', 'Test Label')
		})
	})

	describe('Additional Props', () => {
		it('should pass additional props to button element', () => {
			render(<Button label="Test" data-testid="custom-button" data-custom="value" />)
			const button = screen.getByTestId('custom-button')
			expect(button).toHaveAttribute('data-custom', 'value')
		})
	})
})
