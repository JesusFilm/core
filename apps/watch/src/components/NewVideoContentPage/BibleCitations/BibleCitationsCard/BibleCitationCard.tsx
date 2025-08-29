import axios from 'axios'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { VideoContentFields_bibleCitations as BibleCitation } from '../../../../../__generated__/VideoContentFields'

import { formatScripture } from './utils/formatScripture'

const LOCALE_TO_BIBLE_VERSION_MAP = {
  en: { bibleVersion: 'en-asv', bibleGatewayLinkVersion: 'NIV' },
  es: { bibleVersion: 'es-rvr1960', bibleGatewayLinkVersion: 'NVI' },
  fr: { bibleVersion: 'fr-s21', bibleGatewayLinkVersion: 'BDS' },
  id: { bibleVersion: 'id-tlab', bibleGatewayLinkVersion: 'TB' },
  ja: { bibleVersion: 'ja-jc', bibleGatewayLinkVersion: 'SHINK2017' },
  ko: { bibleVersion: 'ko-askv', bibleGatewayLinkVersion: 'NKRV' },
  ru: { bibleVersion: 'ru-synod', bibleGatewayLinkVersion: 'SYNOD' },
  th: { bibleVersion: 'th-tkjv', bibleGatewayLinkVersion: 'TNCV' },
  tr: { bibleVersion: 'tr-tcl02', bibleGatewayLinkVersion: 'TC-2009' },
  zh: { bibleVersion: 'zh-cunp-s', bibleGatewayLinkVersion: 'CUVMPT' },
  'zh-Hans-CN': {
    bibleVersion: 'zh-cn-cmn-s-cuv',
    bibleGatewayLinkVersion: 'CUVS'
  }
} as const

interface BibleCitationCardProps {
  citation: BibleCitation
  imageUrl: string
}

interface FBVScripture {
  text: string
  reference: string
}

export function BibleCitationCard({
  citation,
  imageUrl
}: BibleCitationCardProps): ReactElement {
  const { t, i18n } = useTranslation('apps-watch')
  const [scripture, setScripture] = useState<FBVScripture | null>(null)

  useEffect(() => {
    async function fetchScripture(): Promise<void> {
      try {
        const bookName = citation.bibleBook.name[0].value.toLowerCase()
        const { data } = await axios.get<FBVScripture>(
          `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${LOCALE_TO_BIBLE_VERSION_MAP[i18n.language].bibleVersion}/books/${bookName}/chapters/${citation.chapterStart}/verses/${citation.verseStart}.json`
        )
        setScripture(data)
      } catch (_) {
        setScripture(null)
      }
    }

    void fetchScripture()
  }, [citation])

  const bibleGatewayUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(
    `${citation.bibleBook.name[0].value} ${citation.chapterStart}${citation.chapterEnd != null ? `-${citation.chapterEnd}` : ''}${citation.verseEnd != null ? `:${citation.verseStart}-${citation.verseEnd}` : `:${citation.verseStart}`}`
  )}&version=${LOCALE_TO_BIBLE_VERSION_MAP[i18n.language].bibleGatewayLinkVersion}`

  return (
    <div
      className="relative h-[400px] w-[400px] flex flex-col justify-end rounded-lg overflow-hidden border border-white/10 bg-black/10"
      style={{ backgroundColor: '#1A1815' }}
    >
      <Image
        fill
        src={imageUrl}
        alt="Bible Citation"
        className="absolute top-0 object-cover overflow-hidden rounded-lg [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_20%,transparent_100%)] [mask-size:cover]"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <div className="p-8 z-10">
        <span className="relative font-bold text-xs uppercase tracking-wider text-white/80">
          {`${citation.bibleBook.name[0].value} ${citation.chapterStart}${citation.chapterEnd != null ? `-${citation.chapterEnd}` : ''}:${citation.verseEnd != null ? `${citation.verseStart}-${citation.verseEnd}` : citation.verseStart}`}
        </span>
        {scripture != null && (
          <p className="relative mt-4 text-white/90 text-sm">
            {formatScripture(scripture.text)}
          </p>
        )}
        {citation.verseEnd != null && (
          <a
            href={bibleGatewayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-4 block text-white/80 text-sm hover:text-white transition-colors duration-200 underline"
          >
            {t('Read more...')}
          </a>
        )}
      </div>
    </div>
  )
}
