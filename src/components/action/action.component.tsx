/*
 *   BASE
 **********************************************************************************************************/
import clsx from 'clsx'

import { Icon, type IconProps } from '@/components/icon'
import { genUUID } from '@/lib/functions'

/*
 *   STYLES
 **********************************************************************************************************/
import styles from './action.module.scss'

/*
 *   TYPES
 **********************************************************************************************************/
import { createContext, useContext, type Context, type MouseEvent } from 'react'
import type {
	BaseInterface,
	InteractiveColors,
	InteractiveSizes,
	InteractiveVariants,
} from '@/types/generic'

export interface ActionProps extends BaseInterface {
	type?: 'button' | 'submit'
	onClick?: (e: MouseEvent<HTMLButtonElement>) => void
	label?: string
	variant?: InteractiveVariants
	color?: InteractiveColors
	size?: InteractiveSizes
	loading?: boolean
	disabled?: boolean
	adornment?: IconProps
	inline?: boolean
}

/*
 *   CONTEXT
 **********************************************************************************************************/
const ActionContext: Context<ActionProps> = createContext({})

/*
 *   COMPONENT
 **********************************************************************************************************/
export const Action = (p: ActionProps) => {
	const {
		className,
		style,
		children,
		disabled = false,
		loading = false,
		label,
		onClick,
		type = 'button',
		adornment,
		inline,
	} = p

	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		if (disabled || loading) {
			e.preventDefault()
			return
		}
		onClick?.(e)
	}

	// Determine additional classes
	const hasAdornment = !!adornment
	const hasLabel = !!label
	const iconOnly = hasAdornment && !hasLabel

	return (
		<ActionContext.Provider value={p}>
			<button
				type={type}
				className={clsx(
					styles.action,
					{
						[styles.hasAdornment]: hasAdornment,
						[styles.iconOnly]: iconOnly,
						[styles.inline]: inline,
					},
					className
				)}
				style={style}
				onClick={handleClick}
				disabled={disabled || loading}
				aria-label={label}
			>
				{children}
			</button>
		</ActionContext.Provider>
	)
}

Action.Adornment = ({ className }: BaseInterface) => {
	const { adornment, inline } = useContext(ActionContext)

	return (
		<div
			key={genUUID()}
			className={clsx(styles.adornment, { [styles.inline]: inline }, className)}
		>
			<Icon noDefaultStyling {...adornment} size={inline ? 20 : adornment?.size} />
		</div>
	)
}

Action.Label = ({ className }: BaseInterface) => {
	const { label, inline } = useContext(ActionContext)

	return (
		<span className={clsx(styles.label, { [styles.inline]: inline }, className)}>{label}</span>
	)
}
