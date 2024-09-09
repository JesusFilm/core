import { ApolloError } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Form, Formik, type FormikValues } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import type { ReactElement } from 'react'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery'
import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useJourneyUpdateMutation } from '../../../../libs/useJourneyUpdateMutation'

interface TitleDialogProps {
  open: boolean
  onClose: () => void
}

export function TitleDescriptionDialog({
  open,
  onClose
}: TitleDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [journeyUpdate] = useJourneyUpdateMutation()
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const titleSchema = object().shape({
    title: string().required(t('Required'))
  })

  const { data, loading } = useLanguagesQuery({ languageId: '529' })

  function handleUpdateTitleDescription(values: FormikValues): void {
    if (journey == null) return
    try {
      void journeyUpdate({
        variables: {
          id: journey.id,
          input: {
            title: values.title,
            description: values.description,
            languageId: values.language.id
          }
        },
        optimisticResponse: {
          journeyUpdate: {
            ...journey,
            id: journey.id,
            __typename: 'Journey',
            title: values.title,
            description: values.description,
            strategySlug: journey.strategySlug,
            language: {
              id: values.language.id,
              __typename: 'Language',
              bcp47: null,
              iso3: null,
              name: []
            }
          }
        }
      })
      onClose()
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
      onClose()
      setTimeout(() =>
        resetForm({
          values: {
            title: journey?.title,
            description: journey?.description,
            language:
              journey != null
                ? {
                    id: journey.language.id,
                    localName: journey.language.name.find(
                      ({ primary }) => !primary
                    )?.value,
                    nativeName: journey.language.name.find(
                      ({ primary }) => primary
                    )?.value
                  }
                : undefined
          }
        })
      )
    }
  }

  return (
    <>
      {journey != null && (
        <Formik
          initialValues={{
            title: journey.title,
            description: journey.description,
            language: { id: journey.language.id }
          }}
          onSubmit={handleUpdateTitleDescription}
          validationSchema={titleSchema}
        >
          {({
            values,
            errors,
            handleChange,
            handleSubmit,
            resetForm,
            setFieldValue
          }) => (
            <Dialog
              open={open}
              onClose={handleClose(resetForm)}
              dialogAction={{
                onSubmit: handleSubmit,
                closeLabel: t('Cancel')
              }}
              testId="TitleDescriptionDialog"
            >
              <Form>
                <TextField
                  id="title"
                  name="title"
                  variant="filled"
                  label={t('Title')}
                  fullWidth
                  value={values.title}
                  error={Boolean(errors.title)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={handleChange}
                  helperText={errors.title as string}
                  sx={{ mt: 2, marginBottom: 8 }}
                />

                <TextField
                  id="description"
                  label={t('Description')}
                  name="description"
                  fullWidth
                  value={values.description}
                  multiline
                  variant="filled"
                  rows={2}
                  onChange={handleChange}
                  helperText={t('Only you and other editors can see this')}
                  sx={{ paddingBottom: 4 }}
                />

                <LanguageAutocomplete
                  onChange={async (value) =>
                    await setFieldValue('language', value)
                  }
                  value={values.language}
                  languages={data?.languages}
                  loading={loading}
                />
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
}
