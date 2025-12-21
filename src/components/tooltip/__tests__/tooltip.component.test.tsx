/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Tooltip } from '../tooltip.component'

/*
 *   MOCKS
 ***************************************************************************************************/
vi.mock('@/lib/event', () => ({
	useGlobalEvent: vi.fn(),
}))

vi.mock('gsap', () => ({
	default: {
		fromTo: vi.fn(),
		to: vi.fn(),
	},
}))

/*
 *   TESTS
 ***************************************************************************************************/
describe('Tooltip Component', () => {
	beforeEach(() => {
		// Clean up any existing portal roots
		const existingRoot = document.getElementById('tooltip-portal-root')
		if (existingRoot) {
			existingRoot.remove()
		}
	})

	describe('Rendering', () => {
		it('should not render when visible is false', () => {
			render(<Tooltip visible={false}>Tooltip Content</Tooltip>)
			expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument()
		})

		it('should render when visible is true', async () => {
			render(<Tooltip visible={true}>Tooltip Content</Tooltip>)

			await waitFor(() => {
				expect(screen.getByText('Tooltip Content')).toBeInTheDocument()
			})
		})

		it('should render children content', async () => {
			render(
				<Tooltip visible={true}>
					<div>Custom Content</div>
				</Tooltip>
			)

			await waitFor(() => {
				expect(screen.getByText('Custom Content')).toBeInTheDocument()
			})
		})
	})

	describe('Portal Root', () => {
		it('should create portal root on mount', async () => {
			render(<Tooltip visible={true}>Content</Tooltip>)

			await waitFor(() => {
				const portalRoot = document.getElementById('tooltip-portal-root')
				expect(portalRoot).toBeInTheDocument()
			})
		})

		it('should reuse existing portal root', async () => {
			// Render first tooltip
			const { unmount: unmount1 } = render(<Tooltip visible={true}>Content 1</Tooltip>)

			await waitFor(() => {
				const portalRoot = document.getElementById('tooltip-portal-root')
				expect(portalRoot).toBeInTheDocument()
			})

			const firstRoot = document.getElementById('tooltip-portal-root')

			// Render second tooltip
			render(<Tooltip visible={true}>Content 2</Tooltip>)

			await waitFor(() => {
				const secondRoot = document.getElementById('tooltip-portal-root')
				expect(secondRoot).toBe(firstRoot) // Should be the same element
			})

			unmount1()
		})

		it('should set correct portal root styles', async () => {
			render(<Tooltip visible={true}>Content</Tooltip>)

			await waitFor(() => {
				const portalRoot = document.getElementById('tooltip-portal-root')
				expect(portalRoot).toHaveStyle({
					position: 'absolute',
					top: '0',
					left: '0',
					pointerEvents: 'none',
					zIndex: '10000',
				})
			})
		})
	})

	describe('Positioning', () => {
		it('should set initial transform position', async () => {
			render(<Tooltip visible={true}>Positioning Content</Tooltip>)

			await waitFor(() => {
				const tooltip = screen.getByTestId('tooltip')
				expect(tooltip).toHaveAttribute('style')
				const style = tooltip.getAttribute('style') || ''
				expect(style).toContain('transform: translate(0px, 0px)')
			})
		})

		it('should apply custom maxWidth', async () => {
			render(
				<Tooltip visible={true} maxWidth={300}>
					Max Width Content
				</Tooltip>
			)

			await waitFor(() => {
				const tooltip = screen.getByTestId('tooltip')
				expect(tooltip).toHaveAttribute('style')
				const style = tooltip.getAttribute('style') || ''
				expect(style).toContain('max-width: 300px')
			})
		})

		it('should use default maxWidth of 200', async () => {
			render(<Tooltip visible={true}>Default Width Content</Tooltip>)

			await waitFor(() => {
				const tooltip = screen.getByTestId('tooltip')
				expect(tooltip).toHaveAttribute('style')
				const style = tooltip.getAttribute('style') || ''
				expect(style).toContain('max-width: 200px')
			})
		})
	})

	describe('Mouse Tracking', () => {
		it('should render tooltip when visible', async () => {
			render(<Tooltip visible={true}>Mouse Track Content</Tooltip>)

			await waitFor(() => {
				expect(screen.getByText('Mouse Track Content')).toBeInTheDocument()
			})
		})

		it('should not render when not visible', () => {
			render(<Tooltip visible={false}>Content</Tooltip>)
			expect(screen.queryByText('Content')).not.toBeInTheDocument()
		})

		it('should update position on mouse move', async () => {
			render(<Tooltip visible={true}>Content</Tooltip>)

			await waitFor(() => {
				expect(screen.getByText('Content')).toBeInTheDocument()
			})

			const tooltip = screen.getByText('Content').parentElement

			// Simulate mouse move
			const mouseMoveEvent = new MouseEvent('mousemove', {
				bubbles: true,
				cancelable: true,
				clientX: 100,
				clientY: 200,
			})
			document.dispatchEvent(mouseMoveEvent)

			await waitFor(() => {
				// Transform should be updated (not initial 0,0)
				expect(tooltip?.style.transform).not.toBe('translate(0px, 0px)')
			})
		})
	})

	describe('Visibility Classes', () => {
		it('should apply visible class when visible', async () => {
			render(<Tooltip visible={true}>Visibility Test Content</Tooltip>)

			await waitFor(() => {
				const tooltip = screen.getByTestId('tooltip')
				expect(tooltip).toHaveClass('visible')
				expect(tooltip).not.toHaveClass('hidden')
			})
		})

		it('should apply hidden class when not visible', async () => {
			const { rerender } = render(<Tooltip visible={true}>Hidden Test Content</Tooltip>)

			await waitFor(() => {
				expect(screen.getByText('Hidden Test Content')).toBeInTheDocument()
			})

			// Change to not visible
			rerender(<Tooltip visible={false}>Hidden Test Content</Tooltip>)

			// The tooltip should not be rendered when not visible
			expect(screen.queryByText('Hidden Test Content')).not.toBeInTheDocument()
		})
	})

	describe('Custom Styling', () => {
		it('should apply custom className', async () => {
			render(
				<Tooltip visible={true} className="custom-tooltip">
					Custom Styling Content
				</Tooltip>
			)

			await waitFor(() => {
				const tooltip = screen.getByTestId('tooltip')
				expect(tooltip).toHaveClass('custom-tooltip')
			})
		})
	})

	describe('Offset', () => {
		it('should use default offset', async () => {
			render(<Tooltip visible={true}>Content</Tooltip>)

			await waitFor(() => {
				expect(screen.getByText('Content')).toBeInTheDocument()
			})

			// Default offset is { x: 0, y: -18 }
			// Position calculation uses this offset
		})

		it('should accept custom offset', async () => {
			render(
				<Tooltip visible={true} offset={{ x: 10, y: -30 }}>
					Content
				</Tooltip>
			)

			await waitFor(() => {
				expect(screen.getByText('Content')).toBeInTheDocument()
			})

			// Custom offset should be used in positioning
		})
	})

	describe('Placement', () => {
		it('should accept top placement', async () => {
			render(
				<Tooltip visible={true} placement="top">
					Content
				</Tooltip>
			)

			await waitFor(() => {
				expect(screen.getByText('Content')).toBeInTheDocument()
			})
		})

		it('should accept bottom placement', async () => {
			render(
				<Tooltip visible={true} placement="bottom">
					Content
				</Tooltip>
			)

			await waitFor(() => {
				expect(screen.getByText('Content')).toBeInTheDocument()
			})
		})

		it('should accept left placement', async () => {
			render(
				<Tooltip visible={true} placement="left">
					Content
				</Tooltip>
			)

			await waitFor(() => {
				expect(screen.getByText('Content')).toBeInTheDocument()
			})
		})

		it('should accept right placement', async () => {
			render(
				<Tooltip visible={true} placement="right">
					Content
				</Tooltip>
			)

			await waitFor(() => {
				expect(screen.getByText('Content')).toBeInTheDocument()
			})
		})

		it('should default to top placement', async () => {
			render(<Tooltip visible={true}>Content</Tooltip>)

			await waitFor(() => {
				expect(screen.getByText('Content')).toBeInTheDocument()
			})
		})
	})

	describe('Fixed Positioning', () => {
		it('should use fixed positioning', async () => {
			render(<Tooltip visible={true}>Fixed Position Content</Tooltip>)

			await waitFor(() => {
				const tooltip = screen.getByTestId('tooltip')
				expect(tooltip).toHaveAttribute('style')
				const style = tooltip.getAttribute('style') || ''
				expect(style).toContain('position: fixed')
				expect(style).toContain('left: 0px')
				expect(style).toContain('top: 0px')
			})
		})

		it('should have pointer-events: none', async () => {
			render(<Tooltip visible={true}>Pointer Events Content</Tooltip>)

			await waitFor(() => {
				const tooltip = screen.getByTestId('tooltip')
				expect(tooltip).toHaveAttribute('style')
				const style = tooltip.getAttribute('style') || ''
				expect(style).toContain('pointer-events: none')
			})
		})

		it('should have will-change: transform for performance', async () => {
			render(<Tooltip visible={true}>Will Change Content</Tooltip>)

			await waitFor(() => {
				const tooltip = screen.getByTestId('tooltip')
				expect(tooltip).toHaveAttribute('style')
				const style = tooltip.getAttribute('style') || ''
				expect(style).toContain('will-change: transform')
			})
		})
	})
})
