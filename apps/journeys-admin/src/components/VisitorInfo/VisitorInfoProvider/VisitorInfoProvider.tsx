import {
  createContext,
  Dispatch,
  ReactElement,
  ReactNode,
  useContext,
  useReducer
} from 'react'
import { JourneyWithEvents } from '../transformVisitorEvents'

interface SetJourneyAction {
  type: 'SetJourneyAction'
  journey: JourneyWithEvents
  open?: boolean
}

interface SetOpenAction {
  type: 'SetOpenAction'
  open: boolean
}

type VisitorInfoAction = SetJourneyAction | SetOpenAction

interface VisitorInfoState {
  open: boolean
  journey?: JourneyWithEvents
}

export const reducer = (
  state: VisitorInfoState,
  action: VisitorInfoAction
): VisitorInfoState => {
  switch (action.type) {
    case 'SetJourneyAction':
      return {
        ...state,
        journey: action.journey,
        open: action.open ?? true
      }
    case 'SetOpenAction':
      return {
        ...state,
        open: action.open
      }
  }
}

export const VisitorInfoContext = createContext<{
  state: VisitorInfoState
  dispatch: Dispatch<VisitorInfoAction>
}>({
  state: {
    open: false
  },
  dispatch: () => null
})

interface VisitorInfoProviderProps {
  children: ReactNode
  initialState?: Partial<VisitorInfoState>
}

export function VisitorInfoProvider({
  children,
  initialState
}: VisitorInfoProviderProps): ReactElement {
  const [state, dispatch] = useReducer(reducer, {
    open: false,
    ...initialState
  })

  return (
    <VisitorInfoContext.Provider value={{ state, dispatch }}>
      {children}
    </VisitorInfoContext.Provider>
  )
}

export function useVisitorInfo(): {
  state: VisitorInfoState
  dispatch: Dispatch<VisitorInfoAction>
} {
  const context = useContext(VisitorInfoContext)
  if (context === undefined) {
    throw new Error('useVisitorInfo must be used within a VisitorInfoProvider')
  }
  return context
}
