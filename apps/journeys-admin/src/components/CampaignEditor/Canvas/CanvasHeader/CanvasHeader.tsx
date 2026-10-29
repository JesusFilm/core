import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useEffect, useState } from 'react'

import {
  CAMPAIGN_HEADER_HEIGHT,
  campaignImageSource
} from '@core/journeys/ui/Campaign'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import Menu1Icon from '@core/shared/ui/icons/Menu1'

import { CampaignStringKey } from '../../../../../__generated__/globalTypes'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaignStringText } from '../../utils/campaignStringText'
import { languageNames } from '../../utils/languageNames'
import type { CanvasBlock } from '../canvasBlock'

interface CanvasHeaderProps {
  /** The header block. */
  block: CanvasBlock
  /** The header itself is selected. */
  selected: boolean
  /** Renders one of its nav buttons, selectable and editable in place. */
  renderExtra: (child: CanvasBlock) => ReactElement | null
}

/**
 * The header row as the public `CampaignHeader` lays it out: the "All
 * regions" chip while a region is edited, Brand Mark, the nav buttons on the
 * right, the language box. The chip and the box are static: the canvas never
 * leaves the region, and the box has no chevron since the Preview Language
 * chip switches language. As on the public header, a blank `allRegions`
 * leaves the chip empty. Below `md` the nav sits behind the menu icon.
 */
export function CanvasHeader({
  block,
  selected,
  renderExtra
}: CanvasHeaderProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    currentRegion,
    selection,
    selectBlock,
    state: { previewLanguageId }
  } = useCampaignEditor()
  const [menuOpen, setMenuOpen] = useState(false)
  const selectedId = selection.block?.id
  const logo =
    block.__typename === 'CampaignHeaderBlock'
      ? campaignImageSource(block.logo)
      : null
  const previewLanguage = campaign.languages.find(
    (language) => language.languageId === previewLanguageId
  )
  const previewLanguageLabel =
    previewLanguage == null ? '' : languageNames(previewLanguage).autonym

  /** Only buttons are nav: the public header drops any other child. */
  const navButtons = block.children.filter(
    (child) => child.__typename === 'CampaignButtonBlock'
  )
  const navButtonSelected = navButtons.some((child) => child.id === selectedId)
  /** Below `md` the nav sits behind the menu icon; a selected nav button opens it so it can be outlined and scrolled to. */
  const navOpen = menuOpen || navButtonSelected

  /** The phone menu is only for the header: it closes once the selection leaves the header and its nav buttons, so the taller header never covers the section the selection scrolls to. */
  const selectionInHeader = selected || navButtonSelected
  useEffect(() => {
    if (!selectionInHeader) setMenuOpen(false)
  }, [selectedId, selectionInHeader])

  function handleMenuToggle(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    if (!navOpen) {
      setMenuOpen(true)
      return
    }
    setMenuOpen(false)
    if (navButtonSelected) selectBlock(block.id)
  }

  return (
    <Box
      data-testid="CanvasHeaderRow"
      sx={{
        display: 'flex',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        alignItems: 'center',
        columnGap: 2
      }}
    >
      {currentRegion != null && (
        <Chip
          label={campaignStringText(
            campaign,
            CampaignStringKey.allRegions,
            previewLanguageId,
            ''
          )}
          size="small"
          variant="outlined"
          icon={<ChevronLeftIcon />}
          data-testid="CanvasAllRegionsChip"
          sx={{
            color: 'var(--campaign-band-text)',
            borderColor: 'var(--campaign-band-accent)',
            '& .MuiChip-label': { whiteSpace: 'pre-line' },
            '& .MuiChip-icon': { color: 'var(--campaign-band-accent)' }
          }}
        />
      )}
      <Box
        data-testid="CanvasBrandMark"
        sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: 0,
          height: CAMPAIGN_HEADER_HEIGHT
        }}
      >
        {logo != null ? (
          <Box
            component="img"
            src={logo.src}
            alt={logo.alt ?? campaign.title}
            data-testid="CanvasBrandMarkLogo"
            sx={{
              display: 'block',
              height: CAMPAIGN_HEADER_HEIGHT - 24,
              maxWidth: 200,
              objectFit: 'contain'
            }}
          />
        ) : (
          <Typography
            variant="h6"
            component="span"
            noWrap
            data-testid="CanvasBrandMarkTitle"
            sx={{ color: 'var(--campaign-band-text)' }}
          >
            {campaign.title}
          </Typography>
        )}
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      {navButtons.length > 0 && (
        <Box
          component="nav"
          id={`${block.id}-nav`}
          data-testid="CanvasHeaderNav"
          data-open={navOpen}
          sx={{
            display: { xs: navOpen ? 'flex' : 'none', md: 'flex' },
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            order: { xs: 1, md: 0 },
            flexBasis: { xs: '100%', md: 'auto' },
            gap: { xs: 1.5, md: 1 },
            pb: { xs: 2, md: 0 }
          }}
        >
          {navButtons.map(renderExtra)}
        </Box>
      )}
      {campaign.languages.length >= 2 && (
        <Box
          data-testid="CanvasLanguageSelect"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 1,
            border: '1px solid var(--campaign-band-border)',
            color: 'var(--campaign-band-text)',
            whiteSpace: 'nowrap'
          }}
        >
          <Typography variant="body1" component="span">
            {previewLanguageLabel}
          </Typography>
        </Box>
      )}
      {navButtons.length > 0 && (
        <IconButton
          data-testid="CanvasHeaderMenuButton"
          aria-label={t('Menu')}
          aria-expanded={navOpen}
          aria-controls={`${block.id}-nav`}
          onClick={handleMenuToggle}
          sx={{
            display: { xs: 'inline-flex', md: 'none' },
            color: 'var(--campaign-band-text)'
          }}
        >
          <Menu1Icon />
        </IconButton>
      )}
    </Box>
  )
}
