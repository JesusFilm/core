import axios from 'axios'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { VideoContentFields_bibleCitations as BibleCitation } from '../../../../../__generated__/VideoContentFields'

import { formatScripture } from './utils/formatScripture'

// Type for supported Bible versions
interface BibleVersion {
  /**
   * The version of the Bible to use from the Bible API
   * https://github.com/wldeh/bible-api/tree/main/bibles
   */
  bibleApi: string
  /**
   * The version of the Bible to use for the Bible Gateway link
   * https://www.biblegateway.com/versions/
   */
  bibleGateway: string
}

const LOCALE_TO_BIBLE_VERSION_MAP: Record<string, BibleVersion> = {
  en: { bibleApi: 'en-asv', bibleGateway: 'NIV' },
  es: { bibleApi: 'es-rvr1960', bibleGateway: 'NVI' },
  fr: { bibleApi: 'fr-s21', bibleGateway: 'BDS' },
  id: { bibleApi: 'id-tlab', bibleGateway: 'TB' },
  ja: { bibleApi: 'ja-jc', bibleGateway: 'SHINK2017' },
  ko: { bibleApi: 'ko-askv', bibleGateway: 'NKRV' },
  ru: { bibleApi: 'ru-synod', bibleGateway: 'SYNOD' },
  th: { bibleApi: 'th-tkjv', bibleGateway: 'TNCV' },
  tr: { bibleApi: 'tr-tcl02', bibleGateway: 'TC-2009' },
  zh: { bibleApi: 'zh-cunp-s', bibleGateway: 'CUVMPT' },
  'zh-Hans-CN': {
    bibleApi: 'zh-cn-cmn-s-cuv',
    bibleGateway: 'CUVS'
  }
}

// Default Bible version (English) used as fallback
const DEFAULT_BIBLE_VERSION: BibleVersion = LOCALE_TO_BIBLE_VERSION_MAP.en

/**
 * Safely gets Bible version information for a locale with fallback
 * @param locale - The locale/language code to look up
 * @returns BibleVersion object for the locale or default fallback
 */
function getBibleVersionForLocale(locale: string): BibleVersion {
  // Check if locale exists in our map
  if (locale in LOCALE_TO_BIBLE_VERSION_MAP) {
    return LOCALE_TO_BIBLE_VERSION_MAP[locale]
  }

  // Fallback to default English version for unsupported locales
  return DEFAULT_BIBLE_VERSION
}

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
        const bibleVersion = getBibleVersionForLocale(i18n.language)
        const { data } = await axios.get<FBVScripture>(
          `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${bibleVersion.bibleApi}/books/${bookName}/chapters/${citation.chapterStart}/verses/${citation.verseStart}.json`
        )
        setScripture(data)
      } catch {
        setScripture(null)
      }
    }

    void fetchScripture()
  }, [citation])

  const bibleVersion = getBibleVersionForLocale(i18n.language)
  const bibleGatewayUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(
    `${citation.bibleBook.name[0].value} ${citation.chapterStart}${citation.chapterEnd != null ? `-${citation.chapterEnd}` : ''}${citation.verseEnd != null ? `:${citation.verseStart}-${citation.verseEnd}` : `:${citation.verseStart}`}`
  )}&version=${bibleVersion.bibleGateway}`

  return (
    <div
      className="relative flex h-[400px] w-[400px] flex-col justify-end overflow-hidden rounded-lg border border-white/10 bg-black/10"
      style={{ backgroundColor: '#1A1815' }}
    >
      <Image
        fill
        src={imageUrl}
        alt="Bible Citation"
        className="absolute top-0 overflow-hidden rounded-lg [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_20%,transparent_100%)] [mask-size:cover] object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <div className="z-10 p-8">
        <span className="relative text-xs font-bold tracking-wider text-white/80 uppercase">
          {`${citation.bibleBook.name[0].value} ${citation.chapterStart}${citation.chapterEnd != null ? `-${citation.chapterEnd}` : ''}:${citation.verseEnd != null ? `${citation.verseStart}-${citation.verseEnd}` : citation.verseStart}`}
        </span>
        {scripture != null && (
          <p className="relative mt-4 text-sm text-white/90">
            {formatScripture(scripture.text)}
          </p>
        )}
        {citation.verseEnd != null && (
          <a
            href={bibleGatewayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-4 block text-sm text-white/80 underline transition-colors duration-200 hover:text-white"
          >
            {t('Read more...')}
          </a>
        )}
      </div>
    </div>
  )
}
