import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { FC } from 'react'
import { CallbackDoc } from 'react-google-drive-picker/dist/typeDefs'

import { GET_RESOURCES } from '../../../pages/resources'
import { Modal } from '../Modal'

const GET_RESOUCE_FROM_TEMPLATE = gql`
  mutation ResourceFromTemplate($input: ResourceFromTemplateInput!) {
    resourceFromTemplate(input: $input) {
      id
    }
  }
`

interface UploadConfirmationModalProps {
  open: boolean
  onClose: () => void
  selectedTemplateFile: CallbackDoc | null
  selectedVideosDirectory: CallbackDoc | null
  googleAccessToken: string
}

export const UploadConfirmationModal: FC<UploadConfirmationModalProps> = ({
  open,
  onClose,
  selectedTemplateFile,
  selectedVideosDirectory,
  googleAccessToken
}) => {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [getResourceFromTemplate, { loading }] = useMutation(
    GET_RESOUCE_FROM_TEMPLATE
  )

  const { t } = useTranslation()

  const uploadYoutubeTemplate = (): void => {
    void getResourceFromTemplate({
      variables: {
        input: {
          accessToken: googleAccessToken,
          spreadsheetId: selectedTemplateFile?.id,
          drivefolderId: selectedVideosDirectory?.id
        }
      },
      onCompleted: () => {
        onClose()
        enqueueSnackbar('Resource Uploaded', {
          variant: 'success',
          preventDuplicate: true
        })
        void router.push('/resources')
      },
      refetchQueries: [GET_RESOURCES]
    })
  }

  return (
    <Modal
      title="Upload Confirmation"
      open={open}
      handleClose={onClose}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button disabled={loading} onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={
              selectedTemplateFile === null ||
              selectedVideosDirectory === null ||
              loading
            }
            onClick={uploadYoutubeTemplate}
          >
            {t('Upload')}
          </Button>
        </Stack>
      }
    >
      <Stack>
        <Typography>
          {t(
            'By clicking Upload, you certify that the content you are uploading complies with the YouTube Terms of Service, Please be sure not to violate others copyright or privacy rights.'
          )}
        </Typography>
      </Stack>
    </Modal>
  )
}
