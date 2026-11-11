import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { CampaignRegionName } from '@core/journeys/ui/Campaign'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { TypographyVariant } from '../../../../../__generated__/globalTypes'
import { blockTranslations } from '../../../../libs/useCampaignBlockTextMutation'
import { regionLineColor } from '../../utils/regionLineColor'
import { previewFieldText } from '../../utils/useTranslatedField/readPreviewField'

interface CanvasRegionHeadingProps {
  name: string
  lines: CampaignBlock[]
  previewLanguageId: string
  defaultLanguageId: string
}

/** The previewed region's name and Region Lines as the public Region Header sets them; read-only, the lines edit on the Region Switcher. */
export function CanvasRegionHeading({
  name,
  lines,
  previewLanguageId,
  defaultLanguageId
}: CanvasRegionHeadingProps): ReactElement {
  return (
    <>
      <CampaignRegionName>{name}</CampaignRegionName>
      {lines.map((line) => {
        if (line.__typename !== 'CampaignTypographyBlock') return null
        const content = previewFieldText({
          field: line.content,
          translations: blockTranslations(line, 'content'),
          previewLanguageId,
          defaultLanguageId
        })
        if (content.trim() === '') return null
        const variant = line.typographyVariant ?? TypographyVariant.body1
        return (
          <Typography
            key={line.id}
            variant={variant}
            variantMapping={{ overline: 'p', caption: 'p' }}
            align={line.align ?? undefined}
            data-testid="CanvasRegionLine"
            sx={{
              color: regionLineColor(line.color, variant),
              whiteSpace: 'pre-line',
              wordBreak: 'break-word'
            }}
          >
            {content}
          </Typography>
        )
      })}
    </>
  )
}
