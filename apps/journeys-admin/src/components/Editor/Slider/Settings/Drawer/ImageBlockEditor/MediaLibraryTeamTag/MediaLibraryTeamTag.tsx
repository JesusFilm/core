import { alpha, styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

const TeamTag = styled(Typography)<{ component?: string }>(({ theme }) => ({
  position: 'absolute',
  right: 6,
  bottom: 6,
  zIndex: 2,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  fontWeight: 600,
  pointerEvents: 'none',
  color: theme.palette.background.paper,
  backgroundColor: alpha(theme.palette.grey[900], 0.72),
  backdropFilter: 'blur(2px)'
}))

interface MediaLibraryTeamTagProps {
  'data-testid'?: string
}

/**
 * Corner "Team" pill marking a tile uploaded by a teammate rather than the
 * current user. Shared by the image (MediaLibraryList) and Mux video
 * (MyMuxVideos) picker grids so both render an identical badge.
 *
 * Rendered aria-hidden — the teammate-ownership signal is conveyed via the
 * parent tile's accessible name, so the tag itself is purely decorative.
 */
export function MediaLibraryTeamTag({
  'data-testid': dataTestId
}: MediaLibraryTeamTagProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <TeamTag
      variant="body2"
      component="span"
      aria-hidden
      data-testid={dataTestId}
    >
      {t('Team')}
    </TeamTag>
  )
}
