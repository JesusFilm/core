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
  GridRowParams,
  GridRowsProp,
  GridToolbar,
  MuiEvent,
  getGridStringOperators
} from '@mui/x-data-grid'
import { VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

export const GET_VIDEOS_AND_COUNT = graphql(`
  query GetVideosAndCount(
    $limit: Int
    $offset: Int
    $showTitle: Boolean!
    $showSnippet: Boolean!
    $where: VideosFilter
  ) {
    videos(limit: $limit, offset: $offset, where: $where) {
      id
      title @include(if: $showTitle) {
        primary
        value
      }
      snippet @include(if: $showSnippet) {
        primary
        value
      }
    }
    videosCount(where: $where)
  }
`)

type VideosFilter = VariablesOf<typeof GET_VIDEOS_AND_COUNT>['where']

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
  const { data, loading, fetchMore } = useQuery(GET_VIDEOS_AND_COUNT, {
    variables: {
      limit: videosLimit,
      offset: paginationModel.page * videosLimit,
      showTitle: columnVisibilityModel.title ?? true,
      showSnippet: columnVisibilityModel.description ?? true,
      where: getVideosWhereArgs
    }
  })

  const rows: GridRowsProp =
    data?.videos?.map((video) => {
      const title = video?.title?.find(({ primary }) => primary)?.value
      const description = video?.snippet?.find(({ primary }) => primary)?.value
      return {
        id: video.id,
        title,
        description
      }
    }) ?? []

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: t('ID'),
      width: 150,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'equals'
      )
    },
    {
      field: 'title',
      headerName: t('Title'),
      width: 200,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'equals'
      )
    },
    {
      field: 'description',
      headerName: t('Description'),
      width: 500,
      filterable: false
    }
  ]

  function handleClick(
    params: GridRowParams,
    _event: MuiEvent,
    _details: GridCallbackDetails
  ): void {
    // console.log(`redirect to: [locale]/videos/[${params.id}]`)
    // console.log(params)
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
    <Box sx={{ height: '90cqh' }}>
      <DataGrid
        data-testid="VideoListDataGrid"
        loading={loading}
        filterMode="server"
        rows={rows}
        columns={columns}
        pageSizeOptions={[videosLimit]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={handleChangePage}
        rowCount={data?.videosCount ?? 0}
        onRowClick={handleClick}
        slots={{
          toolbar: GridToolbar
        }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) =>
          setColumnVisibilityModel(newModel)
        }
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
      />
    </Box>
  )
}
