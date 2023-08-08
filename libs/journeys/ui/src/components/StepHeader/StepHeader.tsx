import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MuiMenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { MouseEvent, ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '../../libs/JourneyProvider'

export function StepHeader(): ReactElement {
  const { journey, variant } = useJourney()
  const { t } = useTranslation('libs-journeys-ui')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (variant === 'default' || variant === 'embed')
      setAnchorEl(event.currentTarget)
  }
  const handleClose = (): void => {
    setAnchorEl(null)
  }

  return (
    <Stack
      data-testid="stepHeader"
      sx={{
        width: {
          xs: 'calc(100% - env(safe-area-inset-left) - env(safe-area-inset-right))',
          lg: 'unset'
        },
        mt: { xs: 1, lg: 0 },
        position: { xs: 'absolute', lg: 'relative' },
        zIndex: 1,
        top: 0,
        left: 'env(safe-area-inset-left)',
        right: 'env(safe-area-inset-right)',
        alignItems: 'flex-end'
      }}
    >
      <IconButton
        id="more-info"
        aria-controls="more-info"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        sx={{ mx: 2, mt: 1 }}
        onClick={handleClick}
      >
        <InfoOutlinedIcon sx={{ color: 'white' }} />
      </IconButton>
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
        <NextLink
          href={`mailto:support@nextstep.is?subject=Report%20Journey:%20${
            journey?.title ?? journey?.seoTitle ?? ''
          }&body=I want to report journey (your.nextstep.is/${
            journey?.slug ?? ''
          }) because ...`}
          passHref
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
        >
          <Link
            variant="body2"
            underline="none"
            target="_blank"
            rel="noopener"
            sx={{ px: 0 }}
            onClick={handleClose}
          >
            <MuiMenuItem>{t('Terms & Conditions')}</MuiMenuItem>
          </Link>
        </NextLink>
        <NextLink href="https://www.cru.org/us/en/about/privacy.html" passHref>
          <Link
            variant="body2"
            underline="none"
            target="_blank"
            rel="noopener"
            sx={{ px: 0 }}
            onClick={handleClose}
          >
            <MuiMenuItem>{t('Privacy Policy')}</MuiMenuItem>
          </Link>
        </NextLink>
        <Box sx={{ px: 4, py: 1, maxWidth: '204px' }}>
          <Typography
            color={(theme) => theme.palette.action.disabled}
            variant="caption"
          >
            {t(
              'All personal identifiable data registered on this website will be processed by journey creator: "{{ teamTitle }}".',
              { teamTitle: journey?.team?.title ?? '' }
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
