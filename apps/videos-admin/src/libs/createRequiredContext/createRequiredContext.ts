import { Provider, createContext, useContext } from 'react'

const EMPTY = Symbol('Empty Context')

export function createRequiredContext<T>(): [Provider<T>, () => T] {
  const context = createContext<T | typeof EMPTY>(EMPTY)

  const Provider = context.Provider as Provider<T>

  const useStrictContext = (): T => {
    const value = useContext(context)
    if (value !== EMPTY) return value
    throw new Error('Missing context provider')
  }

  return [Provider, useStrictContext]
}
