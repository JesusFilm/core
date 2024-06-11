import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DataGrid, GridCellParams } from '@mui/x-data-grid'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { FC, useState } from 'react'

import { Resources_resources } from '../../../__generated__/Resources'
import { ViewResourceTableModal } from '../ViewResourceTableModal/ViewResourceTableModal'

import { ResourcesTableHeader } from './ResourcesTableHeader'

interface ResourcesTableProps {
  data: Resources_resources[] | []
  onEdit: (channelId: string) => void
  onDelete: (channelId: string) => void
  loading: boolean
}

export const ResourcesTable: FC<ResourcesTableProps> = ({
  data,
  onEdit,
  onDelete,
  loading
}) => {
  const [morePopup, setMorePopup] = useState<HTMLElement | null>(null)
  const [resourceId, setResourceId] = useState<string>('')
  const [isTableViewOpen, setIsTableViewOpen] = useState<boolean>(false)
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  })
  const router = useRouter()
  const { t } = useTranslation()

  const defaultColumnsVisibility = {
    status: true,
    name: true,
    title: true,
    description: true,
    keywords: true,
    action: true
  }
  const [columnsVisibility, setColumnsVisibility] = useState(
    defaultColumnsVisibility
  )

  const allColumnsVisibility = (): void =>
    setColumnsVisibility({
      status: true,
      name: true,
      title: true,
      description: true,
      keywords: true,
      action: true
    })

  const toggleColumnVisibility = (column: string, value: boolean): void => {
    setColumnsVisibility((prevState) => ({
      ...prevState,
      [column]: value
    }))
  }

  const resetColumnsVisibility = (): void => {
    setColumnsVisibility(defaultColumnsVisibility)
  }

  const statusColor = {
    done: 'success',
    published: 'success',
    error: 'error',
    uploaded: 'info'
  }

  const columns = [
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: ({ row }) => (
        <Chip label={row.status} color={statusColor[row.status]} />
      )
    },
    { field: 'name', headerName: 'Filename', flex: 1 },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      renderCell: ({ row }) => (
        <Typography>{row.resourceLocalizations?.[0]?.title}</Typography>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      renderCell: ({ row }) => (
        <Typography>{row.resourceLocalizations?.[0]?.description}</Typography>
      )
    },
    {
      field: 'keywords',
      headerName: 'Keywords',
      flex: 4,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={2}>
          {row.resourceLocalizations?.[0]?.keywords
            ?.split(',')
            ?.map((keyword) => (
              <Chip key={keyword} label={keyword} variant="outlined" />
            ))}
        </Stack>
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      sortable: false,
      renderCell: ({ row }: GridCellParams) => (
        <IconButton
          onClick={(event) => {
            event.stopPropagation()
            setMorePopup(event.currentTarget)
            setResourceId(row.id as string)
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
          toolbar: ResourcesTableHeader
        }}
        slotProps={{
          toolbar: {
            onTableView: () => setIsTableViewOpen(!isTableViewOpen)
          }
        }}
        sx={{
          fontFamily: 'Montserrat',
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700
          }
        }}
        columnVisibilityModel={columnsVisibility}
        onRowClick={({ row }) => {
          void router.push(`/resources/${row.id}`)
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
              onEdit(resourceId)
              setMorePopup(null)
            }}
          >
            <BorderColorOutlinedIcon />
            <Typography>{t('Edit')}</Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              onDelete(resourceId)
              setMorePopup(null)
            }}
          >
            <DeleteOutlineOutlinedIcon />
            <Typography>{t('Delete')}</Typography>
          </Stack>
        </Stack>
      </Popover>
      <ViewResourceTableModal
        open={isTableViewOpen}
        closeModal={() => setIsTableViewOpen(false)}
        columnsVisibility={columnsVisibility}
        toggleColumnVisibility={toggleColumnVisibility}
        allColumnsVisibility={allColumnsVisibility}
        resetColumnsVisibility={resetColumnsVisibility}
      />
    </Paper>
  )
}
