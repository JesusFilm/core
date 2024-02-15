import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import SortIcon from '@mui/icons-material/Sort'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { FC, useState } from 'react'

import { MainLayout } from '../../src/components/MainLayout'

const ResourceDetailsPage: FC = () => {
  const [value, setValue] = useState(0)

  const handleChange = (
    event: React.SyntheticEvent,
    newValue: number
  ): void => {
    setValue(newValue)
  }

  return (
    <MainLayout title="Video Details">
      <Box
        sx={{
          backgroundColor: 'white',
          width: '1000px',
          margin: '0 auto',
          borderRadius: '8px',
          padding: '16px'
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              width: '328px',
              height: '170px',
              borderRadius: '8px',
              backgroundImage: "url('https://fakeimg.pl/320x170')"
            }}
          />
          <Stack direction="row" alignItems="center" spacing={1}>
            <InfoOutlinedIcon />
            <Typography>Thumbnail for Jesus Film</Typography>
          </Stack>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange}>
              <Tab label="Localization" />
              <Tab label="Channel" />
            </Tabs>
          </Box>
          <Stack direction="row" alignItems="center" spacing={4}>
            <Stack
              direction="row"
              sx={{
                flex: 1
              }}
            >
              <TextField
                variant="filled"
                placeholder="Lorem ipsum"
                sx={{
                  flex: 1
                }}
              />
              <Button variant="contained">Search</Button>
            </Stack>
            <SortIcon />
          </Stack>
          <Stack
            spacing={4}
            sx={{
              pt: 2
            }}
          >
            <Paper
              elevation={1}
              sx={{
                px: 6,
                py: 4
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Stack spacing={4}>
                    <Stack>
                      <Typography>Filename</Typography>
                      <Typography>Filename</Typography>
                    </Stack>
                    <Stack>
                      <Typography>Title</Typography>
                      <Typography>Filename</Typography>
                    </Stack>
                    <Stack>
                      <Typography>Language</Typography>
                      <Typography>Filename</Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={8}>
                  <Stack spacing={4}>
                    <Stack>
                      <Typography>Description</Typography>
                      <Typography>Filename</Typography>
                    </Stack>
                    <Stack>
                      <Typography>Keyword</Typography>
                      <Typography>Filename</Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
            <Paper
              elevation={1}
              sx={{
                px: 6,
                py: 4
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Stack spacing={4}>
                    <Stack>
                      <Typography>Filename</Typography>
                      <Typography>Filename</Typography>
                    </Stack>
                    <Stack>
                      <Typography>Title</Typography>
                      <Typography>Filename</Typography>
                    </Stack>
                    <Stack>
                      <Typography>Language</Typography>
                      <Typography>Filename</Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={8}>
                  <Stack spacing={4}>
                    <Stack>
                      <Typography>Description</Typography>
                      <Typography>Filename</Typography>
                    </Stack>
                    <Stack>
                      <Typography>Keyword</Typography>
                      <Typography>Filename</Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Stack>
      </Box>
    </MainLayout>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user }) => {
  const token = await user?.getIdToken()

  return {
    props: {
      token
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(ResourceDetailsPage)
