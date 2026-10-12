import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import type { CampaignTreeOf } from '../types'

interface CampaignRichTextProps {
  block: CampaignTreeOf<'CampaignRichTextBlock'>
}

/** The paragraphs of one text column: split on blank lines, empty ones skipped. */
export function splitParagraphs(content: string | null | undefined): string[] {
  if (content == null) return []
  return content
    .split(/\n[^\S\n]*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== '')
}

/**
 * A title and one content column. `content` is a single text column; each
 * run of text between blank lines is its own paragraph, and single line
 * breaks inside a paragraph are kept.
 */
export function CampaignRichText({
  block
}: CampaignRichTextProps): ReactElement {
  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading title={block.title} />
      {splitParagraphs(block.richTextContent).map((paragraph, index) => (
        <Typography
          key={index}
          variant="body1"
          data-testid="CampaignRichTextParagraph"
          sx={{ maxWidth: 720, whiteSpace: 'pre-line' }}
        >
          {paragraph}
        </Typography>
      ))}
    </CampaignSectionBand>
  )
}
