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
          field: 'identification',
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
        { identification: 1, location: 'Snow', startTime: 'Jon', chatStartTimege: 35, stared: 10 },
        { identification: 2, location: 'Snow', startTime: 'Jon', chatStartTimege: 35, stared: 10 },
        { identification: 3, location: 'Snow', startTime: 'Jon', chatStartTimege: 35, stared: 10 },
        { identification: 4, location: 'Snow', startTime: 'Jon', chatStartTimege: 35, stared: 10 },
        { identification: 5, location: 'Snow', startTime: 'Jon', chatStartTimege: 35, stared: 10 },
        { identification: 6, location: 'Snow', startTime: 'Jon', chatStartTimege: 35, stared: 10 },
        { identification: 7, location: 'Snow', startTime: 'Jon', chatStartTimege: 35, stared: 10 },
        { identification: 8, location: 'Snow', startTime: 'Jon', chatStartTimege: 35, stared: 10 },
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
  