'use client'

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { useParams } from 'next/navigation'
import { Component, ReactElement, ReactNode } from 'react'

import { Section } from '../../../../../components/Section'
import { RestrictedDownloads } from '../_RestrictedDownloads'
import { RestrictedViews } from '../_RestrictedViews'
import { RestrictTranslations } from '../_RestrictTranslations'

interface RestrictionsErrorBoundaryProps {
  children: ReactNode
  resetKey: string
}

interface RestrictionsErrorBoundaryState {
  error?: Error
}

class RestrictionsErrorBoundary extends Component<
  RestrictionsErrorBoundaryProps,
  RestrictionsErrorBoundaryState
> {
  state: RestrictionsErrorBoundaryState = {}

  static getDerivedStateFromError(
    error: Error
  ): RestrictionsErrorBoundaryState {
    return { error }
  }

  componentDidUpdate(prevProps: RestrictionsErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error != null) {
      this.setState({ error: undefined })
    }
  }

  render(): ReactNode {
    if (this.state.error != null) {
      return <RestrictionsLoadError error={this.state.error} />
    }

    return this.props.children
  }
}

function RestrictionsLoadError({ error }: { error: Error }): ReactElement {
  return (
    <Alert severity="error" variant="outlined">
      <AlertTitle>Unable to load restrictions</AlertTitle>
      <Typography variant="body2">
        The video exists, but restriction settings could not be loaded. Try
        refreshing, or contact support if this continues.
      </Typography>
      {process.env.NODE_ENV !== 'production' && error.message !== '' ? (
        <Typography sx={{ mt: 1 }} variant="caption" component="p">
          Error details: {error.message}
        </Typography>
      ) : null}
    </Alert>
  )
}

export default function VideoRestrictionsPage(): ReactElement {
  const { videoId } = useParams<{ videoId: string }>()

  return (
    <>
      <Section title="Translations" variant="outlined">
        <RestrictionsErrorBoundary resetKey={videoId + ':translations'}>
          <RestrictTranslations videoId={videoId} />
        </RestrictionsErrorBoundary>
      </Section>
      <Section title="Restricted Views" variant="outlined">
        <RestrictionsErrorBoundary resetKey={videoId + ':views'}>
          <RestrictedViews videoId={videoId} />
        </RestrictionsErrorBoundary>
      </Section>
      <Section title="Restricted Downloads" variant="outlined">
        <RestrictionsErrorBoundary resetKey={videoId + ':downloads'}>
          <RestrictedDownloads videoId={videoId} />
        </RestrictionsErrorBoundary>
      </Section>
    </>
  )
}
