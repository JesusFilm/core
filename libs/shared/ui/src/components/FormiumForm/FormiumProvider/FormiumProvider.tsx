import { ReactElement, ReactNode, createContext, useContext } from 'react'

interface FormiumProviderContext {
  hiddenPageTitle: boolean
  submitText?: string
  submitIcon?: ReactNode
}

const FormiumContext = createContext<FormiumProviderContext>({
  hiddenPageTitle: false
})

function useFormium(): FormiumProviderContext {
  const context = useContext(FormiumContext)

  return context
}

interface FormProviderProps {
  children: ReactNode
  value?: Partial<FormiumProviderContext>
}
function FormiumProvider({ value, children }: FormProviderProps): ReactElement {
  return (
    <FormiumContext.Provider value={{ hiddenPageTitle: false, ...value }}>
      {children}
    </FormiumContext.Provider>
  )
}
