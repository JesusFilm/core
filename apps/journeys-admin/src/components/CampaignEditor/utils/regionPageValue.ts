const REGION_PAGE_PREFIX = 'region:'

/** The Pages panel's value for the Region Page rendered for one region. */
export function regionPageValue(regionId: string): string {
  return `${REGION_PAGE_PREFIX}${regionId}`
}

/** The region a Pages panel value renders the Region Page for; undefined for any other page. */
export function regionIdOfPageValue(value: string): string | undefined {
  return value.startsWith(REGION_PAGE_PREFIX)
    ? value.slice(REGION_PAGE_PREFIX.length)
    : undefined
}
