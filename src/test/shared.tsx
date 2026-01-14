/*
 *   IMPORTS
 ***************************************************************************************************/
import { vi } from 'vitest'

/*
 *   COMMON MOCKS
 ***************************************************************************************************/
/**
 * Mock GSAP for router transition tests
 */
export const mockGsap = () => {
	vi.mock('gsap', () => ({
		default: {
			timeline: vi.fn(() => ({
				to: vi.fn().mockReturnThis(),
				from: vi.fn().mockReturnThis(),
				fromTo: vi.fn().mockReturnThis(),
				set: vi.fn().mockReturnThis(),
				play: vi.fn().mockReturnThis(),
			})),
			to: vi.fn(),
			from: vi.fn(),
			fromTo: vi.fn(),
			set: vi.fn(),
		},
	}))
}

/**
 * Mock Icon component for testing
 */
export const createMockIcon = () => {
	return vi.fn(
		({
			icon,
			size,
			className,
			noDefaultStyling,
		}: {
			icon?: string
			size?: number
			className?: string
			noDefaultStyling?: boolean
		}) => (
			<div
				data-testid="icon"
				data-icon={icon}
				data-size={size}
				data-no-styling={noDefaultStyling}
				className={className}
			>
				Icon
			</div>
		)
	)
}

/**
 * Mock genUUID function
 */
export const mockGenUUID = () => {
	return vi.fn(() => 'test-uuid')
}

/**
 * Mock Tabler Icons for Icon component tests
 */
export const mockTablerIcons = () => {
	return {
		IconQuestionMark: ({ size, stroke }: { size?: number; stroke?: number }) => (
			<div
				data-testid="tabler-icon"
				data-icon="IconQuestionMark"
				data-size={size}
				data-stroke={stroke}
			>
				?
			</div>
		),
		IconPlus: ({ size, stroke }: { size?: number; stroke?: number }) => (
			<div
				data-testid="tabler-icon"
				data-icon="IconPlus"
				data-size={size}
				data-stroke={stroke}
			>
				+
			</div>
		),
		IconCheck: ({ size, stroke }: { size?: number; stroke?: number }) => (
			<div
				data-testid="tabler-icon"
				data-icon="IconCheck"
				data-size={size}
				data-stroke={stroke}
			>
				✓
			</div>
		),
	}
}

/**
 * Mock useTooltip hook
 */
export const mockUseTooltip = (): {
	showTooltip: ReturnType<typeof vi.fn>
	hideTooltip: ReturnType<typeof vi.fn>
	Tooltip: null
} => {
	return {
		showTooltip: vi.fn(),
		hideTooltip: vi.fn(),
		Tooltip: null,
	}
}
