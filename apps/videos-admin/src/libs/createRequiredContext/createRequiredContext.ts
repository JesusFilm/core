import { Provider, createContext, useContext } from 'react'

const EMPTY = Symbol('Empty Context')

export function createRequiredContext<T>(): [Provider<T>, () => T] {
  // Context, initialized with EMPTY
  const context = createContext<T | typeof EMPTY>(EMPTY)

  // Provider with EMPTY excluded (only T values are allowed)
  const Provider = context.Provider as Provider<T>

  // Hook that throws an error if the value is EMPTY
  const useStrictContext = (): T => {
    const value = useContext(context)
    if (value !== EMPTY) return value
    throw new Error('Missing context provider')
  }

  return [Provider, useStrictContext]
}
