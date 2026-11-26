'use client'
import { useMutation, useSuspenseQuery } from '@apollo/client/react'
import Stack from '@mui/material/Stack'
import { Form, Formik, FormikHelpers } from 'formik'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { graphql } from '@core/shared/gql'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { CancelButton } from '../../../../../components/CancelButton'
import { FormSelectField } from '../../../../../components/FormSelectField'
import { FormTextField } from '../../../../../components/FormTextField'
import { SaveButton } from '../../../../../components/SaveButton'
import { Section } from '../../../../../components/Section'

import { parseTimestamp } from './parseTimestamp'

interface VideoMediaValidationProps {
  videoId: string
}

type TriState = 'unassessed' | 'yes' | 'no'

interface VideoMediaValidationFormValues {
  gospelPresentation: TriState
  gospelStartSeconds: string
  gospelEndSeconds: string
  opportunityToRespond: TriState
  opportunityToRespondEndSeconds: string
  biblicallyAccuratePortrayal: TriState
  personOfJesusDisplayed: TriState
  validationComments: string
}

export const GET_VIDEO_MEDIA_VALIDATION = graphql(`
  query GetVideoMediaValidation($id: ID!) {
    adminVideo(id: $id) {
      id
      gospelPresentation
      gospelStartSeconds
      gospelEndSeconds
      opportunityToRespond
      opportunityToRespondEndSeconds
      biblicallyAccuratePortrayal
      personOfJesusDisplayed
      validationComments
    }
  }
`)

export const UPDATE_VIDEO_MEDIA_VALIDATION = graphql(`
  mutation UpdateVideoMediaValidation($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
      gospelPresentation
      gospelStartSeconds
      gospelEndSeconds
      opportunityToRespond
      opportunityToRespondEndSeconds
      biblicallyAccuratePortrayal
      personOfJesusDisplayed
      validationComments
    }
  }
`)

const TRI_STATE_OPTIONS = [
  { label: 'Not assessed', value: 'unassessed' },
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
] as const

const TIMESTAMP_ERROR = 'Use HH:MM:SS or MM:SS'

function booleanToTriState(value: boolean | null | undefined): TriState {
  if (value == null) return 'unassessed'
  return value ? 'yes' : 'no'
}

function triStateToBoolean(value: TriState): boolean | null {
  if (value === 'unassessed') return null
  return value === 'yes'
}

function secondsToField(seconds: number | null | undefined): string {
  return seconds == null ? '' : secondsToTimeFormat(seconds)
}

function fieldToSeconds(value: string): number | null {
  return parseTimestamp(value) ?? null
}

const timestampSchema = string().test(
  'timestamp',
  TIMESTAMP_ERROR,
  (value) => parseTimestamp(value ?? '') !== undefined
)

const validationSchema = object({
  gospelStartSeconds: timestampSchema,
  gospelEndSeconds: timestampSchema.test(
    'gospel-end-after-start',
    'Gospel end must not be before gospel start',
    function (value) {
      const start = parseTimestamp(this.parent.gospelStartSeconds ?? '')
      const end = parseTimestamp(value ?? '')
      if (start == null || end == null) return true
      return end >= start
    }
  ),
  opportunityToRespondEndSeconds: timestampSchema
})

export function VideoMediaValidation({
  videoId
}: VideoMediaValidationProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [updateVideoMediaValidation] = useMutation(
    UPDATE_VIDEO_MEDIA_VALIDATION
  )
  const { data } = useSuspenseQuery(GET_VIDEO_MEDIA_VALIDATION, {
    variables: { id: videoId }
  })
  const { adminVideo } = data

  const initialValues: VideoMediaValidationFormValues = {
    gospelPresentation: booleanToTriState(adminVideo.gospelPresentation),
    gospelStartSeconds: secondsToField(adminVideo.gospelStartSeconds),
    gospelEndSeconds: secondsToField(adminVideo.gospelEndSeconds),
    opportunityToRespond: booleanToTriState(adminVideo.opportunityToRespond),
    opportunityToRespondEndSeconds: secondsToField(
      adminVideo.opportunityToRespondEndSeconds
    ),
    biblicallyAccuratePortrayal: booleanToTriState(
      adminVideo.biblicallyAccuratePortrayal
    ),
    personOfJesusDisplayed: booleanToTriState(
      adminVideo.personOfJesusDisplayed
    ),
    validationComments: adminVideo.validationComments ?? ''
  }

  async function handleSubmit(
    values: VideoMediaValidationFormValues,
    { resetForm }: FormikHelpers<VideoMediaValidationFormValues>
  ): Promise<void> {
    await updateVideoMediaValidation({
      variables: {
        input: {
          id: videoId,
          gospelPresentation: triStateToBoolean(values.gospelPresentation),
          gospelStartSeconds: fieldToSeconds(values.gospelStartSeconds),
          gospelEndSeconds: fieldToSeconds(values.gospelEndSeconds),
          opportunityToRespond: triStateToBoolean(values.opportunityToRespond),
          opportunityToRespondEndSeconds: fieldToSeconds(
            values.opportunityToRespondEndSeconds
          ),
          biblicallyAccuratePortrayal: triStateToBoolean(
            values.biblicallyAccuratePortrayal
          ),
          personOfJesusDisplayed: triStateToBoolean(
            values.personOfJesusDisplayed
          ),
          validationComments:
            values.validationComments === '' ? null : values.validationComments
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Successfully updated media validation', {
          variant: 'success'
        })
        void resetForm({ values })
      },
      onError: () => {
        enqueueSnackbar('Failed to update media validation', {
          variant: 'error'
        })
      }
    })
  }

  return (
    <Section title="Media Validation" variant="outlined">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, dirty, resetForm }) => (
          <Form>
            <Stack sx={{ gap: 2 }}>
              <FormSelectField
                name="gospelPresentation"
                label="Gospel Presentation"
                options={TRI_STATE_OPTIONS}
              />
              <FormTextField
                name="gospelStartSeconds"
                label="Gospel Start"
                placeholder="HH:MM:SS"
              />
              <FormTextField
                name="gospelEndSeconds"
                label="Gospel End"
                placeholder="HH:MM:SS"
              />
              <FormSelectField
                name="opportunityToRespond"
                label="Includes Opportunity to Respond"
                options={TRI_STATE_OPTIONS}
              />
              <FormTextField
                name="opportunityToRespondEndSeconds"
                label="End of Opportunity to Respond"
                placeholder="HH:MM:SS"
              />
              <FormSelectField
                name="biblicallyAccuratePortrayal"
                label="Biblically Accurate Portrayal of Jesus"
                options={TRI_STATE_OPTIONS}
              />
              <FormSelectField
                name="personOfJesusDisplayed"
                label="Person of Jesus Displayed"
                options={TRI_STATE_OPTIONS}
              />
              <FormTextField
                name="validationComments"
                label="Comments"
                multiline
                minRows={3}
              />
              <Stack
                direction="row"
                sx={{ justifyContent: 'flex-end', gap: 1 }}
              >
                <CancelButton
                  show={dirty}
                  handleCancel={() => void resetForm()}
                />
                <SaveButton disabled={isSubmitting || !dirty} />
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </Section>
  )
}
