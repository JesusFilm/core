// Minimal local type surface for `ink`.
//
// This file lets `apps/scribe` type-check before `pnpm install` pulls the
// real package. After installation the package ships its own types — TypeScript
// merges these declarations and prefers the ones in node_modules when there is
// overlap, so this file remains harmless.
//
// Keep this surface in sync with the imports in `src/repl/components/*` and
// `src/repl/App.tsx`.
declare module 'ink' {
  import type { ReactElement, ReactNode } from 'react'

  export interface BoxProps {
    children?: ReactNode
    flexDirection?: 'row' | 'column'
    justifyContent?:
      | 'flex-start'
      | 'flex-end'
      | 'center'
      | 'space-between'
      | 'space-around'
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch'
    marginTop?: number
    marginBottom?: number
    marginLeft?: number
    marginRight?: number
    paddingX?: number
    paddingY?: number
    borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble'
    borderColor?: string
    backgroundColor?: string
  }

  export interface TextProps {
    children?: ReactNode
    color?: string
    backgroundColor?: string
    bold?: boolean
    dimColor?: boolean
    italic?: boolean
    underline?: boolean
  }

  export const Box: (props: BoxProps) => ReactElement
  export const Text: (props: TextProps) => ReactElement

  export interface KeyObject {
    upArrow: boolean
    downArrow: boolean
    leftArrow: boolean
    rightArrow: boolean
    pageUp: boolean
    pageDown: boolean
    return: boolean
    escape: boolean
    ctrl: boolean
    shift: boolean
    tab: boolean
    backspace: boolean
    delete: boolean
    meta: boolean
  }

  export function useInput(
    handler: (input: string, key: KeyObject) => void,
    options?: { isActive?: boolean }
  ): void

  export interface AppHandle {
    exit: (error?: Error) => void
  }
  export function useApp(): AppHandle

  export interface RenderInstance {
    waitUntilExit: () => Promise<void>
    rerender: (tree: ReactElement) => void
    unmount: () => void
  }
  export function render(tree: ReactElement): RenderInstance
}
