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

import { GetAdminJourneys_journeys as Journey } from '../../../../../../__generated__/GetAdminJourneys'
import { useTitleDescLanguageUpdateMutation } from '../../../../../libs/useTitleDescLanguageUpdateMutation'

interface JourneyDetailsDialogProps {
  open: boolean
  onClose: () => void
  journey?: Journey
}

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

/**
 * JourneyDetailsDialog component provides a dialog for editing journey details.
 * It allows users to update the title, description, and language of a journey.
 *
 * @param {JourneyDetailsDialogProps} props - The component props
 * @param {boolean} props.open - Controls the visibility of the dialog
 * @param {() => void} props.onClose - Callback function to handle dialog close
 * @param {Journey} [props.journey] - Optional journey data object. If not provided, uses journey from context
 * @returns {ReactElement} A dialog component with form fields for journey details
 */
export function JourneyDetailsDialog({
  open,
  onClose,
  journey
}: JourneyDetailsDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [titleDescLanguageUpdate] = useTitleDescLanguageUpdateMutation()
  const { journey: journeyFromContext } = useJourney()
  const journeyData = journey ?? journeyFromContext
  const { enqueueSnackbar } = useSnackbar()
  const { data, loading } = useLanguagesQuery({ languageId: '529' })
  const titleSchema = object().shape({
    title: string().required(t('Required'))
  })
  const { t } = useTranslation('apps-journeys-admin')
  const journeyLanguage: JourneyLanguage | undefined =
    journeyData != null
      ? {
          id: journeyData.language.id,
          localName: journeyData.language.name.find(({ primary }) => !primary)
            ?.value,
          nativeName: journeyData.language.name.find(({ primary }) => primary)
            ?.value
        }
      : undefined

  function handleUpdateJourneyDetails(values: FormikValues): void {
    if (journeyData == null) return

    void titleDescLanguageUpdate({
      variables: {
        id: journeyData.id,
        input: {
          title: values.title,
          description: values.description,
          languageId: values.language.id
        }
      },
      optimisticResponse: {
        journeyUpdate: {
          __typename: 'Journey',
          id: journeyData.id,
          title: values.title,
          description: values.description,
          language: {
            __typename: 'Language',
            id: values.language.id,
            bcp47: null,
            iso3: null,
            name: [
              {
                __typename: 'LanguageName',
                value: values.language.nativeName ?? values.language.localName,
                primary: values.language.nativeName != null
              }
            ]
          },
          updatedAt: null
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
          enqueueSnackbar(error.message || t('Journey details update failed'), {
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
            title: journeyData?.title,
            description: journeyData?.description,
            language: journeyLanguage
          }
        })
      )
    }
  }

  return (
    <>
      {journeyData != null && (
        <Formik
          initialValues={{
            title: journeyData.title,
            description: journeyData.description,
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
                closeLabel: t('Cancel'),
                submitLabel: t('Save')
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
