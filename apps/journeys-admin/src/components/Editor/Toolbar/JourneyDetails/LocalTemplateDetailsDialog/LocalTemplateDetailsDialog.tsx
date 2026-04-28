import { ApolloError } from '@apollo/client'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useMemo } from 'react'
import { object, string } from 'yup'

import { JourneyProvider, useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'

import { JourneyFields as JourneyContext } from '../../../../../../__generated__/JourneyFields'
import { useJourneyCustomizationDescriptionUpdateMutation } from '../../../../../libs/useJourneyCustomizationDescriptionUpdateMutation'
import { useTitleDescLanguageUpdateMutation } from '../../../../../libs/useTitleDescLanguageUpdateMutation'
import { CustomizeTemplate } from '../../Items/TemplateSettingsItem/TemplateSettingsDialog/AboutTabPanel/CustomizeTemplate'
import { MetadataTabPanel } from '../../Items/TemplateSettingsItem/TemplateSettingsDialog/MetadataTabPanel'
import { formatTemplateCustomizationString } from '../../Items/TemplateSettingsItem/TemplateSettingsDialog/utils/formatTemplateCustomizationString'
import { getTemplateCustomizationFields } from '../../Items/TemplateSettingsItem/TemplateSettingsDialog/utils/getTemplateCustomizationFields'

// Subset of journey fields the dialog actually consumes — kept loose so that
// both `JourneyFields` and `GetAdminJourneys_journeys` (the template-list
// shape) satisfy it without an unsafe cast.
interface DialogJourney {
  id: string
  title?: string | null
  description?: string | null
  language: { id: string }
  journeyCustomizationDescription?: string | null
}

interface LocalTemplateDetailsFormValues {
  title: string
  description: string
  languageId: string
  journeyCustomizationDescription: string
}

interface LocalTemplateDetailsDialogProps {
  open: boolean
  onClose: () => void
  /**
   * Optional explicit journey override. When provided, the dialog uses this
   * value instead of (or in addition to) the journey from {@link JourneyProvider}.
   * The template-list context menu passes the card's journey here because that
   * page does not provide a JourneyProvider.
   */
  journey?: DialogJourney | null
}

/**
 * LocalTemplateDetailsDialog — single unified editor for LOCAL templates only
 * (template === true && team.id !== 'jfp-team'). Dispatches title/description/
 * language through `useTitleDescLanguageUpdateMutation` so the translation-poll
 * subscription path keeps emitting `updatedAt`. The customization description
 * goes through `useJourneyCustomizationDescriptionUpdateMutation` and the
 * Apollo cache is patched directly (the response is a customization-fields
 * payload, not a Journey).
 */
export function LocalTemplateDetailsDialog({
  open,
  onClose,
  journey: journeyProp
}: LocalTemplateDetailsDialogProps): ReactElement {
  const { journey: journeyFromContext } = useJourney()

  // The dialog's children (MetadataTabPanel, CustomizeTemplate) read journey
  // from JourneyProvider. When `journey` is supplied as a prop (e.g. from the
  // template-list context menu, which has no provider in scope) we bridge it
  // into context with a local provider so the prop takes precedence.
  if (journeyProp != null) {
    return (
      <JourneyProvider
        value={{
          journey: journeyProp as unknown as JourneyContext,
          variant: 'admin'
        }}
      >
        <LocalTemplateDetailsDialogBody open={open} onClose={onClose} />
      </JourneyProvider>
    )
  }
  if (journeyFromContext == null) return <></>
  return <LocalTemplateDetailsDialogBody open={open} onClose={onClose} />
}

function LocalTemplateDetailsDialogBody({
  open,
  onClose
}: Omit<LocalTemplateDetailsDialogProps, 'journey'>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { journey } = useJourney()
  const [titleDescLanguageUpdate] = useTitleDescLanguageUpdateMutation()
  const [journeyCustomizationDescriptionUpdate] =
    useJourneyCustomizationDescriptionUpdateMutation()
  const { enqueueSnackbar } = useSnackbar()

  const validationSchema = useMemo(
    () =>
      object({
        title: string().trim().required(t('Required'))
      }),
    [t]
  )

  // Captured once at mount so dirty detection survives JourneyProvider
  // updates from translation polling. Without `enableReinitialize`, Formik
  // also keeps the user's in-progress edits stable across context refreshes.
  const initialValues = useMemo<LocalTemplateDetailsFormValues>(
    () => ({
      title: journey?.title ?? '',
      description: journey?.description ?? '',
      languageId: journey?.language?.id ?? '',
      journeyCustomizationDescription:
        journey?.journeyCustomizationDescription ??
        formatTemplateCustomizationString(
          getTemplateCustomizationFields(journey)
        )
    }),
    // Re-seed only when the journey identity changes — opening the dialog for
    // a different template should refresh defaults; mid-edit polling should not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [journey?.id]
  )

  function handleClose(resetForm: () => void): () => void {
    return () => {
      onClose()
      // 300ms aligns with MUI's default Dialog exit transition.
      setTimeout(() => resetForm(), 300)
    }
  }

  async function handleSubmit(
    values: LocalTemplateDetailsFormValues
  ): Promise<void> {
    if (journey == null) return
    const titleDescLangDirty =
      values.title !== initialValues.title ||
      values.description !== initialValues.description ||
      values.languageId !== initialValues.languageId
    const customizationDirty =
      values.journeyCustomizationDescription !==
      initialValues.journeyCustomizationDescription

    const tasks: Array<Promise<unknown>> = []
    if (titleDescLangDirty) {
      tasks.push(
        titleDescLanguageUpdate({
          variables: {
            id: journey.id,
            input: {
              title: values.title,
              description: values.description,
              languageId: values.languageId
            }
          },
          optimisticResponse: {
            journeyUpdate: {
              __typename: 'Journey',
              id: journey.id,
              title: values.title,
              description: values.description,
              language: {
                __typename: 'Language',
                id: values.languageId,
                bcp47: null,
                iso3: null,
                name: journey.language?.name ?? []
              },
              updatedAt: null
            }
          }
        })
      )
    }
    if (customizationDirty) {
      tasks.push(
        journeyCustomizationDescriptionUpdate({
          variables: {
            journeyId: journey.id,
            string: values.journeyCustomizationDescription
          },
          // Mutation result returns customization fields, not a Journey, so we
          // patch the Journey entity in cache so reopening the dialog (and any
          // GetPublisherTemplate consumer on the gallery view) sees the new value.
          update(cache) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                journeyCustomizationDescription() {
                  return values.journeyCustomizationDescription
                }
              }
            })
          }
        })
      )
    }

    if (tasks.length === 0) {
      onClose()
      return
    }

    const results = await Promise.allSettled(tasks)
    const failed = results.find((r) => r.status === 'rejected')

    if (failed == null) {
      enqueueSnackbar(t('Template details saved'), {
        variant: 'success',
        preventDuplicate: true
      })
      onClose()
      return
    }

    const networkError =
      failed.reason instanceof ApolloError && failed.reason.networkError != null
    enqueueSnackbar(
      networkError
        ? t('Field update failed. Reload the page or try again.')
        : t('Something went wrong, please reload the page and try again'),
      { variant: 'error', preventDuplicate: true }
    )
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, isSubmitting, resetForm }) => (
        <Form>
          <Dialog
            testId="LocalTemplateDetailsDialog"
            open={open}
            onClose={handleClose(resetForm)}
            dialogTitle={{ title: t('Template Details') }}
            dialogAction={{
              onSubmit: handleSubmit,
              closeLabel: t('Cancel')
            }}
            divider
            fullscreen={!smUp}
            loading={isSubmitting}
          >
            <Stack sx={{ pt: 2 }} gap={5}>
              <MetadataTabPanel showFeaturedSettings={false} />
              <Divider />
              <CustomizeTemplate />
            </Stack>
          </Dialog>
        </Form>
      )}
    </Formik>
  )
}
