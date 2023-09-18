import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

export function Header(props: any): ReactElement {
  const title = props.page.title ?? 'default'
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100px'
      }}
    >
      <Typography variant="h2" sx={{ minHeight: '100px' }}>
        {title}
      </Typography>
    </Box>
  )
}
