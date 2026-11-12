import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useState } from 'react'

import ChevronLeft from '@core/shared/ui/icons/ChevronLeft'
import ChevronRight from '@core/shared/ui/icons/ChevronRight'
import Menu1 from '@core/shared/ui/icons/Menu1'

import { CampaignStringKey } from '../../../../__generated__/globalTypes'
import { CampaignButton, resolveCampaignAction } from '../CampaignButton'
import {
  campaignLandingHref,
  campaignStringOr,
  useCampaign
} from '../CampaignProvider'
import {
  CAMPAIGN_HEADER_HEIGHT,
  CampaignSectionContext,
  useCampaignBand
} from '../CampaignSectionBand'
import { shownExtras } from '../libs/campaignBlockGrammar'
import { campaignImageSource } from '../libs/campaignImageSource'
import { hasExtraContent } from '../types'
import type { CampaignBlockOf, CampaignTree, CampaignTreeOf } from '../types'

import { CampaignLanguageSelect } from './CampaignLanguageSelect'

interface CampaignHeaderProps {
  block: CampaignTreeOf<'CampaignHeaderBlock'>
}

const LOGO_HEIGHT = CAMPAIGN_HEADER_HEIGHT - 24

/** The Extras the grammar shows on the header: its Buttons, which are its nav links. */
const HEADER_EXTRAS: readonly string[] = shownExtras('CampaignHeaderBlock')

/** A shown header child with a label: any other child of the header renders nothing. */
function isNavButton(
  child: CampaignTree
): child is CampaignTreeOf<'CampaignButtonBlock'> {
  return (
    HEADER_EXTRAS.includes(child.__typename) &&
    child.__typename === 'CampaignButtonBlock' &&
    hasExtraContent(child)
  )
}

/**
 * The Campaign Chrome header: a sticky AppBar painted from the band table
 * like any section (`useCampaignBand`; an `image` kind's cover scaled to the header height,
 * overlay applied). Fixed elements in the band's text and accent colours:
 * the "All regions" back chip in the leading slot on a Region Page only
 * (its arrow pointing back in the reading direction),
 * the Brand Mark (logo when set, else the campaign title), and the language
 * select. The authored nav buttons (the header's button children) follow
 * the button fallback chain and collapse into a Menu behind a menu icon
 * below `md`; no icon renders when there are none. Same rows on both pages.
 */
export function CampaignHeader({ block }: CampaignHeaderProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { direction } = useTheme()
  const context = useCampaign()
  const { campaign, region, string } = context
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const band = useCampaignBand(block)
  const navButtons = block.children.filter(isNavButton)
  const logo = campaignImageSource(block.logo)
  const landingHref = campaignLandingHref(context)
  const allRegions = string(CampaignStringKey.allRegions)

  function handleMenuOpen(event: MouseEvent<HTMLElement>): void {
    setMenuAnchor(event.currentTarget)
  }

  function handleMenuClose(): void {
    setMenuAnchor(null)
  }

  function menuItemFor(
    button: CampaignBlockOf<'CampaignButtonBlock'>
  ): ReactElement {
    const resolved = resolveCampaignAction(button.action, context)
    if (resolved == null)
      return (
        <MenuItem key={button.id} disabled sx={{ whiteSpace: 'pre-line' }}>
          {button.label}
        </MenuItem>
      )
    return (
      <MenuItem
        key={button.id}
        component="a"
        href={resolved.href}
        target={resolved.target}
        rel="noopener noreferrer"
        onClick={handleMenuClose}
        sx={{ whiteSpace: 'pre-line' }}
      >
        {button.label}
      </MenuItem>
    )
  }

  return (
    <CampaignSectionContext.Provider value={band.context}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        component="header"
        id={block.id}
        data-testid="CampaignHeader"
        style={band.style}
        sx={{
          top: 0,
          overflow: 'hidden',
          // An AppBar is a Paper, which the campaign theme rounds; a header band runs straight across.
          borderRadius: 0,
          backgroundColor: 'var(--campaign-band-background)',
          backgroundImage: 'none',
          color: 'var(--campaign-band-text)',
          // The bottom border is drawn inside the header, so CAMPAIGN_HEADER_HEIGHT
          // stays its true height for the bands' scroll margin.
          boxShadow: 'inset 0 -1px 0 var(--campaign-band-border)'
        }}
      >
        {band.cover}
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', height: CAMPAIGN_HEADER_HEIGHT }}
          >
            <Box data-testid="CampaignHeaderLeading" sx={{ display: 'flex' }}>
              {region != null && (
                <Chip
                  component="a"
                  clickable
                  href={landingHref}
                  label={allRegions}
                  aria-label={campaignStringOr(
                    campaign.strings,
                    CampaignStringKey.allRegions,
                    t('All regions')
                  )}
                  size="small"
                  variant="outlined"
                  icon={
                    direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />
                  }
                  data-testid="CampaignAllRegionsChip"
                  sx={{
                    color: 'var(--campaign-band-text)',
                    borderColor: 'var(--campaign-band-accent)',
                    '& .MuiChip-label': { whiteSpace: 'pre-line' },
                    '& .MuiChip-icon': { color: 'var(--campaign-band-accent)' }
                  }}
                />
              )}
            </Box>
            <Link
              href={landingHref}
              underline="none"
              data-testid="CampaignBrandMark"
              aria-label={campaign.title}
              sx={{
                display: 'flex',
                alignItems: 'center',
                minWidth: 0,
                color: 'var(--campaign-band-text)'
              }}
            >
              {logo != null ? (
                <Box
                  component="img"
                  src={logo.src}
                  alt={logo.alt ?? campaign.title}
                  data-testid="CampaignBrandMarkLogo"
                  sx={{
                    display: 'block',
                    height: LOGO_HEIGHT,
                    maxWidth: 200,
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <Typography
                  variant="h6"
                  component="span"
                  noWrap
                  data-testid="CampaignBrandMarkTitle"
                  sx={{ color: 'var(--campaign-band-text)' }}
                >
                  {campaign.title}
                </Typography>
              )}
            </Link>
            <Box sx={{ flexGrow: 1 }} />
            {navButtons.length > 0 && (
              <Box
                component="nav"
                aria-label={t('Page sections')}
                data-testid="CampaignHeaderNav"
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {navButtons.map((button) => (
                  <CampaignButton key={button.id} block={button} />
                ))}
              </Box>
            )}
            <CampaignLanguageSelect />
            {navButtons.length > 0 && (
              <>
                <IconButton
                  aria-label={t('Open menu')}
                  aria-haspopup="menu"
                  aria-expanded={menuAnchor != null}
                  onClick={handleMenuOpen}
                  data-testid="CampaignHeaderMenuButton"
                  sx={{
                    display: { xs: 'inline-flex', md: 'none' },
                    color: 'var(--campaign-band-text)'
                  }}
                >
                  <Menu1 />
                </IconButton>
                <Menu
                  open={menuAnchor != null}
                  anchorEl={menuAnchor}
                  onClose={handleMenuClose}
                  data-testid="CampaignHeaderMenu"
                >
                  {navButtons.map(menuItemFor)}
                </Menu>
              </>
            )}
          </Stack>
        </Container>
      </AppBar>
    </CampaignSectionContext.Provider>
  )
}
