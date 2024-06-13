import TextField from '@mui/material/TextField'
import { GridColDef } from '@mui/x-data-grid'
import { ReactElement } from 'react'

interface CellTextFieldProps {
  value: string
}
const CellTextField = ({ value }: CellTextFieldProps): ReactElement => (
  <TextField
    variant="standard"
    value={value}
    multiline
    maxRows={3}
    fullWidth
    disabled
    InputProps={{
      disableUnderline: true
    }}
    sx={{
      p: 0,
      '& .MuiInputBase-input.Mui-disabled': {
        fontSize: '14px',
        WebkitTextFillColor: 'black',
        '&:hover': {
          cursor: 'pointer'
        }
      }
    }}
  />
)

export function getColDefs(t: (value) => string): GridColDef[] {
  return [
    {
      field: 'id',
      headerName: t('ID')
    },
    {
      field: 'lastStepViewedAt',
      headerName: t('Last Active'),
      width: 200
    },
    {
      field: 'lastChatPlatform',
      headerName: t('Chat Started'),
      width: 200
    },
    {
      field: 'lastLinkAction',
      headerName: t('Action'),
      width: 400
    },
    {
      field: 'lastTextResponse',
      headerName: t('User Data'),
      flex: 1,
      minWidth: 300,
      renderCell: (cellValues) => <CellTextField value={cellValues.value} />
    },
    {
      field: 'lastRadioQuestion',
      headerName: t('Polls'),
      flex: 1,
      minWidth: 300,
      renderCell: (cellValues) => <CellTextField value={cellValues.value} />
    }
  ]
}
