import { ReactElement } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { useVisitors } from '../../libs/useVisitors'

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  overflow: 'hidden',
  '& .MuiDataGrid-row': {
    borderTop: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      cursor: 'pointer'
    }
  },
  '& .MuiDataGrid-row--lastVisible': {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  '& .MuiDataGrid-cell:focus': {
    outline: 'none'
  }
}))

export function VisitorsList(): ReactElement {
  const visitors = useVisitors()
  const router = useRouter()

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100
    },
    {
      field: 'lastStepViewedAt',
      headerName: 'Last Active',
      width: 300
    },
    {
      field: 'lastChatPlatform',
      headerName: 'Chat Started',
      width: 300
    },
    {
      field: 'lastLinkAction',
      headerName: 'Action',
      width: 300
    },
    {
      field: 'lastTextResponse',
      headerName: 'User Data',
      width: 300
    },
    {
      field: 'lastRadioQuestion',
      headerName: 'Polls',
      width: 300
    }
  ]

  console.log(visitors)

  const rows =
    visitors != null
      ? visitors.map((visitor) => {
          return {
            id: visitor.node.id,
            createdAt: new Intl.DateTimeFormat('en-us', {
              dateStyle: 'medium',
              timeStyle: 'short'
            }).format(new Date(visitor.node.createdAt))
          }
        })
      : []

  async function handleRowClick(params): Promise<void> {
    await router.push(`/reports/visitors/${params.row.id as string}`)
  }

  return (
    <Box sx={{ height: '90vh', width: '100%' }}>
      <StyledDataGrid
        columns={columns}
        rows={rows}
        onRowClick={handleRowClick}
        disableRowSelectionOnClick
        columnVisibilityModel={{
          id: false
        }}
        // initialState={{
        //   pagination: {
        //     paginationModel: {
        //       pageSize: 5
        //     }
        //   }
        // }}
        // pageSizeOptions={[5]}
      />
    </Box>
  )
}
