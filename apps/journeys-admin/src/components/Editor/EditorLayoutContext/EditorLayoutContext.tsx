import { ReactElement, ReactNode, createContext, useContext } from 'react'

export type EditorLayout = 'slider' | 'layered'

const EditorLayoutContext = createContext<EditorLayout>('slider')

interface EditorLayoutProviderProps {
  value: EditorLayout
  children: ReactNode
}

export function EditorLayoutProvider({
  value,
  children
}: EditorLayoutProviderProps): ReactElement {
  return (
    <EditorLayoutContext.Provider value={value}>
      {children}
    </EditorLayoutContext.Provider>
  )
}

export function useEditorLayout(): {
  layout: EditorLayout
  isLayered: boolean
} {
  const layout = useContext(EditorLayoutContext)
  return { layout, isLayered: layout === 'layered' }
}
