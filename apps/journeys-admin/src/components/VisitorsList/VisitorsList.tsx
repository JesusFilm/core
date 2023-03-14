import { ReactElement } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import Box from '@mui/material/Box'

export function VisitorsList(): ReactElement {
  const columns = [
    {
      field: 'id',
      headerName: 'ID'
    },
    {
      field: 'userId',
      headerName: 'User ID'
    },
    {
      field: 'name',
      headerName: 'Name'
    }
  ]

  const rows = [
    {
      id: 1,
      userId: 'user1.id',
      name: 'Test'
    }
  ]

  function handleRowClick(params): void {
    console.log(params.row.userId) // redirect to /reports/visitors/[visitorId]
  }

  return (
    <Box sx={{ height: 400, width: '100%' }}>
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
