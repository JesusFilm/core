import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'

export function FilterDrawer(): ReactElement {
  return (
    <>
      <Box sx={{ px: 6, py: 5 }}>
        <Typography>Location</Typography>
        <Typography>Source</Typography>
      </Box>

      <Divider />

      <Box sx={{ px: 6, py: 5 }}>
        <Typography variant="subtitle2">Categories</Typography>
        <Typography>Chat Started</Typography>
        <Typography>With Poll Answers</Typography>
        <Typography>With Submitted Text</Typography>
        <Typography>With Icon</Typography>
        <Typography>Hide Inactive</Typography>
      </Box>

      <Divider />

      <Box sx={{ px: 6, py: 5 }}>
        <Typography variant="subtitle2">Sort By</Typography>
        <Typography>Date</Typography>
        <Typography>Duration</Typography>
      </Box>
    </>
  )
}
