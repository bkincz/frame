/*
 *   BASE
 **********************************************************************************************************/
import { useState, useEffect, useRef, type RefObject } from 'react'

/*
 *   HOOK
 **********************************************************************************************************/
export const useElementDimensions = <T extends HTMLElement = HTMLElement>(): [
	RefObject<T>,
	{ width: number; height: number },
] => {
	const ref = useRef<T>(null)
	const [dimensions, setDimensions] = useState({
		width: 0,
		height: 0,
	})

	useEffect(() => {
		const element = ref.current
		if (!element) return

		const resizeObserver = new ResizeObserver(entries => {
			if (!entries || entries.length === 0) return

			const entry = entries[0]
			const { width, height } = entry.contentRect

			setDimensions({
				width: Math.round(width),
				height: Math.round(height),
			})
		})

		resizeObserver.observe(element)

		return () => {
			resizeObserver.disconnect()
		}
	}, [])

	return [ref as RefObject<T>, dimensions]
}
