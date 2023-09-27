import { ApolloError, gql, useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikValues } from 'formik'
import isEqual from 'lodash/isEqual'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'

import { JourneyFeature } from '../../../../../__generated__/JourneyFeature'
import { TitleDescriptionUpdate } from '../../../../../__generated__/TitleDescriptionUpdate'
import { FeaturedCheckbox } from '../FeaturedCheckbox'

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
interface TitleDescriptionDialogProps {
  open: boolean
  onClose: () => void
}

export function TitleDescriptionDialog({
  open,
  onClose
}: TitleDescriptionDialogProps): ReactElement {
  const [titleDescriptionUpdate] = useMutation<TitleDescriptionUpdate>(
    TITLE_DESCRIPTION_UPDATE
  )

  const [journeyFeature, { loading }] = useMutation<JourneyFeature>(
    JOURNEY_FEATURE_UPDATE
  )

  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()

  const handleUpdateTitleDescription = async (
    values: FormikValues
  ): Promise<void> => {
    if (journey == null) return

    const journeyUpdateValues = (({ title, description }) => ({
      title,
      description
    }))(journey)

    const formikJourneyUpdateValues = (({ title, description }) => ({
      title,
      description
    }))(values)

    try {
      if (!isEqual(journeyUpdateValues, formikJourneyUpdateValues)) {
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
        void journeyFeature({
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
          onSubmit={handleUpdateTitleDescription}
        >
          {({ values, handleChange, handleSubmit, resetForm }) => (
            <Dialog
              open={open}
              onClose={handleClose(resetForm)}
              dialogTitle={{ title: 'Edit Title and Description' }}
              dialogAction={{
                onSubmit: handleSubmit,
                closeLabel: 'Cancel'
              }}
              divider
            >
              <Form>
                <Typography variant="body1" gutterBottom>
                  Journey Title
                </Typography>
                <TextField
                  id="title"
                  name="title"
                  hiddenLabel
                  fullWidth
                  value={values.title}
                  variant="filled"
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body1" gutterBottom>
                  Description
                </Typography>
                <TextField
                  id="description"
                  name="description"
                  hiddenLabel
                  fullWidth
                  value={values.description}
                  multiline
                  variant="filled"
                  rows={3}
                  onChange={handleChange}
                />
                <Stack sx={{ pt: 6 }}>
                  <FeaturedCheckbox
                    loading={loading}
                    values={values.featuredAt}
                    handleChange={handleChange}
                    name="featuredAt"
                  />
                </Stack>
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </Stack>
  )
}
