import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { DataGrid, GridCellParams } from '@mui/x-data-grid'
import { formatISO, parseISO } from 'date-fns'
import { useSnackbar } from 'notistack'
import { FC, useState } from 'react'

import { Redirection } from '../CreateShortLinkModal'

import { ShortLinksTableHeader } from './ShortLinksTableHeader'

export interface ShortLink {
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
  loading: boolean
}

export const ShortLinksTable: FC<ShortLinksTableProps> = ({
  data,
  loading
}) => {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })
  const { enqueueSnackbar } = useSnackbar()

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
      renderCell: ({ row }: GridCellParams<ShortLink>) => {
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
      renderCell: ({ row }: GridCellParams<ShortLink>) => {
        return (
          <Box
            onClick={async () =>
              await copyToClipBoard(`https://${row.domain}/${row.id}`)
            }
            sx={{ cursor: 'pointer' }}
          >{`https://${row.domain}/${row.id}`}</Box>
        )
      }
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
        pageSizeOptions={[5, 10, 25, 50, 100]}
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
    </Paper>
  )
}
