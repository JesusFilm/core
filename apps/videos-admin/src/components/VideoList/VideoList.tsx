'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import Box from '@mui/material/Box'
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridPaginationModel,
  GridRowParams,
  GridRowsProp,
  MuiEvent
} from '@mui/x-data-grid'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

const GET_VIDEOS_AND_COUNT = graphql(`
  query GetVideosAndCount($limit: Int, $offset: Int) {
    videos(limit: $limit, offset: $offset) {
      id
      title {
        primary
        value
      }
      snippet {
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

  const t = useTranslations()
  const { data } = useSuspenseQuery(GET_VIDEOS_AND_COUNT, {
    variables: {}
  })

  const rows: GridRowsProp = data.videos.map((video) => {
    const title = video.title.find(({ primary }) => primary)?.value
    const description = video.snippet.find(({ primary }) => primary)?.value
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
    setPaginationModel(model)
  }

  return (
    <Box sx={{ height: '80cqh' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[videosLimit]}
        paginationModel={paginationModel}
        onPaginationModelChange={handleChangePage}
        rowCount={data.videosCount.length}
        onRowClick={handleClick}
      />
    </Box>
  )
}
