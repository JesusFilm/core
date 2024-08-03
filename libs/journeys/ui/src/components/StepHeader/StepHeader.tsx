import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MuiMenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { SxProps, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useState } from 'react'

import { useJourney } from '../../libs/JourneyProvider'

import { PaginationBullets } from './PaginationBullets'

interface StepHeaderProps {
  sx?: SxProps
}

export function StepHeader({ sx }: StepHeaderProps): ReactElement {
  const { journey, variant } = useJourney()
  const theme = useTheme()
  const { t } = useTranslation('libs-journeys-ui')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const router = useRouter()

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (variant === 'default' || variant === 'embed')
      setAnchorEl(event.currentTarget)
  }
  const handleClose = (): void => {
    setAnchorEl(null)
  }

  return (
    <Stack
      data-testid="JourneysStepHeader"
      sx={{
        position: { xs: 'absolute', lg: 'relative' },
        mt: { xs: 1, lg: 0 },
        height: { lg: 44 },
        zIndex: 1,
        top: 0,
        alignItems: 'flex-end',
        width: { xs: '100%', lg: 'auto' },
        ...sx
      }}
    >
      <PaginationBullets />
      {router.query.noi == null && (
        <IconButton
          data-testid="more-info"
          id="more-info"
          aria-controls="more-info"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : 'false'}
          sx={{ mx: 2, mt: 1 }}
          onClick={handleClick}
        >
          <InfoOutlinedIcon
            sx={{
              color: theme.palette.primary.main,
              [theme.breakpoints.up('lg')]: {
                color: theme.palette.common.white
              }
            }}
          />
        </IconButton>
      )}
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          dense: true,
          'aria-labelledby': 'more-info'
        }}
      >
        <MuiMenuItem disabled>
          <Typography color="text.primary" variant="body2">
            {journey?.team?.publicTitle !== '' &&
            journey?.team?.publicTitle !== null
              ? journey?.team?.publicTitle
              : journey?.team?.title ?? ''}
          </Typography>
        </MuiMenuItem>
        <Divider />
        <NextLink
          href={`mailto:support@nextstep.is?subject=Report%20Journey:%20${
            journey?.title ?? journey?.seoTitle ?? ''
          }&body=I want to report journey (your.nextstep.is/${
            journey?.slug ?? ''
          }) because ...`}
          passHref
          legacyBehavior
        >
          <MuiMenuItem onClick={handleClose}>
            <Typography color="text.primary" variant="body2">
              {t('Report this content')}
            </Typography>
          </MuiMenuItem>
        </NextLink>
        <Divider />
        <NextLink
          href="https://www.cru.org/us/en/about/terms-of-use.html"
          passHref
          legacyBehavior
        >
          <Link
            variant="body2"
            underline="none"
            rel="noopener"
            target="_blank"
            sx={{ px: 0 }}
            onClick={handleClose}
          >
            <MuiMenuItem>{t('Terms & Conditions')}</MuiMenuItem>
          </Link>
        </NextLink>
        <Box sx={{ px: 4, py: 1, maxWidth: '204px' }}>
          <Typography
            color={(theme) => theme.palette.action.disabled}
            variant="caption"
            sx={{ display: 'block', lineHeight: 1.2 }}
          >
            {t(
              'All personal identifiable data registered on this website will be processed by journey creator: "{{ teamTitle }}".',
              {
                teamTitle:
                  journey?.team?.publicTitle !== '' &&
                  journey?.team?.publicTitle !== null
                    ? journey?.team?.publicTitle
                    : journey?.team?.title ?? ''
              }
            )}
          </Typography>
        </Box>
        <MuiMenuItem disabled>
          <Typography variant="caption" color="primary.light">
            {t('NextSteps © {{year}}', { year: new Date().getFullYear() })}
          </Typography>
        </MuiMenuItem>
      </Menu>
    </Stack>
  )
}
