import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'

export interface VisitorListReportProps {
    input: string[]
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
          field: 'location',
          headerName: 'Location',
          type: 'string',
          width: 110,
          editable: true,
        },
        {
          field: 'startTime',
          headerName: 'Start Time',
          description: 'This column has a value getter and is not sortable.',
          sortable: false,
          width: 160,
          // valueGetter: (params) =>
          //   // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          //   `${params.row.firstName} ${params.row.lastName}`,
        },
        {
          field: 'chatStartTime',
          headerName: 'Chat Start Time',
          type: 'number',
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
      
      const rows = [
        { id: 1, location: 'Snow', startTime: 'Jon', chatStartTime: 35, stared: 10 },
        { id: 2, location: 'Snow', startTime: 'Jon', chatStartTime: 35, stared: 10 },
        { id: 3, location: 'Snow', startTime: 'Jon', chatStartTime: 35, stared: 10 },
        { id: 4, location: 'Snow', startTime: 'Jon', chatStartTime: 35, stared: 10 },
        { id: 5, location: 'Snow', startTime: 'Jon', chatStartTime: 35, stared: 10 },
        { id: 6, location: 'Snow', startTime: 'Jon', chatStartTime: 35, stared: 10 },
        { id: 7, location: 'Snow', startTime: 'Jon', chatStartTime: 35, stared: 10 },
        { id: 8, location: 'Snow', startTime: 'Jon', chatStartTime: 35, stared: 10 },
      ];


    return (
      <>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableSelectionOnClick
            experimentalFeatures={{ newEditingApi: true }}
            />
        </Box>
      </>
    )
  }
  