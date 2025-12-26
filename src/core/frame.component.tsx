/*
 *   IMPORTS
 ***************************************************************************************************/
import { isValidElement, forwardRef, useState, useEffect, type ReactNode } from 'react'
import clsx from 'clsx'
import { customEventManager } from '@/lib/event'

import type { FrameVariant } from '@/flows/flow.types'

/*
 *   SHARED COMPONENTS
 ***************************************************************************************************/
import { Icon } from '@/components/icon'
import { Button } from '@/components/button'

/*
 *   HOOKS
 ***************************************************************************************************/
import { useNavigationState } from '@/hooks/useNavigationState'

/*
 *   STATE
 ***************************************************************************************************/
import FrameState from '@/state/frame.state'

/*
 *   STYLES
 **********************************************************************************************************/
import styles from './frame.module.scss'

/*
 *   TYPES
 **********************************************************************************************************/
import type {
	BaseInterface,
	InteractiveVariants,
	InteractiveColors,
	InteractiveSizes,
} from '@/types/generic'
import type { MouseEvent } from 'react'
import type { Step } from '@/flows/flow.types'
import { isFirstStepOfRootFlow, isLastStepOfLeafFlow } from './frame.functions'

export interface FrameProps extends BaseInterface {}

export interface FrameOverlayProps extends BaseInterface {
	onClick?: () => void
}

export interface FrameContentProps extends BaseInterface {
	onClick?: (event: MouseEvent) => void
	variant?: FrameVariant
}

export interface FrameNavigationProps extends BaseInterface {
	label?: string
	variant?: InteractiveVariants
	color?: InteractiveColors
	size?: InteractiveSizes
	loading?: boolean
	startAdornment?: ReactNode
	endAdornment?: ReactNode
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

Frame.Back = ({ className, loading }: FrameNavigationProps) => {
	const { isDisabled, isHidden } = useNavigationState({ direction: 'previous' })

	function handleBack() {
		if (isDisabled) return

		if (isFirstStepOfRootFlow()) {
			customEventManager.emit('frame:request:close', { source: 'user' })
		} else {
			customEventManager.emit('frame:request:previous', {})
		}
	}

	if (isHidden) return null

	return (
		<Button
			className={clsx(styles.navigationBack, className)}
			onClick={handleBack}
			disabled={isDisabled}
			loading={loading}
			variant={'icon'}
		>
			<Icon icon="IconArrowLeft" size={24} />
		</Button>
	)
}

Frame.Next = ({
	className,
	children,
	label,
	variant = 'solid',
	color = 'primary',
	size,
	loading,
	startAdornment,
	endAdornment,
	style,
	...rest
}: FrameNavigationProps) => {
	const { isDisabled, isHidden } = useNavigationState({ direction: 'next' })

	function handleNext() {
		if (isDisabled) return
		if (isLastStepOfLeafFlow()) {
			customEventManager.emit('frame:request:close', { source: 'user' })
		} else {
			customEventManager.emit('frame:request:next', {})
		}
	}

	if (isHidden) return null

	const resolvedLabel = label ?? (typeof children === 'string' ? children : 'Next')
	const defaultEndAdornment = endAdornment ?? <Icon icon="IconArrowRight" size={24} />

	// Icon-only variant for no label
	if (!resolvedLabel && variant === 'icon') {
		return (
			<Button
				className={clsx(styles.navigationNext, className)}
				style={style}
				onClick={handleNext}
				disabled={isDisabled}
				loading={loading}
				variant="icon"
				color={color}
				{...rest}
			>
				<Icon icon="IconArrowRight" size={24} />
			</Button>
		)
	}

	// Regular button with label
	return (
		<Button
			className={clsx(styles.navigationNext, className)}
			style={style}
			onClick={handleNext}
			disabled={isDisabled}
			loading={loading}
			variant={variant}
			color={color}
			size={size}
			startAdornment={startAdornment}
			endAdornment={defaultEndAdornment}
			{...rest}
		>
			{resolvedLabel}
		</Button>
	)
}

Frame.Navigation = ({ className, ...rest }: Omit<BaseInterface, 'children'>) => {
	const [variant, setVariant] = useState<FrameVariant>(FrameState.selectVariant())

	useEffect(() => {
		const unsubscribe = FrameState.subscribe(() => {
			setVariant(FrameState.selectVariant())
		})
		return unsubscribe
	}, [])

	const navClassName = variant === 'modal' ? styles.navigationModal : styles.navigation

	return (
		<div className={clsx(navClassName, className)} {...rest}>
			<Frame.Back />
			<Frame.Next />
		</div>
	)
}

Frame.Close = ({ className, ...rest }: Omit<BaseInterface, 'children'>) => {
	const [variant, setVariant] = useState<FrameVariant>(FrameState.selectVariant())

	useEffect(() => {
		const unsubscribe = FrameState.subscribe(() => {
			setVariant(FrameState.selectVariant())
		})
		return unsubscribe
	}, [])

	function closeFrame() {
		customEventManager.emit('frame:request:close', { source: 'user' })
	}

	const closeClassName = variant === 'modal' ? styles.closeModal : styles.close

	return (
		<div className={clsx(closeClassName, className)} {...rest} onClick={closeFrame}>
			<Icon icon="IconX" tooltip="Close" />
		</div>
	)
}
