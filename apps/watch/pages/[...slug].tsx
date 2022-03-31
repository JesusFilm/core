import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { routeParser } from '../src/libs/routeParser/routeParser'

export default function SeoFriendly(): ReactElement {
  const router = useRouter()
  const locale = router.locale ?? router.defaultLocale
  const { slug } = router.query
  const { routes, tags, audioLanguage, subtitleLanguage } = routeParser(slug)

  return (
    <div>
      <div>Locale - {locale} </div>
      <div>SeoFriendly - {routes?.join('/')}</div>
      <div>Tags - {tags.join(' ')}</div>
      <div>AudioLanguange - {audioLanguage}</div>
      <div>SubtitleLanguage - {subtitleLanguage}</div>
    </div>
  )
}
