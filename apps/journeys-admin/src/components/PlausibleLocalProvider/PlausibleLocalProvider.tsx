import isFunction from 'lodash/isFunction'
import {
  Dispatch,
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useReducer
} from 'react'
import { DateRange } from 'react-day-picker'

export type PlausiblePeriod =
  | 'day'
  | 'realtime'
  | '7d'
  | '30d'
  | 'month'
  | 'year'
  | '6mo'
  | '12mo'
  | 'all' // nope
  | 'custom'

export type PlausibleComparison =
  | 'previous_period'
  | 'year_over_year'
  | 'custom'
  | undefined

export interface PlausibleLocalState {
  date: Date
  period: PlausiblePeriod
  periodRange?: DateRange
  comparison: PlausibleComparison
  comparisonRange?: DateRange
  matchDayOfWeek: boolean
}

interface SetPeriodAction {
  type: 'SetPeriodAction'
  period: PlausiblePeriod
  date?: Date
}

interface SetPeriodRangeAction {
  type: 'SetPeriodRangeAction'
  range?: DateRange
}

interface SetComparisonAction {
  type: 'SetComparisonAction'
  comparison: PlausibleComparison
}

interface SetComparisonRangeAction {
  type: 'SetComparisonRangeAction'
  range?: DateRange
}

interface SetMatchDayOfWeekAction {
  type: 'SetMatchDayOfWeekAction'
  matchDayOfWeek: boolean
}

type PlausibleLocalAction =
  | SetPeriodAction
  | SetPeriodRangeAction
  | SetComparisonAction
  | SetComparisonRangeAction
  | SetMatchDayOfWeekAction

export const reducer = (
  state: PlausibleLocalState,
  action: PlausibleLocalAction
): PlausibleLocalState => {
  switch (action.type) {
    case 'SetPeriodAction':
      return {
        ...state,
        period: action.period,
        date: action.date ?? state.date
      }
    case 'SetPeriodRangeAction':
      return {
        ...state,
        periodRange: action.range
      }
    case 'SetComparisonAction':
      return {
        ...state,
        comparison: action.comparison
      }
    case 'SetComparisonRangeAction':
      return {
        ...state,
        comparisonRange: action.range
      }
    case 'SetMatchDayOfWeekAction':
      return {
        ...state,
        matchDayOfWeek: action.matchDayOfWeek
      }
  }
}

export const PlausibleLocalContext = createContext<{
  state: PlausibleLocalState
  dispatch: Dispatch<PlausibleLocalAction>
}>({
  state: {
    date: new Date(),
    period: '7d',
    comparison: undefined,
    matchDayOfWeek: true
  },
  dispatch: () => null
})

interface PlausibleLocalProviderProps {
  children: ((state: PlausibleLocalState) => ReactNode) | ReactNode
  initialState?: Partial<PlausibleLocalState>
}

export function PlausibleLocalProvider({
  children,
  initialState
}: PlausibleLocalProviderProps): ReactElement {
  const [state, dispatch] = useReducer(reducer, {
    date: new Date(),
    period: '7d',
    comparison: undefined,
    matchDayOfWeek: true,
    ...initialState
  })

  return (
    <PlausibleLocalContext.Provider value={{ state, dispatch }}>
      {isFunction(children) ? children(state) : children}
    </PlausibleLocalContext.Provider>
  )
}

export function usePlausibleLocal(): {
  state: PlausibleLocalState
  dispatch: Dispatch<PlausibleLocalAction>
} {
  const context = useContext(PlausibleLocalContext)
  if (context === undefined) {
    throw new Error(
      'usePlausibleLocal must be used within a PlausibleLocalProvider'
    )
  }
  return context
}
