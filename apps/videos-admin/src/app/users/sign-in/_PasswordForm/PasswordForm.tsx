import { FirebaseError } from 'firebase/app'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import { FormEvent, ReactElement, ReactNode, useState } from 'react'

export interface PasswordFormValue {
  email: string
  password: string
}

interface PasswordFormProps {
  children?: ReactNode
  loading: boolean
  onSubmit: (value: PasswordFormValue) => void
  disabled?: boolean
  error?: FirebaseError
}
export function PasswordForm({
  children,
  loading,
  disabled,
  error,
  onSubmit
}: PasswordFormProps): ReactElement {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    event.stopPropagation()

    onSubmit({
      email,
      password
    })
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: 2
      }}
    >
      <FormControl>
        <FormLabel htmlFor="email">Email</FormLabel>
        <TextField
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          type="email"
          placeholder="your@email.com"
          disabled={disabled}
          id="email"
          autoComplete="email"
          autoFocus
          fullWidth
          variant="outlined"
          color="primary"
          sx={{ ariaLabel: 'email' }}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="password">Password</FormLabel>
        <TextField
          name="password"
          placeholder="••••••"
          type="password"
          id="password"
          autoComplete="current-password"
          autoFocus
          required
          fullWidth
          variant="outlined"
          color="primary"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormControl>
      {error != null && <span>{error.message}</span>}
      <Button
        loading={loading}
        disabled={loading || disabled}
        variant="contained"
        type="submit"
        fullWidth
        loadingIndicator={<CircularProgress size={16} />}
      >
        Sign in
      </Button>
      <Divider>or</Divider>
      {children}
    </Box>
  )
}
