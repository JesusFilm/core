export const getDuplicatedJourney = (
  oldJourneys,
  journeys
): string | undefined => {
  if (
    oldJourneys != null &&
    journeys != null &&
    (oldJourneys.length as number) + 1 === journeys.length
  ) {
    return journeys.find((journey, i) => journey !== oldJourneys[i])?.id
  } else {
    return undefined
  }
}
