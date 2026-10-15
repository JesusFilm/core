import Chip from '@mui/material/Chip'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useState } from 'react'

import CheckIcon from '@core/shared/ui/icons/Check'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { useCampaignEditor } from '../CampaignEditorProvider'
import { languageNames } from '../LanguagesPanel/LanguagesPanel'

/**
 * The Preview Language chip at the bottom-right of the canvas area: it reads
 * the current Preview Language and opens a menu of the campaign's languages
 * in selector order. Editor chrome, so it takes the editor theme rather than
 * the campaign's. Hidden while the campaign has one language. Choosing a
 * language is a view choice, never a Command.
 */
export function PreviewLanguageChip(): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    state: { previewLanguageId },
    dispatch
  } = useCampaignEditor()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  if (campaign.languages.length < 2) return null

  const languages = [...campaign.languages].sort((a, b) => a.order - b.order)
  const current = languages.find(
    (language) => language.languageId === previewLanguageId
  )

  function handleOpen(event: MouseEvent<HTMLElement>): void {
    setAnchor(event.currentTarget)
  }

  function handleClose(): void {
    setAnchor(null)
  }

  function handleSelect(languageId: string): void {
    dispatch({
      type: 'SetPreviewLanguageAction',
      previewLanguageId: languageId
    })
    handleClose()
  }

  return (
    <>
      <Chip
        clickable
        color="default"
        label={current != null ? languageNames(current).autonym : ''}
        icon={<ChevronDownIcon fontSize="small" />}
        onClick={handleOpen}
        aria-label={t('Preview language')}
        aria-haspopup="menu"
        aria-expanded={anchor != null}
        data-testid="PreviewLanguageChip"
        sx={{
          position: 'absolute',
          right: 16,
          bottom: 16,
          zIndex: 1,
          bgcolor: 'background.paper',
          boxShadow: 2,
          flexDirection: 'row-reverse',
          '& .MuiChip-icon': { ml: 0, mr: 1 }
        }}
      />
      <Menu
        anchorEl={anchor}
        open={anchor != null}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{ list: { 'aria-label': t('Preview language') } }}
      >
        {languages.map((language) => {
          const selected = language.languageId === previewLanguageId
          return (
            <MenuItem
              key={language.id}
              selected={selected}
              aria-current={selected ? 'true' : undefined}
              onClick={() => handleSelect(language.languageId)}
              data-testid={`PreviewLanguageChip-${language.languageId}`}
            >
              {languageNames(language).autonym}
              {selected && (
                <ListItemIcon sx={{ ml: 2, minWidth: 0 }}>
                  <CheckIcon fontSize="small" />
                </ListItemIcon>
              )}
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
