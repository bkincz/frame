/*
 *   USE FRAME PARAMS
 *   Access flow params set when opening a flow via FrameAPI.openFlow(flow, step, params).
 *   Params are available in any step component within the current flow.
 ***************************************************************************************************/
import { useStateSlice } from '@bkincz/clutch'
import FrameState from '@/state/frame.state'

/**
 * Returns the params passed to FrameAPI.openFlow() for the current flow.
 * Params merge when flows chain — new params override existing keys.
 * Params are cleared when the frame closes.
 *
 * @example
 * ```tsx
 * // Opening with params
 * FrameAPI.openFlow('checkout', 'payment', { instanceId: '123', redirect: '/home' })
 *
 * // Reading in a step component
 * const { instanceId, redirect } = useFrameParams<{ instanceId: string; redirect: string }>()
 * ```
 */
export function useFrameParams<T extends Record<string, unknown> = Record<string, unknown>>(): T {
	return useStateSlice(FrameState, state => state.flowParams) as T
}
