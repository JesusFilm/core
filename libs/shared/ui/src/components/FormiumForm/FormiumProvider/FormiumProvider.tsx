import { ReactElement, ReactNode, createContext, useContext } from 'react'

export interface FormiumProviderContext {
  hideHeader?: boolean
  headerAsPageTitle?: boolean
  submitText?: string
  submitIcon?: ReactNode
}

const FormiumContext = createContext<FormiumProviderContext>({})

export function useFormium(): FormiumProviderContext {
  const context = useContext(FormiumContext)
  return context
}

interface FormiumProviderProps extends FormiumProviderContext {
  children: ReactNode
}

export function FormiumProvider({
  children,
  ...props
}: FormiumProviderProps): ReactElement {
  return (
    <FormiumContext.Provider value={{ ...props }}>
      {children}
    </FormiumContext.Provider>
  )
}
