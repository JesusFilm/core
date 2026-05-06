export function addTransferParam(redirectUrl: string): string {
  try {
    const parsed = new URL(redirectUrl, 'https://admin.nextstep.is')
    parsed.searchParams.set('transfer', 'true')
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return redirectUrl
  }
}
