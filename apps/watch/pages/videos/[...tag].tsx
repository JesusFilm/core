import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { Videos } from '../../src/components/Videos/Videos'
import { routeParser } from '../../src/libs/routeParser/routeParser'

function VideoPage(): ReactElement {
  const router = useRouter()
  const locale = router.locale ?? router.defaultLocale
  const { tag } = router.query
  const { routes, tags, audioLanguage, subtitleLanguage } = routeParser(tag)

  return (
    <div>
      <div>Locale - {locale} </div>
      <div>SeoFriendlyTag - {routes?.join('/')}</div>
      <div>Tags - {tags.join(' ')}</div>
      <div>AudioLanguange - {audioLanguage}</div>
      <div>SubtitleLanguage - {subtitleLanguage}</div>
      <Videos />
    </div>
  )
}

export default VideoPage
