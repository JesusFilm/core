import type { ApiResponse, MediaComponent } from '../../types'

export const mediaComponentIds = [
  'CS1',
  '1_jf-0-0',
  '1_wl-0-0',
  '1_cl-0-0',
  '1_mld-0-0',
  '1_fj_1-0-0',
  '2_0-ConsideringChristmas'
]

export const mediaComponentIdsForLanguageTest = [
  '1_jf-0-0',
  '2_0-ConsideringChristmas'
]

export const defaultMediaComponentsResponse: ApiResponse<MediaComponent> = {
  page: 1,
  limit: 10,
  pages: 1,
  total: 7,
  apiSessionId: '67857178602dd5.46881044',
  _links: {
    self: {
      href: 'http://api.arclight.org/v2/media-components?ids=CS1,1_jf-0-0,1_wl-0-0,1_cl-0-0,1_mld-0-0,1_fj_1-0-0,2_0-ConsideringChristmas&page=1&limit=10&apiKey=3a21a65d4gf98hZ7'
    },
    first: {
      href: 'http://api.arclight.org/v2/media-components?ids=CS1,1_jf-0-0,1_wl-0-0,1_cl-0-0,1_mld-0-0,1_fj_1-0-0,2_0-ConsideringChristmas&page=1&limit=10&apiKey=3a21a65d4gf98hZ7'
    },
    last: {
      href: 'http://api.arclight.org/v2/media-components?ids=CS1,1_jf-0-0,1_wl-0-0,1_cl-0-0,1_mld-0-0,1_fj_1-0-0,2_0-ConsideringChristmas&page=1&limit=10&apiKey=3a21a65d4gf98hZ7'
    }
  },
  _embedded: {
    mediaComponents: [
      {
        mediaComponentId: '1_cl-0-0',
        componentType: 'content',
        subType: 'featureFilm',
        contentType: 'video',
        imageUrls: {
          thumbnail:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.thumbnail.jpg',
          videoStill:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.videoStill.jpg',
          mobileCinematicHigh:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicHigh.jpg',
          mobileCinematicLow:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicLow.jpg',
          mobileCinematicVeryLow:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicVeryLow.webp'
        },
        lengthInMilliseconds: 3679829,
        containsCount: 0,
        isDownloadable: true,
        downloadSizes: {
          approximateSmallDownloadSizeInBytes: 99603207,
          approximateLargeDownloadSizeInBytes: 1132791000
        },
        bibleCitations: [],
        primaryLanguageId: 529,
        title: 'The Story of Jesus for Children',
        shortDescription:
          "In the first century, a group of children meet together to talk about what they've seen and heard about Jesus. Some believe Jesus is the Son of God. But others think Jesus may just be tricking the people.",
        longDescription:
          "In the first century, a group of children meet together to talk about what they've seen and heard about Jesus. Some believe Jesus is the Son of God. But others think Jesus may just be tricking the people.\n\nThe children follow Jesus around, witness His miracles, and listen to Him teach. Jesus raises a girl from the dead, calls imperfect people like tax collectors to follow Him, teaches everyone to be kind and gracious to each other, and lets a woman wash His feet with tears. He teaches in parables no one really understands, calms a raging storm, gives sight to the blind, and helps those who no one sees as worth helping. He shows the children an amazing, powerful, and kind way to live. Benjamin and Sarah talk to the children watching their story about Jesus and what it means to believe who He is and accept Him as their Savior.",
        studyQuestions: [
          'How do the kids learn about Jesus?',
          'Name three miracles Jesus performs.',
          'Name three things Jesus teaches.',
          'What does Jesus mean to you?',
          'Is He your Savior?'
        ],
        metadataLanguageTag: 'en'
      },
      {
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
      },
      {
        mediaComponentId: '1_wl-0-0',
        componentType: 'content',
        subType: 'featureFilm',
        contentType: 'video',
        imageUrls: {
          thumbnail:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl-0-0.thumbnail.jpg',
          videoStill:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl-0-0.videoStill.jpg',
          mobileCinematicHigh:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl-0-0.mobileCinematicHigh.jpg',
          mobileCinematicLow:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl-0-0.mobileCinematicLow.jpg',
          mobileCinematicVeryLow:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl-0-0.mobileCinematicVeryLow.webp'
        },
        lengthInMilliseconds: 4944356,
        containsCount: 0,
        isDownloadable: true,
        downloadSizes: {
          approximateSmallDownloadSizeInBytes: 133615336,
          approximateLargeDownloadSizeInBytes: 1495124623
        },
        bibleCitations: [],
        primaryLanguageId: 529,
        title: "Magdalena - Director's Cut",
        shortDescription:
          "Magdalena, a film made especially for women, beautifully shares God's love and the gospel, engaging women at the heart level with the potential of changing their lives for eternity. The Director's Cut is 82 minutes and includes additional scenes.",
        longDescription:
          "Magdalena, a film made especially for women, beautifully shares God's love and the gospel, engaging women at the heart level with the potential of changing their lives for eternity.\n\nA story of tenderness, freedom and purpose, it portrays Jesus' compassion for women and historical accounts of His interactions with them, as seen through the eyes of Mary Magdalene.",
        studyQuestions: [],
        metadataLanguageTag: 'en'
      },
      {
        mediaComponentId: 'CS1',
        componentType: 'container',
        subType: 'collection',
        contentType: 'none',
        imageUrls: {
          thumbnail:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/CS1.thumbnail.jpg',
          videoStill:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/CS1.videoStill.jpg',
          mobileCinematicHigh:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/CS1.mobileCinematicHigh.jpg',
          mobileCinematicLow:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/CS1.mobileCinematicLow.jpg',
          mobileCinematicVeryLow:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/CS1.mobileCinematicVeryLow.webp'
        },
        lengthInMilliseconds: 0,
        containsCount: 71,
        isDownloadable: false,
        downloadSizes: {},
        bibleCitations: [],
        primaryLanguageId: 529,
        title: 'Conversation Starters',
        shortDescription:
          'Short films are a great way to take the conversation deeper with "old friends and new." We\'ve included questions with each film to help you get started. Our goal is to help you discover a person\'s story through the theme of the films.',
        longDescription:
          'Short films are a great way to take the conversation deeper with "old friends and new." We\'ve included questions with each film to help you get started. Our goal is to help you discover a person\'s story through the theme of the films. As you listen to their story, you can share your own and connect the viewer to the person of Christ.',
        studyQuestions: [],
        metadataLanguageTag: 'en'
      },
      {
        mediaComponentId: '1_mld-0-0',
        componentType: 'content',
        subType: 'shortFilm',
        contentType: 'video',
        imageUrls: {
          thumbnail:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_mld1-0-0.thumbnail.jpg',
          videoStill:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_mld1-0-0.videoStill.jpg',
          mobileCinematicHigh:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_mld-0-0.mobileCinematicHigh.jpg',
          mobileCinematicLow:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_mld-0-0.mobileCinematicLow.jpg',
          mobileCinematicVeryLow:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_mld-0-0.mobileCinematicVeryLow.webp'
        },
        lengthInMilliseconds: 553558,
        containsCount: 1,
        isDownloadable: true,
        downloadSizes: {
          approximateSmallDownloadSizeInBytes: 14835823,
          approximateLargeDownloadSizeInBytes: 169098910
        },
        bibleCitations: [],
        primaryLanguageId: 529,
        title: 'My Last Day',
        shortDescription:
          'In a beautiful animé style, a prisoner watches as Jesus gets flogged in Pilate’s courtyard. He remembers Jesus teaching and wonders why they’re hurting an innocent man. Horrified, he remembers his own crime.',
        longDescription:
          "In a beautiful animé style, a prisoner watches as Jesus gets flogged in Pilate's courtyard. He remembers Jesus teaching and wonders why they're hurting an innocent man. Horrified, he remembers his own crime.\n\nThe crowds in the courtyard scream for Jesus to be crucified. The thief, another man, and Jesus are loaded with the beams for their crosses and march to Golgotha. \n\nThey arrive and nails are driven through their wrists. Each man is hung on a cross, their feet nailed to a wooden shelf.Our thief claims Jesus is the Messiah and asks that Jesus remember him. Jesus promises him they will be in paradise together that day. A dark storm overwhelms the hill and Jesus dies.\n\nThe thief passes away with a gasp and sees Jesus in a beautiful place.",
        studyQuestions: [
          'What message do you get from this story?',
          'How do you deal with things you feel guilty about?',
          'What do you think about the idea of being with Jesus in paradise?'
        ],
        metadataLanguageTag: 'en'
      },
      {
        mediaComponentId: '2_0-ConsideringChristmas',
        componentType: 'content',
        subType: 'shortFilm',
        contentType: 'video',
        imageUrls: {
          thumbnail:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-ConsideringChristmas.thumbnail.jpg',
          videoStill:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-ConsideringChristmas.videoStill.jpg',
          mobileCinematicHigh:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-ConsideringChristmas.mobileCinematicHigh.jpg',
          mobileCinematicLow:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-ConsideringChristmas.mobileCinematicLow.jpg',
          mobileCinematicVeryLow:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-ConsideringChristmas.mobileCinematicVeryLow.webp'
        },
        lengthInMilliseconds: 119786,
        containsCount: 0,
        isDownloadable: true,
        downloadSizes: {
          approximateSmallDownloadSizeInBytes: 3211425,
          approximateLargeDownloadSizeInBytes: 36601661
        },
        bibleCitations: [
          {
            osisBibleBook: 'Gal',
            chapterStart: 2,
            verseStart: 20,
            chapterEnd: null,
            verseEnd: null
          }
        ],
        primaryLanguageId: 529,
        title: 'Considering Christmas',
        shortDescription:
          'Christmas-time means traditions, family celebrations, and gifts. But what is the ultimate Christmas gift? This short film examines this question.',
        longDescription:
          'Christmas-time means traditions, family celebrations, and gifts. But what is the ultimate Christmas gift? This short film examines this question.',
        studyQuestions: [
          'Have you ever surprised someone with the perfect gift?',
          'What shows us that the world isn’t perfect?',
          'How did Jesus show people love through his birth?'
        ],
        metadataLanguageTag: 'en'
      },
      {
        mediaComponentId: '1_fj_1-0-0',
        componentType: 'content',
        subType: 'episode',
        contentType: 'video',
        imageUrls: {
          thumbnail:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_fj_1-0-0.thumbnail.jpg',
          videoStill:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_fj_1-0-0.videoStill.jpg',
          mobileCinematicHigh:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_fj_1-0-0.mobileCinematicHigh.jpg',
          mobileCinematicLow:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_fj_1-0-0.mobileCinematicLow.jpg',
          mobileCinematicVeryLow:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_fj_1-0-0.mobileCinematicVeryLow.webp'
        },
        lengthInMilliseconds: 1079427,
        containsCount: 0,
        isDownloadable: true,
        downloadSizes: {
          approximateSmallDownloadSizeInBytes: 29163513,
          approximateLargeDownloadSizeInBytes: 331817768
        },
        bibleCitations: [
          {
            osisBibleBook: 'Luke',
            chapterStart: 8,
            verseStart: 40,
            chapterEnd: null,
            verseEnd: 42
          },
          {
            osisBibleBook: 'Luke',
            chapterStart: 8,
            verseStart: 49,
            chapterEnd: null,
            verseEnd: 56
          },
          {
            osisBibleBook: 'Luke',
            chapterStart: 19,
            verseStart: 45,
            chapterEnd: null,
            verseEnd: 46
          }
        ],
        primaryLanguageId: 529,
        title: 'Who Is God?',
        shortDescription:
          "A few men in the village walk and talk. The JESUS film has been shown in their village and it's made an impression. One man keeps remembering how Jesus brought the daughter of Jairus from death to life.",
        longDescription:
          "A few men in the village walk and talk. The JESUS film has been shown in their village and it's made an impression. One man keeps remembering how Jesus brought the daughter of Jairus from death to life.\n\nWhen God created the world, everything was good. But now, there's no justice. A father wonders what happened to the good God who created everything. The son assures his father that God is still good. But it was man and woman who changed everything by disobeying God. The world changed. And we were all separated from God. But God sacrificed Jesus, His son, to redeem us so we could be with Him again.\n\nThey talk about Jesus fighting corruption in the temple, insisting that injustice shouldn't be a part of this world. The son agrees that God is kind and shows love and mercy and allows people to return to Him through Jesus. He who knows Jesus knows God.\n\nGod allowed Jesus to be crucified for us out of unconditional love. And because Jesus reconciles us with God, we can talk with God again and He will care for us.",
        studyQuestions: [
          'What does God do to show His love, grace, and mercy for us?',
          'How does God reveal His character and power through Jesus?',
          'What can we know about God and ourselves through the sacrifice of Jesus?',
          "Have you ever felt like you have had a debt that you can't pay?"
        ],
        metadataLanguageTag: 'en'
      }
    ]
  }
}
