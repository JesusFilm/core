import { useMutation } from '@apollo/client'
import {
  Button,
  Checkbox,
  Stack,
  TextField
} from '@mui/material'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'
import { v4 as uuid } from 'uuid'

import { FormCheckbox } from '../../../../../../../../../components/FormCheckbox'
import { FormTextField } from '../../../../../../../../../components/FormTextField'
import { UPDATE_STUDY_QUESTION } from '../StudyQuestions'

export const CREATE_STUDY_QUESTION = graphql(`
  mutation CreateStudyQuestion($input: VideoStudyQuestionCreateInput!) {
    videoStudyQuestionCreate(input: $input) {
      id
      value
    }
  }
`)

interface Inputs {
  value: string
  primary: boolean
  languageId: string
  order: number
}

function Create({ total }: { total: number }): ReactElement {
  const { control, handleSubmit } = useForm<Inputs>()

  const [createStudyQuestion] = useMutation(CREATE_STUDY_QUESTION)

  const onSubmit = (data): void => {
    console.log('submit', { data })

    const id = uuid()
    void createStudyQuestion({
      variables: {
        input: {
          id,
          videoId: '1_fj_1-0-0',
          value: data.value,
          primary: data.primary,
          languageId: data.languageId,
          order: Number(data.order)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Controller
          name="value"
          control={control}
          rules={{ required: true }}
          render={({ field }) => <TextField {...field} />}
        />
        <Controller
          name="primary"
          control={control}
          rules={{ required: true }}
          render={({ field }) => <Checkbox {...field} />}
        />
        <Controller
          name="languageId"
          control={control}
          rules={{ required: true }}
          render={({ field }) => <TextField {...field} />}
        />

        <Controller
          name="order"
          control={control}
          rules={{ required: true, min: 1, max: total + 1 }}
          render={({ field }) => (
            <input {...field} type="number" min={1} max={total + 1} />
          )}
        />

        <Button type="submit" variant="outlined">
          Submit
        </Button>
      </Stack>
    </form>
  )
}

function Edit({ studyQuestion }): ReactElement {
  const t = useTranslations()
  const [updateStudyQuestion] = useMutation(UPDATE_STUDY_QUESTION)

  const handleValueUpdate = (newValue: string): void => {
    void updateStudyQuestion({
      variables: {
        input: {
          id: studyQuestion.id,
          value: newValue
        }
      }
    })
  }

  const handlePrimaryChange = (checked: boolean): void => {
    void updateStudyQuestion({
      variables: {
        input: {
          id: studyQuestion.id,
          primary: checked
        }
      }
    })
  }

  return (
    <Stack>
      <FormTextField
        name="value"
        label={t('Value')}
      />
    </Stack>
  )
}

interface StudyQuestionCreate {
  variant: 'create'
}

interface StudyQuestionEdit {
  studyQuestion: any
  variant: 'edit'
}

type StudyQuestionEditorProps = StudyQuestionCreate | StudyQuestionEdit

export function StudyQuestionEditor(
  props: StudyQuestionEditorProps
): ReactElement {
  if (props.variant === 'edit') {
    return <Edit studyQuestion={props.studyQuestion} />
  }

  return <Create total={5} />
}
