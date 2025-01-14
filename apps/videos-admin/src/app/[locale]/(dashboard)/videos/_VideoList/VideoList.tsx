'use client'

import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridRenderCellParams,
  GridRowParams,
  GridRowsProp,
  GridToolbar,
  GridValidRowModel,
  MuiEvent,
  getGridBooleanOperators,
  getGridStringOperators,
  gridClasses
} from '@mui/x-data-grid'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import omitBy from 'lodash/omitBy'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { PublishedChip } from '../../../../../components/PublishedChip'
import { useVideoFilter } from '../../../../../libs/useVideoFilter'

export const GET_ADMIN_VIDEOS_AND_COUNT = graphql(`
  query GetAdminVideosAndCount(
    $limit: Int
    $offset: Int
    $showTitle: Boolean!
    $showSnippet: Boolean!
    $where: VideosFilter
  ) {
    adminVideos(limit: $limit, offset: $offset, where: $where) {
      id
      title @include(if: $showTitle) {
        primary
        value
      }
      snippet @include(if: $showSnippet) {
        primary
        value
      }
      published
    }
    adminVideosCount(where: $where)
  }
`)

export type GetAdminVideosAndCount = ResultOf<typeof GET_ADMIN_VIDEOS_AND_COUNT>
export type GetAdminVideosAndCountVariables = VariablesOf<
  typeof GET_ADMIN_VIDEOS_AND_COUNT
>

export function VideoList(): ReactElement {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()

  const { filters, tableFilterProps, updateQueryParams, dispatch } =
    useVideoFilter()

  const { data, loading, fetchMore } = useQuery<
    GetAdminVideosAndCount,
    GetAdminVideosAndCountVariables
  >(GET_ADMIN_VIDEOS_AND_COUNT, {
    variables: {
      ...filters
    }
  })

  const rows: GridRowsProp =
    data?.adminVideos?.map((video) => {
      const title = video?.title?.find(({ primary }) => primary)?.value
      const description = video?.snippet?.find(({ primary }) => primary)?.value
      return {
        id: video.id,
        title,
        description,
        published: video.published
      }
    }) ?? []

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: t('ID'),
      minWidth: 150,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'equals'
      )
    },
    {
      field: 'title',
      headerName: t('Title'),
      minWidth: 200,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'equals'
      )
    },
    {
      field: 'published',
      headerName: t('Published'),
      minWidth: 150,
      filterOperators: getGridBooleanOperators().filter(
        (operator) => operator.value === 'is'
      ),
      renderCell: (
        params: GridRenderCellParams<GridValidRowModel, boolean>
      ) => <PublishedChip published={params.value ?? false} />
    },
    {
      field: 'description',
      headerName: t('Description'),
      flex: 1,
      filterable: false
    }
  ]

  function handleClick(
    params: GridRowParams,
    _event: MuiEvent,
    _details: GridCallbackDetails
  ): void {
    router.push(`${pathname}/${params.id}`)
  }

  async function handleChangePage(
    model: GridPaginationModel,
    _details: GridCallbackDetails
  ): Promise<void> {
    await fetchMore({
      variables: {
        offset: model.page * filters.limit
      }
    })

    dispatch({ type: 'PageChange', model })

    updateQueryParams({ page: model.page })
  }

  function handleFilterModelChange(model: GridFilterModel): void {
    const params = model.items.reduce((acc, item) => {
      acc[item.field] = {
        [item.operator]: item.value === '' ? null : item.value
      }
      return acc
    }, {})

    dispatch({
      type: 'PageChange',
      model: { pageSize: filters.limit, page: 0 }
    })
    dispatch({
      type: 'FilterChange',
      model
    })

    updateQueryParams({ filters: params })
  }

  const handleColumnVisibilityModelChange = (model) => {
    dispatch({ type: 'ColumnChange', model })

    const columns = omitBy(model)
    delete columns.undefined

    updateQueryParams({ columns })
  }

  return (
    <Box sx={{ height: 'calc(100vh - 150px)', width: '100%' }}>
      <DataGrid
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        density="compact"
        data-testid="VideoListDataGrid"
        loading={loading}
        rows={rows}
        columns={columns}
        {...tableFilterProps}
        pageSizeOptions={[10]}
        paginationMode="server"
        onPaginationModelChange={handleChangePage}
        rowCount={data?.adminVideosCount ?? 0}
        onRowClick={handleClick}
        slots={{
          toolbar: GridToolbar
        }}
        disableDensitySelector
        onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
        onFilterModelChange={handleFilterModelChange}
        filterMode="server"
        sx={{
          [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
            outline: 'transparent'
          },
          [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
            {
              outline: 'none'
            }
        }}
        slotProps={{
          row: {
            style: {
              cursor: 'pointer'
            }
          }
        }}
      />
    </Box>
  )
}
