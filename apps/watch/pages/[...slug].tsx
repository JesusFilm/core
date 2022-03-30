import { useRouter } from 'next/router'
import { ReactElement } from 'react'

export default function SeoFriendly(): ReactElement {
  const router = useRouter()
  const locale = router.locale ?? router.defaultLocale
  const { slug } = router.query
  if (!Array.isArray(slug)) return <></>

  let audioLanguage = '529'
  let subtitleLanguage = '529'
  const seoFriendly = slug[0]
  slug?.forEach((item, index) => {
    if (item === 'al') audioLanguage = slug[index + 1]
    if (item === 'sl') subtitleLanguage = slug[index + 1]
  })
  return (
    <div>
      <div>Locale - {locale} </div>
      <div>SeoFriendly - {seoFriendly}</div>
      <div>AudioLanguange - {audioLanguage}</div>
      <div>SubtitleLanguage - {subtitleLanguage}</div>
    </div>
  )
}
