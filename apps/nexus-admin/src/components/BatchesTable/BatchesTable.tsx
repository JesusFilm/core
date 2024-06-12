import CircleIcon from '@mui/icons-material/Circle'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Box from '@mui/material/Box'
import Chip, { ChipOwnProps } from '@mui/material/Chip'
import CircularProgress, {
  CircularProgressProps
} from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { FC, ReactElement, useState } from 'react'

import { Batches_batches } from '../../../__generated__/Batches'

import { BatchesTableHeader } from './BatchesTableHeader'

interface BatchesTableProps {
  data: Batches_batches[] | []
  loading: boolean
}

export const BatchesTable: FC<BatchesTableProps> = ({ data, loading }) => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const { t } = useTranslation()

  return (
    <TableContainer component={Paper}>
      <BatchesTableHeader />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '14px',
                  fontFamily: 'Montserrat'
                }}
              >
                {t('Batch Number')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '14px',
                  fontFamily: 'Montserrat'
                }}
              >
                {t('Status')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '14px',
                  fontFamily: 'Montserrat'
                }}
              >
                {t('Progress')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '14px',
                  fontFamily: 'Montserrat'
                }}
              >
                {t('Created At')}
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((batch) => (
            <Row key={batch.id} batch={batch} />
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setPageSize(parseInt(event.target.value, 10))
        }}
      />
    </TableContainer>
  )
}

const CircularProgressWithLabel = (
  props: CircularProgressProps & { value: number }
): ReactElement => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
          fontSize="10px"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  )
}

const Row: FC<{ batch: Batches_batches }> = ({ batch }) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const getChipColor = (status: string): ChipOwnProps['color'] => {
    if (status === 'completed') return 'success'
    if (status === 'failed') return 'error'
    return 'warning'
  }

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{batch.id}</TableCell>
        <TableCell>{batch.status}</TableCell>
        <TableCell>
          <CircularProgressWithLabel value={batch.progress ?? 0} />
        </TableCell>
        <TableCell>
          {format(parseISO(batch.createdAt as string), 'yyyy-MM-dd')}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '14px',
                      fontFamily: 'Montserrat'
                    }}
                  >
                    {t('Type')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '14px',
                      fontFamily: 'Montserrat'
                    }}
                  >
                    {t('Status')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '14px',
                      fontFamily: 'Montserrat'
                    }}
                  >
                    {t('Progress')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '14px',
                      fontFamily: 'Montserrat'
                    }}
                  >
                    {t('Channel ID')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '14px',
                      fontFamily: 'Montserrat'
                    }}
                  >
                    {t('Video ID')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '14px',
                      fontFamily: 'Montserrat'
                    }}
                  >
                    {t('State')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batch.batchTasks?.map((task) => (
                  <TableRow key={task?.type}>
                    <TableCell>{task?.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={task?.status}
                        color={getChipColor(task?.status as string)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{Number(task?.progress).toFixed(2)}%</TableCell>
                    <TableCell>
                      {task?.task?.channel?.youtube?.youtubeId}
                    </TableCell>
                    <TableCell>{task?.task?.localization?.videoId}</TableCell>
                    <TableCell>
                      {task?.error !== null ? (
                        <Tooltip title={task?.error}>
                          <IconButton>
                            <CircleIcon
                              sx={{
                                color: 'error.main'
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Successful">
                          <IconButton>
                            <CircleIcon
                              sx={{
                                color: 'success.main'
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}
