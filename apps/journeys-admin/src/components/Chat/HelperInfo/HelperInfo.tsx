import { ReactElement } from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface Props {
  value: string
}

export function HelperInfo({ value }: Props): ReactElement {
  return (
    <Box display="flex" alignItems="center" color="text.secondary">
      <InfoOutlinedIcon sx={{ mr: 3 }} />
      <Typography variant="caption">{value}</Typography>
    </Box>
  )
}
