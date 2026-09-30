import { FirebaseError } from 'firebase/app'
import { FormEvent, ReactElement, ReactNode, useState } from 'react'

import { TextField } from '../../../../components/form'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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

    onSubmit({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <TextField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="your@email.com"
        autoComplete="email"
        disabled={disabled}
        required
        autoFocus
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="••••••"
        autoComplete="current-password"
        disabled={disabled}
        required
      />
      {error != null && (
        <Alert variant="error">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        loading={loading}
        disabled={disabled}
        className="w-full"
      >
        Sign in
      </Button>
      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <Separator className="flex-1" />
        or
        <Separator className="flex-1" />
      </div>
      {children}
    </form>
  )
}
