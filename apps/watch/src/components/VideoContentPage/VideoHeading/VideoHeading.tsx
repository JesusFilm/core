import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { VideoChildFields } from '../../../../__generated__/VideoChildFields'
import { useVideo } from '../../../libs/videoContext'
import { ShareButton } from '../../ShareButton'
import { DownloadButton } from '../DownloadButton'

interface VideoHeadingProps {
  loading?: boolean
  hasPlayed?: boolean
  onShareClick: () => void
  onDownloadClick: () => void
  videos?: VideoChildFields[]
}

export function VideoHeading({
  hasPlayed = false,
  loading,
  onShareClick,
  onDownloadClick,
  videos = []
}: VideoHeadingProps): ReactElement {
  const { title, id, container } = useVideo()
  const { t } = useTranslation('apps-watch')
  const activeVideoIndex = useMemo(() => {
    return container != null
      ? videos.findIndex((child) => child.id === id) + 1
      : -1
  }, [container, videos, id])

  return (
    <>
      <Collapse in={hasPlayed} unmountOnExit>
        <Box>
          <Container maxWidth="xxl">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" color="text.primary">
                {title[0].value}
              </Typography>
              <Stack
                direction="row"
                sx={{ display: { md: 'none' } }}
                spacing={2}
              >
                <ShareButton variant="icon" onClick={onShareClick} />
                <DownloadButton variant="icon" onClick={onDownloadClick} />
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Collapse>
      {container != null && (
        <Box>
          <Container maxWidth="xxl" data-testid="VideoHeading">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <NextLink
                  href={`/watch/${container.variant?.slug as string}`}
                  passHref
                  legacyBehavior
                >
                  <Link
                    variant="overline1"
                    color="primary"
                    sx={{ textDecoration: 'none' }}
                  >
                    {container.title[0].value}
                  </Link>
                </NextLink>
                <Typography
                  variant="overline1"
                  color="secondary"
                  sx={{ display: { xs: 'none', xl: 'block' } }}
                >
                  •
                </Typography>
                <Typography
                  variant="overline1"
                  color="secondary"
                  sx={{ display: { xs: 'none', xl: 'block' } }}
                >
                  {loading === true ? (
                    <Skeleton width={100} />
                  ) : (
                    <>
                      {t('Clip ') +
                        activeVideoIndex +
                        t(' of ') +
                        container.childrenCount}
                    </>
                  )}
                </Typography>
              </Stack>
              <NextLink
                href={`/watch/${container.variant?.slug as string}`}
                passHref
                legacyBehavior
              >
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  sx={{ display: { xs: 'none', xl: 'block' } }}
                >
                  {container.label === VideoLabel.featureFilm
                    ? 'Watch Full Film'
                    : 'See All'}
                </Button>
              </NextLink>
              <Typography
                data-testid="container-progress-short"
                variant="overline1"
                color="secondary"
                sx={{ display: { xs: 'block', xl: 'none' } }}
              >
                {loading === true ? (
                  <Skeleton width={50} />
                ) : (
                  <>
                    {activeVideoIndex}/{container.childrenCount}
                  </>
                )}
              </Typography>
            </Stack>
          </Container>
        </Box>
      )}
    </>
  )
}
