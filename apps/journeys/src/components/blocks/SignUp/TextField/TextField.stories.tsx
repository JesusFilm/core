import { Story, Meta } from '@storybook/react'
import { Paper } from '@mui/material'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { ThemeProvider } from '@core/shared/ui'

import TextField, { TextFieldProps } from './TextField'
import { ThemeName, ThemeMode } from '../../../../../__generated__/globalTypes'
import { journeysConfig } from '../../../../libs/storybook/decorators'

interface TextFieldStoryProps extends TextFieldProps {
  themeModes: ThemeMode[]
}

const Demo = {
  ...journeysConfig,
  component: TextField,
  title: 'Journeys/Blocks/SignUp/TextField'
}

const Template: Story<TextFieldStoryProps> = ({ themeModes }) => (
  <>
    {themeModes.map((themeMode) => (
      <ThemeProvider
        key={themeMode}
        themeName={ThemeName.base}
        themeMode={themeMode}
      >
        <Paper sx={{ p: 8, mb: 4 }}>
          <Formik
            initialValues={{
              default: '',
              prepopulated: 'Prepopulated',
              errored: '',
              disabled: ''
            }}
            validationSchema={Yup.object().shape({
              errored: Yup.string()
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
        </Paper>
      </ThemeProvider>
    ))}
  </>
)

export const States = Template.bind({})
States.args = {
  themeModes: [ThemeMode.dark, ThemeMode.light]
}

// TODO: Future variants

// export const Size = Template.bind({})

// export const MultiLine = Template.bind({})

// export const Icon = Template.bind({})

// export const Select = Template.bind({})

export default Demo as Meta
