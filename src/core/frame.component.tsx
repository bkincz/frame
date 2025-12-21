/*
 *   IMPORTS
 ***************************************************************************************************/
import { isValidElement, forwardRef } from 'react'
import clsx from 'clsx'
import { customEventManager } from '@/lib/event'

import type { FrameVariant } from '@/flows/flow.types'

/*
 *   SHARED COMPONENTS
 ***************************************************************************************************/
import { Icon } from '@/components/icon'

/*
 *   STYLES
 **********************************************************************************************************/
import styles from './frame.module.scss'

/*
 *   TYPES
 **********************************************************************************************************/
import type { BaseInterface } from '@/types/generic'
import type { MouseEvent } from 'react'
import type { Step } from '@/flows/flow.types'

export interface FrameProps extends BaseInterface {}

export interface FrameOverlayProps extends BaseInterface {
	onClick?: () => void
}

export interface FrameContentProps extends BaseInterface {
	onClick?: (event: MouseEvent) => void
	variant?: FrameVariant
}

/*
 *   COMPONENT
 **********************************************************************************************************/
export const Frame = ({ className, children, ...rest }: FrameProps) => {
	return (
		<section className={clsx(styles.frame, className)} {...rest}>
			{children}
		</section>
	)
}

Frame.Overlay = forwardRef<HTMLDivElement, FrameOverlayProps>(
	({ className, children, onClick, ...rest }, ref) => {
		return (
			<div
				ref={ref}
				className={clsx(styles.backgroundOverlay, className)}
				onClick={onClick}
				{...rest}
			>
				{children}
			</div>
		)
	}
)

Frame.Overlay.displayName = 'Frame.Overlay'

Frame.Content = forwardRef<HTMLDivElement, FrameContentProps>(
	({ className, children, onClick, variant = 'fullscreen', ...rest }, ref) => {
		const contentClassName =
			variant === 'modal' ? styles.contentModal : styles.contentFullscreen

		return (
			<div
				ref={ref}
				className={clsx(contentClassName, className)}
				onClick={onClick}
				{...rest}
			>
				{children}
			</div>
		)
	}
)

Frame.Content.displayName = 'Frame.Content'

Frame.Footer = ({ className, children, ...rest }: BaseInterface) => {
	return (
		<div className={clsx(styles.footer, className)} {...rest}>
			{children}
		</div>
	)
}

Frame.Heading = ({ className, children, ...rest }: BaseInterface) => {
	return (
		<h1 className={clsx(styles.heading, className)} {...rest}>
			{children}
		</h1>
	)
}

Frame.Subheading = ({ className, children, ...rest }: BaseInterface) => {
	return (
		<p className={clsx(styles.subheading, className)} {...rest}>
			{children}
		</p>
	)
}

Frame.Step = ({ step }: { step: Step }) => {
	return (
		<>
			{step.components.map((Component, index) => {
				// Handle React elements (JSX with keys)
				if (isValidElement(Component)) {
					return Component
				}

				// Handle component functions
				if (typeof Component === 'function') {
					const key = `component-${index}`
					return <Component key={key} />
				}

				// Invalid component type
				if (process.env.NODE_ENV === 'development') {
					console.error(
						`[Frame.Step] Invalid component type at index ${index}:`,
						typeof Component
					)
				}
				return null
			})}

			<Frame.Navigation />
		</>
	)
}

Frame.NotFound = ({
	className,
	children,
	stepKey,
	...rest
}: BaseInterface & { stepKey: string }) => {
	return (
		<div className={clsx(styles.notFound, className)} {...rest}>
			<h2>Step Not Found</h2>
			<p>The step "{stepKey}" does not exist in this flow.</p>
			{children}
		</div>
	)
}

const FrameNavigationBack = ({ className, children, ...rest }: BaseInterface) => {
	function handleBack() {
		customEventManager.emit('frame:request:previous', {})
	}

	return (
		<button className={clsx(styles.navigationBack, className)} onClick={handleBack} {...rest}>
			{children || 'Back'}
		</button>
	)
}

const FrameNavigationNext = ({ className, children, ...rest }: BaseInterface) => {
	function handleNext() {
		customEventManager.emit('frame:request:next', {})
	}

	return (
		<button className={clsx(styles.navigationNext, className)} onClick={handleNext} {...rest}>
			{children || 'Next'}
		</button>
	)
}

const FrameNavigation = ({ className, ...rest }: Omit<BaseInterface, 'children'>) => {
	return (
		<div className={clsx(styles.navigation, className)} {...rest}>
			<FrameNavigationBack />
			<FrameNavigationNext />
		</div>
	)
}

Frame.Navigation = Object.assign(FrameNavigation, {
	Back: FrameNavigationBack,
	Next: FrameNavigationNext,
})

Frame.Close = ({ className, ...rest }: Omit<BaseInterface, 'children'>) => {
	function closeFrame() {
		// Emit event to request frame close
		// The useFrameRouter hook will listen and handle the actual close
		customEventManager.emit('frame:request:close', {})
	}

	return (
		<div className={clsx(styles.close, className)} {...rest}>
			<Icon icon="IconX" onClick={closeFrame} tooltip="Close" />
		</div>
	)
}
