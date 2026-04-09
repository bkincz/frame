import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFrameRouter } from '../useFrameRouter'

const { mockFrameState, mockRouter, mockFrameApi } = vi.hoisted(() => {
	const mockFrameState = {
		isOpen: false as boolean,
		currentFlow: null as string | null,
		currentStepKey: null as string | null,
		flowHistory: [] as string[],
		stepHistory: [] as string[],
	}

	const mockRouter = {
		params: {} as Record<string, string | null>,
		updateParams: vi.fn(),
		replaceParams: vi.fn(),
		setParam: vi.fn(),
		clearParams: vi.fn(),
		goBack: vi.fn(),
		goForward: vi.fn(),
		isBrowserNavigating: vi.fn(() => false),
		consumeBrowserNavigation: vi.fn(),
		pathname: '/',
		search: '',
	}

	const mockFrameApi = {
		openFrame: vi.fn(),
		closeFrame: vi.fn(),
		cacheFlowDefinition: vi.fn(),
		getFlowDefinition: vi.fn(),
		selectStepKeys: vi.fn(() => ['entry', 'details']),
		selectCurrentStepIndex: vi.fn(() => 0),
		nextStep: vi.fn(),
		previousStep: vi.fn(),
		setStepKey: vi.fn(),
		goBackInHistory: vi.fn(() => false),
		goBackInStepHistory: vi.fn(() => false),
		goToStep: vi.fn(),
		getState: vi.fn(() => mockFrameState),
	}

	return {
		mockFrameState,
		mockRouter,
		mockFrameApi,
	}
})

vi.mock('@bkincz/clutch', () => ({
	useStateMachine: vi.fn(() => ({ state: mockFrameState })),
}))

vi.mock('@/state/frame.state', () => ({
	default: mockFrameApi,
}))

vi.mock('@/state/animation.state', () => ({
	default: {
		selectIsAnimating: vi.fn(() => false),
	},
}))

vi.mock('@/core/frame.functions', () => ({
	flowExists: vi.fn(() => true),
	createFlowDefinition: vi.fn(() => ({
		flow: {
			entry: {},
			details: {},
		},
	})),
}))

vi.mock('@/lib/event', () => ({
	customEventManager: {
		subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
		emit: vi.fn(),
	},
}))

vi.mock('@/lib/router', () => ({
	useRouter: vi.fn(() => mockRouter),
}))

describe('useFrameRouter', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockRouter.params = {}
		mockRouter.isBrowserNavigating.mockReturnValue(false)
		mockFrameState.isOpen = false
		mockFrameState.currentFlow = null
		mockFrameState.currentStepKey = null
		mockFrameApi.getFlowDefinition.mockReturnValue({
			flow: {
				entry: {},
				details: {},
			},
		})
	})

	it('opens a step from a step-key URL', () => {
		mockRouter.params = {
			flow: 'example',
			step: 'details',
		}

		renderHook(() => useFrameRouter({ stepUrlMode: 'key' }))

		expect(mockFrameApi.openFrame).toHaveBeenCalledWith(
			'example',
			'details',
			undefined,
			false
		)
	})

	it('normalizes a missing step to the first key when requested', () => {
		mockRouter.params = {
			flow: 'example',
			step: null,
		}

		renderHook(() => useFrameRouter({ stepUrlMode: 'key', normalizeStepUrl: true }))

		expect(mockRouter.replaceParams).toHaveBeenCalledWith({
			flow: 'example',
			step: 'entry',
		})
		expect(mockFrameApi.openFrame).not.toHaveBeenCalled()
	})

	it('writes step keys to the URL when configured', () => {
		const { result } = renderHook(() => useFrameRouter({ stepUrlMode: 'key' }))

		result.current.openFlow('example', 'details')

		expect(mockRouter.updateParams).toHaveBeenCalledWith({
			flow: 'example',
			step: 'details',
		})
	})
})
