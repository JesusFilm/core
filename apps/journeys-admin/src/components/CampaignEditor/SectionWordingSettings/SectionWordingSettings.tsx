import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { campaignStringKeysFor } from '@core/journeys/ui/Campaign/libs/campaignStrings'
import {
  TRANSLATED_FIELDS,
  textLength
} from '@core/journeys/ui/Campaign/libs/translatedField'

import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_strings as CampaignString
} from '../../../../__generated__/GetCampaign'
import { CampaignStringKey } from '../../../../__generated__/globalTypes'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { useCampaignTextCommand } from '../utils/useCampaignTextCommand'

type Translate = (key: string) => string

/** Where the page shows a Campaign String, as the field's label. */
export function stringKeyLabel(t: Translate, key: CampaignStringKey): string {
  switch (key) {
    case CampaignStringKey.allRegions:
      return t('All regions label')
    case CampaignStringKey.step1:
      return t('Share step 1')
    case CampaignStringKey.step2:
      return t('Share step 2')
    case CampaignStringKey.step2help:
      return t('Share step 2 help')
    case CampaignStringKey.step3:
      return t('Share step 3')
    case CampaignStringKey.step4:
      return t('Share step 4')
    case CampaignStringKey.copy:
      return t('Copy link button')
    case CampaignStringKey.copied:
      return t('Copied confirmation')
    case CampaignStringKey.downloadQr:
      return t('Download QR code button')
    case CampaignStringKey.open:
      return t('Open button')
    case CampaignStringKey.watch:
      return t('Watch card badge')
    case CampaignStringKey.youtube:
      return t('YouTube card badge')
    case CampaignStringKey.seeAllOnWatch:
      return t('See all card')
    case CampaignStringKey.videos:
      return t('Video count word')
    case CampaignStringKey.openTemplate:
      return t('Open journey button')
    case CampaignStringKey.noJourneys:
      return t('No journeys message')
    case CampaignStringKey.totalVisitors:
      return t('Total visitors tile')
    case CampaignStringKey.topCountry:
      return t('Top country tile')
    default:
      return key
  }
}

interface WordingFieldProps {
  string: CampaignString
}

/** One Campaign String, typed into as inline text is: one Command per edit, in the Preview Language. Multi-line, as every Campaign String is. */
function WordingField({ string }: WordingFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { value, fallback, error, handleChange, handleFocus, handleBlur } =
    useCampaignTextCommand({ string })

  return (
    <TextField
      label={stringKeyLabel(t, string.key)}
      value={value}
      placeholder={fallback}
      onChange={(event) => handleChange(event.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      error={error != null}
      helperText={
        error ?? `${textLength(value)} / ${TRANSLATED_FIELDS.string.value}`
      }
      slotProps={{
        htmlInput: {
          maxLength: TRANSLATED_FIELDS.string.value,
          'data-testid': `WordingField-${string.key}`
        },
        formHelperText: error != null ? { role: 'alert' } : undefined
      }}
      size="small"
      multiline
      minRows={1}
      fullWidth
    />
  )
}

interface SectionWordingSettingsProps {
  block: Pick<CampaignBlock, '__typename'>
}

/**
 * The button and label wording a section shows on the page: the Campaign
 * Strings its public rendering reads (a Watch card's badge, the share steps,
 * the Analytics tile labels), each a field named for where it shows. The
 * canvas shows these only in place, so they are edited here; nothing for a
 * section that reads none.
 */
export function SectionWordingSettings({
  block
}: SectionWordingSettingsProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const strings = campaignStringKeysFor(block.__typename).flatMap((key) =>
    campaign.strings.filter((string) => string.key === key)
  )
  if (strings.length === 0) return null

  return (
    <Stack spacing={2} data-testid="SectionWordingSettings">
      <Stack spacing={0.5}>
        <Typography variant="subtitle2">{t('Wording')}</Typography>
        <Typography variant="caption" color="text.secondary">
          {t('Button and label text this section shows on the page.')}
        </Typography>
      </Stack>
      {strings.map((string) => (
        <WordingField key={string.id} string={string} />
      ))}
    </Stack>
  )
}
