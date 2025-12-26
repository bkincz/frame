/*
 *   USE TOOLTIP HOOK
 *   React hook for managing tooltip state and rendering
 ***************************************************************************************************/
import { type ReactNode, useState, useCallback } from 'react'
import { Tooltip } from './tooltip.component'

/*
 *   TYPES
 **********************************************************************************************************/
import type { TooltipProps } from './tooltip.component'

export interface UseTooltipOptions {
	placement?: TooltipProps['placement']
	offset?: TooltipProps['offset']
	maxWidth?: TooltipProps['maxWidth']
	className?: string
	delay?: number
	variant?: TooltipProps['variant']
}

export interface TooltipState {
	visible: boolean

	content: any
}

/*
 *   HOOK
 **********************************************************************************************************/
export function useTooltip<T = ReactNode>(options?: UseTooltipOptions) {
	const [tooltipState, setTooltipState] = useState<TooltipState>({
		visible: false,
		content: null,
	})

	const showTooltip = useCallback((content: T) => {
		setTooltipState({
			visible: true,
			content,
		})
	}, [])

	const hideTooltip = useCallback(() => {
		setTooltipState({
			visible: false,
			content: null,
		})
	}, [])

	const updateTooltipContent = useCallback((content: T) => {
		setTooltipState(prev => ({
			...prev,
			content,
		}))
	}, [])

	const TooltipComponent = (
		<Tooltip
			visible={tooltipState.visible}
			placement={options?.placement}
			offset={options?.offset}
			maxWidth={options?.maxWidth}
			className={options?.className}
			delay={options?.delay}
			variant={options?.variant}
		>
			{tooltipState.content}
		</Tooltip>
	)

	return {
		tooltipState,
		showTooltip,
		hideTooltip,
		updateTooltipContent,
		Tooltip: TooltipComponent,
	}
}
