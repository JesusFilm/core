import { gql, useMutation } from '@apollo/client'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { object, string } from 'yup'

import InformationCircleContained from '@core/shared/ui/icons/InformationCircleContained'

import { GetJourneyForSharing_journey as JourneyFromLazyQuery } from '../../../../../../__generated__/GetJourneyForSharing'
import { JourneyFields as JourneyFromContext } from '../../../../../../__generated__/JourneyFields'
import { JourneySlugUpdate } from '../../../../../../__generated__/JourneySlugUpdate'
import { Tooltip } from '../../../../Tooltip'

export const JOURNEY_SLUG_UPDATE = gql`
  mutation JourneySlugUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      slug
    }
  }
`

interface LinkTabProps {
  journey?: JourneyFromContext | JourneyFromLazyQuery
  hostname?: string
}

export function LinkTab({ journey, hostname }: LinkTabProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [journeyUpdate] = useMutation<JourneySlugUpdate>(JOURNEY_SLUG_UPDATE)
  const { enqueueSnackbar } = useSnackbar()
  const [isEditing, setIsEditing] = useState(false)

  const previewTitle = 'Aliquam pellentesque ultrices faucibus nulla'
  const previewDescription =
    'Lorem ipsum dolor sit amet consectetur. Habitant feuegiat sit pulvinar mauris elit luctus malesuada non dignissim.'

  const slugSchema = object().shape({
    slug: string().required(t('Required'))
  })

  const handleUpdateSlug = async (
    values: FormikValues,
    { setValues, setSubmitting }: FormikHelpers<FormikValues>
  ): Promise<void> => {
    const id = journey?.id
    if (id == null) return

    setSubmitting(true)

    try {
      const response = await journeyUpdate({
        variables: { id, input: { slug: values.slug } }
      })
      await setValues({ slug: response?.data?.journeyUpdate.slug })
      enqueueSnackbar(t('URL updated successfully'), {
        variant: 'success'
      })
      setIsEditing(false)
    } catch (error) {
      if (error instanceof Error) {
        if ('networkError' in error && error.networkError != null) {
          enqueueSnackbar(
            t('Field update failed. Reload the page or try again.'),
            {
              variant: 'error',
              preventDuplicate: true
            }
          )
        } else {
          enqueueSnackbar(error.message, {
            variant: 'error',
            preventDuplicate: true
          })
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCopyClick = async (): Promise<void> => {
    if (journeyUrl) {
      await navigator.clipboard.writeText(journeyUrl)
      enqueueSnackbar(t('Link copied'), {
        variant: 'success',
        preventDuplicate: true
      })
    }
  }

  const journeyUrl =
    journey?.slug != null && journey.slug !== ''
      ? `${
          hostname != null
            ? `https://${hostname}`
            : (process.env.NEXT_PUBLIC_JOURNEYS_URL ??
              'https://your.nextstep.is')
        }/${journey?.slug}`
      : undefined

  return (
    <TabPanel value="0" sx={{ padding: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              borderRadius: 1,
              backgroundColor: 'background.paper'
            }}
          >
            {/* Image placeholder */}
            <Box
              sx={{
                width: '33%',
                minHeight: 130,
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {journey?.primaryImageBlock?.src != null ? (
                <Image
                  src={journey?.primaryImageBlock?.src ?? ''}
                  alt="Journey Image"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <Skeleton variant="rectangular" width="100%" height="100%" />
              )}
            </Box>
            {/* Content */}
            <Box sx={{ flex: 1, paddingLeft: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {journey?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {journey?.description}
              </Typography>
            </Box>
          </Box>
        </Box>
        {!isEditing ? (
          <>
            {/* Header with Action Buttons - Non-editing */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {JourneyLinkTitle()}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  onClick={handleStartEdit}
                  size="small"
                  variant="outlined"
                  sx={{ minWidth: '6ch', px: 2 }}
                >
                  {t('Edit')}
                </Button>
                <Button
                  onClick={handleCopyClick}
                  size="small"
                  variant="contained"
                  disabled={!journeyUrl}
                  sx={{ minWidth: '6ch', px: 2 }}
                >
                  {t('Copy')}
                </Button>
              </Box>
            </Box>

            {/* Copy View */}
            <TextField
              fullWidth
              hiddenLabel
              variant="filled"
              value={journeyUrl || ''}
              slotProps={{
                input: {
                  readOnly: true
                },
                inputLabel: {
                  shrink: true
                }
              }}
              disabled={!journeyUrl}
              helperText=" "
            />
          </>
        ) : (
          // Edit View with Formik
          journey?.slug != null && (
            <Formik
              initialValues={{ slug: journey.slug }}
              onSubmit={handleUpdateSlug}
              validationSchema={slugSchema}
            >
              {({
                values,
                errors,
                handleChange,
                handleSubmit,
                resetForm,
                isSubmitting
              }) => (
                <>
                  {/* Header with Action Buttons - Editing */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    {JourneyLinkTitle()}

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        onClick={() => {
                          resetForm({ values: { slug: journey.slug } })
                          setIsEditing(false)
                        }}
                        size="small"
                        variant="outlined"
                        disabled={isSubmitting}
                        sx={{ minWidth: '6ch', px: 2 }}
                      >
                        {t('Cancel')}
                      </Button>
                      <Button
                        onClick={() => handleSubmit()}
                        variant="contained"
                        size="small"
                        disabled={isSubmitting}
                        sx={{ minWidth: '6ch', px: 2 }}
                      >
                        {t('Save')}
                      </Button>
                    </Box>
                  </Box>

                  {/* Edit Form */}
                  <Form>
                    <TextField
                      id="slug"
                      name="slug"
                      hiddenLabel
                      fullWidth
                      value={values.slug}
                      variant="filled"
                      error={Boolean(errors.slug)}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      autoFocus
                      InputLabelProps={{ shrink: true }}
                      helperText={
                        values.slug !== '' ? (
                          <>
                            {hostname != null
                              ? `https://${hostname}`
                              : (process.env.NEXT_PUBLIC_JOURNEYS_URL ??
                                'https://your.nextstep.is')}
                            /<strong>{values.slug}</strong>
                          </>
                        ) : (
                          (errors.slug as string)
                        )
                      }
                    />
                  </Form>
                </>
              )}
            </Formik>
          )
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}
        ></Box>
      </Box>
    </TabPanel>
  )

  function JourneyLinkTitle(): ReactElement {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {t('Journey Link')}
        </Typography>
        <Tooltip
          title={t(
            'You can edit this link to make it shorter and more meaningful'
          )}
          placement="top"
          light
        >
          <InformationCircleContained
            sx={{ fontSize: 16, color: 'text.secondary' }}
          />
        </Tooltip>
      </Box>
    )
  }
}
