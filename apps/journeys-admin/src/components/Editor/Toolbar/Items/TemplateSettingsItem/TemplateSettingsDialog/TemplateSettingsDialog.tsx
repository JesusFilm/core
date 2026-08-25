import { ApolloError, gql, useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik } from 'formik'
import omit from 'lodash/omit'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { JourneyFeature } from '../../../../../../../__generated__/JourneyFeature'
import { useJourneyCustomizationDescriptionUpdateMutation } from '../../../../../../libs/useJourneyCustomizationDescriptionUpdateMutation'
import { useJourneyUpdateMutation } from '../../../../../../libs/useJourneyUpdateMutation'

import { AboutTabPanel } from './AboutTabPanel'
import { CategoriesTabPanel } from './CategoriesTabPanel'
import { MetadataTabPanel } from './MetadataTabPanel'
import { TemplateSettingsFormValues } from './useTemplateSettingsForm'
import { formatTemplateCustomizationString } from './utils/formatTemplateCustomizationString'
import { getTemplateCustomizationFields } from './utils/getTemplateCustomizationFields'

// Re-exported for backwards compatibility with the existing spec file.
export { JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE } from '../../../../../../libs/useJourneyCustomizationDescriptionUpdateMutation'

export const JOURNEY_FEATURE_UPDATE = gql`
  mutation JourneyFeature($id: ID!, $feature: Boolean!) {
    journeyFeature(id: $id, feature: $feature) {
      id
      featuredAt
    }
  }
`

interface TemplateSettingsFormProp {
  open: boolean
  onClose: () => void
}

export function TemplateSettingsDialog({
  open,
  onClose
}: TemplateSettingsFormProp): ReactElement {
  const [tab, setTab] = useState(0)
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { journey } = useJourney()
  const [journeySettingsUpdate] = useJourneyUpdateMutation()
  const [journeyFeature] = useMutation<JourneyFeature>(JOURNEY_FEATURE_UPDATE)
  const [journeyCustomizationDescriptionUpdate] =
    useJourneyCustomizationDescriptionUpdateMutation()
  const { enqueueSnackbar } = useSnackbar()
  const isGlobalTemplate = journey?.team?.id === 'jfp-team'

  // NES-1678: strategy section UI was removed; the only Yup rule that
  // existed in this dialog was the embed-URL validation for `strategySlug`,
  // so the form no longer needs a validation schema. The `strategySlug`
  // value still rides through `initialValues` → submit so existing slugs
  // are preserved on save.
  const initialValues: TemplateSettingsFormValues = {
    title: journey?.title,
    description: journey?.description,
    featured: journey?.featuredAt != null,
    strategySlug: journey?.strategySlug,
    tagIds: journey?.tags.map(({ id }) => id),
    creatorDescription: journey?.creatorDescription,
    languageId: journey?.language?.id,
    journeyCustomizationDescription:
      journey?.journeyCustomizationDescription ??
      formatTemplateCustomizationString(getTemplateCustomizationFields(journey))
  }

  function handleTabChange(_event, newValue: number): void {
    setTab(newValue)
  }

  function handleClose(resetForm: () => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(() => resetForm())
    }
  }

  async function handleSubmit(
    values: TemplateSettingsFormValues
  ): Promise<void> {
    if (journey == null) return
    // Mutations run via Promise.allSettled (mirroring
    // LocalTemplateDetailsDialog) so one failure cannot silently drop the
    // others — e.g. a journeyFeature rejection must not lose the user's
    // customization edit, and vice versa (QA-564).
    const tasks: Array<Promise<unknown>> = [
      journeySettingsUpdate({
        variables: {
          id: journey.id,
          input: {
            ...omit(values, ['featured', 'journeyCustomizationDescription'])
          }
        }
      })
    ]
    if (Boolean(journey.featuredAt) !== values.featured)
      tasks.push(
        journeyFeature({
          variables: { id: journey.id, feature: values.featured }
        })
      )
    tasks.push(
      journeyCustomizationDescriptionUpdate({
        variables: {
          journeyId: journey.id,
          string: values.journeyCustomizationDescription
        },
        // The mutation returns customization fields, not a Journey, so patch
        // the Journey entity directly (as LocalTemplateDetailsDialog does)
        // instead of refetching GetPublisherTemplate — a refetch issued here
        // could read pre-feature state and land after journeyFeature's
        // response, clobbering featuredAt in the cache with a stale value
        // (QA-564).
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

    const results = await Promise.allSettled(tasks)

    if (results.every((result) => result.status === 'fulfilled')) {
      enqueueSnackbar(t('Template settings have been saved'), {
        variant: 'success',
        preventDuplicate: true
      })
      onClose()
      return
    }

    // Prefer the network-error message whichever task it came from — it is
    // the actionable one, so it must not lose to an earlier GraphQL error.
    const networkError = results.some(
      (result) =>
        result.status === 'rejected' &&
        result.reason instanceof ApolloError &&
        result.reason.networkError != null
    )
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
      enableReinitialize
    >
      {({ handleSubmit, isSubmitting, resetForm }) => (
        <Form>
          <Dialog
            data-testid="TemplateSettingsDialog"
            open={open}
            onClose={handleClose(resetForm)}
            dialogTitle={{ title: t('Template Settings') }}
            dialogAction={{
              onSubmit: handleSubmit,
              closeLabel: t('Cancel')
            }}
            divider
            fullscreen={!smUp}
            loading={isSubmitting}
          >
            <>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                aria-label="template-settings-dialog-tabs"
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label={t('Metadata')} {...tabA11yProps('metadata', 0)} />
                {isGlobalTemplate && (
                  <Tab
                    label={t('Categories')}
                    {...tabA11yProps('categories', 1)}
                  />
                )}
                <Tab
                  label={t('About')}
                  {...tabA11yProps('about', isGlobalTemplate ? 2 : 1)}
                />
              </Tabs>
              <TabPanel name="metadata" value={tab} index={0}>
                <Stack
                  sx={{
                    gap: 5,
                    pt: 6
                  }}
                >
                  <MetadataTabPanel showFeaturedSettings={isGlobalTemplate} />
                </Stack>
              </TabPanel>
              {isGlobalTemplate && (
                <TabPanel name="categories" value={tab} index={1}>
                  <Stack
                    sx={{
                      gap: 5,
                      pt: 6
                    }}
                  >
                    <CategoriesTabPanel />
                  </Stack>
                </TabPanel>
              )}
              <TabPanel
                name="about"
                value={tab}
                index={isGlobalTemplate ? 2 : 1}
              >
                <Stack
                  sx={{
                    gap: 5,
                    pt: 6
                  }}
                >
                  <AboutTabPanel />
                </Stack>
              </TabPanel>
            </>
          </Dialog>
        </Form>
      )}
    </Formik>
  )
}
