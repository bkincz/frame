/*
 *   IMPORTS
 ***************************************************************************************************/
import clsx from 'clsx'

/*
 *   SHARED
 ***************************************************************************************************/
import { Action, type ActionProps } from './action.component'
import { getColorVariantClass } from './action.functions'

/*
 *   STYLES
 ***************************************************************************************************/
import styles from './action.module.scss'

/*
 *   BUTTON COMPONENT
 ***************************************************************************************************/
const Button = (p: ActionProps) => {
	const { color = 'primary', variant = 'solid', disabled, loading } = p
	const colorVariantClass = getColorVariantClass(color, variant, disabled || loading)

	return (
		<Action className={clsx(styles[colorVariantClass])} {...p}>
			{p.adornment && <Action.Adornment />}
			<Action.Label />
		</Action>
	)
}

/*
 *   EXPORTED
 ***************************************************************************************************/
export { Action, Button }
