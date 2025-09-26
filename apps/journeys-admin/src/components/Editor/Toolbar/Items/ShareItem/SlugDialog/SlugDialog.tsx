import { ApolloError, gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetJourneyForSharing_journey as JourneyFromLazyQuery } from '../../../../../../../__generated__/GetJourneyForSharing'
import { JourneyFields as JourneyFromContext } from '../../../../../../../__generated__/JourneyFields'
import { JourneySlugUpdate } from '../../../../../../../__generated__/JourneySlugUpdate'

export const JOURNEY_SLUG_UPDATE = gql`
  mutation JourneySlugUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      slug
    }
  }
`

interface SlugDialogProps {
  open?: boolean
  onClose?: () => void
  hostname?: string
  journey?: JourneyFromContext | JourneyFromLazyQuery
}

export function SlugDialog({
  open,
  onClose,
  hostname,
  journey
}: SlugDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [journeyUpdate] = useMutation<JourneySlugUpdate>(JOURNEY_SLUG_UPDATE)
  const { enqueueSnackbar } = useSnackbar()
  const slugSchema = object().shape({
    slug: string().required(t('Required'))
  })

  const handleUpdateSlug = async (
    values: FormikValues,
    { setValues }: FormikHelpers<FormikValues>
  ): Promise<void> => {
    const id = journey?.id
    if (id == null) return

    try {
      const response = await journeyUpdate({
        variables: { id, input: { slug: values.slug } }
      })
      await setValues({ slug: response?.data?.journeyUpdate.slug })
      onClose?.()
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.networkError != null) {
          enqueueSnackbar(
            t('Field update failed. Reload the page or try again.'),
            {
              variant: 'error',
              preventDuplicate: true
            }
          )
          return
        }
      }
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose?.()
      // wait for dialog animation to complete
      setTimeout(() => resetForm({ values: { slug: journey?.slug } }))
    }
  }

  return (
    <>
      {journey?.slug != null && (
        <Formik
          initialValues={{ slug: journey.slug }}
          onSubmit={handleUpdateSlug}
          validationSchema={slugSchema}
        >
          {({ values, errors, handleChange, handleSubmit, resetForm }) => (
            <Dialog
              open={open}
              onClose={handleClose(resetForm)}
              dialogTitle={{ title: t('Edit Link') }}
              dialogAction={{
                onSubmit: handleSubmit,
                closeLabel: t('Cancel')
              }}
              testId="SlugDialog"
            >
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
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
}
