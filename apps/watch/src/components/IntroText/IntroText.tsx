import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { ReactElement } from 'react'

export function IntroText(): ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        position: 'relative',
        py: { xs: 10, lg: 20 }
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={10}>
          <Typography variant="h3" color="secondary.contrastText">
            About Our Project
          </Typography>
          <Stack direction="row" spacing={4}>
            <Box
              sx={{
                backgroundColor: 'primary.main',
                height: 'inherit',
                width: { xs: 38, lg: 14 }
              }}
            />
            <Typography
              variant="subtitle2"
              color="secondary.contrastText"
              sx={{ opacity: 0.85 }}
            >
              With 70% of the world not being able to speak English, there is a
              huge opportunity for the gospel to spread to unreached places. We
              have a vision to make it easier to watch, download and share
              Christian videos with people in their native heart language.
            </Typography>
          </Stack>
          <Typography
            variant="subtitle1"
            color="secondary.contrastText"
            sx={{ opacity: 0.85 }}
          >
            Jesus Film Project is a Christian ministry with a vision to reach
            the world with the gospel of Jesus Christ through evangelistic
            videos. Watch from over 2000 languages on any device and share it
            with others.
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
