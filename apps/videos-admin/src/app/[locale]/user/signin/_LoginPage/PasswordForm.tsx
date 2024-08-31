import { FirebaseError } from '@firebase/util'
import LoadingButton from '@mui/lab/LoadingButton'
import Input from '@mui/material/Input'
import { useTranslations } from 'next-intl'
import { FormEvent, ReactElement, useState } from 'react'

export interface PasswordFormValue {
  email: string
  password: string
}

interface PasswordFormProps
  extends Omit<JSX.IntrinsicElements['form'], 'onSubmit'> {
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
  onSubmit,
  ...props
}: PasswordFormProps): ReactElement {
  const t = useTranslations()
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
    <div>
      <form onSubmit={handleSubmit} {...props}>
        <Input
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          type="email"
          placeholder="Email address"
          disabled={disabled}
        />
        <div>
          <Input
            required
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            disabled={disabled}
          />
        </div>
        {error != null && <span>{error.message}</span>}
        <LoadingButton
          loading={loading}
          disabled={loading || disabled}
          variant="contained"
          type="submit"
        >
          {t('Submit')}
        </LoadingButton>
      </form>
      {children}
    </div>
  )
}
