import { BaseHit, Hit } from 'instantsearch.js'
import { HttpResponse, delay, http } from 'msw'

const hits = [
  {
    videoId: '1_jf-0-0',
    titles: ['JESUS'],
    description: [
      "This film is a perfect introduction to Jesus through the Gospel of Luke. Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion. \n\nGod creates everything and loves mankind. But mankind disobeys God. God and mankind are separated, but God loves mankind so much, He arranges redemption for mankind. He sends his Son Jesus to be a perfect sacrifice to make amends for us.\n\nBefore Jesus arrives, God prepares mankind. Prophets speak of the birth, the life, and the death of Jesus.\n\nJesus attracts attention. He teaches in parables no one really understands, gives sight to the blind, and helps those who no one sees as worth helping.\n\nHe scares the Jewish leaders, they see him as a threat. So they arrange, through Judas the traitor and their Roman oppressors, for the crucifixion of Jesus. They think the matter is settled. But the women who serve Jesus discover an empty tomb. The disciples panic. When Jesus appears, they doubt He's real. But it's what He proclaimed all along: He is their perfect sacrifice, their Savior, victor over death. He ascends to heaven, telling His followers to tell others about Him and His teachings."
    ],
    duration: 7674,
    languageId: '529',
    subtitles: [
      '1106',
      '1112',
      '1269',
      '1341',
      '139089',
      '140126',
      '16639',
      '184497',
      '184498',
      '184506',
      '1942',
      '21028',
      '21753',
      '21754',
      '22500',
      '22658',
      '23178',
      '3804',
      '3887',
      '3934',
      '3964',
      '3974',
      '4415',
      '4432',
      '4820',
      '4823',
      '483',
      '496',
      '529',
      '5546',
      '6464',
      '7083'
    ],
    slug: 'jesus/english',
    label: 'featureFilm',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg',
    imageAlt: 'JESUS',
    childrenCount: 61,
    objectID: '1_529-jf-0-0'
  },
  {
    videoId: '2_ChosenWitness',
    titles: ['Chosen Witness'],
    description: [
      "An unlikely woman's life is dramatically transformed by a man who will soon change the world forever. In this animated short film, experience the life of Jesus through the eyes of one of his followers, Mary Magdalene."
    ],
    duration: 565,
    languageId: '529',
    subtitles: ['529'],
    slug: 'chosen-witness/english',
    label: 'shortFilm',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_ChosenWitness.mobileCinematicHigh.jpg?version=2',
    imageAlt: 'Chosen Witness',
    childrenCount: 0,
    objectID: '2_529-ChosenWitness'
  },
  {
    videoId: '2_GOJ-0-0',
    titles: ['Life of Jesus (Gospel of John)'],
    description: [
      'And truly Jesus did many other signs in the presence of His disciples, which are not written in this book; but these are written that you may believe that Jesus is the Christ, the Son of God, and that believing you may have life in His name. -John 20:30-31 NKJV\n\n" I have come that they may have life, and that they may have it more abundantly." - John 10:10 NKJV\n\n"And this is eternal life, that they may know You, the only true God, and Jesus Christ whom You have sent." - John 17:3 NKJV'
    ],
    duration: 10994,
    languageId: '529',
    subtitles: [],
    slug: 'life-of-jesus-gospel-of-john/english',
    label: 'featureFilm',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ-0-0.mobileCinematicHigh.jpg',
    imageAlt: 'Life of Jesus (Gospel of John)',
    childrenCount: 49,
    objectID: '2_529-GOJ-0-0'
  },
  {
    videoId: 'MAG1',
    titles: ['Magdalena'],
    description: [
      '"Magdalena", the compelling film portraying Jesus\' tender regard for women, is being met with incredible response around the world. Magdalena is inspiring women everywhere to realize and reclaim the purpose they were always intended for...to know Jesus, and with loving hearts and a gentle touch make Him known.\n\nThis collection includes the 1-hour version of "Magdalena" as well as the original 82 minute director\'s cut. A series of short clips (2-5 minutes) with thought-provoking questions help viewers delve deeper into God’s Word to discover hope for their lives. '
    ],
    duration: 3658,
    languageId: '529',
    subtitles: [
      '1106',
      '1109',
      '1269',
      '184497',
      '184498',
      '1942',
      '1964',
      '20601',
      '21028',
      '21046',
      '21064',
      '21754',
      '22500',
      '23178',
      '3804',
      '3887',
      '3934',
      '4415',
      '4432',
      '4601',
      '4823',
      '483',
      '496',
      '529',
      '531',
      '5541',
      '5545',
      '5546',
      '5563',
      '6788',
      '7698'
    ],
    slug: 'magdalena/english',
    label: 'featureFilm',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/high_mag_collection_640x300br.jpg',
    imageAlt: 'Magdalena',
    childrenCount: 46,
    objectID: '1_529-wl60-0-0'
  },
  {
    videoId: '1_cl-0-0',
    titles: ['The Story of Jesus for Children'],
    description: [
      "In the first century, a group of children meet together to talk about what they've seen and heard about Jesus. Some believe Jesus is the Son of God. But others think Jesus may just be tricking the people.\n\nThe children follow Jesus around, witness His miracles, and listen to Him teach. Jesus raises a girl from the dead, calls imperfect people like tax collectors to follow Him, teaches everyone to be kind and gracious to each other, and lets a woman wash His feet with tears. He teaches in parables no one really understands, calms a raging storm, gives sight to the blind, and helps those who no one sees as worth helping. He shows the children an amazing, powerful, and kind way to live. Benjamin and Sarah talk to the children watching their story about Jesus and what it means to believe who He is and accept Him as their Savior."
    ],
    duration: 3680,
    languageId: '529',
    subtitles: ['1942', '21028', '3934', '3964', '4820', '496', '529', '7083'],
    slug: 'the-story-of-jesus-for-children/english',
    label: 'featureFilm',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicHigh.jpg',
    imageAlt: 'The Story of Jesus for Children',
    childrenCount: 0,
    objectID: '1_529-cl-0-0'
  },
  {
    videoId: 'IsItWorthIt',
    titles: ['Is it Worth it?'],
    description: [
      'Injury, loss, and winning are critical issues all athletes deal with. Hear what a professional basketball player, a USA hammer thrower, and a world champion wrestler have experienced and what they all have in common.'
    ],
    duration: 0,
    languageId: '529',
    subtitles: [],
    slug: 'is-it-worth-it/english',
    label: 'collection',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/IsItWorthIt.mobileCinematicHigh.jpg',
    imageAlt: 'Is it Worth it?',
    childrenCount: 6,
    objectID: '529-IsItWorthIt'
  },
  {
    videoId: 'Wonder',
    titles: ['Do You Ever Wonder...?'],
    description: [
      'Have you ever felt like the world was broken, and that we are broken along with it? But there is Good News: God, in His love, has made a way for us to be restored and reconciled.'
    ],
    duration: 0,
    languageId: '529',
    subtitles: [],
    slug: 'do-you-ever-wonder/english',
    label: 'collection',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/Wonder.mobileCinematicHigh.jpg?version=2',
    imageAlt: 'Do You Ever Wonder...?',
    childrenCount: 8,
    objectID: '529-Wonder'
  },
  {
    videoId: 'Nua',
    titles: ['NUA: Fresh Perspective'],
    description: [
      "NUA is a film series that isn't afraid to acknowledge your questions of doubt, while yearning for something deeper in your spiritual life. The answers are out there. Let's find them!"
    ],
    duration: 0,
    languageId: '529',
    subtitles: [],
    slug: 'nua-fresh-perspective/english',
    label: 'collection',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/nua.mobileCinematicHigh.jpg?version=2',
    imageAlt: 'NUA: Fresh Perspective',
    childrenCount: 10,
    objectID: '529-Nua'
  },
  {
    videoId: '8_NBC',
    titles: ['New Believer Course'],
    description: [
      'If you’ve ever wondered what Christianity is about, or what sort of lifestyle it empowers you to live, the New Believer Course exists to help you understand the Gospel and live your life in response to it.'
    ],
    duration: 0,
    languageId: '529',
    subtitles: [],
    slug: 'new-believer-course/english',
    label: 'series',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/8_NBC.mobileCinematicHigh.jpg',
    imageAlt: 'New Believer Course',
    childrenCount: 10,
    objectID: '8_529-NBC'
  },
  {
    videoId: 'GoodStory',
    titles: ['Retelling the Good Story'],
    description: [
      'See the stories told by Creator Sets Free (Jesus) as told in the First Nations Version of the New Testament, a thought-for-thought translation, for North American Native People. The film begins with a group of people around a fire listening to the storyteller, Mishomis, sharing about the Good Story first told by Gift From Creator (Matthew) who was a follower of Creator Sets Free (Jesus), the Chosen One—the Son of the Great Spirit. These stories happened over two thousand winters ago, far across the great waters of the sea, in the Land of Promise of the tribes of Wrestles With Creator (Israel). Visit https://firstnationsversion.com to learn more.'
    ],
    duration: 0,
    languageId: '529',
    subtitles: [],
    slug: 'retelling-the-good-story/english',
    label: 'collection',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/GoodStory.mobileCinematicHigh.jpg',
    imageAlt: 'Retelling the Good Story',
    childrenCount: 3,
    objectID: '529-GoodStory'
  }
] as unknown as Array<Hit<BaseHit>>

export const getAlgoliaVideosHandlers = [
  http.post('https://algolia-dsn.algolia.net/1/indexes/*', () => {
    return HttpResponse.json({
      results: [{ hits, nbHits: 10 }]
    })
  })
]

export const loadingHandler = [
  http.post('https://algolia-dsn.algolia.net/1/indexes/*', async () => {
    await delay(1000 * 60 * 60 * 60)
    return HttpResponse.json({
      results: [{ hits: [], nbHits: 0, loading: true }]
    })
  })
]

export const emptyResultsHandler = [
  http.post('https://algolia-dsn.algolia.net/1/indexes/*', () => {
    return HttpResponse.json({
      results: [{ hits: [], nbHits: 0 }]
    })
  })
]
