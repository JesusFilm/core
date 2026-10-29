import { TFunction } from 'i18next'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { CAMPAIGN_LEDE_SX } from '@core/journeys/ui/Campaign'

import {
  CampaignTextBlock,
  CampaignTextField,
  textFieldValue
} from '../../../../libs/useCampaignBlockTextMutation'
import { InlineText } from '../InlineText'

interface SectionTextProps {
  block: CampaignTextBlock
  field: CampaignTextField
  editing: boolean
  focusField?: CampaignTextField
  onSelect: (field: CampaignTextField) => void
  titleVariant: 'h1' | 'h2'
  /** Show the field's placeholder while it is empty, selected or not. */
  showEmpty?: boolean
}

function sectionFieldPlaceholder(
  t: TFunction,
  field: CampaignTextField
): string {
  switch (field) {
    case 'eyebrow':
      return t('Eyebrow')
    case 'title':
      return t('Title')
    case 'description':
      return t('Description')
    case 'intro':
      return t('Intro')
    case 'richTextContent':
      return t('Your text')
    case 'bullets':
      return t('Bullets, one per line')
    default:
      return t('Your text')
  }
}

/** One of a section's typed text fields, styled as the public page styles it. */
export function SectionText({
  block,
  field,
  editing,
  focusField,
  onSelect,
  titleVariant,
  showEmpty = false
}: SectionTextProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const value = textFieldValue(block, field)
  if (!editing && !showEmpty && (value == null || value.trim() === ''))
    return null
  const styles = {
    eyebrow: {
      variant: 'overline' as const,
      sx: { color: 'var(--campaign-band-eyebrow)' }
    },
    title: {
      variant: titleVariant,
      sx: { color: 'var(--campaign-band-heading)' }
    },
    description: {
      variant: 'body1' as const,
      sx: CAMPAIGN_LEDE_SX
    },
    intro: {
      variant: 'body1' as const,
      sx: { color: 'var(--campaign-band-muted)' }
    },
    richTextContent: {
      variant: 'body1' as const,
      sx: {},
      display: 'paragraphs' as const
    },
    bullets: {
      variant: 'body1' as const,
      sx: { color: 'var(--campaign-band-text)' },
      display: 'bullets' as const
    }
  }[
    field as
      | 'eyebrow'
      | 'title'
      | 'description'
      | 'intro'
      | 'richTextContent'
      | 'bullets'
  ]

  return (
    <InlineText
      target={{ block, field }}
      placeholder={sectionFieldPlaceholder(t, field)}
      editing={editing}
      autoFocus={editing && focusField === field}
      onSelect={() => onSelect(field)}
      variant={styles.variant}
      sx={styles.sx}
      display={'display' in styles ? styles.display : undefined}
    />
  )
}
