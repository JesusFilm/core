import { ApolloError, gql, useMutation } from '@apollo/client'
import FormGroup from '@mui/material/FormGroup'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik, FormikValues } from 'formik'
import isEqual from 'lodash/isEqual'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { JourneyFeature } from '../../../../../__generated__/JourneyFeature'
import { TitleDescriptionUpdate } from '../../../../../__generated__/TitleDescriptionUpdate'

import { FeaturedCheckbox } from './FeaturedCheckbox'

export const TITLE_DESCRIPTION_UPDATE = gql`
  mutation TitleDescriptionUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      title
      description
    }
  }
`

export const JOURNEY_FEATURE_UPDATE = gql`
  mutation JourneyFeature($id: ID!, $feature: Boolean!) {
    journeyFeature(id: $id, feature: $feature) {
      id
      featuredAt
    }
  }
`
interface TemplateSettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function TemplateSettingsDialog({
  open,
  onClose
}: TemplateSettingsDialogProps): ReactElement {
  const [tabValue, setTabValue] = useState(0)
  const handleTabChange = (_event, newValue): void => {
    setTabValue(newValue)
  }

  const [titleDescriptionUpdate] = useMutation<TitleDescriptionUpdate>(
    TITLE_DESCRIPTION_UPDATE
  )

  const [journeyFeature, { loading }] = useMutation<JourneyFeature>(
    JOURNEY_FEATURE_UPDATE
  )

  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const handleTemplateUpdate = async (values: FormikValues): Promise<void> => {
    if (journey == null) return

    const existingValues = (({ title, description }) => ({
      title,
      description
    }))(journey)

    const formValues = (({ title, description }) => ({
      title,
      description
    }))(values)

    try {
      if (!isEqual(existingValues, formValues)) {
        await titleDescriptionUpdate({
          variables: {
            id: journey.id,
            input: { title: values.title, description: values.description }
          },
          optimisticResponse: {
            journeyUpdate: {
              id: journey.id,
              __typename: 'Journey',
              title: values.title,
              description: values.description
            }
          }
        })
      }
      if (Boolean(journey.featuredAt) !== values.featuredAt) {
        await journeyFeature({
          variables: { id: journey.id, feature: values.featuredAt }
        })
      }
      onClose()
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.networkError != null) {
          enqueueSnackbar(
            'Field update failed. Reload the page or try again.',
            {
              variant: 'error',
              preventDuplicate: true
            }
          )
          return
        }
      }
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
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
            featuredAt: journey?.featuredAt != null
          }
        })
      )
    }
  }

  return (
    <Stack>
      {journey != null && (
        <Formik
          initialValues={{
            title: journey.title ?? '',
            description: journey.description ?? '',
            featuredAt: journey.featuredAt != null
          }}
          onSubmit={handleTemplateUpdate}
        >
          {({ values, handleChange, handleSubmit, resetForm }) => (
            <Dialog
              open={open}
              onClose={handleClose(resetForm)}
              dialogTitle={{ title: 'Template Settings' }}
              dialogAction={{
                onSubmit: handleSubmit,
                closeLabel: 'Cancel'
              }}
              fullscreen={!smUp}
            >
              <Form data-testId="template-settings-dialog-form">
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="template-settings-dialog-tabs"
                  variant="fullWidth"
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab
                    label={t('Metadata')}
                    {...tabA11yProps('template-meta-data-settings', 0)}
                  />
                  <Tab
                    label={t('Categories')}
                    {...tabA11yProps('template-categories-settings', 1)}
                  />
                  <Tab
                    label={t('About')}
                    {...tabA11yProps('template-about-settings', 2)}
                  />
                </Tabs>
                <TabPanel
                  name="template-meta-data-settings"
                  value={tabValue}
                  index={0}
                >
                  <Stack sx={{ pt: 6 }} gap={5}>
                    <TextField
                      label={t('Title')}
                      id="title"
                      name="title"
                      fullWidth
                      value={values.title}
                      variant="filled"
                      onChange={handleChange}
                      helperText={t('Recommended length: six words or shorter')}
                    />
                    <TextField
                      label={t('Description')}
                      id="description"
                      name="description"
                      fullWidth
                      value={values.description}
                      multiline
                      variant="filled"
                      rows={3}
                      onChange={handleChange}
                      helperText={t(
                        'Publicly visible on template details page'
                      )}
                    />
                    <FormGroup>
                      <FeaturedCheckbox
                        loading={loading}
                        values={values.featuredAt}
                        onChange={handleChange}
                        name="featuredAt"
                      />
                    </FormGroup>
                  </Stack>
                </TabPanel>
                <TabPanel
                  name="template-categories-settings"
                  value={tabValue}
                  index={1}
                >
                  <Stack sx={{ pt: 6 }}>
                    Categories - yet to be implemented - contact
                    support@nextsteps.is for more info
                  </Stack>
                </TabPanel>
                <TabPanel
                  name="template-about-settings"
                  value={tabValue}
                  index={2}
                >
                  <Stack sx={{ pt: 6 }}>
                    About - yet to be implemented - contact support@nextsteps.is
                    for more info
                  </Stack>
                </TabPanel>
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </Stack>
  )
}
