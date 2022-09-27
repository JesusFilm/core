import Stack from '@mui/material/Stack'
import { Story, Meta } from '@storybook/react'
import { Form, Formik } from 'formik'
import { object, string } from 'yup'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { StoryCard } from '../StoryCard'
import { TextField, TextFieldProps } from './TextField'

const Demo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: TextField,
  title: 'Journeys-Ui/TextField'
}

const Template: Story<TextFieldProps> = () => (
  <StoryCard>
    <Formik
      initialValues={{
        default: '',
        prepopulated: 'Prepopulated',
        hint: '',
        error: '',
        focused: '',
        disabled: ''
      }}
      validationSchema={object().shape({
        error: string()
          .min(50, 'Must be 50 characters or more')
          .required('Required')
      })}
      initialTouched={{ error: true }}
      validateOnMount
      onSubmit={(values) => {
        console.log(values)
      }}
    >
      {() => (
        <Form>
          <Stack>
            <TextField name="default" label="Default" />
            <TextField name="prepopulated" label="Prepopulated" />
            <TextField name="hint" label="Hint" helperText="Hint Text" />
            <TextField name="error" label="Error" />
            <TextField name="focused" label="Focused" focused />
            <TextField name="disabled" label="Disabled" disabled />
          </Stack>
        </Form>
      )}
    </Formik>
  </StoryCard>
)

const TextareaTemplate: Story<TextFieldProps> = () => {
  // Hack to create multiple components in 1 story. Only done for journey-ui
  const fields = [
    {
      name: 'singleLine',
      label: 'Single Line',
      value: 'Ok.'
    },
    {
      name: 'fewLines',
      label: 'Few Lines',
      value: 'Why waste time say lot word when few word do trick?\n\n- Kevin'
    },
    {
      name: 'manyLines',
      label: 'Many Lines',
      value:
        "This is a really long story about how I became a Christian. Buckle down because you're in for an adventure!\n\nIt started a long long time ago when God knew me before I was conceived. Don't ask me how that works - but somehow he worked all things together, my parents met and had me.\n\nGoodness, you're still here? Why are you reading this story - you've got work to do! Storybook max height for portals is 900px. I'm including multiple components in one story to more widely test our most core components. I don't expect this to be the norm for all our stories.\n\nThis should cut off at some point due to the card scroll. Please don't make me write anymore.\n\nOh no, it's still going! Help! I've got nothing more to write!"
    }
  ]

  return (
    <Stack direction="row" spacing={4}>
      {fields.map((field) => {
        return (
          <StoryCard key={field.name}>
            <Formik
              initialValues={{
                [field.name ?? 'name']: field.value
              }}
              onSubmit={(values) => {
                console.log(values)
              }}
            >
              {() => (
                <Form>
                  <TextField multiline name={field.name} label={field.label} />
                </Form>
              )}
            </Formik>
          </StoryCard>
        )
      })}
    </Stack>
  )
}

export const States = Template.bind({})

export const Textarea = TextareaTemplate.bind({})

// TODO: Future variants

// export const Size = Template.bind({})

// export const Icon = Template.bind({})

// export const Select = Template.bind({})

export default Demo as Meta
