export function baseUrl(id: string): string {
  return `https://imagedelivery.net/${
    process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
  }/${id}`
}

