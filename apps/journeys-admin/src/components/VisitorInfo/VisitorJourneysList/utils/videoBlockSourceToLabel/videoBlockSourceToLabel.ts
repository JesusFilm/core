import { TFunction } from 'react-i18next'

import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'

export function videoBlockSourceToLabel(
  source: VideoBlockSource,
  t: TFunction<'apps-journeys-admin', undefined>
): string {
  switch (source) {
    case VideoBlockSource.internal:
      return t('Jesus Film Library')
    case VideoBlockSource.cloudflare:
      return t('Custom')
    case VideoBlockSource.youTube:
      return t('YouTube')
    default:
      return ''
  }
}
