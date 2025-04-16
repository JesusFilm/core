import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

export default function VideoHdLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  )
}
