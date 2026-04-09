/*
 *   IMPORTS
 ***************************************************************************************************/
import { useEffect, useCallback, useRef, useState } from 'react'
import { useStateSlice } from '@bkincz/clutch'

/*
 *   SHARED
 ***************************************************************************************************/
import { Frame } from './frame.component'
import { DefaultFrameLayout } from './frame.layout'
import { useFrameRouter } from '@/hooks/useFrameRouter'
import { useFrameAnimations } from '@/hooks/useFrameAnimations'
import { useFlowLifecycle } from '@/hooks/useFlowLifecycle'
import { useStepLifecycle } from '@/hooks/useStepLifecycle'
import { useInertManagement } from '@/hooks/useInertManagement'
import { useHistoryLock } from '@/hooks/useHistoryLock'
import FrameState from '@/state/frame.state'
import { customEventManager } from '@/lib/event'

/*
 *   TYPES
 ***************************************************************************************************/
import type { FrameRenderFunction, FrameRenderProps } from './frame.types'
import type { FrameRouterConfig } from '@/hooks/useFrameRouter'

export interface FrameContainerProps {
	/** Enable debug logging to console (default: false) */
	debug?: boolean
	/** Optional router configuration passed through to useFrameRouter */
	router?: Omit<FrameRouterConfig, 'debug'>
	/**
	 * Optional render function for custom layouts.
	 * When provided, gives full control over the Frame layout structure.
	 * When omitted, uses the default layout.
	 *
	 * The render function receives refs, handlers, state, and the Frame component.
	 * Required elements: Frame, Frame.Overlay (modal only), Frame.Content, Frame.Main, Frame.Step
	 *
	 * @example
	 * ```tsx
	 * <FrameContainer>
	 *   {({ refs, handlers, state, Frame }) => (
	 *     <Frame>
	 *       {state.showOverlay && <Frame.Overlay ref={refs.overlay} onClick={handlers.handleOverlayClick} />}
	 *       <Frame.Content ref={refs.content} onClick={handlers.stopPropagation} variant={state.variant}>
	 *         <Frame.Main ref={refs.stepWrapper}>
	 *           <Frame.Step step={state.currentStep} />
	 *         </Frame.Main>
	 *       </Frame.Content>
	 *     </Frame>
	 *   )}
	 * </FrameContainer>
	 * ```
	 */
	children?: FrameRenderFunction
}

/*
 *   FRAME CONTAINER
 *   Smart component that orchestrates the frame routing and rendering
 ***************************************************************************************************/

/**
 * The main Frame container component that manages flow rendering and animations.
 * This component should be placed at the root of your application.
 *
 * @param props - Component props
 * @param props.debug - Enable debug logging to console (default: false)
 * @param props.children - Optional render function for custom layouts
 *
 * @example
 * Default usage:
 * ```tsx
 * import { FrameContainer } from '@bkincz/frame'
 *
 * function App() {
 *   return (
 *     <>
 *       <YourApp />
 *       <FrameContainer debug={false} />
 *     </>
 *   )
 * }
 * ```
 *
 * @example
 * Custom layout with render prop:
 * ```tsx
 * <FrameContainer debug={false}>
 *   {({ refs, handlers, state, Frame }) => (
 *     <Frame>
 *       {state.showOverlay && (
 *         <Frame.Overlay ref={refs.overlay} onClick={handlers.handleOverlayClick} />
 *       )}
 *       <Frame.Content ref={refs.content} onClick={handlers.stopPropagation} variant={state.variant}>
 *         <div className="custom-layout">
 *           <Frame.Main ref={refs.stepWrapper}>
 *             {state.currentStep && <Frame.Step step={state.currentStep} />}
 *           </Frame.Main>
 *           <div className="custom-nav">
 *             <Frame.Back />
 *             <Frame.Next />
 *           </div>
 *         </div>
 *       </Frame.Content>
 *     </Frame>
 *   )}
 * </FrameContainer>
 * ```
 */
const selectHasFrameInit = (s: { hasFrameInit: boolean }) => s.hasFrameInit
const selectFlowOpenCount = (s: { flowOpenCount: number }) => s.flowOpenCount

export function FrameContainer({ debug = false, router, children }: FrameContainerProps) {
	const { isOpen, currentFlow, currentStepKey, closeFlow } = useFrameRouter({
		debug,
		...router,
	})

	useHistoryLock(isOpen)

	const hasFrameInit = useStateSlice(FrameState, selectHasFrameInit)
	const flowOpenCount = useStateSlice(FrameState, selectFlowOpenCount)

	// Refs for animation
	const overlayRef = useRef<HTMLDivElement | null>(null)
	const contentRef = useRef<HTMLDivElement | null>(null)
	const stepWrapperRef = useRef<HTMLDivElement | null>(null)

	// Track the current rendered step and flow for transitions
	const [renderedStepKey, setRenderedStepKey] = useState<string | null>(currentStepKey)
	const [renderedFlow, setRenderedFlow] = useState<string | null>(currentFlow)

	// Animation hook with memoized callbacks
	const handleStepChange = (stepKey: string) => setRenderedStepKey(stepKey)
	const handleFlowChange = (flowName: string | null, stepKey: string | null) => {
		setRenderedFlow(flowName)
		if (stepKey) setRenderedStepKey(stepKey)
	}

	const { animateFrameEntrance, animateFrameExit, animateFlowTransition } = useFrameAnimations(
		stepWrapperRef,
		overlayRef,
		contentRef,
		{
			debug,
			onStepChange: handleStepChange,
			onFlowChange: handleFlowChange,
		}
	)

	// Get flow definition from state cache (optimized lookup)
	const flowDefinition =
		(renderedFlow && FrameState.getFlowDefinition(renderedFlow)) ||
		(currentFlow && FrameState.getFlowDefinition(currentFlow)) ||
		null

	// Get current step (use renderedStepKey for smooth transitions)
	const currentStep =
		flowDefinition && renderedStepKey ? flowDefinition.flow[renderedStepKey] : null

	// Determine variant (step config > flow config > default 'fullscreen')
	const variant = currentStep?.config?.variant || flowDefinition?.config?.variant || 'fullscreen'
	const showOverlay = variant === 'modal'

	const sidebarConfig = currentStep?.config?.sidebar ?? flowDefinition?.config?.sidebar ?? true
	const showSidebar = variant === 'modal' ? false : sidebarConfig !== false

	const inertConfig = currentStep?.config?.inert ?? flowDefinition?.config?.inert ?? {}

	useFlowLifecycle(isOpen, currentFlow, flowDefinition)
	useStepLifecycle(currentStepKey, flowDefinition)

	useInertManagement({
		isOpen,
		isModal: showOverlay,
		config: inertConfig,
		debug,
	})

	// This handles cases where animations don't run (e.g., frame not initialized yet, browser navigation)
	useEffect(() => {
		if (!isOpen) return

		const subscription = customEventManager.subscribe('frame:step:change', data => {
			// If frame hasn't been initialized or animation is skipped, sync immediately
			if (!hasFrameInit || data.skipAnimation) {
				if (debug) {
					console.log('[FrameContainer] Direct step sync (no animation):', {
						to: data.stepKey,
						reason: !hasFrameInit ? 'frame not init' : 'browser navigation',
					})
				}
				setRenderedStepKey(data.stepKey)
			}
			// Otherwise, animation will handle the update via the callback
		})

		return () => subscription.unsubscribe()
	}, [isOpen, hasFrameInit, debug])

	useEffect(() => {
		if (!isOpen) return

		const cleanup = animateFrameEntrance(variant)
		return cleanup
	}, [isOpen, variant, animateFrameEntrance])

	useEffect(() => {
		// Only sync without animation if one of them is null (initial open or close)
		const isInitialOpen = !renderedFlow && currentFlow
		const isClosing = renderedFlow && !currentFlow

		if (isInitialOpen || isClosing) {
			if (debug) {
				console.log('[FrameContainer] Flow state sync (no animation):', {
					from: renderedFlow,
					to: currentFlow,
					reason: isInitialOpen ? 'initial open' : 'closing',
				})
			}
			setRenderedFlow(currentFlow)
			setRenderedStepKey(currentStepKey)
			return
		}

		// Don't run transition animations until frame has been initialized
		if (!hasFrameInit) return

		// Detect flow change or same-flow reopen (after initialization)
		const isFlowChange = currentFlow && renderedFlow && currentFlow !== renderedFlow
		const isSameFlowReopen = currentFlow && renderedFlow === currentFlow && flowOpenCount > 1

		if (isFlowChange || isSameFlowReopen) {
			if (debug) {
				console.log('[FrameContainer] Flow transition triggered:', {
					type: isFlowChange ? 'flow change' : 'same flow reopen',
					from: renderedFlow,
					to: currentFlow,
				})
			}

			// Use hook to animate flow transition
			animateFlowTransition(currentFlow, currentStepKey)
		}
	}, [
		currentFlow,
		renderedFlow,
		currentStepKey,
		flowOpenCount,
		hasFrameInit,
		debug,
		animateFlowTransition,
	])

	const triggerClose = useCallback(() => {
		animateFrameExit(closeFlow)
	}, [animateFrameExit, closeFlow])

	useEffect(() => {
		if (!isOpen) return

		const closeSubscription = customEventManager.subscribe('frame:request:close', triggerClose)

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') triggerClose()
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			closeSubscription.unsubscribe()
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen, triggerClose])

	const handleOverlayClick = () => {
		triggerClose()
	}

	const handleContentClick = (event: React.MouseEvent) => {
		event.stopPropagation()
	}

	// Don't render if not open
	if (!isOpen || !currentFlow) {
		return null
	}

	// Flow not found in cache
	if (!flowDefinition) {
		console.error(`[FrameContainer] Flow "${currentFlow}" not found in state cache`)
		return null
	}

	// No valid step key
	if (!currentStepKey) {
		console.error(`[FrameContainer] No valid step key in flow "${currentFlow}"`)
		return null
	}

	// Prepare props for render function
	const renderProps: FrameRenderProps = {
		refs: {
			overlay: overlayRef,
			content: contentRef,
			stepWrapper: stepWrapperRef,
		},
		handlers: {
			closeFrame: triggerClose,
			stopPropagation: handleContentClick,
			handleOverlayClick: handleOverlayClick,
		},
		state: {
			isOpen,
			currentFlow,
			currentStepKey,
			renderedStepKey,
			currentStep,
			variant,
			showOverlay,
			showSidebar,
		},
		Frame,
	}

	const stepLayout = currentStep?.config?.layout
	const flowLayout = flowDefinition?.config?.layout
	const Layout = stepLayout || flowLayout || children || DefaultFrameLayout

	return <Layout {...renderProps} />
}
