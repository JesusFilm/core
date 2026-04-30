import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { Component, ErrorInfo, ReactElement, ReactNode } from 'react'

interface UserDeleteErrorBoundaryProps {
  children: ReactNode
}

interface UserDeleteErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class UserDeleteErrorBoundary extends Component<
  UserDeleteErrorBoundaryProps,
  UserDeleteErrorBoundaryState
> {
  constructor(props: UserDeleteErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): UserDeleteErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('UserDelete error:', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <UserDeleteErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}

interface UserDeleteErrorFallbackProps {
  error: Error | null
}

function UserDeleteErrorFallback({
  error
}: UserDeleteErrorFallbackProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Box sx={{ p: 4, maxWidth: 800 }}>
      <Alert severity="error">
        <AlertTitle>{t('Something went wrong')}</AlertTitle>
        <Typography variant="body2">
          {error?.message ?? t('An unexpected error occurred.')}
        </Typography>
      </Alert>
    </Box>
  )
}
