/*
 *   IMPORTS
 ***************************************************************************************************/
import { useState, useEffect } from 'react'

/*
 *   SHARED
 ***************************************************************************************************/
import AnimationState from '@/state/animation.state'
import StepState from '@/state/step.state'
import FrameState from '@/state/frame.state'
import { isFirstStepOfRootFlow, isLastStepOfLeafFlow } from '@/core/frame.functions'

/*
 *   TYPES
 ***************************************************************************************************/
export interface NavigationStateConfig {
	direction: 'next' | 'previous'
}

export interface NavigationState {
	isDisabled: boolean
	isHidden: boolean
	canNavigate: boolean
}

/*
 *   HOOK
 ***************************************************************************************************/
export function useNavigationState(config: NavigationStateConfig): NavigationState {
	const { direction } = config

	const [isAnimating, setIsAnimating] = useState(AnimationState.selectIsAnimating())
	const [isInLifecycle, setIsInLifecycle] = useState(StepState.selectIsInLifecycle())
	const [frameState, setFrameState] = useState(FrameState.getState())

	// Subscribe to animation state changes
	useEffect(() => {
		const unsubscribe = AnimationState.subscribe(() => {
			setIsAnimating(AnimationState.selectIsAnimating())
		})
		return unsubscribe
	}, [])

	// Subscribe to step lifecycle state changes
	useEffect(() => {
		const unsubscribe = StepState.subscribe(() => {
			setIsInLifecycle(StepState.selectIsInLifecycle())
		})
		return unsubscribe
	}, [])

	// Subscribe to frame state changes (for config)
	useEffect(() => {
		const unsubscribe = FrameState.subscribe(() => {
			setFrameState(FrameState.getState())
		})
		return unsubscribe
	}, [])

	// Get current flow and step configuration
	const { currentFlow, currentStepKey } = frameState
	const flowDefinition = currentFlow ? FrameState.getFlowDefinition(currentFlow) : null
	const currentStep =
		flowDefinition && currentStepKey ? flowDefinition.flow[currentStepKey] : null

	// Check if button should be hidden based on config
	const footerConfig = currentStep?.config?.footer || flowDefinition?.config?.footer
	const isHiddenByConfig =
		direction === 'next' ? footerConfig?.hideNext === true : footerConfig?.hideBack === true

	// Check if navigation is available
	const stepKeys = flowDefinition ? Object.keys(flowDefinition.flow) : []
	const currentStepIndex = currentStepKey ? stepKeys.indexOf(currentStepKey) : -1
	const canNavigateNext = currentStepIndex >= 0 && currentStepIndex < stepKeys.length - 1
	const canNavigatePrevious = currentStepIndex > 0

	// Special cases: back on first step of root flow, or next on last step should close frame
	const isBackOnFirstStepOfRoot = direction === 'previous' && isFirstStepOfRootFlow()
	const isNextOnLastStep = direction === 'next' && isLastStepOfLeafFlow()

	const canNavigate = direction === 'next' ? canNavigateNext : canNavigatePrevious

	// Button is disabled if animating, in lifecycle operation, or (can't navigate AND not a close action)
	const isDisabled =
		isAnimating ||
		isInLifecycle ||
		(!canNavigate && !isBackOnFirstStepOfRoot && !isNextOnLastStep)

	// Button is hidden if config says to hide it
	const isHidden = isHiddenByConfig

	return {
		isDisabled,
		isHidden,
		canNavigate,
	}
}
