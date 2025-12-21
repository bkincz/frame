/*
 *   BASE
 **********************************************************************************************************/
import * as TablerIcons from '@tabler/icons-react'
import clsx from 'clsx'

import { useTooltip } from '@/components/tooltip'

/*
 *   STYLES
 **********************************************************************************************************/
import styles from './icon.module.scss'

/*
 *   INTERFACE/TYPES
 **********************************************************************************************************/
import type { FC, MouseEventHandler, ComponentType } from 'react'
import type { BaseInterface } from '@/types/generic'

export interface IconProps extends BaseInterface {
	icon?: string
	size?: number
	stroke?: number
	tooltip?: string
	onClick?: MouseEventHandler<HTMLDivElement>
	noDefaultStyling?: boolean
	color?: 'primary' | 'success' | 'error' | 'info' | 'default'
	variant?: 'filled' | 'outlined'
	rounded?: boolean
	disabled?: boolean
}

/*
 *   COMPONENT
 **********************************************************************************************************/
export const Icon: FC<IconProps> = ({
	className,
	icon = 'IconQuestionMark',
	size = 24,
	stroke = 1.5,
	color = 'default',
	variant = 'filled',
	rounded = false,
	tooltip,
	onClick,
	disabled,
	noDefaultStyling = true,
	...rest
}) => {
	const { showTooltip, hideTooltip, Tooltip } = useTooltip({
		delay: 350,
	})

	const icons = TablerIcons
	let IconComponent = icons.IconQuestionMark as ComponentType<{
		size?: number
		stroke?: number
		className?: string
	}>

	if (icon && (icons as any)[icon]) {
		IconComponent = (icons as any)[icon] as ComponentType<{
			size?: number
			stroke?: number
			className?: string
		}>
	} else if (icon !== 'IconQuestionMark') {
		console.warn(`Icon named "${icon}" not found, using fallback icon`)
	}

	const isDefaultColor = color === 'default'
	const hasColorBackground = color && color !== 'default'
	const effectiveColor = !onClick && isDefaultColor ? 'primary' : color
	const isOutlined = variant === 'outlined'

	return (
		<>
			<div
				className={clsx(
					{
						[styles.icon]:
							!noDefaultStyling &&
							!onClick &&
							effectiveColor !== 'default' &&
							!isOutlined,
						[styles.interactive]:
							!noDefaultStyling &&
							(effectiveColor === 'default' || (onClick && !hasColorBackground)),
						[styles.interactiveColored]:
							!noDefaultStyling && onClick && hasColorBackground && !isOutlined,
						[styles.interactiveOutlined]:
							!noDefaultStyling && onClick && hasColorBackground && isOutlined,
						[styles[`${effectiveColor}`]]:
							!noDefaultStyling && effectiveColor !== 'default' && !isOutlined,
						[styles[`${effectiveColor}Outlined`]]:
							!noDefaultStyling && effectiveColor !== 'default' && isOutlined,
						[styles.rounded]: rounded,
						[styles.disabled]: disabled,
					},
					className
				)}
				style={{
					width: size,
					height: size,
				}}
				onClick={disabled ? undefined : onClick}
				onMouseEnter={tooltip ? () => showTooltip(tooltip) : undefined}
				onMouseLeave={tooltip ? hideTooltip : undefined}
				{...rest}
			>
				<IconComponent
					size={size}
					stroke={stroke}
					className={
						onClick && hasColorBackground && !isOutlined ? styles.whiteIcon : undefined
					}
				/>
			</div>
			{Tooltip}
		</>
	)
}
