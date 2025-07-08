// @generated
// This file was automatically generated and should not be edited.
// Please run `nx generate-test-data watch` to regenerate it.
import {
  VideoLabel,
  VideoVariantDownloadQuality
} from '../../../../__generated__/globalTypes'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'

export const videos: VideoContentFields[] = [
  {
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
        value: "How is the sacrifice of Jesus part of God's plan?",
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'How do the different groups of people respond to Jesus and His teachings?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'What are some of the miracles Jesus performed? How do they affect those people?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: 'How do you respond to the life of Jesus?',
        primary: true
      }
    ],
    bibleCitations: [],
    title: [{ __typename: 'VideoTitle', value: 'JESUS' }],
    variant: {
      __typename: 'VideoVariant',
      id: '1_529-jf-0-0',
      duration: 7674,
      hls: 'https://arc.gt/j67rz',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 2358523707,
          url: 'https://arc.gt/7geui'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 207141494,
          url: 'https://arc.gt/fct70'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 1561752518,
          url: 'https://arc.gt/2r4bc'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'jesus/english',
      subtitleCount: 38
    },
    variantLanguagesCount: 2206,
    slug: 'jesus',
    childrenCount: 61
  },
  {
    __typename: 'Video',
    id: '2_GOJ-0-0',
    label: VideoLabel.featureFilm,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_GOJ-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [
      { __typename: 'VideoImageAlt', value: 'Life of Jesus (Gospel of John)' }
    ],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          'And truly Jesus did many other signs in the presence of His disciples, which are not written in this book; but these are written that you may believe that Jesus is the Christ, the Son of God, and that believing you may have life in His name. -John 20:30-31 NKJV'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          'And truly Jesus did many other signs in the presence of His disciples, which are not written in this book; but these are written that you may believe that Jesus is the Christ, the Son of God, and that believing you may have life in His name. -John 20:30-31 NKJV\n\n" I have come that they may have life, and that they may have it more abundantly." - John 10:10 NKJV\n\n"And this is eternal life, that they may know You, the only true God, and Jesus Christ whom You have sent." - John 17:3 NKJV'
      }
    ],
    studyQuestions: [],
    bibleCitations: [
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'John' }]
        },
        chapterStart: 20,
        chapterEnd: null,
        verseStart: 30,
        verseEnd: 31
      },
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'John' }]
        },
        chapterStart: 10,
        chapterEnd: null,
        verseStart: 10,
        verseEnd: null
      },
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'John' }]
        },
        chapterStart: 17,
        chapterEnd: null,
        verseStart: 3,
        verseEnd: null
      }
    ],
    title: [
      { __typename: 'VideoTitle', value: 'Life of Jesus (Gospel of John)' }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: '2_529-GOJ-0-0',
      duration: 10994,
      hls: 'https://arc.gt/u3kd6',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 3384067193,
          url: 'https://arc.gt/on94p'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 297742490,
          url: 'https://arc.gt/evdp0'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 2240777708,
          url: 'https://arc.gt/9ftv4'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'life-of-jesus-gospel-of-john/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 24,
    slug: 'life-of-jesus-gospel-of-john',
    childrenCount: 49
  },
  {
    __typename: 'Video',
    id: '1_jf6119-0-0',
    label: VideoLabel.segment,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6119-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'Jesus Calms the Storm' }],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          'Jesus gets into a boat and tells His disciples they should all go to the other side of the lake. Along the way, Jesus falls asleep. A storm starts to rage. Waves stretch high over the bow. And the boat starts to take on water.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          "Jesus gets into a boat and tells His disciples they should all go to the other side of the lake. Along the way, Jesus falls asleep. A storm starts to rage. Waves stretch high over the bow. And the boat starts to take on water.\n\nThe whole time, Jesus stays asleep. The disciples hold on tight. They try to keep the boat afloat. Finally, Peter cries out to the still sleeping Jesus. He tells Jesus that the boat is taking on water and that they'll all be drowned.\n\nJesus stands and puts a hand out toward the storm. The storm clears. And the seas immediately calm."
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value: 'How do the disciples react to the storm?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: 'What does Jesus do when the disciples ask Him for help?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: 'How would you respond to the storm and to Jesus?',
        primary: true
      }
    ],
    bibleCitations: [
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Luke' }]
        },
        chapterStart: 8,
        chapterEnd: null,
        verseStart: 22,
        verseEnd: 25
      }
    ],
    title: [{ __typename: 'VideoTitle', value: 'Jesus Calms the Storm' }],
    variant: {
      __typename: 'VideoVariant',
      id: '1_529-jf6119-0-0',
      duration: 119,
      hls: 'https://arc.gt/69sos',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 36145996,
          url: 'https://arc.gt/i9ugt'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 3154895,
          url: 'https://arc.gt/b44vt'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 23985620,
          url: 'https://arc.gt/1lmgn'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'jesus-calms-the-storm/english',
      subtitleCount: 38
    },
    variantLanguagesCount: 2179,
    slug: 'jesus-calms-the-storm',
    childrenCount: 0
  },
  {
    __typename: 'Video',
    id: '1_wl604423-0-0',
    label: VideoLabel.segment,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_wl604423-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [
      {
        __typename: 'VideoImageAlt',
        value: 'The Woman with the Issue of Blood'
      }
    ],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          'A woman suffering from 12 years of bleeding could find no one to help her.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          'A woman suffering from 12 years of bleeding could find no one to help her.'
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value:
          "Why do you think the woman so desperately wanted to touch Jesus' garment?",
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'In such a large crowd of people, why do you think Jesus wanted to know who touched Him?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'Of all the things Jesus said to the woman, what meant the most to you?',
        primary: true
      }
    ],
    bibleCitations: [
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Matthew' }]
        },
        chapterStart: 9,
        chapterEnd: null,
        verseStart: 18,
        verseEnd: 22
      },
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Mark' }]
        },
        chapterStart: 5,
        chapterEnd: null,
        verseStart: 21,
        verseEnd: 34
      },
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Luke' }]
        },
        chapterStart: 8,
        chapterEnd: null,
        verseStart: 40,
        verseEnd: 48
      }
    ],
    title: [
      { __typename: 'VideoTitle', value: 'The Woman with the Issue of Blood' }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: '1_529-wl604423-0-0',
      duration: 190,
      hls: 'https://arc.gt/0sgr2',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 5081515,
          url: 'https://arc.gt/7jh6t'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 58536996,
          url: 'https://arc.gt/6iia6'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 38652823,
          url: 'https://arc.gt/hcody'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'the-woman-with-the-issue-of-blood/english',
      subtitleCount: 31
    },
    variantLanguagesCount: 232,
    slug: 'the-woman-with-the-issue-of-blood',
    childrenCount: 0
  },
  {
    __typename: 'Video',
    id: 'MAG1',
    label: VideoLabel.featureFilm,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/MAG1.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'Magdalena' }],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          'This compelling film collection portraying Jesus’ tender regard for women, is being met with incredible response around the world--inspiring women everywhere to realize and reclaim the purpose they were always intended for...to know God’s love for them and to make it known to others.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          '"Magdalena", the compelling film portraying Jesus\' tender regard for women, is being met with incredible response around the world. Magdalena is inspiring women everywhere to realize and reclaim the purpose they were always intended for...to know Jesus, and with loving hearts and a gentle touch make Him known.\n\nThis collection includes the 1-hour version of "Magdalena" as well as the original 82 minute director\'s cut. A series of short clips (2-5 minutes) with thought-provoking questions help viewers delve deeper into God’s Word to discover hope for their lives. '
      }
    ],
    studyQuestions: [],
    bibleCitations: [],
    title: [{ __typename: 'VideoTitle', value: 'Magdalena' }],
    variant: {
      __typename: 'VideoVariant',
      id: '529-MAG1',
      duration: 3658,
      hls: 'https://arc.gt/d8p35',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 98861290,
          url: 'https://arc.gt/22mpi'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 1099718055,
          url: 'https://arc.gt/29xoy'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 744467103,
          url: 'https://arc.gt/5zqjs'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'magdalena/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 233,
    slug: 'magdalena',
    childrenCount: 46
  },
  {
    __typename: 'Video',
    id: '1_wl7-0-0',
    label: VideoLabel.series,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_wl7-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'Reflections of Hope' }],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          "Reflections of Hope is an eight-lesson Bible study that helps women deepen their understanding of Jesus' love and care for them. They learn of His promise to be with them each step of life's journey."
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          "Reflections of Hope is an eight-lesson Bible study that helps women deepen their understanding of Jesus' love and care for them. They learn of His promise to be with them each step of life's journey. This collection includes seven short clips from Magdalena that correspond with the lessons in the study. It also provides thought provoking questions to help women go deeper into God's Word and find the value that God placed in each one of them."
      }
    ],
    studyQuestions: [],
    bibleCitations: [],
    title: [{ __typename: 'VideoTitle', value: 'Reflections of Hope' }],
    variant: {
      __typename: 'VideoVariant',
      id: '1_529-wl7-0-0',
      duration: 0,
      hls: null,
      downloadable: true,
      downloads: [],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'reflections-of-hope/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 232,
    slug: 'reflections-of-hope',
    childrenCount: 7
  },
  {
    __typename: 'Video',
    id: '3_0-8DWJ-WIJ_06-0-0',
    label: VideoLabel.episode,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/3_0-8DWJ-WIJ_06-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [
      { __typename: 'VideoImageAlt', value: 'Day 6: Jesus Died for Me' }
    ],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          "They arrive at the place where the crosses are being set up. Others are being tied to their crosses. Jesus is stripped and led to His own cross. They throw Him down on it. There are cries as the others are nailed to their crosses.\n\nThe nails are hammered through Jesus's wrists and feet as He screams. Then slowly, the crosses are erected as Romans pulls the ropes. Jesus is lifted high in the air. He hangs on the cross, tired and in pain. He prays for those in the crowd. He asks God to forgive them because they don't know what they do.\n\nThe crowd murmurs at the feet of the cross. Annas and Caiaphas comment that He saved others. They wonder why He doesn't save Himself. The crowd starts to jeer. They urge Him to save Himself. But He doesn't."
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value: 'How do I feel about Jesus being crucified?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: "How do Jesus' words to the thief on the cross give me hope?",
        primary: true
      }
    ],
    bibleCitations: [
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Luke' }]
        },
        chapterStart: 23,
        chapterEnd: 24,
        verseStart: 56,
        verseEnd: 50
      },
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Matthew' }]
        },
        chapterStart: 28,
        chapterEnd: null,
        verseStart: 18,
        verseEnd: 20
      }
    ],
    title: [{ __typename: 'VideoTitle', value: 'Day 6: Jesus Died for Me' }],
    variant: {
      __typename: 'VideoVariant',
      id: '3_529-0-8DWJ-WIJ_06-0-0',
      duration: 488,
      hls: 'https://arc.gt/xqav7',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 149873025,
          url: 'https://arc.gt/edne0'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 13079055,
          url: 'https://arc.gt/tts5q'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 99320243,
          url: 'https://arc.gt/9ctj6'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'day-6-jesus-died-for-me/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 3,
    slug: 'day-6-jesus-died-for-me',
    childrenCount: 0
  },
  {
    __typename: 'Video',
    id: '2_Acts-0-0',
    label: VideoLabel.featureFilm,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_Acts-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'Book of Acts' }],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          'This film depicts the birth of the early church through the eyes of Luke, the author of the Gospel of Luke.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          'This film depicts the birth of the early church through the eyes of Luke, the author of the Gospel of Luke.'
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value: 'What did you like best or what caught your attention?',
        primary: true
      },
      { __typename: 'VideoStudyQuestion', value: 'Why?', primary: true }
    ],
    bibleCitations: [
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Acts' }]
        },
        chapterStart: 2,
        chapterEnd: null,
        verseStart: 42,
        verseEnd: null
      }
    ],
    title: [{ __typename: 'VideoTitle', value: 'Book of Acts' }],
    variant: {
      __typename: 'VideoVariant',
      id: '2_529-Acts-0-0',
      duration: 11530,
      hls: 'https://arc.gt/6x6ke',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 312095090,
          url: 'https://arc.gt/1xfta'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 3548570033,
          url: 'https://arc.gt/8fsak'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 2349598163,
          url: 'https://arc.gt/2kmly'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'book-of-acts/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 9,
    slug: 'book-of-acts',
    childrenCount: 73
  },
  {
    __typename: 'Video',
    id: '2_GOJ4904-0-0',
    label: VideoLabel.segment,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_GOJ4904-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'Wedding in Cana' }],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          'Jesus performs His first recorded miracle at a Wedding by transforming water into Wine.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          'Jesus performs His first recorded miracle at a Wedding by transforming water into Wine.'
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value: 'Who was affected by this miracle?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: 'What does this first miracle tell you about Jesus?',
        primary: true
      }
    ],
    bibleCitations: [
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'John' }]
        },
        chapterStart: 2,
        chapterEnd: null,
        verseStart: 11,
        verseEnd: null
      }
    ],
    title: [{ __typename: 'VideoTitle', value: 'Wedding in Cana' }],
    variant: {
      __typename: 'VideoVariant',
      id: '2_529-GOJ4904-0-0',
      duration: 213,
      hls: 'https://arc.gt/29cgr',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 65652285,
          url: 'https://arc.gt/fcuyv'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 5741430,
          url: 'https://arc.gt/5h7zk'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 43303851,
          url: 'https://arc.gt/2f78w'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'wedding-in-cana/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 24,
    slug: 'wedding-in-cana',
    childrenCount: 0
  },
  {
    __typename: 'Video',
    id: 'LUMOCollection',
    label: VideoLabel.collection,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/LUMOCollection.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'LUMO' }],
    snippet: [{ __typename: 'VideoSnippet', value: 'LUMO content collection' }],
    description: [
      { __typename: 'VideoDescription', value: 'LUMO content collection' }
    ],
    studyQuestions: [],
    bibleCitations: [],
    title: [{ __typename: 'VideoTitle', value: 'LUMO' }],
    variant: {
      __typename: 'VideoVariant',
      id: '529-LUMOCollection',
      duration: 0,
      hls: null,
      downloadable: true,
      downloads: [],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'lumo/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 57,
    slug: 'lumo',
    childrenCount: 5
  },
  {
    __typename: 'Video',
    id: '2_Acts7331-0-0',
    label: VideoLabel.segment,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_Acts7331-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [
      {
        __typename: 'VideoImageAlt',
        value: "Peter's Miraculous Escape From Prison"
      }
    ],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value: 'Peter escapes "death row" with help from an angel.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value: 'Peter escapes "death row" with help from an angel.'
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value: 'What did you like best or what caught your attention?',
        primary: true
      },
      { __typename: 'VideoStudyQuestion', value: 'Why?', primary: true },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'Herod also imprisoned John the Baptist. What happened to John? [See Matthew 14:1-12.]',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: 'How secure was Peter in prison? Any chance of escape?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: 'How do you think the non-believers explained Peter’s escape?',
        primary: true
      }
    ],
    bibleCitations: [
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Acts' }]
        },
        chapterStart: 12,
        chapterEnd: null,
        verseStart: 11,
        verseEnd: null
      }
    ],
    title: [
      {
        __typename: 'VideoTitle',
        value: "Peter's Miraculous Escape From Prison"
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: '2_529-Acts7331-0-0',
      duration: 298,
      hls: 'https://arc.gt/esnsq',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 8038767,
          url: 'https://arc.gt/91ujt'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 91521131,
          url: 'https://arc.gt/2hh1p'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 60603092,
          url: 'https://arc.gt/2on53'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'peter-miraculous-escape-from-prison/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 9,
    slug: 'peter-miraculous-escape-from-prison',
    childrenCount: 0
  },
  {
    __typename: 'Video',
    id: '3_0-8DWJ-WIJ',
    label: VideoLabel.series,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/3_0-8DWJ-WIJ.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [
      { __typename: 'VideoImageAlt', value: '8 Days with Jesus: Who is Jesus?' }
    ],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.\n\nAbout Days with Jesus:\nMentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specially designed to help users deepen their walk with Christ. "Days with Jesus" uses The JESUS Film, an already-successful means for reaching people with the Gospel, and unpacks it one step further. Each video segment from The JESUS Film is carefully selected to convey God’s message of truth, and each question has been deliberately chosen and worded. Our prayer for this series is that people would learn from Jesus how to be like Jesus.\n\n8 Days with Jesus: Who is Jesus? will introduce you to Jesus and who He is. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. \n\nVisit www.mentorlink.org for more information.'
      }
    ],
    studyQuestions: [],
    bibleCitations: [],
    title: [
      { __typename: 'VideoTitle', value: '8 Days with Jesus: Who is Jesus?' }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: '3_529-0-8DWJ-WIJ',
      duration: 0,
      hls: null,
      downloadable: true,
      downloads: [],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: '8-days-with-jesus-who-is-jesus/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 3,
    slug: '8-days-with-jesus-who-is-jesus',
    childrenCount: 8
  },
  {
    __typename: 'Video',
    id: '2_ChosenWitness',
    label: VideoLabel.shortFilm,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_ChosenWitness.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'Chosen Witness' }],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          "An unlikely woman's life is dramatically transformed by a man who will soon change the world forever. In this animated short film, experience the life of Jesus through the eyes of one of his followers, Mary Magdalene."
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          "An unlikely woman's life is dramatically transformed by a man who will soon change the world forever. In this animated short film, experience the life of Jesus through the eyes of one of his followers, Mary Magdalene."
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value:
          'In what ways do you identify with the main character, Mary Magdalene?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: "Why do you think the elders didn't approve of Jesus?",
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'After his resurrection, why do you think Jesus chose to speak first with Mary?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'How do you respond to the life of Jesus? What emotions come to mind, and why?',
        primary: true
      }
    ],
    bibleCitations: [
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'John' }]
        },
        chapterStart: 20,
        chapterEnd: null,
        verseStart: 17,
        verseEnd: null
      },
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'John' }]
        },
        chapterStart: 20,
        chapterEnd: null,
        verseStart: 18,
        verseEnd: null
      }
    ],
    title: [{ __typename: 'VideoTitle', value: 'Chosen Witness' }],
    variant: {
      __typename: 'VideoVariant',
      id: '2_529-ChosenWitness',
      duration: 565,
      hls: 'https://arc.gt/3mcdc',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 15189642,
          url: 'https://arc.gt/41226'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 173112311,
          url: 'https://arc.gt/6vvi2'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 114394441,
          url: 'https://arc.gt/799o4'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'chosen-witness/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 49,
    slug: 'chosen-witness',
    childrenCount: 0
  },
  {
    __typename: 'Video',
    id: 'GOLukeCollection',
    label: VideoLabel.collection,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/GOLukeCollection.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [
      { __typename: 'VideoImageAlt', value: 'LUMO - The Gospel of Luke' }
    ],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          "Luke's Gospel, more than any other, fits the category of ancient biography. Luke acts as a 'narrator' of events rather than the conventional author, painting a picture of Jesus as a very human character, full of compassion for all the suffering world. Luke sees Jesus as the 'Savior' of all people irrespective of their beliefs, always on the side of the needy and the deprived against the rich and the powerful. He constantly challenges those in power for their self-righteousness. This film about the life of Jesus takes the actual Gospel text as it's script, word-for-word, unedited. Five years in the making, this epic production has been critically acclaimed by leading religious scholars as a unique and highly authentic telling of the Jesus story. \n \nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject"
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          "Luke's Gospel, more than any other, fits the category of ancient biography. Luke acts as a 'narrator' of events rather than the conventional author, painting a picture of Jesus as a very human character, full of compassion for all the suffering world. Luke sees Jesus as the 'Savior' of all people irrespective of their beliefs, always on the side of the needy and the deprived against the rich and the powerful. He constantly challenges those in power for their self-righteousness. This film about the life of Jesus takes the actual Gospel text as it's script, word-for-word, unedited. Five years in the making, this epic production has been critically acclaimed by leading religious scholars as a unique and highly authentic telling of the Jesus story. \n \nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject"
      }
    ],
    studyQuestions: [],
    bibleCitations: [],
    title: [{ __typename: 'VideoTitle', value: 'LUMO - The Gospel of Luke' }],
    variant: {
      __typename: 'VideoVariant',
      id: '529-GOLukeCollection',
      duration: 0,
      hls: null,
      downloadable: true,
      downloads: [],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'lumo-the-gospel-of-luke/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 55,
    slug: 'lumo-the-gospel-of-luke',
    childrenCount: 26
  },
  {
    __typename: 'Video',
    id: '1_cl1309-0-0',
    label: VideoLabel.episode,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_cl1309-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [
      { __typename: 'VideoImageAlt', value: 'StoryClubs: Jesus and Zacchaeus' }
    ],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          "Jesus enters the town surrounded by crowds pushing in on Him. Zacchaeus, a short man, tries to see Jesus. But he can't see above the crowds or get through them. He climbs a tree. Jesus calls out to him."
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          "Jesus enters the town surrounded by crowds pushing in on Him. Zacchaeus, a short man, tries to see Jesus. But he can't see above the crowds or get through them. He climbs a tree. Jesus calls out to him.\n\nHe tells Zacchaeus to come down from the tree because He wants to have dinner with him. People are appalled. Zacchaeus is the town tax collector. But Zacchaeus is more than happy. He comes down from the tree and leads the way.\n\nTo download the entire lesson, go to: http://katw-kidstory.com/download/english-kidstory-jesus-film-lessons/"
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value: 'What part of the story did you really like?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'If Jesus asked to come to your house, how would you respond?  How would that make you feel?  What would you do with him while He was there?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'Zacchaeus wanted to get as close as he could to see Jesus.  Why would he do that?  Why would you want to be close to Jesus?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'How can we get close to Jesus today?  (This would be a good opportunity to give children an opportunity to become Christ followers.)',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: 'Something I learned about God is ________.',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'From what you learned today, what do you feel God is asking you to do?',
        primary: true
      }
    ],
    bibleCitations: [
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Luke' }]
        },
        chapterStart: 19,
        chapterEnd: null,
        verseStart: 1,
        verseEnd: 10
      }
    ],
    title: [
      { __typename: 'VideoTitle', value: 'StoryClubs: Jesus and Zacchaeus' }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: '1_529-cl1309-0-0',
      duration: 124,
      hls: 'https://arc.gt/2174d',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 3306004,
          url: 'https://arc.gt/8at9o'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 38139266,
          url: 'https://arc.gt/7h3r9'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 25192308,
          url: 'https://arc.gt/e8yd9'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'storyclubs-jesus-and-zacchaeus/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 191,
    slug: 'storyclubs-jesus-and-zacchaeus',
    childrenCount: 0
  },
  {
    __typename: 'Video',
    id: '1_jf6102-0-0',
    label: VideoLabel.segment,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6102-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'Birth of Jesus' }],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          'Luke makes his introduction as the careful author of this Gospel. The angel Gabriel appears to Mary, a virgin in Nazareth. He announces to her that she has found favor with God and will give birth to Jesus, the Son of God.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          "Luke makes his introduction as the careful author of this Gospel. The angel Gabriel appears to Mary, a virgin in Nazareth. He announces to her that she has found favor with God and will give birth to Jesus, the Son of God.\n\nThrough Jesus' birth, prophecies are fulfilled by the arrangement of events. God leaves no detail unnoticed. The same can be said of our own lives."
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value: 'How does Mary respond to the angel?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: 'How does Jesus happen to be born in Bethlehem?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: 'Who are the first to know and tell of the birth of Jesus? Why?',
        primary: true
      }
    ],
    bibleCitations: [
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Luke' }]
        },
        chapterStart: 1,
        chapterEnd: 2,
        verseStart: 1,
        verseEnd: 20
      }
    ],
    title: [{ __typename: 'VideoTitle', value: 'Birth of Jesus' }],
    variant: {
      __typename: 'VideoVariant',
      id: '1_529-jf6102-0-0',
      duration: 223,
      hls: 'https://arc.gt/ijec5',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 5928704,
          url: 'https://arc.gt/0armc'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 68130346,
          url: 'https://arc.gt/9lrr6'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 44964383,
          url: 'https://arc.gt/mh31f'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'birth-of-jesus/english',
      subtitleCount: 38
    },
    variantLanguagesCount: 2178,
    slug: 'birth-of-jesus',
    childrenCount: 0
  },
  {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    label: VideoLabel.shortFilm,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: '#FallingPlates' }],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          '#FallingPlates leads through a series of visual metaphors: creation, the fall, Christ’s coming and resurrection, redemption, and our salvation. The video ends with Jesus asking you to respond to His life altering question, “Will you follow me?”.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          '#FallingPlates leads through a series of visual metaphors: creation, the fall, Christ’s coming and resurrection, redemption, and our salvation. The video ends with Jesus asking you to respond to His life altering question, “Will you follow me?”.\n\n#FallingPlates is an award winning short film about life, death & love of a Savior. It’s a flying 4 minute video depiction of the Gospel message with viral momentum (over 4 million views).\n\nAfter you showing the #FallingPlates video to a friend, ask: “Sometime, I’d like to hear more about your spiritual journey... would you be up for that?” And, during that conversation (or in the next one) you will ask if you can meet to hear his or her story.\n\nAn Easy Approach...\nExplore Past Experiences: Where they’ve been\n- What was your religious background as a child?\n- What have you tried in your spiritual journey since?\n\nExplore Present Attitudes: Where they are\n- Where are you now in your spiritual journey?\n- How has your search left you feeling?\n\nExplore Future Direction: Where they are going\n- Do you think you are moving toward God, away from God, or staying about the same?\n- On a scale of 1-10, how would you rate your desire to know God personally?\n- Proceed with sharing the Gospel.\n\nContinue the Conversation: http://www.fallingplates.com/ \n\nTRANSLATION requests for this video email: FallingPlatesVideo@gmail.com'
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value:
          'Life is portrayed as falling plates. What do you think about that?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'Everyone is on a spiritual journey. Where do you think you are on that journey?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'Do you think you are moving toward God, away from God, or staying about the same?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: 'Would you like to hear how you can know God personally?',
        primary: true
      }
    ],
    bibleCitations: [],
    title: [{ __typename: 'VideoTitle', value: '#FallingPlates' }],
    variant: {
      __typename: 'VideoVariant',
      id: '2_529-0-FallingPlates',
      duration: 247,
      hls: 'https://arc.gt/zbrvj',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 75259326,
          url: 'https://arc.gt/g7kxc'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 6627874,
          url: 'https://arc.gt/du6y7'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 50230433,
          url: 'https://arc.gt/3b3bu'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'fallingplates/english',
      subtitleCount: 76
    },
    variantLanguagesCount: 59,
    slug: 'fallingplates',
    childrenCount: 0
  },
  {
    __typename: 'Video',
    id: '2_Acts7345-0-0',
    label: VideoLabel.segment,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_Acts7345-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [
      { __typename: 'VideoImageAlt', value: 'Paul and Silas in Prison' }
    ],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value: 'Paul and Silas beaten and imprisoned for casting out a demon.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value: 'Paul and Silas beaten and imprisoned for casting out a demon.'
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value: 'What did you like best or what caught your attention?',
        primary: true
      },
      { __typename: 'VideoStudyQuestion', value: 'Why?', primary: true },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'Paul cast out a demon. Why did he go to jail? Was this charge correct?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'How did God resolve the problem? Do you think this is what Paul prayed for in verse 25?',
        primary: true
      }
    ],
    bibleCitations: [
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Acts' }]
        },
        chapterStart: 16,
        chapterEnd: null,
        verseStart: 30,
        verseEnd: null
      }
    ],
    title: [{ __typename: 'VideoTitle', value: 'Paul and Silas in Prison' }],
    variant: {
      __typename: 'VideoVariant',
      id: '2_529-Acts7345-0-0',
      duration: 369,
      hls: 'https://arc.gt/cpywt',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 9982369,
          url: 'https://arc.gt/1jd3x'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 113616766,
          url: 'https://arc.gt/6n6h0'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 75268456,
          url: 'https://arc.gt/q17hx'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'paul-and-silas-in-prison/english',
      subtitleCount: 0
    },
    variantLanguagesCount: 9,
    slug: 'paul-and-silas-in-prison',
    childrenCount: 0
  },
  {
    __typename: 'Video',
    id: '1_mld-0-0',
    label: VideoLabel.shortFilm,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_mld-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'My Last Day' }],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          'In a beautiful animé style, a prisoner watches as Jesus gets flogged in Pilate’s courtyard. He remembers Jesus teaching and wonders why they’re hurting an innocent man. Horrified, he remembers his own crime.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          "In a beautiful animé style, a prisoner watches as Jesus gets flogged in Pilate's courtyard. He remembers Jesus teaching and wonders why they're hurting an innocent man. Horrified, he remembers his own crime.\n\nThe crowds in the courtyard scream for Jesus to be crucified. The thief, another man, and Jesus are loaded with the beams for their crosses and march to Golgotha. \n\nThey arrive and nails are driven through their wrists. Each man is hung on a cross, their feet nailed to a wooden shelf.Our thief claims Jesus is the Messiah and asks that Jesus remember him. Jesus promises him they will be in paradise together that day. A dark storm overwhelms the hill and Jesus dies.\n\nThe thief passes away with a gasp and sees Jesus in a beautiful place."
      }
    ],
    studyQuestions: [
      {
        __typename: 'VideoStudyQuestion',
        value: 'What message do you get from this story?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value: 'How do you deal with things you feel guilty about?',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion',
        value:
          'What do you think about the idea of being with Jesus in paradise?',
        primary: true
      }
    ],
    bibleCitations: [],
    title: [{ __typename: 'VideoTitle', value: 'My Last Day' }],
    variant: {
      __typename: 'VideoVariant',
      id: '1_529-mld-0-0',
      duration: 554,
      hls: 'https://arc.gt/1b10x',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 14835823,
          url: 'https://arc.gt/1buse'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 169098910,
          url: 'https://arc.gt/s40no'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 111737248,
          url: 'https://arc.gt/48h6c'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'my-last-day/english',
      subtitleCount: 7
    },
    variantLanguagesCount: 286,
    slug: 'my-last-day',
    childrenCount: 1
  },
  {
    __typename: 'Video',
    id: '1_jf6101-0-0',
    label: VideoLabel.segment,
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6101-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'The Beginning' }],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value:
          'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription',
        value:
          'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.\n\nAll of creation speaks of the majesty of God. As God created man and woman he intended them to live in peace with him forever. But because of their disobedience mankind was separated from God. But God still loved mankind so throughout the Scriptures God reveals his plan to save the world.'
      }
    ],
    studyQuestions: [],
    bibleCitations: [
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Genesis' }]
        },
        chapterStart: 1,
        chapterEnd: null,
        verseStart: 26,
        verseEnd: 27
      },
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Genesis' }]
        },
        chapterStart: 3,
        chapterEnd: null,
        verseStart: 7,
        verseEnd: null
      },
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Genesis' }]
        },
        chapterStart: 3,
        chapterEnd: null,
        verseStart: 22,
        verseEnd: 24
      },
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Genesis' }]
        },
        chapterStart: 22,
        chapterEnd: null,
        verseStart: 1,
        verseEnd: 18
      },
      {
        __typename: 'BibleCitation',
        bibleBook: {
          __typename: 'BibleBook',
          name: [{ __typename: 'BibleBookName', value: 'Psalms' }]
        },
        chapterStart: 19,
        chapterEnd: null,
        verseStart: 1,
        verseEnd: 2
      }
    ],
    title: [{ __typename: 'VideoTitle', value: 'The Beginning' }],
    variant: {
      __typename: 'VideoVariant',
      id: '1_529-jf6101-0-0',
      duration: 488,
      hls: 'https://arc.gt/pm6g1',
      downloadable: true,
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 13138402,
          url: 'https://arc.gt/ijlyf'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 149736452,
          url: 'https://arc.gt/ami4r'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.sd,
          size: 99114557,
          url: 'https://arc.gt/j1cph'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'LanguageName', value: 'English', primary: true }],
        bcp47: 'en'
      },
      slug: 'the-beginning/english',
      subtitleCount: 38
    },
    variantLanguagesCount: 2173,
    slug: 'the-beginning',
    childrenCount: 0
  }
]
