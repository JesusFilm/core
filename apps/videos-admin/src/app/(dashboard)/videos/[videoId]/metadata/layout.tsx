import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { Section } from '../../../../../components/Section'

export default function MetadataLayout({
  children,
  images,
  imageAlt,
  studyQuestions,
  description,
  snippet
}): ReactElement {
  return (
    <Stack gap={2} data-testid="VideoMetadata">
      <Section title="Information" variant="outlined">
        {children}
      </Section>
      <Section title="Images" variant="outlined">
        <Stack gap={4}>
          {images}
          {imageAlt}
        </Stack>
      </Section>
      <Section title="Short Description" variant="outlined">
        {snippet}
      </Section>
      <Section title="Description" variant="outlined">
        {description}
      </Section>
      {studyQuestions}
    </Stack>
  )
}
