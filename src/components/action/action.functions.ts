/*
 *   BASE
 **********************************************************************************************************/
import { capitalize } from '@/lib/functions'

/*
 *   TYPES
 **********************************************************************************************************/
import type { InteractiveColors, InteractiveVariants } from '@/types/generic'

/*
 *   HELPER FUNCTIONS
 **********************************************************************************************************/
export const getColorVariantClass = (
	color?: InteractiveColors,
	variant?: InteractiveVariants,
	disabled?: boolean
): string => {
	if (disabled) {
		return `color${capitalize('disabled')}${capitalize(variant || 'solid')}`
	}

	if (!color || !variant) {
		return `color${capitalize('primary')}${capitalize('solid')}`
	}

	return `color${capitalize(color)}${capitalize(variant)}`
}
