'use client'

import { useParams } from 'next/navigation'
import { ReactElement } from 'react'

import { Section } from '../../../../../components/Section'
import { RestrictedDownloads } from '../_RestrictedDownloads'
import { RestrictedViews } from '../_RestrictedViews'
import { RestrictTranslations } from '../_RestrictTranslations'

export default function VideoRestrictionsPage(): ReactElement {
  const { videoId } = useParams<{ videoId: string }>()

  return (
    <>
      <Section title="Translations" variant="outlined">
        <RestrictTranslations videoId={videoId} />
      </Section>
      <Section title="Restricted Views" variant="outlined">
        <RestrictedViews videoId={videoId} />
      </Section>
      <Section title="Restricted Downloads" variant="outlined">
        <RestrictedDownloads videoId={videoId} />
      </Section>
    </>
  )
}
