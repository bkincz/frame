# Changelog

## 2.0.0 - 2026-08-13

### Breaking

- **`@bkincz/clutch` peer moved from `^1.3.0` to `^3.5.0`.** Frame's own API is unchanged, but
  clutch 3 replaced the `StateMachine` class with `createMachine` plus plugins, so an app on
  clutch 1 has to upgrade with it. See clutch's migration guide.
- **Node 22.12 is the floor**, up from Node 20.

### Changed

- The four state modules run on `createMachine`. Redux DevTools now comes from the `devtools()`
  plugin, still only outside production.
- `FrameContainer` and `useFrameParams` subscribe through clutch 3's `useSlice`, so a component
  re-renders for the fields it reads rather than for any frame state change.
- Toolchain: TypeScript 6, ESLint 10 flat config, vitest 4, vite 8.

## 1.1.1 - 2026-04-09

- **Hash and key based URLs.** The router reads and writes hash changes, and steps can be
  addressed by key, so a browser back or a pasted link lands on the right step instead of the
  start of the flow.

## 1.1.0 - 2026-04-07

- **Flow params.** `FrameAPI.openFlow(flow, step, params)` carries typed data into a flow, read
  anywhere inside it with `useFrameParams<T>()`. Chained flows merge params, later keys win, and
  closing the frame clears them.
- **Conditional step skipping.** A step with `skipIf: () => boolean` is passed over during
  navigation in both directions.
- **History navigation lock** through `useHistoryLock`, so browser back closes the flow rather
  than leaving the app while a flow is open.
- Redux DevTools on the frame and animation state machines outside production.
- Flow and step subscriptions are narrowed to what each consumer reads, and listeners are
  released on unmount.
