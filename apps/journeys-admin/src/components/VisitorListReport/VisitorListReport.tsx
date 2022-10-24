import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'

export interface VisitorListReportProps {
    input: Array<{ [key: string]: any; }>
  }
  
  export function VisitorListReport({
    input
  }: VisitorListReportProps): ReactElement {    
    const columns = [
        {
          field: 'id',
          headerName: 'Ident.',
          width: 150,
          editable: true,
        },        
        {
          field: 'teamId',
          headerName: 'Team ID',
          type: 'number',
          width: 110,
          editable: true,
        },
        {
          field: 'userId',
          headerName: 'User ID',
          description: 'This column has a value getter and is not sortable.',
          sortable: false,
          width: 160,          
        },
        {
          field: 'createdAt',
          headerName: 'Created At',
          type: 'string',
          width: 110,
          editable: true,
        },
        {
          field: 'stared',
          headerName: 'Started',
          type: 'number',
          width: 110,
          editable: true,
        },
      ];

    return (
      <>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={input}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick            
            />
        </Box>
      </>
    )
  }
  