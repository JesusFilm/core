import type { ApiResponse, MediaComponent } from '../../types'

export const mediaComponentId = '1_jf-0-0'

// Response from api.arclight.org for single media component
export const mediaComponentTestData: MediaComponent = {
  mediaComponentId: '1_jf-0-0',
  componentType: 'content',
  subType: 'featureFilm',
  contentType: 'video',
  imageUrls: {
    thumbnail:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.thumbnail.jpg?version=2',
    videoStill:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.videoStill.jpg?version=2',
    mobileCinematicHigh:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg?version=2',
    mobileCinematicLow:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicLow.jpg?version=2',
    mobileCinematicVeryLow:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicVeryLow.webp?version=2'
  },
  lengthInMilliseconds: 7673728,
  containsCount: 61,
  isDownloadable: true,
  downloadSizes: {
    approximateSmallDownloadSizeInBytes: 207141494,
    approximateLargeDownloadSizeInBytes: 2358523707
  },
  bibleCitations: [],
  primaryLanguageId: 529,
  title: 'JESUS',
  shortDescription:
    'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.',
  longDescription:
    "This film is a perfect introduction to Jesus through the Gospel of Luke. Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion. \n\nGod creates everything and loves mankind. But mankind disobeys God. God and mankind are separated, but God loves mankind so much, He arranges redemption for mankind. He sends his Son Jesus to be a perfect sacrifice to make amends for us.\n\nBefore Jesus arrives, God prepares mankind. Prophets speak of the birth, the life, and the death of Jesus.\n\nJesus attracts attention. He teaches in parables no one really understands, gives sight to the blind, and helps those who no one sees as worth helping.\n\nHe scares the Jewish leaders, they see him as a threat. So they arrange, through Judas the traitor and their Roman oppressors, for the crucifixion of Jesus. They think the matter is settled. But the women who serve Jesus discover an empty tomb. The disciples panic. When Jesus appears, they doubt He's real. But it's what He proclaimed all along: He is their perfect sacrifice, their Savior, victor over death. He ascends to heaven, telling His followers to tell others about Him and His teachings.",
  studyQuestions: [
    "How is the sacrifice of Jesus part of God's plan?",
    'How do the different groups of people respond to Jesus and His teachings?',
    'What are some of the miracles Jesus performed? How do they affect those people?',
    'How do you respond to the life of Jesus?'
  ],
  metadataLanguageTag: 'en'
}
