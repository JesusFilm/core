import { Story, Meta } from '@storybook/react'
import { Form, Formik } from 'formik'
import { object, string } from 'yup'
import { journeyUiConfig, simpleComponentConfig, StoryCard } from '../../..'
import { TextField, TextFieldProps } from './TextField'

const Demo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: TextField,
  title: 'Journeys/Blocks/SignUp/TextField'
}

const Template: Story<TextFieldProps> = () => (
  <StoryCard>
    <Formik
      initialValues={{
        default: '',
        prepopulated: 'Prepopulated',
        errored: '',
        disabled: ''
      }}
      validationSchema={object().shape({
        errored: string()
          .min(50, 'Must be 50 characters or more')
          .required('Required')
      })}
      initialTouched={{ errored: true }}
      validateOnMount
      onSubmit={(values) => {
        console.log(values)
      }}
    >
      {() => (
        <Form
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <TextField name="default" label="Default" />
          <TextField name="prepopulated" label="Prepopulated" />
          <TextField name="errored" label="Errored" />
          <TextField name="focused" label="Focused" focused />
          <TextField name="disabled" label="Disabled" disabled />
        </Form>
      )}
    </Formik>
  </StoryCard>
)

export const States = Template.bind({})

// TODO: Future variants

// export const Size = Template.bind({})

// export const MultiLine = Template.bind({})

// export const Icon = Template.bind({})

// export const Select = Template.bind({})

export default Demo as Meta
