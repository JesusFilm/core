import { ApolloError } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik, FormikValues } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useJourneyUpdateMutation } from '../../../../../libs/useJourneyUpdateMutation'

interface JourneyDetailsDialogProps {
  open: boolean
  onClose: () => void
}

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

export function JourneyDetailsDialog({
  open,
  onClose
}: JourneyDetailsDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [journeyUpdate] = useJourneyUpdateMutation()
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const { data, loading } = useLanguagesQuery({ languageId: '529' })
  const titleSchema = object().shape({
    title: string().required(t('Required'))
  })

  const journeyLanguage: JourneyLanguage | undefined =
    journey != null
      ? {
          id: journey.language.id,
          localName: journey.language.name.find(({ primary }) => !primary)
            ?.value,
          nativeName: journey.language.name.find(({ primary }) => primary)
            ?.value
        }
      : undefined

  function handleUpdateJourneyDetails(values: FormikValues): void {
    if (journey == null) return

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
          title: values.title,
          description: values.description,
          language: {
            id: values.language.id,
            bcp47: null,
            iso3: null,
            name: [
              {
                value: values.language.nativeName ?? values.language.localName,
                primary: values.language.nativeName != null,
                __typename: 'LanguageName'
              }
            ],
            __typename: 'Language'
          }
        }
      },
      onError(error) {
        if (error instanceof ApolloError) {
          if (error.networkError != null) {
            enqueueSnackbar(
              t('Journey details update failed. Reload the page or try again.'),
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
    })
    onClose()
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(() =>
        resetForm({
          values: {
            title: journey?.title,
            description: journey?.description,
            language: journeyLanguage
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
            language: journeyLanguage
          }}
          onSubmit={handleUpdateJourneyDetails}
          validationSchema={titleSchema}
          enableReinitialize
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
              testId="JourneyDetailsDialog"
              fullscreen={!smUp}
            >
              <Form>
                <Stack spacing={6}>
                  <TextField
                    id="title"
                    name="title"
                    label={t('Title')}
                    fullWidth
                    value={values.title}
                    variant="filled"
                    error={Boolean(errors.title)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onChange={handleChange}
                    helperText={errors.title as string}
                  />
                  <TextField
                    id="description"
                    name="description"
                    label={t('Description')}
                    helperText={t('Only you and other editors can see this')}
                    fullWidth
                    value={values.description}
                    multiline
                    variant="filled"
                    rows={2}
                    onChange={handleChange}
                  />
                  <LanguageAutocomplete
                    onChange={async (value) =>
                      await setFieldValue('language', value)
                    }
                    value={values.language}
                    languages={data?.languages}
                    loading={loading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={t('Search Language')}
                        label={t('Language')}
                        variant="filled"
                      />
                    )}
                    popper={{
                      placement: !smUp ? 'top' : 'bottom'
                    }}
                  />
                </Stack>
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
}
