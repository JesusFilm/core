import { ReactElement } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import { useVisitors } from '../../libs/useVisitors'

export function VisitorsList(): ReactElement {
  const visitors = useVisitors()
  const columns = [
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

  function handleRowClick(params): void {
    console.log(params.row.id) // redirect to /reports/visitors/[visitorId]
  }

  return (
    <Box sx={{ height: '97vh', width: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        onRowClick={handleRowClick}
        // initialState={{
        //   pagination: {
        //     paginationModel: {
        //       pageSize: 5
        //     }
        //   }
        // }}
        // pageSizeOptions={[5]}
        disableRowSelectionOnClick
      />
    </Box>
  )
}
