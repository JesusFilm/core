'use client'

import { useParams } from 'next/navigation'
import { ReactElement } from 'react'

import { Section } from '../../../../../components/Section'

import { RestrictAutoTranslations } from '../_RestrictAutoTranslations'
import { RestrictedDownloads } from '../_RestrictedDownloads'
import { RestrictedViews } from '../_RestrictedViews'

export default function VideoRestrictionsPage(): ReactElement {
  const { videoId } = useParams<{ videoId: string }>()

  return (
    <>
      <Section title="Automatic Translations" variant="outlined">
        <RestrictAutoTranslations videoId={videoId} />
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
