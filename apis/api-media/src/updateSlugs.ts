import { prisma } from './lib/prisma'

const slugs = [
  { id: '11_Sermon0710', slug: 'the-lord-prayer-bp' },
  { id: '1_jf6125-0-0', slug: 'the-lord-prayer' },
  { id: '1_wl604419-0-0', slug: 'sermon-on-the-mount-123' },
  // { id: '1_jf6112-0-0', slug: 'sermon-on-the-mount-2-123' },
  { id: '11_Sermon', slug: 'sermon-on-the-mount-bp' },
  { id: '1_wl604419-0-0', slug: 'sermon-on-the-mount' }
  // { id: '1_jf6112-0-0', slug: 'sermon-on-the-mount-2' }
]

const errors: Error[] = []

async function main() {
  for (const { id, slug } of slugs) {
    console.log(`Updating slug for video ${id} to ${slug}`)
    const variants = await prisma.videoVariant.findMany({
      where: {
        videoId: id
      }
    })

    await prisma.video.update({
      where: {
        id
      },
      data: {
        slug
      }
    })
    for (const variant of variants) {
      try {
        const slugArr = variant.slug.split('/')
        slugArr[0] = slug
        console.log(
          `Updating slug for variant ${variant.id} to ${slugArr.join('/')}`
        )
        await prisma.videoVariant.update({
          where: {
            id: variant.id
          },
          data: {
            slug: slugArr.join('/')
          }
        })
      } catch (error) {
        errors.push(error as Error)
      }
    }
  }
  for (const error of errors) {
    console.error(error)
  }
}

void main()
