/*
 *   IMPORTS
 ***************************************************************************************************/
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { FrameContainer } from '../frame.container'
import { customEventManager } from '@/lib/event'
import { useFrameAnimations } from '@/hooks/useFrameAnimations'
import type { FlowDefinition } from '@/types/flow.types'

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
	Frame.Overlay = ({ children, onClick }: any) => (
		<div data-testid="frame-overlay" onClick={onClick}>
			{children}
		</div>
	)
	Frame.Content = ({ children, onClick }: any) => (
		<div data-testid="frame-content" onClick={onClick}>
			{children}
		</div>
	)
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

	describe('Animation Callbacks', () => {
		beforeEach(() => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})
			mockUseStateMachine.mockReturnValue({
				state: { hasFrameInit: true, flowOpenCount: 1 },
			})
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)
		})

		it('should update rendered step via onStepChange callback', async () => {
			render(<FrameContainer />)

			const animConfig = vi.mocked(useFrameAnimations).mock.calls[0][3] as any
			act(() => animConfig.onStepChange('step-2'))

			await waitFor(() => {
				expect(screen.getByText('Step 2 Content')).toBeInTheDocument()
			})
		})

		it('should update rendered flow and step via onFlowChange callback', async () => {
			render(<FrameContainer />)

			const animConfig = vi.mocked(useFrameAnimations).mock.calls[0][3] as any
			act(() => animConfig.onFlowChange('test-flow', 'step-2'))

			await waitFor(() => {
				expect(screen.getByText('Step 2 Content')).toBeInTheDocument()
			})
		})
	})

	describe('Flow Transitions', () => {
		it('should call animateFlowTransition on flow change', async () => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})
			mockUseStateMachine.mockReturnValue({
				state: { hasFrameInit: true, flowOpenCount: 1 },
			})
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)

			const { rerender } = render(<FrameContainer />)

			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'flow-2',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})

			rerender(<FrameContainer />)

			await waitFor(() => {
				expect(mockAnimateFlowTransition).toHaveBeenCalledWith('flow-2', 'step-1')
			})
		})

		it('should sync flow immediately on initial open (null → flow)', async () => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: false,
				currentFlow: null,
				currentStepKey: null,
				closeFlow: mockCloseFlow,
			})
			mockUseStateMachine.mockReturnValue({
				state: { hasFrameInit: false, flowOpenCount: 0 },
			})
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)

			const { rerender } = render(<FrameContainer />)

			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})

			rerender(<FrameContainer />)

			await waitFor(() => {
				expect(screen.getByText('Step 1 Content')).toBeInTheDocument()
			})
		})
	})

	describe('Overlay Click', () => {
		beforeEach(() => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})
			mockUseStateMachine.mockReturnValue({
				state: { hasFrameInit: true, flowOpenCount: 1 },
			})
		})

		it('should trigger close when overlay is clicked in modal variant', async () => {
			const modalFlowDef: FlowDefinition = {
				...mockFlowDefinition,
				config: { variant: 'modal' },
			}
			mockGetFlowDefinition.mockReturnValue(modalFlowDef)

			render(<FrameContainer />)

			const overlay = screen.getByTestId('frame-overlay')
			overlay.click()

			await waitFor(() => {
				expect(mockAnimateFrameExit).toHaveBeenCalled()
			})
		})
	})

	describe('Close Behavior', () => {
		beforeEach(() => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})
			mockUseStateMachine.mockReturnValue({
				state: { hasFrameInit: true, flowOpenCount: 1 },
			})
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)
		})

		it('should trigger close when Escape key is pressed', async () => {
			render(<FrameContainer />)

			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

			await waitFor(() => {
				expect(mockAnimateFrameExit).toHaveBeenCalled()
			})
		})

		it('should not trigger close for non-Escape keys', async () => {
			render(<FrameContainer />)

			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

			expect(mockAnimateFrameExit).not.toHaveBeenCalled()
		})

		it('should trigger close when frame:request:close event is received', async () => {
			let closeCallback: ((...args: any[]) => void) | undefined

			vi.mocked(customEventManager.subscribe).mockImplementation(
				(event: string, callback: any) => {
					if (event === 'frame:request:close') closeCallback = callback
					return { unsubscribe: vi.fn() }
				}
			)

			render(<FrameContainer />)

			closeCallback?.()

			await waitFor(() => {
				expect(mockAnimateFrameExit).toHaveBeenCalled()
			})
		})
	})

	describe('Error States', () => {
		beforeEach(() => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})
			mockUseStateMachine.mockReturnValue({
				state: { hasFrameInit: true, flowOpenCount: 1 },
			})
		})

		it('should render nothing when flow definition is not found', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
			mockGetFlowDefinition.mockReturnValue(null)

			const { container } = render(<FrameContainer />)

			expect(container.firstChild).toBeNull()
			expect(consoleSpy).toHaveBeenCalledWith(
				'[FrameContainer] Flow "test-flow" not found in state cache'
			)

			consoleSpy.mockRestore()
		})

		it('should render nothing when currentFlow is null but isOpen is true', () => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: null,
				currentStepKey: null,
				closeFlow: mockCloseFlow,
			})
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)

			const { container } = render(<FrameContainer />)

			expect(container.firstChild).toBeNull()
		})

		it('should render nothing when currentStepKey is null', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: null,
				closeFlow: mockCloseFlow,
			})
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)

			const { container } = render(<FrameContainer />)

			expect(container.firstChild).toBeNull()
			expect(consoleSpy).toHaveBeenCalledWith(
				'[FrameContainer] No valid step key in flow "test-flow"'
			)

			consoleSpy.mockRestore()
		})
	})

	describe('Step Change Events', () => {
		beforeEach(() => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})
			mockUseStateMachine.mockReturnValue({
				state: { hasFrameInit: false, flowOpenCount: 1 },
			})
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)
		})

		it('should sync step immediately when skipAnimation is true', async () => {
			let stepChangeCallback: ((...args: any[]) => void) | undefined

			vi.mocked(customEventManager.subscribe).mockImplementation(
				(event: string, callback: any) => {
					if (event === 'frame:step:change') stepChangeCallback = callback
					return { unsubscribe: vi.fn() }
				}
			)

			render(<FrameContainer />)

			stepChangeCallback?.({ stepKey: 'step-2', skipAnimation: true })

			await waitFor(() => {
				expect(screen.getByText('Step 2 Content')).toBeInTheDocument()
			})
		})

		it('should sync step immediately when frame has not initialized', async () => {
			let stepChangeCallback: ((...args: any[]) => void) | undefined

			vi.mocked(customEventManager.subscribe).mockImplementation(
				(event: string, callback: any) => {
					if (event === 'frame:step:change') stepChangeCallback = callback
					return { unsubscribe: vi.fn() }
				}
			)

			render(<FrameContainer />)

			stepChangeCallback?.({ stepKey: 'step-2', skipAnimation: false })

			await waitFor(() => {
				expect(screen.getByText('Step 2 Content')).toBeInTheDocument()
			})
		})
	})

	describe('Content Click', () => {
		beforeEach(() => {
			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})
			mockUseStateMachine.mockReturnValue({
				state: { hasFrameInit: true, flowOpenCount: 1 },
			})
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)
		})

		it('should stop propagation when content area is clicked', () => {
			render(<FrameContainer />)

			const clickEvent = new MouseEvent('click', { bubbles: true })
			const stopPropagation = vi.spyOn(clickEvent, 'stopPropagation')

			screen.getByTestId('frame-content').dispatchEvent(clickEvent)

			expect(stopPropagation).toHaveBeenCalled()
		})
	})

	describe('Debug Mode', () => {
		it('should pass debug prop to hooks', () => {
			render(<FrameContainer debug={true} />)

			expect(mockUseFrameRouter).toHaveBeenCalledWith({ debug: true })
		})

		it('should log step sync when debug is true and hasFrameInit is false', async () => {
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})
			mockUseStateMachine.mockReturnValue({
				state: { hasFrameInit: false, flowOpenCount: 1 },
			})
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)

			let stepChangeCallback: ((...args: any[]) => void) | undefined
			vi.mocked(customEventManager.subscribe).mockImplementation(
				(event: string, callback: any) => {
					if (event === 'frame:step:change') stepChangeCallback = callback
					return { unsubscribe: vi.fn() }
				}
			)

			render(<FrameContainer debug={true} />)
			stepChangeCallback?.({ stepKey: 'step-2', skipAnimation: false })

			await waitFor(() => {
				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining('[FrameContainer]'),
					expect.anything()
				)
			})

			consoleSpy.mockRestore()
		})

		it('should log flow sync when debug is true and frame opens initially', async () => {
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

			mockUseFrameRouter.mockReturnValue({
				isOpen: false,
				currentFlow: null,
				currentStepKey: null,
				closeFlow: mockCloseFlow,
			})
			mockUseStateMachine.mockReturnValue({
				state: { hasFrameInit: false, flowOpenCount: 0 },
			})
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)

			const { rerender } = render(<FrameContainer debug={true} />)

			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})

			rerender(<FrameContainer debug={true} />)

			await waitFor(() => {
				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining('[FrameContainer]'),
					expect.anything()
				)
			})

			consoleSpy.mockRestore()
		})

		it('should log flow transition when debug is true and flow changes', async () => {
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'test-flow',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})
			mockUseStateMachine.mockReturnValue({
				state: { hasFrameInit: true, flowOpenCount: 1 },
			})
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)

			const { rerender } = render(<FrameContainer debug={true} />)

			mockUseFrameRouter.mockReturnValue({
				isOpen: true,
				currentFlow: 'flow-2',
				currentStepKey: 'step-1',
				closeFlow: mockCloseFlow,
			})
			rerender(<FrameContainer debug={true} />)

			await waitFor(() => {
				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining('[FrameContainer]'),
					expect.anything()
				)
			})

			consoleSpy.mockRestore()
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

	describe('Layout Configuration', () => {
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
		})

		it('should use default layout when no layout is configured', () => {
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)

			render(<FrameContainer />)

			// Default layout renders the standard frame components
			expect(screen.getByTestId('frame-content')).toBeInTheDocument()
			expect(screen.getByTestId('frame-main')).toBeInTheDocument()
		})

		it('should use children render function when provided', () => {
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)

			render(
				<FrameContainer>
					{({ Frame }) => (
						<Frame>
							<div data-testid="custom-children-layout">Custom Children Layout</div>
						</Frame>
					)}
				</FrameContainer>
			)

			expect(screen.getByTestId('custom-children-layout')).toBeInTheDocument()
			expect(screen.getByText('Custom Children Layout')).toBeInTheDocument()
		})

		it('should use flow-level layout when configured', () => {
			const CustomFlowLayout = () => <div data-testid="custom-flow-layout">Flow Layout</div>

			const flowWithLayout: FlowDefinition = {
				flow: {
					'step-1': {
						heading: 'Step 1',
						subheading: 'First step',
						components: [() => <div>Step 1 Content</div>],
					},
				},
				config: {
					layout: CustomFlowLayout,
				},
			}

			mockGetFlowDefinition.mockReturnValue(flowWithLayout)

			render(<FrameContainer />)

			expect(screen.getByTestId('custom-flow-layout')).toBeInTheDocument()
			expect(screen.getByText('Flow Layout')).toBeInTheDocument()
		})

		it('should use step-level layout when configured', () => {
			const CustomStepLayout = () => <div data-testid="custom-step-layout">Step Layout</div>

			const flowWithStepLayout: FlowDefinition = {
				flow: {
					'step-1': {
						heading: 'Step 1',
						subheading: 'First step',
						components: [() => <div>Step 1 Content</div>],
						config: {
							layout: CustomStepLayout,
						},
					},
				},
				config: {},
			}

			mockGetFlowDefinition.mockReturnValue(flowWithStepLayout)

			render(<FrameContainer />)

			expect(screen.getByTestId('custom-step-layout')).toBeInTheDocument()
			expect(screen.getByText('Step Layout')).toBeInTheDocument()
		})

		it('should prioritize step layout over flow layout', () => {
			const FlowLayout = () => <div data-testid="flow-layout">Flow Layout</div>
			const StepLayout = () => <div data-testid="step-layout">Step Layout</div>

			const flowWithBothLayouts: FlowDefinition = {
				flow: {
					'step-1': {
						heading: 'Step 1',
						subheading: 'First step',
						components: [() => <div>Step 1 Content</div>],
						config: {
							layout: StepLayout,
						},
					},
				},
				config: {
					layout: FlowLayout,
				},
			}

			mockGetFlowDefinition.mockReturnValue(flowWithBothLayouts)

			render(<FrameContainer />)

			expect(screen.getByTestId('step-layout')).toBeInTheDocument()
			expect(screen.queryByTestId('flow-layout')).not.toBeInTheDocument()
		})

		it('should prioritize step layout over children prop', () => {
			const StepLayout = () => <div data-testid="step-layout">Step Layout</div>

			const flowWithStepLayout: FlowDefinition = {
				flow: {
					'step-1': {
						heading: 'Step 1',
						subheading: 'First step',
						components: [() => <div>Step 1 Content</div>],
						config: {
							layout: StepLayout,
						},
					},
				},
				config: {},
			}

			mockGetFlowDefinition.mockReturnValue(flowWithStepLayout)

			render(
				<FrameContainer>
					{() => <div data-testid="children-layout">Children Layout</div>}
				</FrameContainer>
			)

			expect(screen.getByTestId('step-layout')).toBeInTheDocument()
			expect(screen.queryByTestId('children-layout')).not.toBeInTheDocument()
		})

		it('should prioritize flow layout over children prop', () => {
			const FlowLayout = () => <div data-testid="flow-layout">Flow Layout</div>

			const flowWithLayout: FlowDefinition = {
				flow: {
					'step-1': {
						heading: 'Step 1',
						subheading: 'First step',
						components: [() => <div>Step 1 Content</div>],
					},
				},
				config: {
					layout: FlowLayout,
				},
			}

			mockGetFlowDefinition.mockReturnValue(flowWithLayout)

			render(
				<FrameContainer>
					{() => <div data-testid="children-layout">Children Layout</div>}
				</FrameContainer>
			)

			expect(screen.getByTestId('flow-layout')).toBeInTheDocument()
			expect(screen.queryByTestId('children-layout')).not.toBeInTheDocument()
		})

		it('should fall back to children prop when no step or flow layout is configured', () => {
			mockGetFlowDefinition.mockReturnValue(mockFlowDefinition)

			render(
				<FrameContainer>
					{({ Frame }) => (
						<Frame>
							<div data-testid="fallback-children">Fallback to Children</div>
						</Frame>
					)}
				</FrameContainer>
			)

			expect(screen.getByTestId('fallback-children')).toBeInTheDocument()
		})

		it('should pass render props to custom layouts', () => {
			const CustomLayout = vi.fn(({ state, Frame }) => (
				<Frame>
					<div data-testid="custom-with-props">
						Flow: {state.currentFlow}, Step: {state.currentStepKey}
					</div>
				</Frame>
			))

			const flowWithLayout: FlowDefinition = {
				flow: {
					'step-1': {
						heading: 'Step 1',
						subheading: 'First step',
						components: [() => <div>Step 1 Content</div>],
					},
				},
				config: {
					layout: CustomLayout,
				},
			}

			mockGetFlowDefinition.mockReturnValue(flowWithLayout)

			render(<FrameContainer />)

			expect(CustomLayout).toHaveBeenCalled()
			expect(screen.getByTestId('custom-with-props')).toBeInTheDocument()
			expect(screen.getByText(/Flow: test-flow/)).toBeInTheDocument()
			expect(screen.getByText(/Step: step-1/)).toBeInTheDocument()
		})
	})
})
