/*
 *   IMPORTS
 **********************************************************************************************************/
import clsx from 'clsx'
import { useTooltip } from '@/components/tooltip'

/*
 *   STYLES
 **********************************************************************************************************/
import styles from './button.module.scss'

/*
 *   TYPES
 **********************************************************************************************************/
import type { FC, MouseEvent, ReactNode } from 'react'
import { useRef } from 'react'
import type {
	BaseInterface,
	InteractiveColors,
	InteractiveSizes,
	InteractiveVariants,
} from '@/types/generic'

type Adornment = ReactNode | ReactNode[]

export interface ButtonProps extends BaseInterface {
	type?: 'button' | 'submit'
	onClick?: (e: MouseEvent<HTMLButtonElement>) => void
	label?: string
	variant?: InteractiveVariants
	color?: InteractiveColors
	size?: InteractiveSizes
	loading?: boolean
	disabled?: boolean
	startAdornment?: Adornment
	endAdornment?: Adornment
	tooltip?: string | ReactNode
}

/*
 *   COMPONENT
 **********************************************************************************************************/
export const Button: FC<ButtonProps> = ({
	className,
	style,
	children,
	color = 'primary',
	disabled = false,
	loading = false,
	size = 'medium',
	variant = 'solid',
	startAdornment,
	endAdornment,
	label,
	onClick,
	type = 'button',
	tooltip,
	...rest
}) => {
	const buttonRef = useRef<HTMLButtonElement>(null)

	const tooltipHook = useTooltip({
		offset: {
			x: 0,
			y: -28,
		},
	})

	const renderAdornments = (adornments: Adornment | undefined) => {
		if (!adornments) return null

		const adornmentArray = Array.isArray(adornments) ? adornments : [adornments]

		return adornmentArray.map((adornment, index) => (
			<div key={index} className={styles.adornmentItem}>
				{adornment}
			</div>
		))
	}

	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		if (disabled || loading) {
			e.preventDefault()
			return
		}
		onClick?.(e)
	}

	const variantClass = styles[`${variant.charAt(0) + variant.slice(1)}`]
	const colorVariantClass =
		disabled || loading
			? styles[`colorDisabled${variant.charAt(0).toUpperCase() + variant.slice(1)}`]
			: styles[
					`color${color.charAt(0).toUpperCase() + color.slice(1)}${variant.charAt(0).toUpperCase() + variant.slice(1)}`
				]

	const buttonClasses = clsx(
		styles.buttonWrapper,
		styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
		colorVariantClass,
		variantClass,
		startAdornment && styles.hasStartAdornment,
		endAdornment && styles.hasEndAdornment,
		className
	)

	const isIconVariant = variant === 'iconSolid' || variant === 'iconOutlined'

	return (
		<>
			<button
				{...rest}
				ref={buttonRef}
				type={type}
				className={buttonClasses}
				style={style}
				onClick={handleClick}
				disabled={disabled || loading}
				aria-label={label}
				onMouseEnter={
					tooltip ? () => tooltipHook.showTooltip(tooltip, buttonRef.current) : undefined
				}
				onMouseLeave={tooltip ? tooltipHook.hideTooltip : undefined}
			>
				{!isIconVariant && renderAdornments(startAdornment)}
				{(label || children) && !isIconVariant ? (
					<span className={styles.buttonLabel}>{label || children}</span>
				) : (
					isIconVariant && children
				)}
				{!isIconVariant && renderAdornments(endAdornment)}
			</button>
			{tooltip && tooltipHook.Tooltip}
		</>
	)
}

Button.displayName = 'Button'
