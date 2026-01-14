/*
 *   EVENT MANAGEMENT EXPORTS
 ***************************************************************************************************/
export { default as customEventManager } from './event.manager'
export type { CustomEventCallback, CustomEventSubscription } from './event.manager'

export { useCustomEvent, useCustomEventEmit } from './useCustomEvent'
export type { UseCustomEventOptions } from './useCustomEvent'

export type { EventType, EventData, EventDataMap } from './event.types'
