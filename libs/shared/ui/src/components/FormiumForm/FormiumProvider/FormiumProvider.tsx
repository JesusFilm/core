import { ReactElement, ReactNode, createContext, useContext } from 'react'

interface FormiumProviderContext {
  hiddenPageTitle: boolean
  submitText?: string
  submitIcon?: ReactNode
}

const FormiumContext = createContext<FormiumProviderContext>({
  hiddenPageTitle: false
})

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
    <FormiumContext.Provider value={{ hiddenPageTitle: false, ...value }}>
      {children}
    </FormiumContext.Provider>
  )
}
