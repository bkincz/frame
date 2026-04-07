/*
 *   IMPORTS
 ***************************************************************************************************/
import { useEffect } from 'react'

/*
 *   STATE
 ***************************************************************************************************/
import FrameState from '@/state/frame.state'
import StepState from '@/state/step.state'
import { customEventManager } from '@/lib/event'

/*
 *   TYPES
 ***************************************************************************************************/
import type { FlowDefinition } from '@/types/flow.types'

/*
 *   HOOK
 ***************************************************************************************************/
export function useStepLifecycle(
	currentStepKey: string | null,
	flowDefinition: FlowDefinition | null
) {
	useEffect(() => {
		if (!currentStepKey) return

		const step = flowDefinition?.flow[currentStepKey]
		if (!step) return

		// Skip this step if skipIf returns true
		if (step.skipIf && step.skipIf()) {
			customEventManager.emit('frame:request:next', {})
			return
		}

		let isActive = true

		const runStepEnter = async () => {
			if (step.onEnter) {
				try {
					StepState.startEntering()
					await step.onEnter()
					if (!isActive) return
					FrameState.markStepEntered()
					StepState.endEntering()
				} catch (error) {
					if (!isActive) return
					console.error(`[useStepLifecycle] Error in step onEnter:`, error)
					StepState.endEntering()
				}
			}
		}

		runStepEnter()

		return () => {
			isActive = false

			const runStepExit = async () => {
				if (step.onExit) {
					try {
						StepState.startExiting()
						await step.onExit()
						FrameState.markStepExited()
						StepState.endExiting()
					} catch (error) {
						console.error(`[useStepLifecycle] Error in step onExit:`, error)
						StepState.endExiting()
					}
				}
			}

			runStepExit()
		}
		// Only depend on currentStepKey - prevents re-runs if flow definition reference changes
		// flowDefinition is cached and stable, so accessing it inside effect is safe
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStepKey])
}
