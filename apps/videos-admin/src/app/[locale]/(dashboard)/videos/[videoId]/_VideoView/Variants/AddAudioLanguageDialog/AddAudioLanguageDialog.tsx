import { useLazyQuery, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import {
  Field,
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
  FormikValues
} from 'formik'
import { graphql } from 'gql.tada'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { mixed, object, string } from 'yup'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete/LanguageAutocomplete'

import {
  GetAdminVideoVariant,
  GetAdminVideo_AdminVideo_VideoEditions as VideoEditions
} from '../../../../../../../../libs/useAdminVideo'

import { AudioLanguageFileUpload } from './AudioLanguageFileUpload/AudioLanguageFileUpload'

export const CREATE_VIDEO_VARIANT = graphql(`
  mutation CreateVideoVariant($input: VideoVariantCreateInput!) {
    videoVariantCreate(input: $input) {
      id
      videoId
      slug
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`)

const CLOUDFLARE_R2_CREATE = graphql(`
  mutation CloudflareR2Create($input: CloudflareR2CreateInput!) {
    cloudflareR2Create(input: $input) {
      id
      fileName
      uploadUrl
      publicUrl
    }
  }
`)

const CREATE_MUX_VIDEO_UPLOAD_BY_URL = graphql(`
  mutation CreateMuxVideoUploadByUrl($url: String!) {
    createMuxVideoUploadByUrl(url: $url) {
      id
      assetId
      playbackId
      uploadUrl
      readyToStream
    }
  }
`)

const GET_MY_MUX_VIDEO = graphql(`
  query GetMyMuxVideo($id: ID!) {
    getMyMuxVideo(id: $id) {
      id
      assetId
      playbackId
      readyToStream
    }
  }
`)

interface AddAudioLanguageDialogProps {
  open?: boolean
  handleClose?: () => void
  variantLanguagesMap: Map<string, GetAdminVideoVariant>
  editions?: VideoEditions
}

const validationSchema = object().shape({
  edition: string().required('Edition is required'),
  language: object().nullable().required('Language is required'),
  file: mixed().required('Video file is required')
})

const initialValues: FormikValues = {
  edition: '',
  language: null,
  file: null
}

export function AddAudioLanguageDialog({
  open,
  handleClose,
  variantLanguagesMap,
  editions
}: AddAudioLanguageDialogProps): ReactElement {
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
  const params = useParams<{ videoId: string }>()

  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [muxVideoId, setMuxVideoId] = useState<string>()

  const [createVideoVariant, { loading }] = useMutation(CREATE_VIDEO_VARIANT)
  const [createR2Asset] = useMutation(CLOUDFLARE_R2_CREATE)
  const [createMuxVideo] = useMutation(CREATE_MUX_VIDEO_UPLOAD_BY_URL)
  const [getMyMuxVideo, { stopPolling }] = useLazyQuery(GET_MY_MUX_VIDEO, {
    pollInterval: 1000,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (
        data.getMyMuxVideo.playbackId != null &&
        data.getMyMuxVideo.assetId != null &&
        data.getMyMuxVideo.readyToStream
      ) {
        stopPolling()
        setProcessing(false)
        void handleCreateVideoVariant(data.getMyMuxVideo.id)
      }
    }
  })

  const { data, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529'
  })

  const availableLanguages = data?.languages?.filter(
    (language) => !variantLanguagesMap.has(language.id)
  )

  async function handleCreateVideoVariant(muxId: string): Promise<void> {
    if (formikRef.current?.values == null || params?.videoId == null) return

    const values = formikRef.current.values
    await createVideoVariant({
      variables: {
        input: {
          id: `${values.language.id}_${params?.videoId}`,
          videoId: params?.videoId,
          edition: values.edition,
          languageId: values.language.id,
          slug: `${params.videoId}/${values.language.slug}`,
          downloadable: true,
          published: true,
          muxVideoId: muxId
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Audio Language Added'), { variant: 'success' })
        formikRef.current?.resetForm()
        handleClose?.()
      },
      update: (cache, { data }) => {
        if (data?.videoVariantCreate == null) return
        cache.modify({
          id: cache.identify({
            __typename: 'Video',
            id: data.videoVariantCreate.videoId
          }),
          fields: {
            variants(existingVariants = []) {
              const newVariantRef = cache.writeFragment({
                data: data.videoVariantCreate,
                fragment: graphql(`
                  fragment NewVariant on VideoVariant {
                    id
                    videoId
                    slug
                    language {
                      id
                      name {
                        value
                        primary
                      }
                    }
                  }
                `)
              })
              return [...existingVariants, newVariantRef]
            }
          }
        })
      }
    })
  }

  const formikRef = useRef<FormikProps<FormikValues>>(null)

  const handleSubmit = async (
    values: FormikValues,
    { resetForm }: FormikHelpers<FormikValues>
  ): Promise<void> => {
    if (
      values.language == null ||
      params?.videoId == null ||
      values.file == null
    )
      return

    setUploading(true)

    try {
      const r2Response = await createR2Asset({
        variables: {
          input: {
            fileName: values.file.name,
            videoId: params.videoId
          }
        }
      })

      if (
        r2Response.data?.cloudflareR2Create?.uploadUrl == null ||
        r2Response.data?.cloudflareR2Create?.publicUrl == null
      ) {
        throw new Error(t('Failed to create R2 asset'))
      }

      const formData = new FormData()
      formData.append('file', values.file, values.file.name)
      const response = await fetch(
        r2Response.data.cloudflareR2Create.uploadUrl,
        {
          method: 'PUT',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (!response.ok) {
        throw new Error(t('Failed to upload file to R2'))
      }

      setUploading(false)
      setProcessing(true)

      const muxResponse = await createMuxVideo({
        variables: {
          url: r2Response.data.cloudflareR2Create.publicUrl
        }
      })

      if (muxResponse.data?.createMuxVideoUploadByUrl?.id == null) {
        throw new Error(t('Failed to create Mux video'))
      }

      setMuxVideoId(muxResponse.data.createMuxVideoUploadByUrl.id)
    } catch (error) {
      setUploading(false)
      setProcessing(false)
      enqueueSnackbar(
        error instanceof Error ? error.message : t('Upload failed'),
        {
          variant: 'error'
        }
      )
    }
  }

  useEffect(() => {
    if (processing && muxVideoId != null) {
      void getMyMuxVideo({
        variables: { id: muxVideoId }
      })
    }
  }, [processing, getMyMuxVideo, muxVideoId])

  return (
    <Dialog
      open={open ?? false}
      onClose={handleClose}
      dialogTitle={{ title: t('Add Audio Language'), closeButton: true }}
      divider
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        innerRef={formikRef}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            <Stack gap={4}>
              <Stack gap={2}>
                <FormControl
                  fullWidth
                  error={touched.edition && errors.edition != null}
                >
                  <InputLabel>{t('Edition')}</InputLabel>
                  <Field
                    as={Select}
                    data-testid="EditionSelect"
                    id="edition"
                    name="edition"
                    label={t('Edition')}
                  >
                    {editions?.map(
                      (edition) =>
                        edition?.name != null && (
                          <MenuItem key={edition.id} value={edition.name}>
                            {edition.name}
                          </MenuItem>
                        )
                    )}
                  </Field>
                </FormControl>
                <Box sx={{ width: '100%' }}>
                  <LanguageAutocomplete
                    onChange={async (value) => {
                      await setFieldValue('language', value)
                    }}
                    languages={availableLanguages}
                    loading={loading || languagesLoading}
                    value={values.language ?? undefined}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('Language')}
                        variant="outlined"
                        error={touched.language && errors.language != null}
                        helperText={
                          touched.language && errors.language
                            ? (errors.language as string)
                            : undefined
                        }
                      />
                    )}
                  />
                </Box>
                <AudioLanguageFileUpload
                  disabled={loading}
                  onFileSelect={async (file) => {
                    await setFieldValue('file', file)
                  }}
                  error={
                    touched.file && errors.file
                      ? (errors.file as string)
                      : undefined
                  }
                  loading={loading}
                  uploading={uploading}
                  processing={processing}
                  selectedFile={values.file}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" disabled={loading || languagesLoading}>
                    {t('Add')}
                  </Button>
                </Box>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}
