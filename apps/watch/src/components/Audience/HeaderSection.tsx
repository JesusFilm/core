import React from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'

export function HeaderSection() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4
      }}
    >
      <Stack direction="column" spacing={0}>
        <Typography variant="h3" sx={{ mb: 1 }}>
          Today for you
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 0, opacity: 0.5 }}>
          November 26, 2024
        </Typography>
      </Stack>
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Button
          variant="text"
          color="primary"
          startIcon={<SearchIcon />}
          onClick={() => console.log('Explore clicked')}
        >
          Explore
        </Button>
      </Box>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Button
          color="primary"
          onClick={() => console.log('Explore clicked')}
          sx={{ flexDirection: 'column', p: 1 }}
        >
          <SearchIcon />
          <Typography variant="caption" sx={{ mt: 0.5 }}>
            Explore
          </Typography>
        </Button>
      </Box>
    </Box>
  )
}
