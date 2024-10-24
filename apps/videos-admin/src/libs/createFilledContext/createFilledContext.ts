import { Provider, createContext, useContext } from 'react'

export function createFilledContext<T>(initialContext: T): [Provider<T>, () => T] {
  const context = createContext<T>(initialContext)

  const Provider = context.Provider as Provider<T>

  const useStrictContext = (): T => {
    const value = useContext(context)
    if (value !== undefined) return value
    throw new Error('Missing context provider')
  }

  return [Provider, useStrictContext]
}

