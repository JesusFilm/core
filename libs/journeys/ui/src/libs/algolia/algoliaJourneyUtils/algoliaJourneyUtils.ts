import { abbreviateLanguageName } from '../../abbreviateLanguageName'
import { GetJourneys_journeys as Journey } from '../../useJourneysQuery/__generated__/GetJourneys'
import { AlgoliaJourney } from '../useAlgoliaJourneys'

export function isAlgoliaJourney(
  journey: Journey | AlgoliaJourney | undefined
): journey is AlgoliaJourney {
  return (
    journey !== undefined &&
    (journey as AlgoliaJourney).language.nativeName !== undefined
  )
}

export function getAlgoliaJourneyLang(journey: AlgoliaJourney): string {
  const localLanguage = journey?.language?.localName
  const nativeLanguage = journey?.language?.nativeName
  return (
    abbreviateLanguageName(
      localLanguage !== '' ? localLanguage : nativeLanguage
    ) ?? ''
  )
}

export function getCoreJourneyLang(journey: Journey): string {
  const localLanguage = journey?.language?.name.find(
    ({ primary }) => !primary
  )?.value
  const nativeLanguage =
    journey?.language?.name.find(({ primary }) => primary)?.value ?? ''

  return abbreviateLanguageName(localLanguage ?? nativeLanguage) ?? ''
}
