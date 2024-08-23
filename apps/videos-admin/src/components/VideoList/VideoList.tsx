'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import Box from '@mui/material/Box'
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowParams,
  GridRowsProp,
  GridToolbar,
  MuiEvent
} from '@mui/x-data-grid'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

const GET_VIDEOS_AND_COUNT = graphql(`
  query GetVideosAndCount(
    $limit: Int
    $offset: Int
    $showTitle: Boolean!
    $showSnippet: Boolean!
  ) {
    videos(limit: $limit, offset: $offset) {
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
    videosCount: videos {
      id
    }
  }
`)

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

  const t = useTranslations()
  const { data, refetch } = useSuspenseQuery(GET_VIDEOS_AND_COUNT, {
    variables: {
      limit: videosLimit,
      offset: paginationModel.page * videosLimit,
      showTitle: columnVisibilityModel.title ?? true,
      showSnippet: columnVisibilityModel.description ?? true
    }
  })

  const rows: GridRowsProp = data.videos.map((video) => {
    const title = video?.title?.find(({ primary }) => primary)?.value
    const description = video?.snippet?.find(({ primary }) => primary)?.value
    return {
      id: video.id,
      title,
      description
    }
  })

  const columns: GridColDef[] = [
    { field: 'id', headerName: t('ID'), width: 150 },
    { field: 'title', headerName: t('Title'), width: 200 },
    { field: 'description', headerName: t('Description'), width: 500 }
  ]

  function handleClick(
    params: GridRowParams,
    _event: MuiEvent,
    _details: GridCallbackDetails
  ): void {
    console.log(`redirect to: [locale]/[${params.id}]`)
    console.log(params)
  }

  async function handleChangePage(
    model: GridPaginationModel,
    _details: GridCallbackDetails
  ): Promise<void> {
    await refetch({
      limit: videosLimit,
      offset: model.page * videosLimit,
      showTitle: columnVisibilityModel.title ?? true,
      showSnippet: columnVisibilityModel.description ?? true
    })
    setPaginationModel(model)
  }

  return (
    <Box sx={{ height: '80cqh' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[videosLimit]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={handleChangePage}
        rowCount={data.videosCount.length}
        onRowClick={handleClick}
        slots={{
          toolbar: GridToolbar
        }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) =>
          setColumnVisibilityModel(newModel)
        }
      />
    </Box>
  )
}
