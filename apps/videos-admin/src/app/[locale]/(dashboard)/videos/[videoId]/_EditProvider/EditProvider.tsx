'use client'

import {
  Dispatch,
  ReactElement,
  createContext,
  useContext,
  useReducer
} from 'react'

export interface EditState {
  /**
   * isEdit indicates if the edit variant of an component should be displayed.
   * Otherwise the component will be in 'readonly' or 'disabled' mode.
   */
  isEdit: boolean
}

interface SetEditStateAction {
  type: 'SetEditStateAction'
  isEdit: boolean
}

export type EditAction = SetEditStateAction

export function reducer(state: EditState, action: EditAction): EditState {
  switch (action.type) {
    case 'SetEditStateAction': {
      return { ...state, isEdit: action.isEdit }
    }
  }
}

interface Context {
  state: EditState
  dispatch: Dispatch<EditAction>
}

const EditContext = createContext<Context | null>(null)

export function useEdit(): Context {
  const context = useContext(EditContext)
  if (context == null)
    throw new Error(
      'The useEdit hook must be used within an EditProvider context'
    )
  return context
}

interface EditProviderProps {
  children: ReactElement
}

export function EditProvider({ children }: EditProviderProps): ReactElement {
  const [state, dispatch] = useReducer(reducer, {
    isEdit: false
  })

  return (
    <EditContext.Provider value={{ state, dispatch }}>
      {children}
    </EditContext.Provider>
  )
}
