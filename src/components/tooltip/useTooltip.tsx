/*
 *   USE TOOLTIP HOOK
 *   React hook for managing tooltip state and rendering
 ***************************************************************************************************/
import { type ReactNode, useState, useCallback } from 'react'
import { Tooltip, type TooltipProps } from './tooltip.component'

/*
 *   TYPES
 **********************************************************************************************************/

export interface UseTooltipOptions {
	placement?: TooltipProps['placement']
	offset?: TooltipProps['offset']
	maxWidth?: TooltipProps['maxWidth']
	className?: string
	delay?: number
	variant?: TooltipProps['variant']
	anchorElement?: HTMLElement | null
}

export interface TooltipState<T = ReactNode> {
	visible: boolean
	content: T | null
	anchorElement?: HTMLElement | null
}

/*
 *   HOOK
 **********************************************************************************************************/
export function useTooltip<T extends ReactNode = ReactNode>(options?: UseTooltipOptions) {
	const [tooltipState, setTooltipState] = useState<TooltipState<T>>({
		visible: false,
		content: null,
		anchorElement: options?.anchorElement || null,
	})

	const showTooltip = useCallback((content: T, anchorElement?: HTMLElement | null) => {
		setTooltipState({
			visible: true,
			content,
			anchorElement: anchorElement || null,
		})
	}, [])

	const hideTooltip = useCallback(() => {
		setTooltipState({
			visible: false,
			content: null,
			anchorElement: null,
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
			anchorElement={tooltipState.anchorElement}
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
