import { Dispatch, useMemo, useReducer } from 'react'

import { DialogAction } from '../../components/CrudDialog'

interface CrudState<T> {
  action: DialogAction | null
  item: T | null
}

interface CreateAction {
  type: DialogAction.CREATE
}

interface ViewAction<T> {
  type: DialogAction
  item: T
}

interface EditAction<T> {
  type: DialogAction.EDIT
  item: T
}

interface DeleteAction<T> {
  type: DialogAction.DELETE
  item: T
}

interface ResetAction {
  type: 'reset'
}

type CrudAction<T> =
  | CreateAction
  | ViewAction<T>
  | EditAction<T>
  | DeleteAction<T>
  | ResetAction

function crudReducer<T>(
  state: CrudState<T>,
  action: CrudAction<T>
): CrudState<T> {
  switch (action.type) {
    case DialogAction.CREATE:
      return {
        action: DialogAction.CREATE,
        item: null
      }
    case DialogAction.VIEW:
      return {
        action: DialogAction.VIEW,
        item: action.item
      }
    case DialogAction.EDIT:
      return {
        action: DialogAction.EDIT,
        item: action.item
      }
    case DialogAction.DELETE:
      return {
        action: DialogAction.DELETE,
        item: action.item
      }
    case 'reset':
      return {
        action: null,
        item: null
      }
  }
}

export function useCrudState<T extends { id: string }>(
  items: T[]
): {
  action: DialogAction | null
  selectedItem: T | null
  dispatch: Dispatch<CrudAction<T>>
} {
  const [state, dispatch] = useReducer(crudReducer<T>, {
    action: null,
    item: null
  })

  const selectedItem = useMemo(() => {
    if (state.item == null) return null

    return items.find((item) => item.id === state.item?.id) ?? null
  }, [JSON.stringify(items), state.item?.id])

  return { selectedItem, action: state.action, dispatch }
}
