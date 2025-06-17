import {
  DataGridProps,
  GridColumnVisibilityModel,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel
} from '@mui/x-data-grid'
import { VariablesOf } from 'gql.tada'
import { useSearchParams } from 'next/navigation'
import qs, { ParsedQs } from 'qs'
import { Dispatch, useReducer } from 'react'
import { z } from 'zod'

import { GET_ADMIN_VIDEOS_AND_COUNT } from '../../app/(dashboard)/videos/_VideoList/VideoList'

const VIDEOS_LIMIT = 50

type VideosWhereFilter = VariablesOf<typeof GET_ADMIN_VIDEOS_AND_COUNT>['where']

interface FilterState {
  paginationModel: { pageSize: number; page: number }
  filterModel: GridFilterModel
  columnVisibilityModel: GridColumnVisibilityModel
  sortModel: GridSortModel
  whereArgs: VideosWhereFilter
}

type FilterAction =
  | { type: 'PageChange'; model: GridPaginationModel }
  | { type: 'ColumnChange'; model: GridColumnVisibilityModel }
  | { type: 'FilterChange'; model: GridFilterModel }
  | { type: 'SortChange'; model: GridSortModel }

export function reducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'PageChange':
      return {
        ...state,
        paginationModel: action.model
      }
    case 'ColumnChange':
      return {
        ...state,
        columnVisibilityModel: action.model
      }
    case 'FilterChange':
      return {
        ...state,
        filterModel: action.model,
        whereArgs: getWhereArgs(action.model)
      }
    case 'SortChange':
      return {
        ...state,
        sortModel: action.model
      }
    default:
      return state
  }
}

const FilterModelSchema = z.object({
  locked: z
    .object({
      is: z.string()
    })
    .optional(),
  id: z
    .object({
      equals: z.string()
    })
    .optional(),
  title: z
    .object({
      equals: z.string()
    })
    .optional(),
  published: z
    .object({
      is: z.string()
    })
    .optional()
})

function getFilterModel(params: ParsedQs): GridFilterModel {
  if (params?.filters == null) {
    return { items: [] }
  }

  const result = FilterModelSchema.safeParse(params?.filters)

  if (result.success) {
    const items = Object.entries(result.data).flatMap(([field, filter]) =>
      Object.entries(filter).map(([operator, value]) => ({
        field,
        operator,
        value: value === 'true' ? true : value === 'false' ? false : value
      }))
    )

    return { items }
  }

  return { items: [] }
}

function getColumnVisibilityModel(
  params?: ParsedQs
): GridColumnVisibilityModel {
  const parseBoolean = (value?: string) =>
    value != null ? value === 'true' : true

  const toggleableColumns = [
    'locked',
    'id',
    'title',
    'description',
    'published'
  ]

  const model = toggleableColumns.reduce((acc, key) => {
    acc[key] = parseBoolean(params?.columns?.[key])
    return acc
  }, {})

  return model
}

function getSortModel(params?: ParsedQs): GridSortModel {
  if (
    params?.sort &&
    typeof params.sort === 'object' &&
    !Array.isArray(params.sort)
  ) {
    const sortObj = params.sort as Record<string, any>
    if (sortObj.field && sortObj.direction) {
      return [
        {
          field: sortObj.field as string,
          sort: sortObj.direction as 'asc' | 'desc'
        }
      ]
    }
  }
  return []
}

function getWhereArgs(model: GridFilterModel): VideosWhereFilter {
  const where: VideosWhereFilter = {}

  if (model.items != null) {
    model.items.forEach((item) => {
      if (
        item.field === 'id' &&
        item.operator === 'equals' &&
        item.value != null
      ) {
        where.ids = item.value === '' ? null : [item.value]
      }

      if (
        item.field === 'title' &&
        item.operator === 'equals' &&
        item.value != null
      )
        where.title = item.value === '' ? null : item.value

      if (
        item.field === 'published' &&
        item.operator === 'is' &&
        item.value != null
      )
        where.published = item.value

      if (
        item.field === 'locked' &&
        item.operator === 'is' &&
        item.value != null
      )
        where.locked = item.value
    })
  }

  return where
}

interface VideoFilters {
  limit: number
  offset: number
  showTitle: boolean
  showSnippet: boolean
  where: VideosWhereFilter
  orderBy?: {
    field: 'id' | 'published' | 'locked' | 'label' | 'primaryLanguageId'
    direction: 'asc' | 'desc'
  } | null
}

type TableFilterProps = Pick<
  DataGridProps,
  | 'filterModel'
  | 'paginationModel'
  | 'pageSizeOptions'
  | 'columnVisibilityModel'
  | 'sortModel'
> & { pageSizeOptions: number[] }

export function useVideoFilter(): {
  filters: VideoFilters
  tableFilterProps: TableFilterProps
  updateQueryParams: (newParams: Record<string, unknown>) => void
  dispatch: Dispatch<FilterAction>
} {
  const searchParams = useSearchParams()

  const params = qs.parse(searchParams?.toString() ?? '')
  const limit = params?.limit != null ? Number(params.limit) : VIDEOS_LIMIT
  const page = params?.page != null ? Number(params.page) : 0

  const [state, dispatch] = useReducer(reducer, {
    paginationModel: { pageSize: limit, page },
    filterModel: getFilterModel(params),
    columnVisibilityModel: getColumnVisibilityModel(params),
    sortModel: getSortModel(params),
    whereArgs: getWhereArgs(getFilterModel(params))
  })

  const updateQueryParams = (newParams: Record<string, unknown>) => {
    const query = qs.stringify({
      ...params,
      ...newParams
    })

    window.history.pushState(null, '', `?${query}`)
  }

  // Convert sort model to backend format
  const sortItem = state.sortModel?.[0]
  const orderBy = sortItem
    ? {
        field: sortItem.field as
          | 'id'
          | 'published'
          | 'locked'
          | 'label'
          | 'primaryLanguageId',
        direction: sortItem.sort as 'asc' | 'desc'
      }
    : null

  return {
    filters: {
      limit: limit,
      offset: state?.paginationModel?.page * limit,
      showTitle: state?.columnVisibilityModel.title ?? true,
      showSnippet: state?.columnVisibilityModel.description ?? true,
      where: state.whereArgs,
      orderBy
    },
    tableFilterProps: {
      ...state,
      pageSizeOptions: [limit]
    },
    updateQueryParams,
    dispatch
  }
}
