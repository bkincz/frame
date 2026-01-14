/*
 *   EVENT TYPE REGISTRY
 *   Maps event names to their expected data payloads for type safety
 ***************************************************************************************************/

/**
 * Registry mapping event names to their data payload types
 * Add new events here to get type checking and autocomplete
 */
export interface EventDataMap {
	// Request Events (user actions)
	'frame:request:close': { source?: string }
	'frame:request:open': { flow: string; stepKey?: string; chain?: boolean }
	'frame:request:next': void
	'frame:request:previous': void
	'frame:request:back': void

	// Lifecycle Events (state changes)
	'frame:open': { flow: string; stepKey: string }
	'frame:close': void
	'frame:step:change': { stepKey: string; previousStepKey: string | null }
	'frame:flow:change': { flow: string; previousFlow: string | null }
	'frame:step:enter': { flow: string; stepKey: string }
	'frame:step:exit': { flow: string; stepKey: string }
	'frame:flow:enter': { flow: string }
	'frame:flow:exit': { flow: string }

	// Navigation Events
	'frame:navigation:next': { flow: string; fromStepKey: string; toStepKey: string }
	'frame:navigation:previous': { flow: string; fromStepKey: string; toStepKey: string }
	'frame:navigation:history-back': { fromFlow: string; toFlow: string; toStepKey: string }
}

/**
 * All valid event type strings
 */
export type EventType = keyof EventDataMap

/**
 * Get the data type for a specific event
 */
export type EventData<T extends EventType> = EventDataMap[T]
