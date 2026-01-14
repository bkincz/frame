/*
 *   TYPES
 **********************************************************************************************************/
export interface IconProps {
	size?: number
	stroke?: number
	className?: string
}

/*
 *   ICONS
 **********************************************************************************************************/
export const IconArrowLeft = ({ size = 24, stroke = 2, className }: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M5 12h14" />
		<path d="M5 12l6 6" />
		<path d="M5 12l6-6" />
	</svg>
)

export const IconArrowRight = ({ size = 24, stroke = 2, className }: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M5 12h14" />
		<path d="M13 18l6-6" />
		<path d="M13 6l6 6" />
	</svg>
)

export const IconX = ({ size = 24, stroke = 2, className }: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M18 6L6 18" />
		<path d="M6 6l12 12" />
	</svg>
)
