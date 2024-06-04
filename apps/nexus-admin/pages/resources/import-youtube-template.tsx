import DeleteIcon from '@mui/icons-material/Delete'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useGoogleLogin } from '@react-oauth/google'
import { useRouter } from 'next/router'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { FC, useEffect, useState } from 'react'
import useDrivePicker from 'react-google-drive-picker'
import { CallbackDoc } from 'react-google-drive-picker/dist/typeDefs'

import { MainLayout } from '../../src/components/MainLayout'
import { UploadConfirmationModal } from '../../src/components/UploadConfirmationModal'

const ImportYouTubeTemplatePage: FC = () => {
  const [selectedTemplateFile, setSelectedTemplateFile] =
    useState<CallbackDoc | null>(null)
  const [selectedVideosDirectory, setSelectedVideosDirectory] =
    useState<CallbackDoc | null>(null)
  const [openPicker] = useDrivePicker()
  const [googleAccessToken, setGoogleAccessToken] = useState('')
  const [resourceType, setResourceType] = useState<'file' | 'directory' | ''>(
    ''
  )
  const { t } = useTranslation()
  const router = useRouter()
  const [consentOpen, setConsentOpen] = useState(false)

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    scope:
      'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.upload',
    onSuccess: async ({ access_token: accessToken }) => {
      setGoogleAccessToken(accessToken)
    }
  })

  const filePicker = function (): void {
    openPicker({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '',
      token: googleAccessToken ?? '',
      viewId: 'SPREADSHEETS',
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button')
        }

        if (data.action === 'picked') {
          setSelectedTemplateFile(data.docs[0])
          console.log(data.docs[0]?.id)
        }
      }
    })
  }

  const directoryPicker = function (): void {
    openPicker({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '',
      token: googleAccessToken ?? '',
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

  useEffect(() => {
    if (googleAccessToken !== '') {
      if (resourceType === 'file') {
        filePicker()
      }

      if (resourceType === 'directory') {
        directoryPicker()
      }
    }
  }, [googleAccessToken])

  return (
    <MainLayout title="Import Youtube Template">
      <Paper elevation={0} sx={{ px: 4, py: 8, mt: 4 }}>
        <Stack spacing={8}>
          <Stack alignItems="flex-start" spacing={2}>
            <Typography variant="h6">
              {t('Pick Template From Google Drive')}
            </Typography>
            {selectedTemplateFile === null && (
              <Button
                variant="outlined"
                startIcon={<PublishOutlinedIcon />}
                onClick={() => {
                  setResourceType('file')

                  if (googleAccessToken === '') {
                    googleLogin()
                  } else {
                    filePicker()
                  }
                }}
              >
                {t('Upload Youtube Template')}
              </Button>
            )}
            {selectedTemplateFile !== null && (
              <Stack direction="row" alignItems="center" spacing={4}>
                <PublishOutlinedIcon />
                <Typography>{selectedTemplateFile.name}</Typography>
                <IconButton onClick={() => setSelectedTemplateFile(null)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            )}
          </Stack>
          <Stack alignItems="flex-start" spacing={2}>
            <Typography variant="h6">
              {t('Pick Google Drive Directory For Videos')}
            </Typography>
            {selectedVideosDirectory === null && (
              <Button
                variant="outlined"
                startIcon={<FolderOutlinedIcon />}
                onClick={() => {
                  setResourceType('directory')

                  if (googleAccessToken === '') {
                    googleLogin()
                  } else {
                    directoryPicker()
                  }
                }}
              >
                {t('Choose Video Folder')}
              </Button>
            )}
            {selectedVideosDirectory !== null && (
              <Stack direction="row" alignItems="center" spacing={4}>
                <FolderOutlinedIcon />
                <Typography>{selectedVideosDirectory.name}</Typography>
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
            <Button sx={{ alignSelf: 'flex-end' }} onClick={router.back}>
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              sx={{ alignSelf: 'flex-end' }}
              disabled={
                selectedTemplateFile === null ||
                selectedVideosDirectory === null
              }
              onClick={() => setConsentOpen(true)}
            >
              {t('Upload Youtube Template')}
            </Button>
          </Stack>
        </Stack>
      </Paper>
      <UploadConfirmationModal
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        selectedTemplateFile={selectedTemplateFile}
        selectedVideosDirectory={selectedVideosDirectory}
        googleAccessToken={googleAccessToken}
      />
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
