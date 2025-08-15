import { NextRouter } from 'next/router'

import { GetLanguagesSlug } from '../../../../__generated__/GetLanguagesSlug'
import { getCookie } from '../../cookieHandler'

/**
 * Handles redirect to preferred audio language URL if current URL doesn't match
 * the user's audio language preference stored in cookies
 */
export function audioLanguageRedirect({
  languageVariantsLoading,
  languageVariantsData,
  router,
  containerSlug
}: {
  languageVariantsLoading: boolean
  languageVariantsData?: GetLanguagesSlug
  router: NextRouter
  containerSlug?: string | null
}): string | undefined {
  // }): Promise<void> {
  const cookieAudioLanguageId = getCookie('AUDIO_LANGUAGE')
  if (languageVariantsLoading || cookieAudioLanguageId == null) return

  const selectedLanguageSlug =
    languageVariantsData?.video?.variantLanguagesWithSlug?.find(
      (languages) => languages.language?.id === cookieAudioLanguageId
    )?.slug

  // Get current language slug from router
  const currentPath = router.asPath
  const currentLanguageSlug = currentPath.split('/').pop()?.replace('.html', '')
  const selectedLanguage = selectedLanguageSlug?.split('/')[1]

  if (selectedLanguageSlug == null || selectedLanguage === currentLanguageSlug)
    return undefined

  // console.log(
  //   'link',
  //   `watch${
  //     containerSlug != null ? `/${containerSlug}/` : '/'
  //   }${selectedLanguageSlug}`
  // )

  return `/watch${
    containerSlug != null ? `/${containerSlug}/` : '/'
  }${selectedLanguageSlug}`

  // await router.replace(
  //   `/watch${
  //     containerSlug != null ? `/${containerSlug}/` : '/'
  //   }${selectedLanguageSlug}`
  // )
}
