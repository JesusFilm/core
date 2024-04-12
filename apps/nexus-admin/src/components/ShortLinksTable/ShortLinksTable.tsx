import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DataGrid, GridCellParams } from '@mui/x-data-grid'
import { formatISO, parseISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { FC, useState } from 'react'

import { Redirection } from '../CreateShortLinkModal'

import { ShortLinksTableHeader } from './ShortLinksTableHeader'

interface ShortLink {
  id: string
  createdDate: string
  title: string
  description: string
  extraOptionsGeolocations: Redirection[]
  url: string
  domain: string
}

interface ShortLinksTableProps {
  data: ShortLink[] | []
  onDelete: (channelId: string) => void
  loading: boolean
}

export const ShortLinksTable: FC<ShortLinksTableProps> = ({
  data,
  onDelete,
  loading
}) => {
  const [morePopup, setMorePopup] = useState<HTMLElement | null>(null)
  const [channelId, setChannelId] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const copyToClipBoard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      enqueueSnackbar('Link copied!', {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (err) {
      enqueueSnackbar('Failed to copy link', {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  const columns = [
    { field: 'title', headerName: 'Title', flex: 2 },
    {
      field: 'createdDate',
      headerName: 'Date',
      flex: 1,
      sortable: false,
      renderCell: ({ row }: GridCellParams) => {
        return (
          <div>
            {formatISO(parseISO(row.createdDate), { representation: 'date' })}
          </div>
        )
      }
    },
    {
      field: 'url',
      headerName: 'URL',
      flex: 2,
      sortable: false
    },
    {
      field: 'link',
      headerName: 'Link to share',
      flex: 2,
      sortable: false,
      renderCell: ({ row }: GridCellParams) => {
        return (
          <Box
            onClick={async () =>
              await copyToClipBoard(`${row.domain}/${row.id}`)
            }
            sx={{ cursor: 'pointer' }}
          >{`${row.domain}/${row.id}`}</Box>
        )
      }
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      sortable: false,
      renderCell: ({ row }: GridCellParams) => (
        <IconButton
          onClick={(event) => {
            setMorePopup(event.currentTarget)
            setChannelId(row.id)
          }}
        >
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      )
    }
  ]

  return (
    <Paper>
      <DataGrid
        autoHeight
        disableColumnMenu
        disableRowSelectionOnClick
        rows={data}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        slots={{
          toolbar: ShortLinksTableHeader
        }}
        sx={{
          fontFamily: 'Montserrat',
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700
          }
        }}
      />
      <Popover
        open={Boolean(morePopup)}
        anchorEl={morePopup}
        onClose={() => setMorePopup(null)}
      >
        <Stack sx={{ p: 4 }} spacing={4}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              onDelete(channelId)
              setMorePopup(null)
            }}
          >
            <DeleteOutlineOutlinedIcon />
            <Typography>{t('Delete')}</Typography>
          </Stack>
        </Stack>
      </Popover>
    </Paper>
  )
}
