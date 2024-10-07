'use client'

import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridColumnVisibilityModel,
  GridFilterModel,
  GridPaginationModel,
  GridRenderCellParams,
  GridRowParams,
  GridRowsProp,
  GridToolbar,
  GridValidRowModel,
  MuiEvent,
  getGridStringOperators,
  gridClasses
} from '@mui/x-data-grid'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import { PublishedChip } from '../../../../../components/PublishedChip'

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

type VideosFilter = VariablesOf<typeof GET_ADMIN_VIDEOS_AND_COUNT>['where']
export type GetAdminVideosAndCount = ResultOf<typeof GET_ADMIN_VIDEOS_AND_COUNT>
export type GetAdminVideosAndCountVariables = VariablesOf<
  typeof GET_ADMIN_VIDEOS_AND_COUNT
>

export function VideoList(): ReactElement {
  const videosLimit = 50
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: videosLimit,
    page: 0
  })
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({
      id: true,
      title: true,
      description: true
    })

  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: []
  })

  const [getVideosWhereArgs, setGetVideosWhereArgs] = useState<VideosFilter>({})

  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()

  const { data, loading, fetchMore } = useQuery<
    GetAdminVideosAndCount,
    GetAdminVideosAndCountVariables
  >(GET_ADMIN_VIDEOS_AND_COUNT, {
    variables: {
      limit: videosLimit,
      offset: paginationModel.page * videosLimit,
      showTitle: columnVisibilityModel.title ?? true,
      showSnippet: columnVisibilityModel.description ?? true,
      where: getVideosWhereArgs
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
        offset: model.page * videosLimit
      }
    })
    setPaginationModel(model)
  }

  function handleFilterModelChange(model: GridFilterModel): void {
    const where: VideosFilter = {}
    model.items.forEach((item) => {
      if (
        item.field === 'id' &&
        item.operator === 'equals' &&
        item.value != null
      )
        where.ids = item.value === '' ? null : [item.value]

      if (
        item.field === 'title' &&
        item.operator === 'equals' &&
        item.value != null
      )
        where.title = item.value === '' ? null : item.value
    })
    setFilterModel(model)
    setPaginationModel({
      pageSize: videosLimit,
      page: 0
    })
    setGetVideosWhereArgs(where)
  }

  return (
    <Box sx={{ height: 'calc(100vh - 90px)', width: '100%' }}>
      <DataGrid
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        density="compact"
        data-testid="VideoListDataGrid"
        loading={loading}
        filterMode="server"
        rows={rows}
        columns={columns}
        pageSizeOptions={[videosLimit]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={handleChangePage}
        rowCount={data?.adminVideosCount ?? 0}
        onRowClick={handleClick}
        slots={{
          toolbar: GridToolbar
        }}
        disableDensitySelector
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) =>
          setColumnVisibilityModel(newModel)
        }
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
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
