import { gql, useMutation } from '@apollo/client'
import DeleteIcon from '@mui/icons-material/Delete'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useGoogleLogin } from '@react-oauth/google'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import useDrivePicker from 'react-google-drive-picker'
import { CallbackDoc } from 'react-google-drive-picker/dist/typeDefs'

import { MainLayout } from '../../src/components/MainLayout'

import { GET_RESOURCES } from '.'

const GET_GOOGLE_ACCESS_TOKEN = gql`
  mutation getGoogleAccessToken($input: GoogleAuthInput!) {
    getGoogleAccessToken(input: $input) {
      id
      accessToken
    }
  }
`

const GET_RESOUCE_FROM_TEMPLATE = gql`
  mutation ResourceFromTemplate(
    $nexusId: String!
    $tokenId: String!
    $spreadsheetId: String!
    $drivefolderId: String!
  ) {
    resourceFromTemplate(
      nexusId: $nexusId
      tokenId: $tokenId
      spreadsheetId: $spreadsheetId
      drivefolderId: $drivefolderId
    ) {
      id
      nexusId
      name
      status
      createdAt
      updatedAt
      deletedAt
      googleDriveLink
      category
      privacy
      sourceType
      localizations {
        id
        title
      }
    }
  }
`

const ImportYouTubeTemplatePage: FC = () => {
  const [selectedTemplateFile, setSelectedTemplateFile] =
    useState<CallbackDoc | null>(null)
  const [selectedVideosDirectory, setSelectedVideosDirectory] =
    useState<CallbackDoc | null>(null)
  const [openPicker] = useDrivePicker()
  const [getGoogleAccessToken] = useMutation(GET_GOOGLE_ACCESS_TOKEN)
  const [getResourceFromTemplate] = useMutation(GET_RESOUCE_FROM_TEMPLATE)
  const [googleAccessToken, setGoogleAccessToken] = useState('')
  const [googleAccessTokenId, setGoogleAccessTokenId] = useState('')
  const [resourceType, setResourceType] = useState<'file' | 'directory' | ''>(
    ''
  )
  const nexusId =
    typeof window !== 'undefined' ? localStorage.getItem('nexusId') : ''

  const router = useRouter()

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope:
      'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/spreadsheets.readonly',
    onSuccess: async ({ code }) => {
      void getGoogleAccessToken({
        variables: {
          input: {
            url:
              process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ??
              'http://localhost:4200',
            authCode: code
          }
        },
        onCompleted: (data) => {
          setGoogleAccessTokenId(data.getGoogleAccessToken.id)
          setGoogleAccessToken(data.getGoogleAccessToken.accessToken)
        }
      })
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
          console.log(googleAccessTokenId)
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
          console.log(googleAccessTokenId)
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

  const uploadYoutubeTemplate = (): void => {
    void getResourceFromTemplate({
      variables: {
        nexusId,
        tokenId: googleAccessTokenId,
        spreadsheetId: selectedTemplateFile?.id,
        drivefolderId: selectedVideosDirectory?.id
      },
      onCompleted: () => {
        router.push('/resources')
      },
      refetchQueries: [GET_RESOURCES]
    })
  }

  return (
    <MainLayout title="Import Youtube Template">
      <Paper elevation={0} sx={{ px: 4, py: 8, mt: 4 }}>
        <Stack spacing={8}>
          <Stack alignItems="flex-start" spacing={2}>
            <Typography variant="h6">
              Pick Template From Google Drive
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
                Upload Youtube Template
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
              Pick Google Drive Directory For Videos
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
                Choose Video Folder
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
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{ alignSelf: 'flex-end' }}
              disabled={
                selectedTemplateFile === null ||
                selectedVideosDirectory === null
              }
              onClick={uploadYoutubeTemplate}
            >
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
