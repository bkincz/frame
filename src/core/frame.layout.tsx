/*
 *   DEFAULT FRAME LAYOUT
 ***************************************************************************************************/
import type { FrameRenderProps } from './frame.types'

/**
 * Default frame layout component.
 * This is the built-in layout that is used when no custom layout is provided.
 * Developers can use this as a reference when building custom layouts.
 *
 * @param props - The frame render props provided by FrameContainer
 *
 * @example
 * ```tsx
 * // Use this as a template for custom layouts
 * function MyCustomLayout({ refs, handlers, state, Frame }: FrameRenderProps) {
 *   return (
 *     <Frame>
 *       <Frame.Overlay ref={refs.overlay} onClick={handlers.handleOverlayClick} />
 *       <Frame.Content ref={refs.content} onClick={handlers.stopPropagation} variant={state.variant}>
 *         // Your custom layout here
 *       </Frame.Content>
 *     </Frame>
 *   )
 * }
 * ```
 */
export function DefaultFrameLayout({ refs, handlers, state, Frame }: FrameRenderProps) {
	return (
		<Frame>
			{state.showOverlay && (
				<Frame.Overlay ref={refs.overlay} onClick={handlers.handleOverlayClick} />
			)}
			<Frame.Content
				ref={refs.content}
				onClick={handlers.stopPropagation}
				data-step-key={state.renderedStepKey || ''}
				variant={state.variant}
			>
				<Frame.Close />
				<Frame.Grid className={!state.showSidebar ? 'noSidebar' : undefined}>
					<Frame.Main ref={refs.stepWrapper}>
						{state.currentStep ? (
							<>
								{state.currentStep.heading && (
									<Frame.Heading>{state.currentStep.heading}</Frame.Heading>
								)}
								{state.currentStep.subheading && (
									<Frame.Subheading>
										{state.currentStep.subheading}
									</Frame.Subheading>
								)}
								<Frame.Step step={state.currentStep} />
							</>
						) : (
							<Frame.NotFound stepKey={state.renderedStepKey || ''} />
						)}
					</Frame.Main>
					{state.showSidebar && <Frame.Sidebar />}
					<Frame.Navigation />
				</Frame.Grid>
			</Frame.Content>
		</Frame>
	)
}
