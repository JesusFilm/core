enum VideoLabel {
  featureFilm = 'featureFilm'
}

enum VideoVariantDownloadQuality {
  high = 'high',
  low = 'low'
}

export const mockVideo =   {
    __typename: 'Video',
    id: '1_jf-0-0',
    label: VideoLabel.featureFilm,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'JESUS' }],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          "This film is a perfect introduction to Jesus through the Gospel of Luke. Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion. \n\nGod creates everything and loves mankind. But mankind disobeys God. God and mankind are separated, but God loves mankind so much, He arranges redemption for mankind. He sends his Son Jesus to be a perfect sacrifice to make amends for us.\n\nBefore Jesus arrives, God prepares mankind. Prophets speak of the birth, the life, and the death of Jesus.\n\nJesus attracts attention. He teaches in parables no one really understands, gives sight to the blind, and helps those who no one sees as worth helping.\n\nHe scares the Jewish leaders, they see him as a threat. So they arrange, through Judas the traitor and their Roman oppressors, for the crucifixion of Jesus. They think the matter is settled. But the women who serve Jesus discover an empty tomb. The disciples panic. When Jesus appears, they doubt He's real. But it's what He proclaimed all along: He is their perfect sacrifice, their Savior, victor over death. He ascends to heaven, telling His followers to tell others about Him and His teachings."
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value: "How is the sacrifice of Jesus part of God's plan?"
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'How do the different groups of people respond to Jesus and His teachings?'
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'What are some of the miracles Jesus performed? How do they affect those people?'
      },
      {
        __typename: 'VideoStudyQuestion',
        value: 'How do you respond to the life of Jesus?'
      }
    ],
    title: [{ __typename: 'VideoTitle', value: 'JESUS' }],
    variant: {
      __typename: 'VideoVariant',
      id: '1_529-jf-0-0',
      duration: 7674,
      hls: 'https://arc.gt/j67rz',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 207296233,
          url: 'https://arc.gt/y1s23'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 2361587773,
          url: 'https://arc.gt/7geui'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }]
      },
      slug: 'jesus/english',
      subtitleCount: 32
    },
    variantLanguagesCount: 2039,
    slug: 'jesus',
    childrenCount: 61
  }