/*
 *   IMPORTS
 ***************************************************************************************************/
import { useEffect } from 'react'

/*
 *   STATE
 ***************************************************************************************************/
import FrameState from '@/state/frame.state'

/*
 *   TYPES
 ***************************************************************************************************/
import type { FlowDefinition } from '@/types/flow.types'

/*
 *   HOOK
 ***************************************************************************************************/
export function useFlowLifecycle(
	isOpen: boolean,
	currentFlow: string | null,
	flowDefinition: FlowDefinition | null
) {
	useEffect(() => {
		if (!isOpen || !currentFlow || !flowDefinition) return

		const isFlowEntered = FrameState.selectIsFlowEntered(currentFlow)
		if (isFlowEntered) return

		const runFlowEnter = async () => {
			if (flowDefinition.onEnter) {
				try {
					await flowDefinition.onEnter()
					FrameState.markFlowEntered(currentFlow)
				} catch (error) {
					console.error(`[useFlowLifecycle] Error in flow onEnter:`, error)
				}
			} else {
				FrameState.markFlowEntered(currentFlow)
			}
		}

		runFlowEnter()
	}, [isOpen, currentFlow, flowDefinition])

	useEffect(() => {
		return () => {
			if (!currentFlow || !flowDefinition?.onExit) return

			const isFlowEntered = FrameState.selectIsFlowEntered(currentFlow)
			if (!isFlowEntered) return

			const runFlowExit = async () => {
				try {
					if (flowDefinition.onExit) {
						await flowDefinition.onExit()
					}
					FrameState.markFlowExited(currentFlow)
				} catch (error) {
					console.error(`[useFlowLifecycle] Error in flow onExit:`, error)
				}
			}

			runFlowExit()
		}
	}, [currentFlow, flowDefinition])
}
