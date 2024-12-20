export function getVideoChildrenLabel(
  label?: string
): 'Items' | 'Clips' | 'Episodes' | undefined {
  switch (label) {
    case 'collection':
      return 'Items'
    case 'featureFilm':
      return 'Clips'
    case 'series':
      return 'Episodes'
    default:
      return undefined
  }
}
