/*
 *   IMPORTS
 **********************************************************************************************************/
import clsx from 'clsx'
import { Icon } from '@/components/icon'

/*
 *   STYLES
 **********************************************************************************************************/
import styles from './button.module.scss'

/*
 *   TYPES
 **********************************************************************************************************/
import type { FC, MouseEvent, ReactNode } from 'react'
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
	...rest
}) => {
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
	const iconAdornment = adornment ? (
		<Icon
			icon={adornment.name}
			size={adornment.size ?? 18}
			stroke={adornment.stroke ?? 2}
			noDefaultStyling
		/>
	) : null

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

	// For icon variant with adornment prop, render the icon directly
	const iconContent = variant === 'icon' && adornment ? iconAdornment : children

	return (
		<button
			{...rest}
			type={type}
			className={buttonClasses}
			style={style}
			onClick={handleClick}
			disabled={disabled || loading}
			aria-label={label}
		>
			{renderAdornments(effectiveStartAdornment)}
			{(label || iconContent) && variant !== 'icon' ? (
				<span className={styles.buttonLabel}>{label || iconContent}</span>
			) : (
				variant === 'icon' && iconContent
			)}
			{renderAdornments(effectiveEndAdornment)}
		</button>
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
 *    // Icon button with children (traditional)
 *    <Button
 *      color="primary"
 *      variant="icon"
 *    >
 *      <Icon icon="IconPlus" />
 *    </Button>
 *
 *    // Icon button with adornment prop (new pattern)
 *    <Button
 *      color="primary"
 *      variant="icon"
 *      adornment={{
 *        position: 'start',
 *        name: 'IconArrowLeft',
 *        size: 24,
 *        stroke: 2,
 *      }}
 *    />
 *
 *    // Outlined icon button
 *    <Button
 *      color="error"
 *      variant="outlined"
 *      adornment={{
 *        position: 'start',
 *        name: 'IconTrash',
 *        size: 20,
 *        stroke: 2,
 *      }}
 *    />
 **********************************************************************************************************/
