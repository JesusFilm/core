import { ReactElement } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { useVisitors } from '../../libs/useVisitors'

export function VisitorsList(): ReactElement {
  const visitors = useVisitors()
  const router = useRouter()

  const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: 12,
    overflow: 'hidden',
    '& .MuiDataGrid-row': {
      borderTop: `1px solid ${theme.palette.divider}`
    },
    '& .MuiDataGrid-row--lastVisible': {
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    '& .MuiDataGrid-cell:focus': {
      outline: 'none'
    }
  }))

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 350
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 300
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 500
    },
    {
      field: 'createdAt',
      headerName: 'Date Created',
      width: 300
    },
    {
      field: 'status',
      headerName: 'Status'
    }
  ]

  const rows =
    visitors != null
      ? visitors.map((visitor) => {
          return {
            id: visitor.node.id,
            name: visitor.node.name,
            email: visitor.node.email,
            createdAt: visitor.node.createdAt,
            status: visitor.node.status
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
