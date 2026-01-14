/*
 * IMPORTS
 ************************************************************************************************************************/
import type { ReactNode, CSSProperties, Ref } from 'react'

/*
 * TYPES
 ************************************************************************************************************************/
export interface BaseInterface {
	/**
	 * The id attribute is used to provide an identifier for the element, so that it can be referenced from outside the element's scope.
	 */
	id?: string
	/**
	 * The ref attribute is a special attribute that allows you to access a DOM element directly from your component.
	 */
	ref?: Ref<any>
	/**
	 * The className attribute is used to set or return the value of an element's class attribute. Using this property, the user can change the class of an element to the desired class.
	 */
	className?: string
	/**
	 * The children prop is a special prop, automatically passed to every component, that can be used to render the content included between the opening and closing tags when invoking a component.
	 * @default <></>
	 */
	children?: ReactNode

	/**
	 * The style prop accepts a JavaScript object with camelCased properties rather than a CSS string. This is consistent with the DOM style JavaScript property, is more efficient, and prevents XSS security holes.
	 * @example { marginTop: '10px', backgroundColor: 'blue' }
	 */
	style?: CSSProperties
}

/*
 *   INTERACTIVE
 **********************************************************************************************************/
export type InteractiveSizes = 'small' | 'medium' | 'large'
export type InteractiveVariants = 'solid' | 'outlined' | 'text' | 'iconSolid' | 'iconOutlined'
export type InteractiveColors = 'primary'
