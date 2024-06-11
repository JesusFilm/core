import { gql, useMutation } from '@apollo/client'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useGoogleLogin } from '@react-oauth/google'
import { camelCase, mapKeys, pick } from 'lodash'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import Papa from 'papaparse'
import { FC } from 'react'

import { MainLayout } from '../../src/components/MainLayout'
import { useCSVFileUpload } from '../../src/libs/useCSVFileUpload/useCSVFileUpload'

import { GET_RESOURCES } from '.'
// import { UploadConfirmationModal } from '../../src/components/UploadConfirmationModal'

const RESOUCE_FROM_ARRAY = gql`
  mutation ResourceFromArray($input: ResourceFromArrayInput!) {
    resourceFromArray(input: $input) {
      id
    }
  }
`

const ImportYouTubeTemplatePage: FC = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedTemplateFile, openFileDialog, resetTemplateFile] =
    useCSVFileUpload()
  const { enqueueSnackbar } = useSnackbar()

  const [resourceFromArray] = useMutation(RESOUCE_FROM_ARRAY)

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    scope:
      'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.channel-memberships.creator',
    onSuccess: async ({ access_token: accessToken }) => {
      Papa.parse(selectedTemplateFile, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const parsedData = results.data

          const modifiedData = parsedData.map((data) =>
            pick(data, [
              'channel',
              'filename',
              'title',
              'description',
              'custom_thumbnail',
              'keywords',
              'category',
              'privacy',
              'spoken_language',
              'video_id',
              'caption_file',
              'audio_track_file',
              'language',
              'caption_language',
              'notify_subscribers',
              'playlist_id',
              'is_made_for_kids',
              'media_component_id',
              'text_language'
            ])
          )

          console.log(modifiedData)

          const spreadsheetData = modifiedData.map((data) =>
            mapKeys(data, (value, key) => camelCase(key))
          )

          void resourceFromArray({
            variables: {
              input: {
                accessToken,
                spreadsheetData
              }
            },
            onCompleted: () => {
              enqueueSnackbar('Resource Created', {
                variant: 'success',
                preventDuplicate: true
              })

              void router.push('/resources')
            },
            refetchQueries: [GET_RESOURCES]
          })
        }
      })
    }
  })

  return (
    <MainLayout title="Import Youtube Template">
      <Box sx={{ p: 10 }}>
        <Paper elevation={0} sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ p: 4 }}>
            Template and Directory Picker
          </Typography>
          <Divider />
          <Stack spacing={8} sx={{ p: 4 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">
                Download Sample Templates
              </Typography>
              <Typography variant="caption">
                Get pre-made templates to help you get started with
                [Upload/Modify/Localization]
              </Typography>
              <Stack direction="row" spacing={3}>
                <Button startIcon={<DownloadIcon />} color="info">
                  Upload template
                </Button>
                <Button startIcon={<DownloadIcon />} color="info">
                  Modify template
                </Button>
                <Button startIcon={<DownloadIcon />} color="info">
                  Localization template
                </Button>
              </Stack>
            </Stack>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <InfoOutlinedIcon color="info" />
                <Typography variant="subtitle2">
                  Editing your spreadsheet template
                </Typography>
              </Stack>
              <Typography variant="body2">
                To ensure a smooth import process, please make sure the
                following fields are included and editable within your
                spreadsheet template:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2">
                    Video Title: This will be the title viewers see for your
                    video.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Video Description: Add details about your video to capture
                    viewers' attention.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Privacy Settings: Choose public, private, or unlisted for
                    who can see your video.
                  </Typography>
                </li>
              </ul>
              <Typography variant="body2">
                Note: The template you upload must be in CSV format (.csv)
              </Typography>
            </Stack>
            <Stack alignItems="flex-start" spacing={2}>
              <Typography variant="subtitle2">
                Pick template from local drive
              </Typography>
              {selectedTemplateFile === null && (
                <Button
                  variant="outlined"
                  startIcon={<PublishOutlinedIcon />}
                  onClick={() => openFileDialog()}
                >
                  {t('Upload Youtube Template')}
                </Button>
              )}
              {selectedTemplateFile !== null && (
                <Stack direction="row" alignItems="center" spacing={4}>
                  <PublishOutlinedIcon />
                  <Typography>{selectedTemplateFile.name}</Typography>
                  <IconButton onClick={() => resetTemplateFile(null)}>
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
                disabled={selectedTemplateFile === null}
                onClick={() => googleLogin()}
              >
                {t('Upload Youtube Template')}
              </Button>
            </Stack>
          </Stack>
          <Divider />
          <Typography variant="body1" sx={{ p: 4 }}>
            This software application uses YouTube API Services. If you use this
            application, you agree to be bound by{' '}
            <a href="https://www.youtube.com/t/terms" target="__blank">
              YouTube's Terms of Service
            </a>
            , the{' '}
            <a href="http://www.google.com/policies/privacy" target="__blank">
              Google Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="https://security.google.com/settings/security/permissions"
              target="__blank"
            >
              Google Security Settings
            </a>
            . Further, if this application uses Authorized Data, then in
            addition to the application's normal procedure for deleting stored
            data, users can revoke that application's access to their data via
            the{' '}
            <a
              href="https://security.google.com/settings/security/permissions"
              target="__blank"
            >
              Google Security Settings
            </a>
            .
          </Typography>
        </Paper>
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
})(ImportYouTubeTemplatePage)
