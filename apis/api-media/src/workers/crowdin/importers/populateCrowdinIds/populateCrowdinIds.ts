import { prisma } from '../../../../../../../libs/prisma/media/src/client'

import {
  crowdinClient,
  crowdinProjectId
} from '../../../../lib/crowdin/crowdinClient'
import { LANGUAGE_CODES } from '../../config'
interface MissingTranslation {
  videoId: string
  type: 'title' | 'description' | 'studyQuestion'
  crowdInId: string
  order?: number
  missingLanguageCodes?: string[]
}

export async function runCrowdinIdOperation(): Promise<void> {
  console.log('Starting to find and upsert missing translations')
  // Find all videos with their existing translations
  const allVideos = await prisma.video.findMany({
    include: {
      title: {
        select: {
          languageId: true,
          crowdInId: true
        },
        where: {
          crowdInId: {
            not: null
          }
        }
      },
      description: {
        select: {
          languageId: true,
          crowdInId: true
        },
        where: {
          crowdInId: {
            not: null
          }
        }
      },
      studyQuestions: {
        select: {
          languageId: true,
          order: true,
          crowdInId: true
        },
        orderBy: {
          order: 'asc'
        },
        where: {
          crowdInId: {
            not: null
          }
        }
      }
    },
    where: {
      AND: [
        {
          id: {
            not: {
              contains: '2_0-Leader'
            }
          }
        },
        {
          id: {
            not: {
              contains: '2_BoA'
            }
          }
        },
        {
          id: {
            not: {
              contains: 'LOVE40'
            }
          }
        },
        {
          id: {
            not: {
              equals: '2_0-Brand_Video'
            }
          }
        },
        {
          id: {
            not: {
              equals: 'JF-Language-Stack'
            }
          }
        },
        {
          id: {
            not: {
              contains: 'GOMark'
            }
          }
        },
        {
          id: {
            not: {
              contains: 'GOMatt'
            }
          }
        },
        {
          id: {
            not: {
              contains: 'GOLuke'
            }
          }
        },
        {
          id: {
            not: {
              contains: 'GOJohn'
            }
          }
        }
      ]
    }
  })

  console.log(`Found ${allVideos.length} videos to process`)
  const missingTranslations: MissingTranslation[] = []

  for (const video of allVideos) {
    const existingTitleLanguages = new Set(video.title.map((t) => t.languageId))
    const existingDescLanguages = new Set(
      video.description.map((d) => d.languageId)
    )
    const existingStudyQuestions = video.studyQuestions.reduce(
      (acc, sq) => {
        if (!acc[sq.order]) acc[sq.order] = new Set()
        acc[sq.order].add(sq.languageId)
        return acc
      },
      {} as Record<number, Set<string>>
    )

    if (existingTitleLanguages.size < 3 && video.title[0]?.crowdInId) {
      const missingLanguageCodes = Object.keys(LANGUAGE_CODES).filter((languageCode) => !existingTitleLanguages.has(languageCode))
      console.log('video.id', video.id)
      console.log('missingLanguageCodes Title', missingLanguageCodes)
   
      const crowdInId = video.title.find((t) => t.languageId === '529')?.crowdInId
      if (!crowdInId) {
        continue
      }
      missingTranslations.push({
        videoId: video.id,
        type: 'title',
        crowdInId,
        missingLanguageCodes
      })
    }

    if (existingDescLanguages.size < 3 && video.description[0]?.crowdInId) {
      const missingLanguageCodes = Object.keys(LANGUAGE_CODES).filter((languageCode) => !existingDescLanguages.has(languageCode))
      console.log('video.id', video.id)
      console.log('missingLanguageCodes Description', missingLanguageCodes)
      const crowdInId = video.description.find((d) => d.languageId === '529')?.crowdInId
      if (!crowdInId) {
        continue
      }
      missingTranslations.push({
        videoId: video.id,
        type: 'description',
        crowdInId,
        missingLanguageCodes
      })
    }

    for (const order of Object.keys(existingStudyQuestions)) {
      if (existingStudyQuestions[Number(order)].size < 3) {
        const missingLanguageCodes = Object.keys(LANGUAGE_CODES).filter((languageCode) => !existingStudyQuestions[Number(order)].has(languageCode))
        console.log('video.id', video.id)
        console.log('missingLanguageCodes Study Question order', order, missingLanguageCodes)
        const crowdInId = video.studyQuestions.find((sq) => sq.languageId === '529' && sq.order === Number(order))?.crowdInId
        if (!crowdInId) {
          continue
        }
        missingTranslations.push({
          videoId: video.id,
          type: 'studyQuestion',
          order: Number(order),
          crowdInId: crowdInId,
          missingLanguageCodes
        })
      }
    }
  }
  
  console.log(`Found ${missingTranslations.length} missing translations`)

  for (const missingTranslation of missingTranslations) {
    const { crowdInId, videoId } = missingTranslation

    if (!crowdInId) {
      console.log('No crowdInId for video', videoId) 
      continue
    }

    for (const languageCode of Object.keys(LANGUAGE_CODES)) {
      const response = await crowdinClient.stringTranslationsApi.listStringTranslations(
        crowdinProjectId,
        Number(crowdInId),
        languageCode,
        {
          limit: 1
        }
      )
      if (response.data.length === 0) {
        console.log('No translations found for', crowdInId, languageCode)
        continue
      }
      console.log('Translations:', response.data[0].data.text)
      const languageId = LANGUAGE_CODES[languageCode as keyof typeof LANGUAGE_CODES]
      await upsertTranslation(missingTranslation, response.data[0].data.text, languageId)
    }
   
  }

}

async function upsertTranslation(
  missingTranslation: MissingTranslation,
  translationText: string,
  languageId: string
): Promise<void> {
  const { videoId, type, order, crowdInId } = missingTranslation

  try {
    switch (type) {
      case 'title':
        console.log('Upserting title', videoId, languageId, translationText)
        await prisma.videoTitle.upsert({
          where: {
            videoId_languageId: {
              videoId,
              languageId
            }
          },
          update: {
            value: translationText
          },
          create: {
            videoId,
            languageId,
            value: translationText,
            primary: false,
            crowdInId
          }
        })
        break

      case 'description':
        console.log('Upserting description', videoId, languageId, translationText)
        await prisma.videoDescription.upsert({
          where: {
            videoId_languageId: {
              videoId,
              languageId
            }
          },
          update: {
            value: translationText
          },
          create: {
            videoId,
            languageId,
            value: translationText,
            primary: false,
            crowdInId
          }
        })
        break

      case 'studyQuestion':
        if (!order) {
          throw new Error('Order is required for study questions')
        }
        console.log('Upserting study question', videoId, languageId, order, translationText)
        await prisma.videoStudyQuestion.upsert({
          where: {
            videoId_languageId_order: {
              videoId,
              languageId,
              order
            }
          },
          update: {
            value: translationText
          },
          create: {
            videoId,
            languageId,
            value: translationText,
            order,
            primary: false,
            crowdInId
          }
        })
        break
    }

     console.log(
       `Successfully upserted ${type} translation for video ${videoId} in language ${languageId}`
     )
   } catch (error) {
     console.log(`Failed to upsert translation:`, {
      videoId,
      type,
      languageId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}
