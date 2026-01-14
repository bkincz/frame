/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Frame } from '../frame.component'
import { customEventManager } from '@/lib/event'
import type { Step } from '@/flows/flow.types'

/*
 *   MOCKS
 ***************************************************************************************************/
const { mockIsFirstStepOfRootFlow, mockIsLastStepOfLeafFlow } = vi.hoisted(() => {
	return {
		mockIsFirstStepOfRootFlow: vi.fn(() => false),
		mockIsLastStepOfLeafFlow: vi.fn(() => false),
	}
})

vi.mock('@/lib/event', () => ({
	customEventManager: {
		emit: vi.fn(),
	},
}))

vi.mock('@/components/icon', () => ({
	Icon: ({ icon }: { icon: string }) => <div data-testid="icon">{icon}</div>,
}))

vi.mock('@/components/button', () => ({
	Button: ({
		children,
		onClick,
		disabled,
		className,
	}: {
		children: React.ReactNode
		onClick?: () => void
		disabled?: boolean
		className?: string
	}) => (
		<button onClick={onClick} disabled={disabled} className={className} data-testid="button">
			{children}
		</button>
	),
}))

vi.mock('@/hooks/useNavigationState', () => ({
	useNavigationState: ({ direction }: { direction: 'next' | 'previous' }) => ({
		isDisabled: false,
		isHidden: false,
	}),
}))

vi.mock('../frame.functions', () => ({
	isFirstStepOfRootFlow: mockIsFirstStepOfRootFlow,
	isLastStepOfLeafFlow: mockIsLastStepOfLeafFlow,
}))

vi.mock('@/state/frame.state', () => ({
	default: {
		selectHasHistory: vi.fn(() => false),
	},
}))

vi.mock('@bkincz/clutch', () => ({
	useStateSlice: vi.fn((state, selector) => {
		// Mock different return values based on selector
		const mockState = {
			hasFrameInit: true,
			variant: 'fullscreen',
		}
		return selector(mockState)
	}),
}))

/*
 *   TESTS
 ***************************************************************************************************/
describe('Frame Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Frame', () => {
		it('should render children', () => {
			render(
				<Frame>
					<div>Test Content</div>
				</Frame>
			)

			expect(screen.getByText('Test Content')).toBeInTheDocument()
		})

		it('should apply custom className', () => {
			const { container } = render(<Frame className="custom-class">Content</Frame>)

			expect(container.querySelector('.custom-class')).toBeInTheDocument()
		})
	})

	describe('Frame.Overlay', () => {
		it('should render overlay with onClick handler', () => {
			const handleClick = vi.fn()

			render(<Frame.Overlay onClick={handleClick}>Overlay Content</Frame.Overlay>)

			const overlay = screen.getByText('Overlay Content')
			fireEvent.click(overlay)

			expect(handleClick).toHaveBeenCalledTimes(1)
		})

		it('should forward ref correctly', () => {
			const ref = { current: null }

			render(<Frame.Overlay ref={ref}>Content</Frame.Overlay>)

			expect(ref.current).not.toBeNull()
		})
	})

	describe('Frame.Content', () => {
		it('should render with fullscreen variant by default', () => {
			const { container } = render(<Frame.Content>Content</Frame.Content>)

			expect(container.querySelector('[class*="contentFullscreen"]')).toBeInTheDocument()
		})

		it('should render with modal variant', () => {
			const { container } = render(<Frame.Content variant="modal">Content</Frame.Content>)

			expect(container.querySelector('[class*="contentModal"]')).toBeInTheDocument()
		})

		it('should forward ref correctly', () => {
			const ref = { current: null }

			render(<Frame.Content ref={ref}>Content</Frame.Content>)

			expect(ref.current).not.toBeNull()
		})
	})

	describe('Frame.Footer', () => {
		it('should render footer content', () => {
			render(<Frame.Footer>Footer Content</Frame.Footer>)

			expect(screen.getByText('Footer Content')).toBeInTheDocument()
		})
	})

	describe('Frame.Heading', () => {
		it('should render as h1 element', () => {
			render(<Frame.Heading>Test Heading</Frame.Heading>)

			const heading = screen.getByText('Test Heading')
			expect(heading.tagName).toBe('H1')
		})
	})

	describe('Frame.Subheading', () => {
		it('should render as p element', () => {
			render(<Frame.Subheading>Test Subheading</Frame.Subheading>)

			const subheading = screen.getByText('Test Subheading')
			expect(subheading.tagName).toBe('P')
		})
	})

	describe('Frame.Grid', () => {
		it('should render grid container', () => {
			render(
				<Frame.Grid>
					<div>Grid Item</div>
				</Frame.Grid>
			)

			expect(screen.getByText('Grid Item')).toBeInTheDocument()
		})
	})

	describe('Frame.Main', () => {
		it('should render main content area', () => {
			render(<Frame.Main>Main Content</Frame.Main>)

			expect(screen.getByText('Main Content')).toBeInTheDocument()
		})

		it('should forward ref correctly', () => {
			const ref = { current: null }

			render(<Frame.Main ref={ref}>Content</Frame.Main>)

			expect(ref.current).not.toBeNull()
		})
	})

	describe('Frame.Sidebar', () => {
		it('should render sidebar content', () => {
			render(<Frame.Sidebar>Sidebar Content</Frame.Sidebar>)

			expect(screen.getByText('Sidebar Content')).toBeInTheDocument()
		})
	})

	describe('Frame.Step', () => {
		it('should render functional components', () => {
			const TestComponent = () => <div>Test Component</div>
			const step: Step = {
				components: [TestComponent],
			}

			render(<Frame.Step step={step} />)

			expect(screen.getByText('Test Component')).toBeInTheDocument()
		})

		it('should render React elements with keys', () => {
			const step: Step = {
				components: [<div key="test-key">React Element</div>],
			}

			render(<Frame.Step step={step} />)

			expect(screen.getByText('React Element')).toBeInTheDocument()
		})

		it('should render multiple components', () => {
			const Component1 = () => <div>Component 1</div>
			const Component2 = () => <div>Component 2</div>

			const step: Step = {
				components: [Component1, Component2],
			}

			render(<Frame.Step step={step} />)

			expect(screen.getByText('Component 1')).toBeInTheDocument()
			expect(screen.getByText('Component 2')).toBeInTheDocument()
		})

		it('should handle empty components array', () => {
			const step: Step = {
				components: [],
			}

			const { container } = render(<Frame.Step step={step} />)

			expect(container.firstChild).toBeNull()
		})
	})

	describe('Frame.NotFound', () => {
		it('should render not found message with step key', () => {
			render(<Frame.NotFound stepKey="missing-step" />)

			expect(screen.getByText('Step Not Found')).toBeInTheDocument()
			expect(
				screen.getByText('The step "missing-step" does not exist in this flow.')
			).toBeInTheDocument()
		})

		it('should render custom children', () => {
			render(
				<Frame.NotFound stepKey="missing">
					<button>Go Back</button>
				</Frame.NotFound>
			)

			expect(screen.getByText('Go Back')).toBeInTheDocument()
		})
	})

	describe('Frame.Back', () => {
		it('should render back button', () => {
			render(<Frame.Back />)

			expect(screen.getByTestId('button')).toBeInTheDocument()
		})

		it('should emit frame:request:previous event on click', () => {
			render(<Frame.Back />)

			const button = screen.getByTestId('button')
			fireEvent.click(button)

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:previous', {})
		})

		it('should emit frame:request:close when on first step of root flow', () => {
			mockIsFirstStepOfRootFlow.mockReturnValue(true)

			render(<Frame.Back />)

			const button = screen.getByTestId('button')
			fireEvent.click(button)

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:close', {
				source: 'user',
			})

			// Reset mock
			mockIsFirstStepOfRootFlow.mockReturnValue(false)
		})
	})

	describe('Frame.Next', () => {
		it('should render next button with default label', () => {
			render(<Frame.Next />)

			expect(screen.getByText('Next')).toBeInTheDocument()
		})

		it('should render with custom label', () => {
			render(<Frame.Next label="Continue" />)

			expect(screen.getByText('Continue')).toBeInTheDocument()
		})

		it('should emit frame:request:next event on click', () => {
			render(<Frame.Next />)

			const button = screen.getByTestId('button')
			fireEvent.click(button)

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:next', {})
		})

		it('should emit frame:request:close when on last step of leaf flow', () => {
			mockIsLastStepOfLeafFlow.mockReturnValue(true)

			render(<Frame.Next />)

			const button = screen.getByTestId('button')
			fireEvent.click(button)

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:close', {
				source: 'user',
			})

			// Reset mock
			mockIsLastStepOfLeafFlow.mockReturnValue(false)
		})

		it('should render as string children', () => {
			render(<Frame.Next>Custom Button Text</Frame.Next>)

			expect(screen.getByText('Custom Button Text')).toBeInTheDocument()
		})
	})

	describe('Frame.Navigation', () => {
		it('should render navigation container with back and next buttons', () => {
			const { container } = render(<Frame.Navigation />)

			const buttons = screen.getAllByTestId('button')
			expect(buttons).toHaveLength(2) // Back and Next
		})
	})

	describe('Frame.Close', () => {
		it('should render close button', () => {
			render(<Frame.Close />)

			expect(screen.getByTestId('icon')).toBeInTheDocument()
		})

		it('should emit frame:request:close event on click', () => {
			const { container } = render(<Frame.Close />)

			const closeButton = container.firstChild as HTMLElement
			fireEvent.click(closeButton)

			expect(customEventManager.emit).toHaveBeenCalledWith('frame:request:close', {
				source: 'user',
			})
		})
	})
})
