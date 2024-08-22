import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import { ReactElement } from 'react'

import { VideoListHead } from '../../../server/VideoListHead'

export function VideoListFallback(): ReactElement {
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="videoListFallback">
            <VideoListHead />
            <TableBody>
              {Array.from(Array(50)).map((_val, i) => {
                return (
                  <TableRow key={i} tabIndex={-1}>
                    <TableCell>
                      <Skeleton
                        key={i}
                        variant="rectangular"
                        width="100%"
                        height={30}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        key={i}
                        variant="rectangular"
                        width="100%"
                        height={30}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        key={i}
                        variant="rectangular"
                        width="100%"
                        height={30}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
