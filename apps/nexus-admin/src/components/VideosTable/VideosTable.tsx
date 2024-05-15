import { gql, useQuery } from '@apollo/client'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import slice from 'lodash/slice'
import { ReactElement, useMemo, useState } from 'react'

import { GetHomeVideos } from '../../../__generated__/GetHomeVideos'
import { VIDEO_CHILD_FIELDS } from '../../libs/videoChildFields'

export const GET_HOME_VIDEOS = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetHomeVideos($languageId: ID, $limit: Int, $offset: Int) {
    videos(limit: $limit, offset: $offset) {
      ...VideoChildFields
    }
  }
`

export function VideosTable(): ReactElement {
  const [page, setPage] = useState<number>(0)
  const [isEnd, setIsEnd] = useState<boolean>(false)
  const [lastPageNumber, setLastPageNumber] = useState<null | number>(null)

  const { data, fetchMore, loading } = useQuery<GetHomeVideos>(
    GET_HOME_VIDEOS,
    {
      variables: { limit: 50, offset: 0 },
      notifyOnNetworkStatusChange: true
    }
  )

  const visibleRows = useMemo(() => {
    const res = slice(data?.videos, page * 50, page * 50 + 50)
    return res
  }, [page, data])

  async function handleChangePage(
    _event: unknown,
    newPage: number
  ): Promise<void> {
    // if pagincation is not the end fetch more
    if (!isEnd) {
      const res = await fetchMore({
        variables: { limit: 50, offset: data?.videos.length }
      })
      if (res.data.videos.length === 0) {
        setIsEnd(true)
        setLastPageNumber(newPage - 1)
        // do not change the page but exit the function
        return
      }
    }
    setPage(newPage)
  }

  return (
    <>
      <TablePagination
        rowsPerPageOptions={[]}
        component="div"
        count={data?.videos.length ?? 0}
        page={page}
        rowsPerPage={50}
        onPageChange={handleChangePage}
        nextIconButtonProps={{
          disabled: lastPageNumber === page || loading
        }}
      />
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table sx={{ minWidth: 750 }} aria-labelledby="Videos" size="medium">
          <TableBody>
            {loading
              ? [...new Array(50).keys()].map(() => (
                  <TableRow hover sx={{ height: 55 }}>
                    <TableCell />
                  </TableRow>
                ))
              : visibleRows.map((video) => (
                  <TableRow
                    hover
                    sx={{ height: 55 }}
                    key={video.id}
                    onClick={() => {
                      console.log(video.id)
                    }}
                  >
                    <TableCell>{video.title[0].value}</TableCell>
                    <TableCell>{video.label}</TableCell>
                    <TableCell>{video.slug}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[]}
        component="div"
        count={data?.videos.length ?? 0}
        page={page}
        rowsPerPage={50}
        onPageChange={handleChangePage}
        nextIconButtonProps={{
          disabled: lastPageNumber === page || loading
        }}
      />
    </>
  )
}
