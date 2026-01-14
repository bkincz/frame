/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { FrameContainer } from '../frame.container'
import type { FlowDefinition } from '@/flows/flow.types'

/*
 *   MOCKS
 ***************************************************************************************************/
const mockFlowDefinition: FlowDefinition = {
	flow: {
		'step-1': {
			components: [() => <div>Step 1 Content</div>],
		},
		'step-2': {
			components: [() => <div>Step 2 Content</div>],
		},
	},
	config: {
		variant: 'fullscreen',
		sidebar: true,
	},
}

const {
	mockCloseFlow,
	mockAnimateFrameEntrance,
	mockAnimateFrameExit,
	mockAnimateFlowTransition,
	mockUseFrameRouter,
	mockUseStateMachine,
	mockGetFlowDefinition,
} = vi.hoisted(() => {
	const mockCloseFlow = vi.fn()
	const mockAnimateFrameEntrance = vi.fn(() => vi.fn())
	const mockAnimateFrameExit = vi.fn()
	const mockAnimateFlowTransition = vi.fn()
	const mockUseFrameRouter = vi.fn(() => ({
		isOpen: false as boolean,
		currentFlow: null as string | null,
		currentStepKey: null as string | null,
		closeFlow: mockCloseFlow,
	}))
	const mockUseStateMachine = vi.fn(() => ({
		state: {
			hasFrameInit: false,
			flowOpenCount: 0,
		},
	}))
	const mockGetFlowDefinition = vi.fn()

	return {
		mockCloseFlow,
		mockAnimateFrameEntrance,
		mockAnimateFrameExit,
		mockAnimateFlowTransition,
		mockUseFrameRouter,
		mockUseStateMachine,
		mockGetFlowDefinition,
	}
})

vi.mock('@/hooks/useFrameRouter', () => ({
	useFrameRouter: mockUseFrameRouter,
}))

vi.mock('@/hooks/useFrameAnimations', () => ({
	useFrameAnimations: vi.fn(() => ({
		animateFrameEntrance: mockAnimateFrameEntrance,
		animateFrameExit: mockAnimateFrameExit,
		animateFlowTransition: mockAnimateFlowTransition,
	})),
}))

vi.mock('@/hooks/useFlowLifecycle', () => ({
	useFlowLifecycle: vi.fn(),
}))

vi.mock('@/hooks/useStepLifecycle', () => ({
	useStepLifecycle: vi.fn(),
}))

vi.mock('@bkincz/clutch', () => ({
	useStateMachine: mockUseStateMachine,
}))

vi.mock('@/state/frame.state', () => ({
	default: {
		getFlowDefinition: mockGetFlowDefinition,
		markFrameInit: vi.fn(),
	},
}))

vi.mock('@/lib/event', () => ({
	customEventManager: {
		subscribe: vi.fn(() => ({
			unsubscribe: vi.fn(),
		})),
		emit: vi.fn(),
	},
}))

vi.mock('../frame.component', () => {
	const Frame = ({ children }: any) => <div data-testid="frame">{children}</div>
	Frame.Overlay = ({ children }: any) => <div data-testid="frame-overlay">{children}</div>
	Frame.Content = ({ children }: any) => <div data-testid="frame-content">{children}</div>
	Frame.Grid = ({ children }: any) => <div data-testid="frame-grid">{children}</div>
	Frame.Main = ({ children }: any) => <div data-testid="frame-main">{children}</div>
	Frame.Sidebar = ({ children }: any) => <div data-testid="frame-sidebar">{children}</div>
	Frame.Navigation = () => <div data-testid="frame-navigation">Navigation</div>
	Frame.Step = ({ step }: any) => (
		<div data-testid="frame-step">
			{step.components.map((Component: any, idx: number) => (
				<Component key={idx} />
			))}
		</div>
	)
	Frame.NotFound = ({ stepKey }: any) => <div data-testid="frame-not-found">{stepKey}</div>
	Frame.Close = () => <div data-testid="frame-close">Close</div>

	return { Frame }
})

/*
 *   TESTS
 ***************************************************************************************************/
describe('FrameContainer', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Closed State', () => {
		it('should render nothing when frame is closed', () => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: false,
				currentFlow: null,
				currentStepKey: null,
				closeFlow: mockCloseFlow,
			})

			const { container } = render(<FrameContainer />)

			expect(container.firstChild).toBeNull()
		})
	})

	describe('Open State', () => {
		beforeEach(() => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})

			mockUseStateMachine.mockReturnValue({
				state: {
					hasFrameInit: true,
					flowOpenCount: 1,
				},
			})

			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)
		})

		it('should render frame when open', () => {
			render(<FrameContainer />)

			expect(screen.getByTestId('frame-content')).toBeInTheDocument()
		})

		it('should render current step content', () => {
			render(<FrameContainer />)

			expect(screen.getByText('Step 1 Content')).toBeInTheDocument()
		})

		it('should render overlay for modal variant', () => {
			const modalFlowDef: FlowDefinition = {
				...mockFlowDefinition,
				config: {
					variant: 'modal',
				},
			}

			mockGetFlowDefinition.mockReturnValue(modalFlowDef)

			render(<FrameContainer />)

			expect(screen.getByTestId('frame-overlay')).toBeInTheDocument()
		})

		it('should not render overlay for fullscreen variant', () => {
			render(<FrameContainer />)

			expect(screen.queryByTestId('frame-overlay')).not.toBeInTheDocument()
		})

		it('should render sidebar when configured', () => {
			render(<FrameContainer />)

			expect(screen.getByTestId('frame-sidebar')).toBeInTheDocument()
		})

		it('should not render sidebar when disabled', () => {
			const noSidebarFlowDef: FlowDefinition = {
				...mockFlowDefinition,
				config: {
					sidebar: false,
				},
			}

			mockGetFlowDefinition.mockReturnValue(noSidebarFlowDef)

			render(<FrameContainer />)

			expect(screen.queryByTestId('frame-sidebar')).not.toBeInTheDocument()
		})

		it('should render navigation', () => {
			render(<FrameContainer />)

			expect(screen.getByTestId('frame-navigation')).toBeInTheDocument()
		})

		it('should render close button', () => {
			render(<FrameContainer />)

			expect(screen.getByTestId('frame-close')).toBeInTheDocument()
		})

		it('should render not found when step does not exist', () => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'invalid-step',
				closeFlow: mockCloseFlow,
			})

			render(<FrameContainer />)

			expect(screen.getByTestId('frame-not-found')).toBeInTheDocument()
		})
	})

	describe('Animations', () => {
		beforeEach(() => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})

			mockUseStateMachine.mockReturnValue({
				state: {
					hasFrameInit: true,
					flowOpenCount: 1,
				},
			})

			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)
		})

		it('should call animateFrameEntrance when opening', async () => {
			render(<FrameContainer />)

			await waitFor(() => {
				expect(mockAnimateFrameEntrance).toHaveBeenCalled()
			})
		})

		it('should pass variant to animateFrameEntrance', async () => {
			render(<FrameContainer />)

			await waitFor(() => {
				expect(mockAnimateFrameEntrance).toHaveBeenCalledWith('fullscreen')
			})
		})
	})

	describe('Debug Mode', () => {
		it('should pass debug prop to hooks', () => {
			render(<FrameContainer debug={true} />)

			expect(mockUseFrameRouter).toHaveBeenCalledWith({ debug: true })
		})
	})

	describe('Integration', () => {
		beforeEach(() => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: true as boolean,
				currentFlow: 'test-flow' as string | null,
				currentStepKey: 'step-1' as string | null,
				closeFlow: mockCloseFlow,
			})

			mockUseStateMachine.mockReturnValue({
				state: {
					hasFrameInit: true,
					flowOpenCount: 1,
				},
			})

			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)
		})

		it('should render container with all components', () => {
			render(<FrameContainer />)

			expect(screen.getByTestId('frame-content')).toBeInTheDocument()
			expect(screen.getByTestId('frame-main')).toBeInTheDocument()
			expect(screen.getByTestId('frame-step')).toBeInTheDocument()
		})
	})
})
