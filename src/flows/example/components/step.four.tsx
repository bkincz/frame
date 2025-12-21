/*
 *   IMPORTS
 ***************************************************************************************************/
import clsx from 'clsx'

/*
 *   STYLES
 **********************************************************************************************************/
import styles from './step.module.scss'

/*
 *   TYPES
 **********************************************************************************************************/
import type { BaseInterface } from '@/types/generic'

/*
 *   COMPONENT
 **********************************************************************************************************/
export const StepFour = ({ className, children, ...rest }: BaseInterface) => {
	return (
		<section className={clsx(styles.step, className)} {...rest}>
			{children}
		</section>
	)
}
