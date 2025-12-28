/*
 *   IMPORTS
 **********************************************************************************************************/
import clsx from 'clsx'
import * as TablerIcons from '@tabler/icons-react'
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

export interface IconAdornment {
	position: 'start' | 'end'
	name: string
	size?: number
	stroke?: number
}

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
	adornment?: IconAdornment
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
	adornment,
	label,
	onClick,
	type = 'button',
	tooltip,
	...rest
}) => {
	// Button ref for tooltip positioning
	const buttonRef = useRef<HTMLButtonElement>(null)

	// Initialize tooltip if tooltip prop is provided
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

	// Handle adornment prop for icon buttons
	const iconAdornment = adornment
		? (() => {
				const IconComponent = TablerIcons[
					adornment.name as keyof typeof TablerIcons
				] as React.ComponentType<{
					size?: number
					stroke?: number
				}>
				return IconComponent ? (
					<IconComponent size={adornment.size ?? 18} stroke={adornment.stroke ?? 2} />
				) : null
			})()
		: null

	// Determine effective adornments based on adornment prop
	const effectiveStartAdornment =
		adornment && adornment.position === 'start' ? iconAdornment : startAdornment
	const effectiveEndAdornment =
		adornment && adornment.position === 'end' ? iconAdornment : endAdornment

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
		effectiveStartAdornment && styles.hasStartAdornment,
		effectiveEndAdornment && styles.hasEndAdornment,
		className
	)

	// For icon variants with adornment prop, render the icon directly
	const isIconVariant = variant === 'iconSolid' || variant === 'iconOutlined'
	const iconContent = isIconVariant && adornment ? iconAdornment : children

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
				{!isIconVariant && renderAdornments(effectiveStartAdornment)}
				{(label || iconContent) && !isIconVariant ? (
					<span className={styles.buttonLabel}>{label || iconContent}</span>
				) : (
					isIconVariant && iconContent
				)}
				{!isIconVariant && renderAdornments(effectiveEndAdornment)}
			</button>
			{tooltip && tooltipHook.Tooltip}
		</>
	)
}

Button.displayName = 'Button'

/*
 *  EXAMPLE USAGE:
 *
 *    // Standard button with adornments
 *    <Button
 *      color="primary"
 *      variant="outlined"
 *      size="small"
 *      startAdornment={<Icon icon="IconPlus" />}
 *      endAdornment={<Icon icon="IconChevronRight" />}
 *    >
 *      Button Label
 *    </Button>
 *
 *    // Solid icon button (circular, filled)
 *    <Button
 *      color="primary"
 *      variant="iconSolid"
 *      adornment={{
 *        position: 'start',
 *        name: 'IconPlus',
 *        size: 20,
 *        stroke: 2,
 *      }}
 *    />
 *
 *    // Outlined icon button (circular, with border)
 *    <Button
 *      color="success"
 *      variant="iconOutlined"
 *      adornment={{
 *        position: 'start',
 *        name: 'IconCheck',
 *        size: 20,
 *        stroke: 2,
 *      }}
 *    />
 *
 *    // Icon button with children (works with both variants)
 *    <Button
 *      color="error"
 *      variant="iconSolid"
 *    >
 *      <Icon icon="IconTrash" />
 *    </Button>
 *
 *    // Button with label and icon adornment
 *    <Button
 *      color="primary"
 *      variant="solid"
 *      label="Delete"
 *      adornment={{
 *        position: 'start',
 *        name: 'IconTrash',
 *        size: 18,
 *        stroke: 2,
 *      }}
 *    />
 **********************************************************************************************************/
