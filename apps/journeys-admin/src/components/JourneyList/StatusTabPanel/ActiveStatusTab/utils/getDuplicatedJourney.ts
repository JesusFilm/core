export const getDuplicatedJourney = (
  oldJourneys,
  newJourneys
): string | undefined => {
  if ((oldJourneys.length as number) + 1 === newJourneys.length) {
    return newJourneys?.find((journey, i) => journey !== oldJourneys[i])?.id
  }
}
