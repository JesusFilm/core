import Box from '@mui/material/Box'
import MuiButton from '@mui/material/Button'
import { MouseEvent, ReactElement } from 'react'

import {
  ButtonSize,
  ButtonVariant,
  TypographyAlign
} from '../../../../__generated__/globalTypes'
import { useCampaign } from '../CampaignProvider'
import { useCampaignSection } from '../CampaignSectionBand'
import { hasText } from '../types'
import type { CampaignBlockOf } from '../types'

import { resolveCampaignAction } from './resolveCampaignAction'

interface CampaignButtonProps {
  block: CampaignBlockOf<'CampaignButtonBlock'>
}

function justifyFor(align: TypographyAlign | null): string {
  if (align === TypographyAlign.center) return 'center'
  if (align === TypographyAlign.right) return 'flex-end'
  return 'flex-start'
}

/**
 * The campaign call-to-action. `variant` null ⇒ contained, `size` null ⇒
 * medium, `align` null follows the section, `color` null ⇒ the section's
 * button colour then the theme primary, `labelColor` null ⇒ the section's
 * button text colour then on-primary. A missing action target renders the
 * button static: same look, no href, aria-disabled, no pointer effect.
 */
export function CampaignButton({
  block
}: CampaignButtonProps): ReactElement | null {
  const campaign = useCampaign()
  const section = useCampaignSection()
  if (!hasText(block.label)) return null

  const variant = block.buttonVariant ?? ButtonVariant.contained
  const size = block.size ?? ButtonSize.medium
  const align = block.align ?? section?.align ?? null
  const fill = block.color ?? section?.band.button
  const label = block.labelColor ?? section?.band.buttonLabel
  const resolved = resolveCampaignAction(block.action, campaign)

  const colorSx =
    variant === ButtonVariant.contained
      ? {
          backgroundColor: fill,
          color: label,
          '&:hover': { backgroundColor: fill, filter: 'brightness(0.92)' }
        }
      : variant === ButtonVariant.outlined
        ? { borderColor: fill, color: fill, '&:hover': { borderColor: fill } }
        : { color: fill }

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (resolved?.scrollToBlockId == null) return
    const target = document.getElementById(resolved.scrollToBlockId)
    if (target == null) return
    event.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', resolved.href)
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: justifyFor(align) }}>
      {resolved == null ? (
        <MuiButton
          component="span"
          variant={variant}
          size={size}
          aria-disabled="true"
          tabIndex={-1}
          disableRipple
          data-testid="CampaignButton"
          sx={{ ...colorSx, pointerEvents: 'none', cursor: 'default' }}
        >
          {block.label}
        </MuiButton>
      ) : (
        <MuiButton
          href={resolved.href}
          target={resolved.target}
          rel={resolved.target === '_blank' ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          variant={variant}
          size={size}
          data-testid="CampaignButton"
          sx={colorSx}
        >
          {block.label}
        </MuiButton>
      )}
    </Box>
  )
}
