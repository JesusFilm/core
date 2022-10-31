import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'

export interface VisitorListProps {
  input: Array<{ [key: string]: any; }>
}
  
export function VisitorList({
  input
}: VisitorListProps): ReactElement { 
  const useable:any = []
  let cursor = 5

  for (const key of Object.keys(input)) {
    if (key !== "cursor") {
      useable.push(input[key])
    }     
    else if (key === "cursor") {
      cursor = input[key]
    }
  }
  
  const columns = [
      {
        field: 'id',
        headerName: 'Ident.',
        width: 150,
        editable: false,
      },        
      {
        field: 'teamId',
        headerName: 'Team ID',
        type: 'number',
        width: 110,
        editable: false,
      },
      {
        field: 'userId',
        headerName: 'User ID',
        sortable: false,
        width: 160,
        editable: false,          
      },
      {
        field: 'createdAt',
        headerName: 'Created At',
        type: 'string',
        width: 110,
        editable: false,
      },
      {
        field: 'stared',
        headerName: 'Stared',
        type: 'number',
        width: 110,
        editable: false,
      },
    ];

  return (
    <>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          getRowId={(row) => row.id}
          rows={useable}
          columns={columns}
          pageSize={cursor}
          rowsPerPageOptions={[cursor]}
          disableSelectionOnClick            
          />
      </Box>
    </>
  )
}
