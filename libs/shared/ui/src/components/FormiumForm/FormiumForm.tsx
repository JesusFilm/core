import { FormiumClient } from '@formium/client'
import {
  FormControlProps,
  FormiumForm as Formium,
  FormiumComponents,
  defaultComponents
} from '@formium/react'
import {
  CheckboxProps,
  RadioGroupProps,
  TextInputProps,
  TextareaProps
} from '@formium/react/dist/inputs'
import { Form } from '@formium/types'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MuiCheckbox from '@mui/material/Checkbox'
import MuiFormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Paper from '@mui/material/Paper'
import Radio from '@mui/material/Radio'
import MuiRadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

function TextInput(props: TextInputProps): ReactElement {
  return <TextField variant="outlined" fullWidth {...props} />
}

function Textarea(props: TextareaProps): ReactElement {
  return <TextField variant="outlined" fullWidth multiline {...props} />
}

function Checkbox(props: CheckboxProps): ReactElement {
  return <MuiCheckbox {...props} />
}

function RadioGroup({
  disabled,
  id,
  name,
  onChange,
  onBlur,
  options
}: RadioGroupProps): ReactElement {
  return (
    <MuiFormControl disabled={disabled}>
      <FormLabel id={id}>{name}</FormLabel>
      <MuiRadioGroup name={name} onChange={onChange} onBlur={onBlur}>
        {options.map((option) => (
          <FormControlLabel {...option} control={<Radio />} />
        ))}
      </MuiRadioGroup>
    </MuiFormControl>
  )
}

function FormControl({
  children,
  description,
  error,
  label,
  labelFor
}: FormControlProps): ReactElement {
  return (
    <div>
      {label != null && <Typography variant="subtitle1">{label}</Typography>}
      {description != null && (
        <Typography variant="body1">{description}</Typography>
      )}
      {children}
      {error != null && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}
    </div>
  )
}

function PageWrapper({ children }: { children: ReactElement }): ReactElement {
  return <Paper sx={{ minWidth: '600px' }}>{children}</Paper>
}

function ElementsWrapper({
  children
}: {
  children: ReactElement
}): ReactElement {
  return (
    <Stack
      spacing={10}
      sx={{
        m: 4
      }}
    >
      {children}
    </Stack>
  )
}

function FooterWrapper({ children }: { children: ReactElement }): ReactElement {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>{children}</Box>
  )
}

function Header(props: any): ReactElement {
  const title = props.page.title ?? 'default'
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100px'
      }}
    >
      <Typography variant="h2" sx={{ minHeight: '100px' }}>
        {title}
      </Typography>
    </Box>
  )
}

function SubmitButton(props: JSX.IntrinsicElements['button']): ReactElement {
  console.log(props)
  return (
    <Button variant="contained" {...props}>
      Submit
    </Button>
  )
}

const myComponents: FormiumComponents = {
  ...defaultComponents,
  TextInput,
  Textarea,
  Checkbox,
  RadioGroup,
  FormControl,
  ElementsWrapper,
  PageWrapper,
  FooterWrapper,
  Header,
  SubmitButton
}

interface Props {
  formiumClient: FormiumClient
  form: Form
  userId: string | undefined
}

export function FormiumForm({
  formiumClient,
  form,
  userId
}: Props): ReactElement {
  return (
    <Formium
      data={form}
      components={myComponents}
      onSubmit={async (values) => {
        await formiumClient.submitForm('ns-test', values)
        alert('Success')
      }}
    />
  )
}
