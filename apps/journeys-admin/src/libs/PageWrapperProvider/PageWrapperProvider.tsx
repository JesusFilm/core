import {
  Dispatch,
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useReducer
} from 'react'

export interface PageState {
  mobileDrawerOpen: boolean
}

interface SetMobileDrawerOpenAction {
  type: 'SetMobileDrawerOpenAction'
  mobileDrawerOpen: boolean
}

type PageAction = SetMobileDrawerOpenAction

export const reducer = (state: PageState, action: PageAction): PageState => {
  switch (action.type) {
    case 'SetMobileDrawerOpenAction':
      return {
        ...state,
        mobileDrawerOpen: action.mobileDrawerOpen
      }
  }
}

export const PageContext = createContext<{
  state: PageState
  dispatch: Dispatch<PageAction>
}>({
  state: {
    mobileDrawerOpen: false
  },
  dispatch: () => null
})

interface PageProviderProps {
  children: ReactNode
  initialState?: Partial<PageState>
}

export function PageProvider({
  children,
  initialState
}: PageProviderProps): ReactElement {
  const [state, dispatch] = useReducer(reducer, {
    mobileDrawerOpen: false,
    ...initialState
  })

  return (
    <PageContext.Provider value={{ state, dispatch }}>
      {children}
    </PageContext.Provider>
  )
}

export function usePage(): {
  state: PageState
  dispatch: Dispatch<PageAction>
} {
  const context = useContext(PageContext)
  if (context === undefined) {
    throw new Error('usePage must be used within a PageProvider')
  }
  return context
}
