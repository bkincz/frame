/*
 *   BASE
 **********************************************************************************************************/
import * as TablerIcons from '@tabler/icons-react'

/*
 *   INTERFACE/TYPES
 **********************************************************************************************************/
import type { FC, ComponentType } from 'react'
import type { BaseInterface } from '@/types/generic'

export interface IconProps extends BaseInterface {
	icon?: string
	size?: number
	stroke?: number
	fill?: 'filled' | 'none'
}

/*
 *   COMPONENT
 **********************************************************************************************************/
export const Icon: FC<IconProps> = ({
	className,
	style,
	icon = 'IconQuestionMark',
	size = 24,
	stroke = 1.5,
	fill = 'none',
	...rest
}) => {
	// Get the icon component from Tabler Icons
	const IconComponent = (TablerIcons[icon as keyof typeof TablerIcons] ||
		TablerIcons.IconQuestionMark) as ComponentType<{
		size?: number
		stroke?: number
		fill?: string
		className?: string
		style?: React.CSSProperties
	}>

	// Log warning if icon not found
	if (!TablerIcons[icon as keyof typeof TablerIcons] && icon !== 'IconQuestionMark') {
		console.warn(`Icon named "${icon}" not found, using fallback icon`)
	}

	return (
		<IconComponent
			size={size}
			stroke={stroke}
			fill={fill === 'filled' ? 'currentColor' : 'none'}
			className={className}
			style={style}
			{...rest}
		/>
	)
}
