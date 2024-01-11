import DeleteIcon from '@mui/icons-material/Delete'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import { Button, IconButton, Paper, Stack, Typography } from '@mui/material'
import { useGoogleLogin } from '@react-oauth/google'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useState } from 'react'
import useDrivePicker from 'react-google-drive-picker'
import { CallbackDoc } from 'react-google-drive-picker/dist/typeDefs'
import { MainLayout } from '../../src/components/MainLayout'

const ImportYouTubeTemplatePage = () => {
  const [selectedTemplateFile, setSelectedTemplateFile] =
    useState<CallbackDoc | null>(null)
  const [selectedVideosDirectory, setSelectedVideosDirectory] =
    useState<CallbackDoc | null>(null)
  const [openPicker] = useDrivePicker()

  const filePicker = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async ({ access_token }) => {
      console.log(`Here is the access token: ${access_token}`)

      openPicker({
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
        developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '',
        token: access_token ?? '',
        viewId: 'SPREADSHEETS',
        callbackFunction: (data) => {
          if (data.action === 'cancel') {
            console.log('User clicked cancel/close button')
          }

          if (data.action === 'picked') {
            setSelectedTemplateFile(data.docs[0])
          }
        }
      })
    }
  })

  const directoryPicker = useGoogleLogin({
    flow: 'implicit',
    onSuccess: ({ access_token }) => {
      console.log(`Here is the access token: ${access_token}`)

      openPicker({
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
        developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '',
        token: access_token ?? '',
        viewId: 'FOLDERS',
        setSelectFolderEnabled: true,
        callbackFunction: (data) => {
          if (data.action === 'cancel') {
            console.log('User clicked cancel/close button')
          }

          if (data.action === 'picked') {
            setSelectedVideosDirectory(data.docs[0])
          }
        }
      })
    }
  })

  return (
    <MainLayout title="Import Youtube Template">
      <Paper elevation={0} sx={{ px: 4, py: 8, mt: 4 }}>
        <Stack spacing={8}>
          <Stack alignItems="flex-start" spacing={2}>
            <Typography variant="h6">
              Pick Template From Google Drive
            </Typography>
            {!selectedTemplateFile && (
              <Button
                variant="outlined"
                startIcon={<PublishOutlinedIcon />}
                onClick={() => filePicker()}
              >
                Upload Youtube Template
              </Button>
            )}
            {selectedTemplateFile && (
              <Stack direction="row" alignItems="center" spacing={4}>
                <PublishOutlinedIcon />
                <Typography>{selectedTemplateFile['name']}</Typography>
                <IconButton onClick={() => setSelectedTemplateFile(null)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            )}
          </Stack>
          <Stack alignItems="flex-start" spacing={2}>
            <Typography variant="h6">
              Pick Google Drive Directory For Videos
            </Typography>
            {!selectedVideosDirectory && (
              <Button
                variant="outlined"
                startIcon={<FolderOutlinedIcon />}
                onClick={() => directoryPicker()}
              >
                Choose Video Folder
              </Button>
            )}
            {selectedVideosDirectory && (
              <Stack direction="row" alignItems="center" spacing={4}>
                <FolderOutlinedIcon />
                <Typography>{selectedVideosDirectory['name']}</Typography>
                <IconButton onClick={() => setSelectedVideosDirectory(null)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            )}
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            spacing={4}
          >
            <Button sx={{ alignSelf: 'flex-end' }}>Cancel</Button>
            <Button variant="contained" sx={{ alignSelf: 'flex-end' }}>
              Upload Youtube Template
            </Button>
          </Stack>
        </Stack>
      </Paper>
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
})(ImportYouTubeTemplatePage)
