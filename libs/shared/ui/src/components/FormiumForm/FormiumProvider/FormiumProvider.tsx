import { ReactElement, ReactNode, createContext, useContext } from 'react'

interface FormiumProviderContext {
  formSubtitle?: string
  submitText?: string
  submitIcon?: ReactNode
}

const FormiumContext = createContext<FormiumProviderContext>({})

export function useFormium(): FormiumProviderContext {
  const context = useContext(FormiumContext)

  return context
}

interface FormProviderProps {
  children: ReactNode
  value?: Partial<FormiumProviderContext>
}

export function FormiumProvider({
  value,
  children
}: FormProviderProps): ReactElement {
  return (
    <FormiumContext.Provider value={{ ...value }}>
      {children}
    </FormiumContext.Provider>
  )
}
