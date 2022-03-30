import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { Videos } from '../../src/components/Videos/Videos'

function VideoPage(): ReactElement {
  const router = useRouter()
  const locale = router.locale ?? router.defaultLocale
  const { tag } = router.query
  if (!Array.isArray(tag)) return <></>

  let audioLanguage = '529'
  let subtitleLanguage = '529'
  const seoFriendly = tag[0]
  tag?.forEach((item, index) => {
    if (item === 'al') audioLanguage = tag[index + 1]
    if (item === 'sl') subtitleLanguage = tag[index + 1]
  })
  return (
    <div>
      <div>Locale - {locale} </div>
      <div>SeoFriendlyTag - {seoFriendly}</div>
      <div>AudioLanguange - {audioLanguage}</div>
      <div>SubtitleLanguage - {subtitleLanguage}</div>
      <Videos />
    </div>
  )
}

export default VideoPage
