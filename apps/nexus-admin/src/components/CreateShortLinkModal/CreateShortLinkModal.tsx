import { gql, useMutation } from '@apollo/client'
import DeleteIcon from '@mui/icons-material/Delete'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { useFormik } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { FC, useEffect, useState } from 'react'
import useDrivePicker from 'react-google-drive-picker'
import { CallbackDoc } from 'react-google-drive-picker/dist/typeDefs'
import { object, string } from 'yup'

import { GET_GOOGLE_ACCESS_TOKEN } from '../../../pages/resources/import-youtube-template'
import { getOrigin } from '../../../utils/getOrigin'
import { Modal } from '../Modal'

const GET_GOOGLE_SHEET_DATA = gql`
  mutation getSheetData($tokenId: String!, $spreadsheetId: String!) {
    getSheetData(tokenId: $tokenId, spreadsheetId: $spreadsheetId)
  }
`

interface CreateShortLinkModalProps {
  open: boolean
  onClose: () => void
  refetch: () => void
}

export interface Redirection {
  url: string
  value: string
}

const shortLinkValidationSchema = object({
  title: string().required('Title is required'),
  description: string().required('Description is required'),
  url: string().required('URL is required'),
  domain: string().required('Domain is required')
})

export const CreateShortLinkModal: FC<CreateShortLinkModalProps> = ({
  open,
  onClose,
  refetch
}) => {
  const [selectedTemplateFile, setSelectedTemplateFile] =
    useState<CallbackDoc | null>(null)
  const [redirections, setRedirections] = useState<Redirection[]>([])
  const [googleAccessToken, setGoogleAccessToken] = useState('')
  const [googleAccessTokenId, setGoogleAccessTokenId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [openPicker] = useDrivePicker()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const [getGoogleAccessToken] = useMutation(GET_GOOGLE_ACCESS_TOKEN)
  const [getGoogleSheetData] = useMutation(GET_GOOGLE_SHEET_DATA)

  const availableDomains = ['link.myfp.ws', 'hi.switchy.io', 'swiy.io']

  const closeModal = (): void => {
    onClose()
    formik.resetForm()
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      url: '',
      domain: ''
    },
    validationSchema: shortLinkValidationSchema,
    onSubmit: (values) => {
      const switchyData = {
        title: values.title,
        description: values.description,
        url: values.url,
        domain: values.domain,
        extraOptionsGeolocations: redirections
      }
      void createSwitchyLink(switchyData)
    }
  })

  const createSwitchyLink = async (switchyData): Promise<void> => {
    setIsLoading(true)

    try {
      const { status } = await axios.post(
        process.env.NEXT_PUBLIC_SWITCHY_CREATE_URL ??
          'https://api.switchy.io/v1/links/create',
        {
          link: {
            workspaceId: process.env.NEXT_PUBLIC_SWITCHY_WORKSPACE_ID ?? 34782,
            folderId: process.env.NEXT_PUBLIC_SWITCHY_FOLDER_ID ?? 65091,
            ...switchyData
          }
        },
        {
          headers: {
            'Api-Authorization':
              process.env.NEXT_PUBLIC_SWITCHY_WORKSPACE_KEY ?? ''
          }
        }
      )

      if (status === 201) {
        setIsLoading(false)

        enqueueSnackbar('Switchy link created successfully!', {
          variant: 'success',
          preventDuplicate: true
        })

        setRedirections([])
        setSelectedTemplateFile(null)
        onClose()

        void refetch()
      }
    } catch (error) {
      setIsLoading(false)

      enqueueSnackbar('Error creating switchy link', {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope:
      'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/spreadsheets.readonly',
    onSuccess: async ({ code }) => {
      void getGoogleAccessToken({
        variables: {
          input: {
            url: getOrigin(),
            authCode: code
          }
        },
        onCompleted: (data) => {
          setGoogleAccessTokenId(data.getGoogleAccessToken.id as string)
          setGoogleAccessToken(data.getGoogleAccessToken.accessToken as string)
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
        if (data.action === 'picked') {
          setSelectedTemplateFile(data.docs[0])
          const fileId = data.docs[0].id

          void getGoogleSheetData({
            variables: {
              tokenId: googleAccessTokenId,
              spreadsheetId: fileId
            },
            onCompleted: (data) => {
              const sheetData = data.getSheetData.map((sheet) => ({
                url: sheet.url,
                value: sheet.country_code
              }))

              interface TSheetData {
                url: string
                value: string
              }

              setRedirections(sheetData as TSheetData[])
            }
          })
        }
      }
    })
  }

  useEffect(() => {
    if (googleAccessToken !== '') {
      filePicker()
    }
  }, [googleAccessToken])

  return (
    <Modal
      title="Create short link"
      open={open}
      handleClose={closeModal}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button
            onClick={() => {
              formik.resetForm()
              setRedirections([])
              setSelectedTemplateFile(null)
              closeModal()
            }}
            disabled={isLoading}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={formik.submitForm}
            disabled={selectedTemplateFile === null || isLoading}
          >
            {t('Create')}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={4}>
        <TextField
          label="Title"
          variant="filled"
          id="title"
          name="title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.touched.title) && Boolean(formik.errors.title)}
          helperText={Boolean(formik.touched.title) && formik.errors.title}
        />
        <TextField
          label="Description"
          variant="filled"
          id="description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            Boolean(formik.touched.description) &&
            Boolean(formik.errors.description)
          }
          helperText={
            Boolean(formik.touched.description) && formik.errors.description
          }
        />
        <TextField
          label="URL"
          variant="filled"
          id="url"
          name="url"
          value={formik.values.url}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.touched.url) && Boolean(formik.errors.url)}
          helperText={Boolean(formik.touched.url) && formik.errors.url}
        />
        <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel>{t('Domain')}</InputLabel>
          <Select
            id="name"
            name="domain"
            value={formik.values.domain}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              Boolean(formik.touched.domain) && Boolean(formik.errors.domain)
            }
          >
            {availableDomains.map((availableDomain) => (
              <MenuItem key={availableDomain} value={availableDomain}>
                {availableDomain}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack alignItems="flex-start" spacing={2}>
          <Typography variant="subtitle2">
            {t('Pick Template From Google Drive')}
          </Typography>
          {selectedTemplateFile === null && (
            <Button
              variant="outlined"
              startIcon={<PublishOutlinedIcon />}
              onClick={() => {
                if (googleAccessToken === '') {
                  googleLogin()
                } else {
                  filePicker()
                }
              }}
            >
              {t('Pick redirections template')}
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
      </Stack>
    </Modal>
  )
}
