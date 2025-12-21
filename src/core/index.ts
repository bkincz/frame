/*
 *   CORE EXPORTS
 ***************************************************************************************************/
export { Frame } from './frame.component'
export type { FrameProps } from './frame.component'

export { FrameContainer } from './frame.container'
export type { FrameContainerProps } from './frame.container'

export * from './frame.registry'
export * from './frame.functions'

// Frame API exports
import * as FrameAPIModule from './frame.api'
export { FrameAPIModule as FrameAPI }
