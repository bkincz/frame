/*
 *   TOOLTIP COMPONENT
 *   Tooltip component with direct DOM manipulation for instant positioning
 ***************************************************************************************************/
import { type FC, type ReactNode, useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import gsap from 'gsap'

/*
 *   STYLES
 **********************************************************************************************************/
import styles from './tooltip.module.scss'

/*
 *   TYPES
 **********************************************************************************************************/
export interface TooltipProps {
	visible: boolean
	children: ReactNode
	className?: string
	offset?: { x: number; y: number }
	placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
	maxWidth?: number
	delay?: number
	variant?: 'default' | 'warning' | 'error'
}

/*
 *   COMPONENT
 **********************************************************************************************************/
export const Tooltip: FC<TooltipProps> = ({
	visible,
	children,
	className,
	offset = { x: 0, y: -18 },
	placement = 'top',
	maxWidth = 200,
	delay,
	variant = 'default',
}) => {
	const tooltipRef = useRef<HTMLDivElement>(null)
	const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
	const [isPositioned, setIsPositioned] = useState(false)
	const [showAfterDelay, setShowAfterDelay] = useState(false)
	const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	// Create or get portal root
	useEffect(() => {
		let root = document.getElementById('tooltip-portal-root')
		if (!root) {
			root = document.createElement('div')
			root.id = 'tooltip-portal-root'
			root.style.position = 'absolute'
			root.style.top = '0'
			root.style.left = '0'
			root.style.pointerEvents = 'none'
			root.style.zIndex = '10000'
			document.body.appendChild(root)
		}
		setPortalRoot(root)

		return () => {
			// Clean up portal root if no tooltips are using it
			if (root && root.parentNode && root.children.length === 0) {
				root.parentNode.removeChild(root)
			}
		}
	}, [])

	// Position calculation function with direct DOM manipulation
	const calculateAndApplyPosition = useCallback(
		(mouseX: number, mouseY: number) => {
			if (!tooltipRef.current || !visible) return

			const viewportWidth = window.innerWidth
			const viewportHeight = window.innerHeight
			const padding = 10

			// Use actual dimensions for accurate positioning
			const rect = tooltipRef.current.getBoundingClientRect()
			const tooltipWidth = rect.width || 150
			const tooltipHeight = rect.height || 30

			let finalX = mouseX + offset.x
			let finalY = mouseY + offset.y

			// Auto placement logic
			if (placement === 'auto' || placement === 'top') {
				if (mouseY - tooltipHeight - Math.abs(offset.y) < padding) {
					finalY = mouseY + Math.abs(offset.y) + 5
				} else {
					finalY = mouseY - tooltipHeight + offset.y
				}
				finalX = mouseX - tooltipWidth / 2
			} else if (placement === 'bottom') {
				finalY = mouseY + Math.abs(offset.y) + 5
				finalX = mouseX - tooltipWidth / 2
			} else if (placement === 'left') {
				finalX = mouseX - tooltipWidth + offset.x
				finalY = mouseY - tooltipHeight / 2
			} else if (placement === 'right') {
				finalX = mouseX + Math.abs(offset.x)
				finalY = mouseY - tooltipHeight / 2
			}

			// Viewport bounds checking
			if (finalX + tooltipWidth > viewportWidth - padding) {
				finalX = viewportWidth - tooltipWidth - padding
			}
			if (finalX < padding) {
				finalX = padding
			}

			if (finalY + tooltipHeight > viewportHeight - padding) {
				finalY = viewportHeight - tooltipHeight - padding
			}
			if (finalY < padding) {
				finalY = padding
			}

			// Direct DOM manipulation for instant positioning
			tooltipRef.current.style.transform = `translate(${Math.round(finalX)}px, ${Math.round(finalY)}px)`
			setIsPositioned(true)
		},
		[visible, placement, offset.x, offset.y]
	)

	// Handle delay
	useEffect(() => {
		if (visible && delay !== undefined) {
			delayTimeoutRef.current = setTimeout(() => {
				setShowAfterDelay(true)
			}, delay)
		} else if (visible && delay === undefined) {
			setShowAfterDelay(true)
		} else {
			if (delayTimeoutRef.current) {
				clearTimeout(delayTimeoutRef.current)
			}
			setShowAfterDelay(false)
		}

		return () => {
			if (delayTimeoutRef.current) {
				clearTimeout(delayTimeoutRef.current)
			}
		}
	}, [visible, delay])

	// Animate tooltip visibility with GSAP
	useEffect(() => {
		if (!tooltipRef.current) return

		if (visible && isPositioned && showAfterDelay) {
			// Only fade in after positioning is complete and delay has passed
			gsap.fromTo(
				tooltipRef.current,
				{ opacity: 0 },
				{
					opacity: 1,
					duration: 0.15,
					ease: 'power2.out',
				}
			)
		} else if (!visible) {
			gsap.to(tooltipRef.current, {
				opacity: 0,
				duration: 0.15,
				ease: 'power2.in',
				onComplete: () => {
					setIsPositioned(false)
				},
			})
		}
	}, [visible, isPositioned, showAfterDelay])

	// Mouse tracking with direct DOM manipulation
	useEffect(() => {
		if (!visible) return

		const handleMouseMove = (event: MouseEvent) => {
			calculateAndApplyPosition(event.clientX, event.clientY)
		}

		window.addEventListener('mousemove', handleMouseMove)
		return () => window.removeEventListener('mousemove', handleMouseMove)
	}, [visible, calculateAndApplyPosition])

	const tooltipElement = (
		<div
			ref={tooltipRef}
			data-testid="tooltip"
			className={clsx(
				styles.tooltip,
				{
					[styles.warning]: variant === 'warning',
					[styles.error]: variant === 'error',
					[styles.visible]: visible && isPositioned && showAfterDelay,
					[styles.hidden]: !visible || !isPositioned || !showAfterDelay,
				},
				className
			)}
			style={{
				position: 'fixed',
				left: 0,
				top: 0,
				maxWidth: maxWidth,
				pointerEvents: 'none',
				willChange: 'transform, opacity',
				transform: 'translate(0px, 0px)',
				opacity: 0,
			}}
		>
			{children}
		</div>
	)

	// Only render if we have a portal root and the tooltip should be visible
	return portalRoot && visible ? createPortal(tooltipElement, portalRoot) : null
}
