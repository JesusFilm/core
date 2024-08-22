'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement, ReactNode, useState } from 'react'

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

export function VideoList({ header }: { header: ReactNode }): ReactElement {
  const t = useTranslations()
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState<number>(0)
  const videosLimit = 50

  const { data, refetch } = useSuspenseQuery(GET_VIDEOS_AND_COUNT, {
    variables: { limit: videosLimit, offset: 0 }
  })

  function handleClick(event: React.MouseEvent<unknown>, id: string): void {
    const selectedIndex = selected.indexOf(id)
    let newSelected: string[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }
    setSelected(newSelected)
  }

  async function handleChangePage(
    _event: unknown,
    newPage: number
  ): Promise<void> {
    setPage(newPage)
    await refetch({ limit: 50, offset: newPage * 50 })
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="videosTable">
            {header}
            <TableBody>
              {data.videos.map((video) => {
                const description = video.snippet.find(
                  ({ primary }) => primary
                )?.value

                const shortenedDescription =
                  description != null && description.length > 100
                    ? description.slice(0, 100) + '...'
                    : description

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, video.id)}
                    tabIndex={-1}
                    key={video.id}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{video.id}</TableCell>
                    <TableCell>
                      {video.title.find(({ primary }) => primary)?.value}
                    </TableCell>
                    <TableCell>
                      {shortenedDescription ?? t('no description for video')}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[-1]}
          component="div"
          count={data.videosCount.length}
          rowsPerPage={videosLimit}
          page={page}
          onPageChange={handleChangePage}
        />
      </Paper>
    </Box>
  )
}
