import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import {
  VideoLabel,
  VideoVariantDownloadQuality
} from '../../../__generated__/globalTypes'

export const videos: VideoContentFields[] = [
  {
    __typename: 'Video',
    id: '1_jf-0-0',
    label: VideoLabel.featureFilm,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg',
    imageAlt: [{ __typename: 'Translation', value: 'JESUS' }],
    snippet: [
      {
        __typename: 'Translation',
        value:
          'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          "This film is a perfect introduction to Jesus through the Gospel of Luke. Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion. \n\nGod creates everything and loves mankind. But mankind disobeys God. God and mankind are separated, but God loves mankind so much, He arranges redemption for mankind. He sends his Son Jesus to be a perfect sacrifice to make amends for us.\n\nBefore Jesus arrives, God prepares mankind. Prophets speak of the birth, the life, and the death of Jesus.\n\nJesus attracts attention. He teaches in parables no one really understands, gives sight to the blind, and helps those who no one sees as worth helping.\n\nHe scares the Jewish leaders, they see him as a threat. So they arrange, through Judas the traitor and their Roman oppressors, for the crucifixion of Jesus. They think the matter is settled. But the women who serve Jesus discover an empty tomb. The disciples panic. When Jesus appears, they doubt He's real. But it's what He proclaimed all along: He is their perfect sacrifice, their Savior, victor over death. He ascends to heaven, telling His followers to tell others about Him and His teachings."
      }
    ],
    studyQuestions: [
      {
        __typename: 'Translation',
        value: "How is the sacrifice of Jesus part of God's plan?"
      },
      {
        __typename: 'Translation',
        value:
          'How do the different groups of people respond to Jesus and His teachings?'
      },
      {
        __typename: 'Translation',
        value:
          'What are some of the miracles Jesus performed? How do they affect those people?'
      },
      {
        __typename: 'Translation',
        value: 'How do you respond to the life of Jesus?'
      }
    ],
    title: [{ __typename: 'Translation', value: 'JESUS' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: true
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: false
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
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
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'jesus/english'
    },
    slug: 'jesus',
    children: [
      {
        __typename: 'Video',
        id: '1_jf6101-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Beginning' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
          }
        ],
        slug: 'the-beginning',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6101-0-0',
          duration: 488,
          hls: 'https://arc.gt/pm6g1',
          slug: 'the-beginning/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6102-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Birth of Jesus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6102-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Birth of Jesus' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Luke makes his introduction as the careful author of this Gospel. The angel Gabriel appears to Mary, a virgin in Nazareth. He announces to her that she has found favor with God and will give birth to Jesus, the Son of God.'
          }
        ],
        slug: 'birth-of-jesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6102-0-0',
          duration: 223,
          hls: 'https://arc.gt/ijec5',
          slug: 'birth-of-jesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6103-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Childhood of Jesus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6103-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Childhood of Jesus' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'One week after the baby is born, He is circumcised and officially named Jesus. While Jesus is a small boy they go to the temple where they meet a man named Simeon.'
          }
        ],
        slug: 'childhood-of-jesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6103-0-0',
          duration: 135,
          hls: 'https://arc.gt/lfoti',
          slug: 'childhood-of-jesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6104-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Baptism of Jesus by John' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6104-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Baptism of Jesus by John' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'John the Baptist calls out in the desert.'
          }
        ],
        slug: 'baptism-of-jesus-by-john',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6104-0-0',
          duration: 227,
          hls: 'https://arc.gt/xgno5',
          slug: 'baptism-of-jesus-by-john/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6105-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Devil Tempts Jesus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6105-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Devil Tempts Jesus' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "After Jesus has been baptized, He's led by the Spirit into the desert. He spends 40 days there, constantly tempted by the devil. All that time, he eats nothing."
          }
        ],
        slug: 'the-devil-tempts-jesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6105-0-0',
          duration: 142,
          hls: 'https://arc.gt/xf6lr',
          slug: 'the-devil-tempts-jesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6106-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Jesus Proclaims Fulfillment of the Scriptures'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6106-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Jesus Proclaims Fulfillment of the Scriptures'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "When Jesus returns to Nazareth, He goes to the synagogue. He's asked to read the Scriptures and is handed the Book of Isaiah. From it, He reads Isaiah 61:1-2."
          }
        ],
        slug: 'jesus-proclaims-fulfillment-of-the-scriptures',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6106-0-0',
          duration: 187,
          hls: 'https://arc.gt/7pqw3',
          slug: 'jesus-proclaims-fulfillment-of-the-scriptures/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6107-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Parable of the Pharisee and Tax Collector'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6107-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Parable of the Pharisee and Tax Collector'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus teaches from a boat off the shore of Lake Gennesaret. He speaks in parables, giving the example of a Pharisee and tax collector going to the temple to pray. The two men approach prayer very differently.'
          }
        ],
        slug: 'parable-of-the-pharisee-and-tax-collector',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6107-0-0',
          duration: 62,
          hls: 'https://arc.gt/vvogt',
          slug: 'parable-of-the-pharisee-and-tax-collector/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6108-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Miraculous Catch of Fish' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6108-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Miraculous Catch of Fish' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus tells the fisherman who owns it to push out farther and let down their nets. The fisherman grumbles that he and the others have already been out all night long. They didn't catch anything."
          }
        ],
        slug: 'miraculous-catch-of-fish',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6108-0-0',
          duration: 122,
          hls: 'https://arc.gt/jqs1v',
          slug: 'miraculous-catch-of-fish/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6109-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "Jairus's Daughter Brought Back to Life"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6109-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "Jairus's Daughter Brought Back to Life"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Crowds press in on Jesus as He leaves the synagogue. One voice rises above the others. A man, Jairus, begs Jesus to save his sick, 12-year-old daughter.'
          }
        ],
        slug: 'jairus-daughter-brought-back-to-life',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6109-0-0',
          duration: 135,
          hls: 'https://arc.gt/e8v1c',
          slug: 'jairus-daughter-brought-back-to-life/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6110-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Disciples Chosen' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6110-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Disciples Chosen' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus spots a tax collector named Matthew Levi at the gate. He collects toll money for customs as people pass through. As Jesus looks at him, Matthew senses it and looks up. Jesus says, "Follow me."'
          }
        ],
        slug: 'disciples-chosen',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6110-0-0',
          duration: 191,
          hls: 'https://arc.gt/oalu7',
          slug: 'disciples-chosen/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6111-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Beatitudes' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6111-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Beatitudes' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus looks out over the crowds who have gathered to hear him speak. But instead of speaking to the masses, Jesus turns back to his disciples. He encourages them for the journey ahead.'
          }
        ],
        slug: 'beatitudes',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6111-0-0',
          duration: 63,
          hls: 'https://arc.gt/tpn0g',
          slug: 'beatitudes/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6112-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Sermon on the Mount' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6112-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Sermon on the Mount' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus turns to the crowds and walks through them, teaching. He advises everyone how to walk through life in love. And talks of how, out of pride, we often judge others. He implores those who are listening to love their enemies, to actively pray for them. He speaks of offering more than what is asked of you. Do for others what you would have them do for you.'
          }
        ],
        slug: 'sermon-on-the-mount',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6112-0-0',
          duration: 219,
          hls: 'https://arc.gt/kt848',
          slug: 'sermon-on-the-mount/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6113-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Blessed are those Who Hear and Obey'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6113-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Blessed are those Who Hear and Obey'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Jesus reminds us that those who hear and obey are blessed.'
          }
        ],
        slug: 'blessed-are-those-who-hear-and-obey',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6113-0-0',
          duration: 19,
          hls: 'https://arc.gt/f7w9m',
          slug: 'blessed-are-those-who-hear-and-obey/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6114-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Sinful Woman Forgiven' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6114-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Sinful Woman Forgiven' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "A Pharisee invites Jesus to have dinner at His house. They're eating when a woman approaches Jesus. Everyone in the house stares, including the Pharisee."
          }
        ],
        slug: 'sinful-woman-forgiven',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6114-0-0',
          duration: 177,
          hls: 'https://arc.gt/mgqws',
          slug: 'sinful-woman-forgiven/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6115-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Women Disciples' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6115-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Women Disciples' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus continues through the countryside. He's adamant in preaching the good news about the kingdom of God. The twelve disciples follow him. And some women follow as well."
          }
        ],
        slug: 'women-disciples',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6115-0-0',
          duration: 44,
          hls: 'https://arc.gt/fyiin',
          slug: 'women-disciples/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6116-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'John the Baptist in Prison' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6116-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'John the Baptist in Prison' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Herod has thrown John the Baptist into prison. Messengers come to him in the prison. They relay to him all that Jesus has been doing.'
          }
        ],
        slug: 'john-the-baptist-in-prison',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6116-0-0',
          duration: 116,
          hls: 'https://arc.gt/nx4ad',
          slug: 'john-the-baptist-in-prison/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6117-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Parable of the Sower and the Seed'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6117-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Parable of the Sower and the Seed'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The crowds press in on Jesus as He walks and teaches. He tells a parable of someone sowing seeds of grain in a field. The seed falls in a number of places, each representing something to the crowd.'
          }
        ],
        slug: 'parable-of-the-sower-and-the-seed',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6117-0-0',
          duration: 138,
          hls: 'https://arc.gt/h8zqo',
          slug: 'parable-of-the-sower-and-the-seed/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6118-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Parable of the Lamp' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6118-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Parable of the Lamp' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus uses a torch to explain how his followers should live. No one covers the light or puts it under a bed. Instead, they put it in a place where people will see the light when they come in.'
          }
        ],
        slug: 'parable-of-the-lamp',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6118-0-0',
          duration: 56,
          hls: 'https://arc.gt/p1xr0',
          slug: 'parable-of-the-lamp/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6119-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Jesus Calms the Storm' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6119-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus Calms the Storm' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus gets into a boat and tells His disciples they should all go to the other side of the lake. Along the way, Jesus falls asleep. A storm starts to rage. Waves stretch high over the bow. And the boat starts to take on water.'
          }
        ],
        slug: 'jesus-calms-the-storm',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6119-0-0',
          duration: 119,
          hls: 'https://arc.gt/69sos',
          slug: 'jesus-calms-the-storm/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6120-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Healing of the Demoniac' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6120-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Healing of the Demoniac' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus and His disciples continue to sail and arrive at Gerasa. A wild man on the shore growls at their approach. Jesus hurries toward him, ahead of His disciples.'
          }
        ],
        slug: 'healing-of-the-demoniac',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6120-0-0',
          duration: 136,
          hls: 'https://arc.gt/2tm22',
          slug: 'healing-of-the-demoniac/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6121-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Jesus Feeds 5,000' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6121-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Jesus Feeds 5,000' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus and the disciples continue to walk the countryside. And a great crowd follows them. Peter comes and asks Jesus to send the people away.'
          }
        ],
        slug: 'jesus-feeds-5000',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6121-0-0',
          duration: 150,
          hls: 'https://arc.gt/iyv6u',
          slug: 'jesus-feeds-5000/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6122-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Peter Declares Jesus to be the Christ'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6122-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Peter Declares Jesus to be the Christ'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus asks who the crowds say He is. Peter speaks up immediately. He claims that some in the crowds say Jesus is John the Baptist. Others say He's Elijah."
          }
        ],
        slug: 'peter-declares-jesus-to-be-the-christ',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6122-0-0',
          duration: 84,
          hls: 'https://arc.gt/5484g',
          slug: 'peter-declares-jesus-to-be-the-christ/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6123-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Transfiguration' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6123-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'The Transfiguration' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus takes John, James and Peter up a hill to pray. Jesus walks apart from them, covering His head to pray. But when He does, His appearance changes.'
          }
        ],
        slug: 'the-transfiguration',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6123-0-0',
          duration: 106,
          hls: 'https://arc.gt/mgomf',
          slug: 'the-transfiguration/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6124-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Jesus Heals Boy from Evil Spirit'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6124-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Jesus Heals Boy from Evil Spirit'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The crowds continue to gather. They wait on Jesus. Finally, Jesus comes down the hill with Peter, James and John. One man approaches Jesus and begs that Jesus would heal his son.'
          }
        ],
        slug: 'jesus-heals-boy-from-evil-spirit',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6124-0-0',
          duration: 135,
          hls: 'https://arc.gt/6v831',
          slug: 'jesus-heals-boy-from-evil-spirit/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6125-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: "The Lord's Prayer" }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6125-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: "The Lord's Prayer" }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The followers of Jesus clean up and take a break at a stream. Jesus stands nearby, praying. Andrew asks Jesus to teach them to pray.'
          }
        ],
        slug: 'the-lord-prayer',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6125-0-0',
          duration: 58,
          hls: 'https://arc.gt/wdq42',
          slug: 'the-lord-prayer/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6126-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Teaching About Prayer and Faith'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6126-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Teaching About Prayer and Faith'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus has just taught them how to pray. He says, "ask and you will receive." He challenges them to seek and assures that they will find.'
          }
        ],
        slug: 'teaching-about-prayer-and-faith',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6126-0-0',
          duration: 144,
          hls: 'https://arc.gt/urach',
          slug: 'teaching-about-prayer-and-faith/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6127-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Woe to Those Who Cause Others to Sin'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6127-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Woe to Those Who Cause Others to Sin'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'As Jesus and the disciples continue to walk the countryside he tells them that there will be temptation. There will be situations which cause people to sin. But the disciples should never be the cause.'
          }
        ],
        slug: 'woe-to-those-who-cause-others-to-sin',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6127-0-0',
          duration: 55,
          hls: 'https://arc.gt/25rgl',
          slug: 'woe-to-those-who-cause-others-to-sin/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6128-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'The Kingdom of God as a Mustard Seed'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6128-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'The Kingdom of God as a Mustard Seed'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus tells the people that the kingdom of God is like a grain of mustard seed. Farmers plant seeds in their field. From it, a tree grows. And when the tree is big enough, birds sit in its branches.'
          }
        ],
        slug: 'the-kingdom-of-god-as-a-mustard-seed',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6128-0-0',
          duration: 28,
          hls: 'https://arc.gt/a2r0f',
          slug: 'the-kingdom-of-god-as-a-mustard-seed/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6129-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus Spends Time with Sinners' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6129-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus Spends Time with Sinners' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "As Jesus sits with a group of people in a village a man walks up and angrily asks why Jesus sits with those who aren't respectable people. Jesus responds that people who are well don't need a doctor."
          }
        ],
        slug: 'jesus-spends-time-with-sinners',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6129-0-0',
          duration: 30,
          hls: 'https://arc.gt/vflur',
          slug: 'jesus-spends-time-with-sinners/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6130-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Healing on the Sabbath' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6130-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Healing on the Sabbath' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "A boy asks Jesus to tell them more about the kingdom. Jesus teaches in the synagogue that believers shouldn't fear. That God is pleased to give them the kingdom. They can feel free to give because their treasure is somewhere else."
          }
        ],
        slug: 'healing-on-the-sabbath',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6130-0-0',
          duration: 117,
          hls: 'https://arc.gt/uvnby',
          slug: 'healing-on-the-sabbath/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6131-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Parable of the Good Samaritan' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6131-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Parable of the Good Samaritan' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'A man asks Jesus what they should do. Jesus asks what the Scriptures say. The man replies with, "Love the Lord your God with all your heart, with all your soul, with all your strength, and with all your mind, and love your neighbor as yourself."'
          }
        ],
        slug: 'parable-of-the-good-samaritan',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6131-0-0',
          duration: 98,
          hls: 'https://arc.gt/pi7os',
          slug: 'parable-of-the-good-samaritan/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6132-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Healing of Bartimaeus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6132-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Healing of Bartimaeus' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus and His disciples wade through a stream into a gathering of people. A man asks what's going on. He follows after Jesus, calling out to Him."
          }
        ],
        slug: 'healing-of-bartimaeus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6132-0-0',
          duration: 105,
          hls: 'https://arc.gt/0qak8',
          slug: 'healing-of-bartimaeus/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6133-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Jesus and Zaccheus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6133-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Jesus and Zaccheus' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus enters the town surrounded by crowds pushing in on Him. Zacchaeus, a short man, tries to see Jesus. But he can't see above the crowds or get through them. He climbs a tree. Jesus calls out to him."
          }
        ],
        slug: 'jesus-and-zaccheus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6133-0-0',
          duration: 142,
          hls: 'https://arc.gt/pp99g',
          slug: 'jesus-and-zaccheus/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6134-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Jesus Predicts His Death and Resurrection'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6134-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Jesus Predicts His Death and Resurrection'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus continues to sit at dinner with His disciples. He asks them to listen carefully. He tells them plainly that they're all going to Jerusalem with Him. And that everything the prophets wrote about the Son of Man will come true."
          }
        ],
        slug: 'jesus-predicts-his-death-and-resurrection',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6134-0-0',
          duration: 42,
          hls: 'https://arc.gt/yl9ba',
          slug: 'jesus-predicts-his-death-and-resurrection/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6135-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: "Jesus's Triumphal Entry" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6135-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Jesus's Triumphal Entry" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus starts on the road to Jerusalem. Just outside Jerusalem, there are crowds with palm branches and a donkey. He climbs onto the donkey and makes His way toward Jerusalem. The crowds yell and cheer.'
          }
        ],
        slug: 'jesus-triumphal-entry',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6135-0-0',
          duration: 71,
          hls: 'https://arc.gt/vxbwy',
          slug: 'jesus-triumphal-entry/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6136-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus Weeps Over Jerusalem' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6136-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus Weeps Over Jerusalem' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus, His disciples, and a large crowd of followers approach Jerusalem. When it's in sight, Jesus stops and looks out over it. He talks of how Jerusalem could not see and understand a path to peace."
          }
        ],
        slug: 'jesus-weeps-over-jerusalem',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6136-0-0',
          duration: 60,
          hls: 'https://arc.gt/4m1we',
          slug: 'jesus-weeps-over-jerusalem/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6137-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Jesus Drives Out Money Changers'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6137-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Jesus Drives Out Money Changers'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus walks through Jerusalem. Crowds of people move with Him. He enters the temple and looks around. There are men counting money to each other. And people carry around goods to be sold.'
          }
        ],
        slug: 'jesus-drives-out-money-changers',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6137-0-0',
          duration: 112,
          hls: 'https://arc.gt/dbd4i',
          slug: 'jesus-drives-out-money-changers/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6138-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: "Widow's Offering" }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6138-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: "Widow's Offering" }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'In the temple, Jesus watches a widow give all that she has. People in the crowd note how little she gives. They ask for her to give more.'
          }
        ],
        slug: 'widow-offering',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6138-0-0',
          duration: 46,
          hls: 'https://arc.gt/x2scs',
          slug: 'widow-offering/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6139-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "Annas Questions Jesus's Authority"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6139-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "Annas Questions Jesus's Authority"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'A Pharisee named Annas asks Jesus what right He has to say the kinds of things he says. In return, Jesus asks Annas a question.'
          }
        ],
        slug: 'annas-questions-jesus-authority',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6139-0-0',
          duration: 60,
          hls: 'https://arc.gt/gf6v4',
          slug: 'annas-questions-jesus-authority/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6140-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Parable of the Vineyard and Tenants'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6140-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Parable of the Vineyard and Tenants'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus tells the story of a man who plants a vineyard. That man leases the vineyard to workers or tenants.'
          }
        ],
        slug: 'parable-of-the-vineyard-and-tenants',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6140-0-0',
          duration: 111,
          hls: 'https://arc.gt/f2d04',
          slug: 'parable-of-the-vineyard-and-tenants/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6141-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Paying Taxes to Caesar' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6141-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Paying Taxes to Caesar' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "The Pharisees tell Jesus they know He teaches righteous things. But, they also say Jesus doesn't pay attention to anyone elses status. But that Jesus teaches the truth about God's will for all people. And then they ask about paying taxes."
          }
        ],
        slug: 'paying-taxes-to-caesar',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6141-0-0',
          duration: 58,
          hls: 'https://arc.gt/z52cl',
          slug: 'paying-taxes-to-caesar/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6142-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Last Supper' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6142-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'The Last Supper' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Passover is about to begin. Jesus sends Peter and John ahead to prepare the Passover meal. Jesus sits with them and looks at all of them. He tells them how glad He is to share the meal before he suffers.'
          }
        ],
        slug: 'the-last-supper',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6142-0-0',
          duration: 175,
          hls: 'https://arc.gt/bqnyb',
          slug: 'the-last-supper/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6143-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Upper Room Teaching' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6143-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Upper Room Teaching' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus sits after sharing the bread and wine, sealing a new covenant with His followers, and revealing that there is a traitor among them. He passes on one last specific teaching to His disciples. The disciples listen solemnly.'
          }
        ],
        slug: 'upper-room-teaching',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6143-0-0',
          duration: 149,
          hls: 'https://arc.gt/246zp',
          slug: 'upper-room-teaching/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6144-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus is Betrayed and Arrested' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6144-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus is Betrayed and Arrested' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The council of the Jewish elders meet to see how they can get rid of Jesus. Meanwhile, Jesus sits with the rest of His followers and tells them to pray against temptation.'
          }
        ],
        slug: 'jesus-is-betrayed-and-arrested',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6144-0-0',
          duration: 263,
          hls: 'https://arc.gt/r72em',
          slug: 'jesus-is-betrayed-and-arrested/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6145-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Peter Disowns Jesus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6145-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Peter Disowns Jesus' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus is taken to the house of the high priest and guarded by temple guards. They push Him and take His clothing in the courtyard. Peter watches from close by.'
          }
        ],
        slug: 'peter-disowns-jesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6145-0-0',
          duration: 144,
          hls: 'https://arc.gt/6q9wr',
          slug: 'peter-disowns-jesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6146-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus is Mocked and Questioned' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6146-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus is Mocked and Questioned' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus gets beaten by the temple guards. A man tells the guards to bring Jesus in to see the council.'
          }
        ],
        slug: 'jesus-is-mocked-and-questioned',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6146-0-0',
          duration: 118,
          hls: 'https://arc.gt/tf1xx',
          slug: 'jesus-is-mocked-and-questioned/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6147-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus is Brought To Pilate' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6147-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus is Brought To Pilate' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Roman guards open the gates and take Jesus. They march through the courtyard followed by the crowd. Pontius Pilate, the most vicious Roman governor who is responsible for the crucifixion of thousands, come to address the crowd.'
          }
        ],
        slug: 'jesus-is-brought-to-pilate',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6147-0-0',
          duration: 104,
          hls: 'https://arc.gt/0ikgq',
          slug: 'jesus-is-brought-to-pilate/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6148-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus is Brought to Herod' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6148-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus is Brought to Herod' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus is escorted into Herod\'s presence. Herod looks Him up and down then asks, "Who is it that you say you are?" Jesus remains silent.'
          }
        ],
        slug: 'jesus-is-brought-to-herod',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6148-0-0',
          duration: 84,
          hls: 'https://arc.gt/u8gqt',
          slug: 'jesus-is-brought-to-herod/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6149-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Jesus is Sentenced' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6149-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Jesus is Sentenced' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus is dragged from Herod's palace. Jesus and the crowds come back to Pilate's courtyard."
          }
        ],
        slug: 'jesus-is-sentenced',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6149-0-0',
          duration: 177,
          hls: 'https://arc.gt/9acdz',
          slug: 'jesus-is-sentenced/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6150-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus Carries His Cross' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6150-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus Carries His Cross' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus struggles to carry His own cross beam through the streets, while the Roman guards beat those out of the way in their path. Jesus continues to struggle under the weight of the beam.'
          }
        ],
        slug: 'jesus-carries-his-cross',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6150-0-0',
          duration: 214,
          hls: 'https://arc.gt/gyi4p',
          slug: 'jesus-carries-his-cross/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6151-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Jesus is Crucified' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6151-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Jesus is Crucified' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'They arrive at the place where the crosses are being set up. Others are being tied to their crosses. Jesus is stripped and led to His own cross. They throw Him down on it. There are cries as the others are nailed to their crosses.'
          }
        ],
        slug: 'jesus-is-crucified',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6151-0-0',
          duration: 169,
          hls: 'https://arc.gt/yiih4',
          slug: 'jesus-is-crucified/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6152-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "Soldiers Gamble for Jesus's Clothes"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6152-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "Soldiers Gamble for Jesus's Clothes"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'As Jesus continues to hang on the cross, the crowd watches in silence. The Roman guards gather around the cross and watch Jesus.'
          }
        ],
        slug: 'soldiers-gamble-for-jesus-clothes',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6152-0-0',
          duration: 57,
          hls: 'https://arc.gt/c3hhs',
          slug: 'soldiers-gamble-for-jesus-clothes/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6153-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Sign on the Cross' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6153-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Sign on the Cross' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "The Roman guard hammers a sign of mockery above Jesus's head. The crowd erupts with laughing and yelling. Then, the guard tries to give Him vinegar from a sponge."
          }
        ],
        slug: 'sign-on-the-cross',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6153-0-0',
          duration: 67,
          hls: 'https://arc.gt/zpy7d',
          slug: 'sign-on-the-cross/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6154-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Crucified Convicts' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6154-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Crucified Convicts' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus hangs between two other men. His disciples watch, helpless. One of the men on a cross asks if Jesus is the Messiah. He tells Him to save Himself and them.'
          }
        ],
        slug: 'crucified-convicts',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6154-0-0',
          duration: 100,
          hls: 'https://arc.gt/g52vf',
          slug: 'crucified-convicts/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6155-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Death of Jesus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6155-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Death of Jesus' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus continues to hang on the cross. Darkness comes over everything. The veil in the temple is torn right down the middle.'
          }
        ],
        slug: 'death-of-jesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6155-0-0',
          duration: 106,
          hls: 'https://arc.gt/de8sd',
          slug: 'death-of-jesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6156-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Burial of Jesus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6156-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Burial of Jesus' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Joseph of Arimathea asks Pontius Pilate for permission to bury Jesus in a tomb.'
          }
        ],
        slug: 'burial-of-jesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6156-0-0',
          duration: 121,
          hls: 'https://arc.gt/fxam3',
          slug: 'burial-of-jesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6157-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Angels at the Tomb' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6157-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Angels at the Tomb' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The sun rises the Sunday after the Sabbath. The women return with spices they had prepared. But when they get close, they see the rock has been moved.'
          }
        ],
        slug: 'angels-at-the-tomb',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6157-0-0',
          duration: 89,
          hls: 'https://arc.gt/wfipb',
          slug: 'angels-at-the-tomb/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6158-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Tomb Is Empty' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6158-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'The Tomb Is Empty' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Mary Magdalene rushes into a room full of disciples. She tells the men the stone has been rolled away. And that when she and the others went into the tomb, the body was gone.'
          }
        ],
        slug: 'the-tomb-is-empty',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6158-0-0',
          duration: 82,
          hls: 'https://arc.gt/z4cu3',
          slug: 'the-tomb-is-empty/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6159-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Resurrected Jesus Appears' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6159-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Resurrected Jesus Appears' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "John and others return to the room where Jesus' followers have gathered. They come in saying that Jesus has indeed risen! John says that Jesus appeared to Simon on the road. Simon talks about how they did not recognize Jesus at first."
          }
        ],
        slug: 'resurrected-jesus-appears',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6159-0-0',
          duration: 116,
          hls: 'https://arc.gt/3accr',
          slug: 'resurrected-jesus-appears/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6160-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Great Commission and Ascension' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6160-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Great Commission and Ascension' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The men and women follow Jesus down a hill. He says all power has been given to Him in heaven and on earth. So the followers are to go and teach the nations.'
          }
        ],
        slug: 'great-commission-and-ascension',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6160-0-0',
          duration: 76,
          hls: 'https://arc.gt/ml18g',
          slug: 'great-commission-and-ascension/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_jf6161-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Invitation to Know Jesus Personally'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6161-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Invitation to Know Jesus Personally'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'A narrator gives an invitation to know God personally.'
          }
        ],
        slug: 'invitation-to-know-jesus-personally',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-jf6161-0-0',
          duration: 341,
          hls: 'https://arc.gt/yz6nc',
          slug: 'invitation-to-know-jesus-personally/english'
        }
      }
    ]
  },
  {
    __typename: 'Video',
    id: '2_GOJ-0-0',
    label: VideoLabel.featureFilm,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ-0-0.mobileCinematicHigh.jpg',
    imageAlt: [
      { __typename: 'Translation', value: 'Life of Jesus (Gospel of John)' }
    ],
    snippet: [
      {
        __typename: 'Translation',
        value:
          'And truly Jesus did many other signs in the presence of His disciples, which are not written in this book; but these are written that you may believe that Jesus is the Christ, the Son of God, and that believing you may have life in His name. -John 20:30-31 NKJV'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          'And truly Jesus did many other signs in the presence of His disciples, which are not written in this book; but these are written that you may believe that Jesus is the Christ, the Son of God, and that believing you may have life in His name. -John 20:30-31 NKJV\n\n" I have come that they may have life, and that they may have it more abundantly." - John 10:10 NKJV\n\n"And this is eternal life, that they may know You, the only true God, and Jesus Christ whom You have sent." - John 17:3 NKJV'
      }
    ],
    studyQuestions: [],
    title: [
      { __typename: 'Translation', value: 'Life of Jesus (Gospel of John)' }
    ],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '2_529-GOJ-0-0',
      duration: 10994,
      hls: 'https://arc.gt/u3kd6',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 297742490,
          url: 'https://arc.gt/fz9kn'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 3384067193,
          url: 'https://arc.gt/on94p'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'life-of-jesus-gospel-of-john/english'
    },
    slug: 'life-of-jesus-gospel-of-john',
    children: [
      {
        __typename: 'Video',
        id: '2_GOJ4901-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: "God's Word Becomes Flesh" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4901-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "God's Word Becomes Flesh" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'In the beginning The Word  of God created the earth and all life. Jesus is the Light of the world, bringing love and truth.'
          }
        ],
        slug: 'god-word-becomes-flesh',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4901-0-0',
          duration: 275,
          hls: 'https://arc.gt/xpzcg',
          slug: 'god-word-becomes-flesh/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4902-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Testimony of John the Baptist' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4902-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Testimony of John the Baptist' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'John tells of Jesus who is the lamb of God who takes away the sin of the world. John baptises Jesus in water and the Holy Spirit came down from Heaven onto Him.'
          }
        ],
        slug: 'testimony-of-john-the-baptist',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4902-0-0',
          duration: 196,
          hls: 'https://arc.gt/t5u00',
          slug: 'testimony-of-john-the-baptist/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4903-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus Gathers Disciples' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4903-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus Gathers Disciples' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus is discovered by Peter, Philip and Nathaniel for who He really is, The Messiah. He starts to gather His disciples to Him.'
          }
        ],
        slug: 'jesus-gathers-disciples',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4903-0-0',
          duration: 306,
          hls: 'https://arc.gt/oze4y',
          slug: 'jesus-gathers-disciples/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4904-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Wedding in Cana' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4904-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Wedding in Cana' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus performs His first recorded miracle at a Wedding by transforming water into Wine.'
          }
        ],
        slug: 'wedding-in-cana',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4904-0-0',
          duration: 213,
          hls: 'https://arc.gt/29cgr',
          slug: 'wedding-in-cana/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4905-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Cleaning the Temple' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4905-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Cleaning the Temple' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus finds moneychangers in His Father's House, the Temple, He furiously chases them out using a whip, this occurs in Jerusalem over the Passover Feast."
          }
        ],
        slug: 'cleaning-the-temple',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4905-0-0',
          duration: 222,
          hls: 'https://arc.gt/55e57',
          slug: 'cleaning-the-temple/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4906-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Talk with Nicodemus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4906-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Talk with Nicodemus' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus explains how we must be Born Again in order to enter the kingdom of Heaven, God sent His Son and those that believe in Him will not be  judged, He is a light that came into the world and those whose deeds are evil hate the light as they do not want their deeds exposed, conversely those who love the light are happy to have their deeds shown as obedience to the Lord.'
          }
        ],
        slug: 'talk-with-nicodemus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4906-0-0',
          duration: 204,
          hls: 'https://arc.gt/ylrhk',
          slug: 'talk-with-nicodemus/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4907-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: "The Baptist's Confirmation" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4907-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "The Baptist's Confirmation" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'John the baptist exalts Christ above himself as the bearer of the truth.'
          }
        ],
        slug: 'the-baptist-confirmation',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4907-0-0',
          duration: 120,
          hls: 'https://arc.gt/6mwan',
          slug: 'the-baptist-confirmation/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4908-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Samaritan Woman' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4908-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Samaritan Woman' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus explains to a Samaritan woman at a well how God's Word and truth is living water that unlike earthly water, gives a person everlasting life."
          }
        ],
        slug: 'samaritan-woman',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4908-0-0',
          duration: 223,
          hls: 'https://arc.gt/zmvbz',
          slug: 'samaritan-woman/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4909-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Samaritan Village' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4909-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Samaritan Village' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Samaritan woman declares the Messiah has arrived to other villagers,who also come to believe in Him after hearing Him teach. Jesus teaches on the law of planting and reaping a spiritual harvest.'
          }
        ],
        slug: 'samaritan-village',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4909-0-0',
          duration: 131,
          hls: 'https://arc.gt/irbhg',
          slug: 'samaritan-village/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4910-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: "Official's Son Healed" }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4910-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Official's Son Healed" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "A government man finds Jesus and asks Him to come with him to heal his dying son. Jesus declares the boy will live. The government official and his whole family became believers. This is Jesus's second miracle."
          }
        ],
        slug: 'official-son-healed',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4910-0-0',
          duration: 189,
          hls: 'https://arc.gt/bavab',
          slug: 'official-son-healed/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4911-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'A Paralytic Healed' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4911-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'A Paralytic Healed' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus finds a paralyzed  man by a pool waiting futilely to gain his healing, Jesus tells the man to get up and walk. He does so! The man tells the Jewish Rabbis who then want to persecute Jesus for healing on the Sabbath.'
          }
        ],
        slug: 'a-paralytic-healed',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4911-0-0',
          duration: 236,
          hls: 'https://arc.gt/xmmk8',
          slug: 'a-paralytic-healed/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4912-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Claim to be the Son' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4912-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Claim to be the Son' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus reveals He is the Son of God, this offends Jewish leaders who think He is blaspheming. Jesus explains how He only does what He sees His father doing and God heals on the Sabbath as does He! He explains how a day is coming when all will leave this earthly existence and be judged by God, some will make Heaven and others will be condemned.'
          }
        ],
        slug: 'claim-to-be-the-son',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4912-0-0',
          duration: 137,
          hls: 'https://arc.gt/8e7tc',
          slug: 'claim-to-be-the-son/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4913-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Witness to the Son' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4913-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Witness to the Son' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus chastises the Jewish leaders for not believing in Him and the writings of Moses which foretell of Jesus being the Messiah, Neither do they believe in the witness that John the Baptist and even Jesus's own life and works bear about His true identity. He exposes the true condition of their hearts as men pleasers and not God lovers."
          }
        ],
        slug: 'witness-to-the-son',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4913-0-0',
          duration: 142,
          hls: 'https://arc.gt/z8fhr',
          slug: 'witness-to-the-son/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4914-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Feeding 5,000' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4914-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Feeding 5,000' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus feeds a great multitude of people by miraculously multiplying 2 fish and 5 loaves.'
          }
        ],
        slug: 'feeding-5000',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4914-0-0',
          duration: 276,
          hls: 'https://arc.gt/yq1j4',
          slug: 'feeding-5000/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4915-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Sea Walking' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4915-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Sea Walking' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The disciples went over the sea to Capernaum and the sea arose due to a great wind blowing, they see Jesus walking on the sea and He tells them not to be afraid and they receive Him into the boat.'
          }
        ],
        slug: 'sea-walking',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4915-0-0',
          duration: 154,
          hls: 'https://arc.gt/81twe',
          slug: 'sea-walking/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4916-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Bread of Life' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4916-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Bread of Life' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Crowd of people wanting to see signs and hear further teachings from Jesus, He tells them to seek Heavenly rather than earthly food as former gives everlasting life. He tells them that He is the bread of life and that those who come to Him will have everlasting life, He also says He is submitted to God's Will and how we must be also."
          }
        ],
        slug: 'bread-of-life',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4916-0-0',
          duration: 348,
          hls: 'https://arc.gt/2gb73',
          slug: 'bread-of-life/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4917-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Falling Away' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4917-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Falling Away' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus asks disciples to follow His words and adhere their lives to His words and teachings, many find this hard to do and turn away from Him, however Peter declares that Jesus is the Son of God so to where would they go?'
          }
        ],
        slug: 'falling-away',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4917-0-0',
          duration: 123,
          hls: 'https://arc.gt/l72b4',
          slug: 'falling-away/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4918-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Confronting Hypocritical Leaders'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4918-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Confronting Hypocritical Leaders'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus says He is hated by the world as He tells them that its deeds are evil, Jews are shocked by Jesus's extensive knowledge of the scriptures, Jesus teaches that he who seeks God's glory and not their own is righteous. He teaches that we should determine to align our wills with God's Will."
          }
        ],
        slug: 'confronting-hypocritical-leaders',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4918-0-0',
          duration: 182,
          hls: 'https://arc.gt/ddgsm',
          slug: 'confronting-hypocritical-leaders/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4919-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Disagreement: Who is Jesus?' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4919-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Disagreement: Who is Jesus?' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The people knew Jesus and so were skeptical of Him, Jesus declares He is from God, whom they do not know. The Jews seek to take Him but His hour is not yet. He tells them He will go of His own accord soon to a place where they cannot find Him. They are confused by this, Jesus tells them that those that are satisfied by Him will themselves become channels of spiritual refreshment for others. Jesus talks of the Holy Spirit who is yet to come and Nicodemus shows curiosity towards Him.'
          }
        ],
        slug: 'disagreement-who-is-jesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4919-0-0',
          duration: 279,
          hls: 'https://arc.gt/t0t8s',
          slug: 'disagreement-who-is-jesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4920-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Adulterous Woman' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4920-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Adulterous Woman' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Pharisees bring adulteress woman before Jesus to trap Him into going against the law of Moses that stated that she should be stoned. Jesus states that he without sin should cast the first stone, All leave, Jesus instructs the woman that He does not condemn her either but to go and sin no more.'
          }
        ],
        slug: 'adulterous-woman',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4920-0-0',
          duration: 196,
          hls: 'https://arc.gt/zdjzd',
          slug: 'adulterous-woman/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4921-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Who are you?' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4921-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Who are you?' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus declares that He is the light of the world and that those that follow him will never walk in darkness. The Pharisees contest who He says He is. Jesus states He says does only what the Father taught Him to, As He says these things many believed on Him.'
          }
        ],
        slug: 'who-are-you',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4921-0-0',
          duration: 181,
          hls: 'https://arc.gt/mlhyx',
          slug: 'who-are-you/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4922-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Great Confrontation' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4922-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Great Confrontation' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus teaches that if Jews abide in His Word they will know the truth and the truth will set them free. Free from sin. He told those who would not accept Him that they were of their father, the devil, the father of all lies.'
          }
        ],
        slug: 'great-confrontation',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4922-0-0',
          duration: 283,
          hls: 'https://arc.gt/948kr',
          slug: 'great-confrontation/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4923-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Blind Man Healed' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4923-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Blind Man Healed' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus anoints the eyes of a blind man with His saliva and mud and tells the man to go wash his eyes in the pool of Siloam, the man does so and comes back seeing!'
          }
        ],
        slug: 'blind-man-healed',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4923-0-0',
          duration: 218,
          hls: 'https://arc.gt/ytim7',
          slug: 'blind-man-healed/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4924-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Pharisees Interrogate the Blind Man'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4924-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Pharisees Interrogate the Blind Man'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Pharisees question man as to how he was healed of blindness. The blind man defends Jesus as a prophet of God, the Jewish leaders expel him from the synagogue. The man accepts Jesus as the son of God. Jesus tells nearby Pharisees that they are guilty of willfully rejecting Him as the son of God.'
          }
        ],
        slug: 'pharisees-interrogate-the-blind-man',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4924-0-0',
          duration: 280,
          hls: 'https://arc.gt/v7a2l',
          slug: 'pharisees-interrogate-the-blind-man/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4925-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Good Shepherd' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4925-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'The Good Shepherd' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus explains how He is the Shepherd and those that follow Him are the sheep. \n\nHe is a good shepherd and loves, cares for and protects His sheep from satan. Even laying down His life willingly for them. \n\nThe Jews quarrel over what they hear and some think He is insane or demon possessed. Others believe Him.'
          }
        ],
        slug: 'the-good-shepherd',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4925-0-0',
          duration: 167,
          hls: 'https://arc.gt/k9qjw',
          slug: 'the-good-shepherd/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4926-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Are You Messiah?' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4926-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Are You Messiah?' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus instructs a group of Jews that He and the Father are one. They become enraged and desire to kill Him for blasphemy as they do not believe in Him.'
          }
        ],
        slug: 'are-you-messiah',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4926-0-0',
          duration: 213,
          hls: 'https://arc.gt/cuxbw',
          slug: 'are-you-messiah/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4927-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Lazarus Dies' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4927-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Lazarus Dies' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus was not alarmed when Lazarus died as He knew that it was for the Glory of God to be shown and that He would restore Lazarus to life.'
          }
        ],
        slug: 'lazarus-dies',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4927-0-0',
          duration: 146,
          hls: 'https://arc.gt/hlw7d',
          slug: 'lazarus-dies/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4928-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Mary and Martha Mourn' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4928-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Mary and Martha Mourn' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Martha and Mary are heartbroken over the death of their brother and tell Jesus that if He had been there their brother would not have died. Jesus is moved, but states that Lazarus will rise to life again.'
          }
        ],
        slug: 'mary-and-martha-mourn',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4928-0-0',
          duration: 212,
          hls: 'https://arc.gt/qsyj0',
          slug: 'mary-and-martha-mourn/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4929-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Lazarus Rises' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4929-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Lazarus Rises' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus commands Lazarus back to life, all are amazed. Word of this reaches the Pharisees, who are concerned Jesus is gaining too many followers and so plot to kill Him.\n\nJesus avoids being arrested by them and returns to home of Lazarus where He is honoured with a meal and Mary washes His feet with perfume, Judas complains that the perfume should have been sold and the money given to the poor, as he was a thief and wanted to steal some of that money. Jesus honours Mary's choice and tells Judas that it is right, as the poor would always be with them but that He would not."
          }
        ],
        slug: 'lazarus-rises',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4929-0-0',
          duration: 414,
          hls: 'https://arc.gt/rod6e',
          slug: 'lazarus-rises/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4930-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Triumphal Entry and Results' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4930-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Triumphal Entry and Results' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus enters Jerusalem triumphantly for the Passover Celebration. He is honored by the crowd as he enters the city, fulfilling prophecy. The people were excited as they had heard how Lazarus had been resurrected from the dead. \n\nThe time had come for Jesus to enter into His Glory. Jesus is nervous about the huge event that is before Him, He prays that God be glorified by His laying down of His life.  He preaches that this life of ours is not about fulfilling our desires, but about serving God. \n\nJesus tells the people that He is about to die, they are confused as they thought The Christ was to remain forever, Jesus explains He is to remain as the light amongst them for a little while longer and encourages them to believe in the light and become sons of light.'
          }
        ],
        slug: 'triumphal-entry-and-results',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4930-0-0',
          duration: 327,
          hls: 'https://arc.gt/dcorg',
          slug: 'triumphal-entry-and-results/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4931-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Divided Opinions' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4931-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Divided Opinions' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The prophecy of Isaiah was fulfilled as many were blinded to Jesus message of salvation and they did not believe what he said. Jesus promised eternal life for those who received His words.'
          }
        ],
        slug: 'divided-opinions',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4931-0-0',
          duration: 142,
          hls: 'https://arc.gt/p1bsp',
          slug: 'divided-opinions/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4932-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Last Supper' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4932-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Last Supper' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'As Jesus and his disciples prepare for the passover meal, Jesus washes his disciples feet. He encourages them to follow his example for those around them. \n\nDuring this time, Judas Iscariot has decided to betray Jesus to the religious authorities.'
          }
        ],
        slug: 'last-supper',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4932-0-0',
          duration: 265,
          hls: 'https://arc.gt/prd0d',
          slug: 'last-supper/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4933-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Betrayal and Denial Foretold' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4933-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Betrayal and Denial Foretold' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus announces that one of the disciples, Judas Iscariot, was going to betray him and that he would not be with the disciples much longer. He knew the his time with the disciples was growing short and he left them with one final command: love one another as I [Jesus} have loved you.'
          }
        ],
        slug: 'betrayal-and-denial-foretold',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4933-0-0',
          duration: 290,
          hls: 'https://arc.gt/fenvo',
          slug: 'betrayal-and-denial-foretold/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4934-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus Comforts His Disciples' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4934-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus Comforts His Disciples' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus comforts his disciples as they struggle with the knowledge that he was leaving. He reminds them that he is the way, the truth and the life.'
          }
        ],
        slug: 'jesus-comforts-his-disciples',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4934-0-0',
          duration: 141,
          hls: 'https://arc.gt/8risd',
          slug: 'jesus-comforts-his-disciples/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4935-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus Promises the Holy Spirit' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4935-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus Promises the Holy Spirit' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus promises his disciples a helper that will be with them when he leaves. He reminds them to love the Father and to obey his commands. Jesus also promises a peace stronger than what the world has to offer for their troubled hearts.'
          }
        ],
        slug: 'jesus-promises-the-holy-spirit',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4935-0-0',
          duration: 151,
          hls: 'https://arc.gt/yg0xw',
          slug: 'jesus-promises-the-holy-spirit/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4936-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'The Vine and the Branches' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4936-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Vine and the Branches' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus describes the relationship with the Father through an analogy of vines and fruit. Jesus reminds his disciples of his love for them and asks that they love one another.'
          }
        ],
        slug: 'the-vine-and-the-branches',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4936-0-0',
          duration: 167,
          hls: 'https://arc.gt/owvp9',
          slug: 'the-vine-and-the-branches/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4937-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: "The World's Hatred" }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4937-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: "The World's Hatred" }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus warns his disciples of the hardships and persecution that face them if they continue to follow Him.'
          }
        ],
        slug: 'the-world-hatred',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4937-0-0',
          duration: 87,
          hls: 'https://arc.gt/zbgr2',
          slug: 'the-world-hatred/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4938-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'The Work of the Holy Spirit' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4938-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Work of the Holy Spirit' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus promises a helper that will assist and lead the disciples after he leaves. The helper is from the Father and will be with them at all times.'
          }
        ],
        slug: 'the-work-of-the-holy-spirit',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4938-0-0',
          duration: 150,
          hls: 'https://arc.gt/inp78',
          slug: 'the-work-of-the-holy-spirit/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4939-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Grief will Turn to Joy!' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4939-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Grief will Turn to Joy!' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Jesus tells the disciples that he will be leaving.'
          }
        ],
        slug: 'grief-will-turn-to-joy',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4939-0-0',
          duration: 190,
          hls: 'https://arc.gt/q074p',
          slug: 'grief-will-turn-to-joy/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4940-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus Prays to be Glorified' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4940-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus Prays to be Glorified' }
        ],
        snippet: [
          { __typename: 'Translation', value: 'Jesus prays for his disciples.' }
        ],
        slug: 'jesus-prays-to-be-glorified',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4940-0-0',
          duration: 262,
          hls: 'https://arc.gt/y2mnc',
          slug: 'jesus-prays-to-be-glorified/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4941-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "The Arrest of Jesus and Peter's Denial"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4941-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "The Arrest of Jesus and Peter's Denial"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus is arrested and brought before the Jewish religious authorities. He is questioned by the High Priest. As Peter waited for news of Jesus, he denied knowing Jesus three times.'
          }
        ],
        slug: 'the-arrest-of-jesus-and-peter-denial',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4941-0-0',
          duration: 346,
          hls: 'https://arc.gt/5zb64',
          slug: 'the-arrest-of-jesus-and-peter-denial/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4942-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'My Kingdom is Not of This World'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4942-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'My Kingdom is Not of This World'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus is brought before Pilate to be judged by the Jewish High Priests. Jesus tells Pilate that His Kingdom is not of this world.\n\nPilate finds no wrong in Jesus and proposes to follow Jewish custom and release one man at Passover. They demand to have Barrabbas.'
          }
        ],
        slug: 'my-kingdom-is-not-of-this-world',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4942-0-0',
          duration: 206,
          hls: 'https://arc.gt/b8psu',
          slug: 'my-kingdom-is-not-of-this-world/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4943-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Jesus Sentenced to be Crucified'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4943-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Jesus Sentenced to be Crucified'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Pilate had Jesus whipped, soldiers put a thorny crown on His head and mocked Him. \n\nPilate wants to now set Jesus free, but Jews cry for Him to be crucified. Pilate speaks with Jesus and Jesus tells him he has no authority over Him other than what's given to him. Again Pilate wants to see Him released, but the Jews accused Pilate of thwarting Caesar, so Pilate hands Him over to the Jews to crucify."
          }
        ],
        slug: 'jesus-sentenced-to-be-crucified',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4943-0-0',
          duration: 328,
          hls: 'https://arc.gt/c46lf',
          slug: 'jesus-sentenced-to-be-crucified/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4944-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'The Crucifixion of Jesus' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4944-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Crucifixion of Jesus' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus is crucified between two other criminals. He is buried in a tomb by Joseph of Arimathea.'
          }
        ],
        slug: 'the-crucifixion-of-jesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4944-0-0',
          duration: 449,
          hls: 'https://arc.gt/77lqv',
          slug: 'the-crucifixion-of-jesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4945-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Jesus is Alive!' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4945-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Jesus is Alive!' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Mary Magdalene finds Jesus' tomb empty and runs to tell Peter and John. As Mary grieved his absence, two angels appeared to her saying that He was not gone. And then Jesus appeared to her and to the disciples."
          }
        ],
        slug: 'jesus-is-alive',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4945-0-0',
          duration: 287,
          hls: 'https://arc.gt/r9p76',
          slug: 'jesus-is-alive/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4946-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Doubting Thomas' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4946-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Doubting Thomas' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus appears before the disciples after his resurrection and doubting Thomas believes.'
          }
        ],
        slug: 'doubting-thomas',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4946-0-0',
          duration: 126,
          hls: 'https://arc.gt/qnsip',
          slug: 'doubting-thomas/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4947-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Miraculous Catch' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4947-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Miraculous Catch' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus appears to his disciples again and performs a miracle.'
          }
        ],
        slug: 'miraculous-catch',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4947-0-0',
          duration: 181,
          hls: 'https://arc.gt/o2nme',
          slug: 'miraculous-catch/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4948-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Do you love me?' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4948-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Do you love me?' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus forgives Peter for denying him, asks him three times if he loves him, tells him to feed his sheep and prophecies about how he (Peter) will die.'
          }
        ],
        slug: 'do-you-love-me',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4948-0-0',
          duration: 201,
          hls: 'https://arc.gt/qq08o',
          slug: 'do-you-love-me/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_GOJ4949-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'How to Know Jesus Personally' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4949-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'How to Know Jesus Personally' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'The purpose and message of Jesus Christ.'
          }
        ],
        slug: 'how-to-know-jesus-personally',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-GOJ4949-0-0',
          duration: 151,
          hls: 'https://arc.gt/kohxw',
          slug: 'how-to-know-jesus-personally/english'
        }
      }
    ]
  },
  {
    __typename: 'Video',
    id: '1_jf6119-0-0',
    label: VideoLabel.segment,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6119-0-0.mobileCinematicHigh.jpg',
    imageAlt: [{ __typename: 'Translation', value: 'Jesus Calms the Storm' }],
    snippet: [
      {
        __typename: 'Translation',
        value:
          'Jesus gets into a boat and tells His disciples they should all go to the other side of the lake. Along the way, Jesus falls asleep. A storm starts to rage. Waves stretch high over the bow. And the boat starts to take on water.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          "Jesus gets into a boat and tells His disciples they should all go to the other side of the lake. Along the way, Jesus falls asleep. A storm starts to rage. Waves stretch high over the bow. And the boat starts to take on water.\n\nThe whole time, Jesus stays asleep. The disciples hold on tight. They try to keep the boat afloat. Finally, Peter cries out to the still sleeping Jesus. He tells Jesus that the boat is taking on water and that they'll all be drowned.\n\nJesus stands and puts a hand out toward the storm. The storm clears. And the seas immediately calm."
      }
    ],
    studyQuestions: [
      {
        __typename: 'Translation',
        value: 'How do the disciples react to the storm?'
      },
      {
        __typename: 'Translation',
        value: 'What does Jesus do when the disciples ask Him for help?'
      },
      {
        __typename: 'Translation',
        value: 'How would you respond to the storm and to Jesus?'
      }
    ],
    title: [{ __typename: 'Translation', value: 'Jesus Calms the Storm' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '1_529-jf6119-0-0',
      duration: 119,
      hls: 'https://arc.gt/69sos',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 3154895,
          url: 'https://arc.gt/hdbpx'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 36145996,
          url: 'https://arc.gt/pj47t'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'jesus-calms-the-storm/english'
    },
    slug: 'jesus-calms-the-storm',
    children: []
  },
  {
    __typename: 'Video',
    id: '1_wl604423-0-0',
    label: VideoLabel.segment,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604423-0-0.mobileCinematicHigh.jpg',
    imageAlt: [
      { __typename: 'Translation', value: 'The Woman with the Issue of Blood' }
    ],
    snippet: [
      {
        __typename: 'Translation',
        value:
          'A woman suffering from 12 years of bleeding could find no one to help her.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          'A woman suffering from 12 years of bleeding could find no one to help her.'
      }
    ],
    studyQuestions: [
      {
        __typename: 'Translation',
        value:
          "Why do you think the woman so desperately wanted to touch Jesus' garment?"
      },
      {
        __typename: 'Translation',
        value:
          'In such a large crowd of people, why do you think Jesus wanted to know who touched Him?'
      },
      {
        __typename: 'Translation',
        value:
          'Of all the things Jesus said to the woman, what meant the most to you?'
      }
    ],
    title: [
      { __typename: 'Translation', value: 'The Woman with the Issue of Blood' }
    ],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '1_529-wl604423-0-0',
      duration: 190,
      hls: 'https://arc.gt/0sgr2',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 297742490,
          url: 'https://arc.gt/fz9kn'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 3384067193,
          url: 'https://arc.gt/on94p'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'the-woman-with-the-issue-of-blood/english'
    },
    slug: 'the-woman-with-the-issue-of-blood',
    children: []
  },
  {
    __typename: 'Video',
    id: 'MAG1',
    label: VideoLabel.featureFilm,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/high_mag_collection_640x300br.jpg',
    imageAlt: [{ __typename: 'Translation', value: 'Magdalena' }],
    snippet: [
      {
        __typename: 'Translation',
        value:
          'This compelling film collection portraying Jesus’ tender regard for women, is being met with incredible response around the world--inspiring women everywhere to realize and reclaim the purpose they were always intended for...to know God’s love for them and to make it known to others.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          '"Magdalena", the compelling film portraying Jesus\' tender regard for women, is being met with incredible response around the world. Magdalena is inspiring women everywhere to realize and reclaim the purpose they were always intended for...to know Jesus, and with loving hearts and a gentle touch make Him known.\n\nThis collection includes the 1-hour version of "Magdalena" as well as the original 82 minute director\'s cut. A series of short clips (2-5 minutes) with thought-provoking questions help viewers delve deeper into God’s Word to discover hope for their lives. '
      }
    ],
    studyQuestions: [],
    title: [{ __typename: 'Translation', value: 'Magdalena' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '1_529-wl60-0-0',
      duration: 3665,
      hls: 'https://arc.gt/d8p35',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 98929472,
          url: 'https://arc.gt/v50a9'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 1127091509,
          url: 'https://arc.gt/29xoy'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'magdalena/english'
    },
    slug: 'magdalena',
    children: [
      {
        __typename: 'Video',
        id: '1_wl-0-0',
        label: VideoLabel.featureFilm,
        title: [
          { __typename: 'Translation', value: "Magdalena - Director's Cut" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Magdalena - Director's Cut" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Magdalena, a film made especially for women, beautifully shares God's love and the gospel, engaging women at the heart level with the potential of changing their lives for eternity. The Director's Cut is 82 minutes and includes additional scenes."
          }
        ],
        slug: 'magdalena-director-cut',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl-0-0',
          duration: 4952,
          hls: 'https://arc.gt/z6lim',
          slug: 'magdalena-director-cut/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604401-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Title and Introduction' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604401-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Title and Introduction' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "This story takes place in the year 40 AD in a village and Mary Magdalene and her friend, Rivka, are walking together. It's about sunset."
          }
        ],
        slug: 'title-and-introduction',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604401-0-0',
          duration: 69,
          hls: 'https://arc.gt/27lap',
          slug: 'title-and-introduction/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604402-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "Mary Magdalene goes to Rivka's house"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604402-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "Mary Magdalene goes to Rivka's house"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Mary Magdalene enters Rivka's house in order to tell them about Jesus and how He impacted women's lives, including her own."
          }
        ],
        slug: 'mary-magdalene-goes-to-rivka-house',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604402-0-0',
          duration: 76,
          hls: 'https://arc.gt/l55hy',
          slug: 'mary-magdalene-goes-to-rivka-house/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604403-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Creation' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604403-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Creation' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Because Jesus' story is part of a larger story, Mary Magdalene tells the story of creation."
          }
        ],
        slug: 'creation',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604403-0-0',
          duration: 149,
          hls: 'https://arc.gt/hu9ht',
          slug: 'creation/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604404-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Temptation and Fall of Mankind' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604404-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Temptation and Fall of Mankind' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The woman, Eve, was tempted by Satan and ate the forbidden fruit. She offered some fruit to Adam and he chose to eat it also.'
          }
        ],
        slug: 'temptation-and-fall-of-mankind',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604404-0-0',
          duration: 88,
          hls: 'https://arc.gt/rlust',
          slug: 'temptation-and-fall-of-mankind/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604405-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Abraham' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604405-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Abraham' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Abraham believed God. One day God tested Abraham and told him to sacrifice his son.'
          }
        ],
        slug: 'abraham',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604405-0-0',
          duration: 133,
          hls: 'https://arc.gt/i1zzu',
          slug: 'abraham/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604406-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Isaiah' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604406-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Isaiah' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Isaiah, the Prophet, described what the Messiah would do when He came.'
          }
        ],
        slug: 'isaiah',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604406-0-0',
          duration: 79,
          hls: 'https://arc.gt/73nzx',
          slug: 'isaiah/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604407-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Announcement to Mary' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604407-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Announcement to Mary' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'An angel appears to Mary to tell her that she will become pregnant with a son and to call him Jesus, even though she is a virgin. Nothing is impossible with God.'
          }
        ],
        slug: 'announcement-to-mary',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604407-0-0',
          duration: 117,
          hls: 'https://arc.gt/0omcj',
          slug: 'announcement-to-mary/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604408-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: "Mary's Visit to Elizabeth" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604408-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Mary's Visit to Elizabeth" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "The angel told Mary that her much older cousin Elizabeth was pregnant. Mary goes to visit her and sees that it's true. Elizabeth confirms that Mary is carrying the Lord Jesus."
          }
        ],
        slug: 'mary-visit-to-elizabeth',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604408-0-0',
          duration: 77,
          hls: 'https://arc.gt/v7i0o',
          slug: 'mary-visit-to-elizabeth/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604409-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: "Joseph's Response" }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604409-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: "Joseph's Response" }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'When Joseph saw that Mary was pregnant, he wanted to divorce her quietly. However, an angel appeared to him in a dream.'
          }
        ],
        slug: 'joseph-response',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604409-0-0',
          duration: 79,
          hls: 'https://arc.gt/u8389',
          slug: 'joseph-response/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604410-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Birth of Jesus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604410-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Birth of Jesus' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Because the government ordered all men to go to their place of birth to be counted, Joseph and Mary went to a town named Bethlehem. Jesus was born there.'
          }
        ],
        slug: 'birth-of-jesus-2',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604410-0-0',
          duration: 23,
          hls: 'https://arc.gt/ivfj3',
          slug: 'birth-of-jesus-2/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604411-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: "Simeon's Prophecy" }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604411-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: "Simeon's Prophecy" }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Mary and Joseph took the baby Jesus to the temple to be presented to God. There they met a righteous man named Simeon.'
          }
        ],
        slug: 'simeon-prophecy',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604411-0-0',
          duration: 64,
          hls: 'https://arc.gt/b7e1w',
          slug: 'simeon-prophecy/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604412-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Explanation of Miraculous Birth'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604412-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Explanation of Miraculous Birth'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Magdalena's friends questioned how Mary could become pregnant even though she was a virgin."
          }
        ],
        slug: 'explanation-of-miraculous-birth',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604412-0-0',
          duration: 51,
          hls: 'https://arc.gt/rbk2a',
          slug: 'explanation-of-miraculous-birth/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604413-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Baptism of Jesus by John' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604413-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Baptism of Jesus by John' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Elizabeth's son, John, proclaims that someone is coming who is much greater than he is."
          }
        ],
        slug: 'baptism-of-jesus-by-john-2',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604413-0-0',
          duration: 91,
          hls: 'https://arc.gt/db9mo',
          slug: 'baptism-of-jesus-by-john-2/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604414-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Jesus Proclaims Fulfillment of the Scriptures'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604414-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Jesus Proclaims Fulfillment of the Scriptures'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus reads a passage from Isaiah about the Messiah and announces that it is fulfilled.'
          }
        ],
        slug: 'jesus-proclaims-fulfillment-of-the-scriptures-2',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604414-0-0',
          duration: 96,
          hls: 'https://arc.gt/nhkh9',
          slug: 'jesus-proclaims-fulfillment-of-the-scriptures-2/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604415-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Mary Magdalene Freed from Demons'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604415-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Mary Magdalene Freed from Demons'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'People reject Mary Magdalene because she was possessed by evil spirits. But Jesus sees her and commands the evil spirits to leave her.'
          }
        ],
        slug: 'mary-magdalene-freed-from-demons',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604415-0-0',
          duration: 235,
          hls: 'https://arc.gt/r2n8c',
          slug: 'mary-magdalene-freed-from-demons/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604416-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "Rivka's Home, Disciples Chosen and Women Followers"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604416-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "Rivka's Home, Disciples Chosen and Women Followers"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus chose 12 disciples to follow Him. A number of women also followed Jesus and helped with their support.'
          }
        ],
        slug: 'rivka-home-disciples-chosen-and-women-followers',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604416-0-0',
          duration: 76,
          hls: 'https://arc.gt/j7e42',
          slug: 'rivka-home-disciples-chosen-and-women-followers/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604417-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Rome Took Everything but Jesus Offered Hope'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604417-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Rome Took Everything but Jesus Offered Hope'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Rome ruled everything, taxing the people and being oppressive. Jesus came and offered hope.'
          }
        ],
        slug: 'rome-took-everything-but-jesus-offered-hope',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604417-0-0',
          duration: 53,
          hls: 'https://arc.gt/kyhu2',
          slug: 'rome-took-everything-but-jesus-offered-hope/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604418-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: "Jesus Raises the Widow's Son" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604418-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Jesus Raises the Widow's Son" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "A widow's only son and means of support died. Jesus passed by and brought the son back to life."
          }
        ],
        slug: 'jesus-raises-the-widow-son',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604418-0-0',
          duration: 69,
          hls: 'https://arc.gt/cpr24',
          slug: 'jesus-raises-the-widow-son/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604419-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Sermon on the Mount' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604419-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Sermon on the Mount' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus teaches His disciples and the people a new way of living.'
          }
        ],
        slug: 'sermon-on-the-mount-2',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604419-0-0',
          duration: 238,
          hls: 'https://arc.gt/4dv62',
          slug: 'sermon-on-the-mount-2/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604420-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Woman at the Well' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604420-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Woman at the Well' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'In those days, Jews and Samaritans hated each other. Yet Jesus talks with this Samaritan woman offering her living water.'
          }
        ],
        slug: 'the-woman-at-the-well',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604420-0-0',
          duration: 354,
          hls: 'https://arc.gt/i9pze',
          slug: 'the-woman-at-the-well/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604421-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Teaching About Prayer and Faith'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604421-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Teaching About Prayer and Faith'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus said that God takes great delight in providing for His children, encouraging them not to worry.'
          }
        ],
        slug: 'teaching-about-prayer-and-faith-2',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604421-0-0',
          duration: 134,
          hls: 'https://arc.gt/qymxm',
          slug: 'teaching-about-prayer-and-faith-2/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604422-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus Spends Time with Sinners' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604422-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus Spends Time with Sinners' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus warns His disciples that temptations would come. As He sat and ate with those who were not religious, He taught them about God's kingdom and why He had come."
          }
        ],
        slug: 'jesus-spends-time-with-sinners-2',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604422-0-0',
          duration: 71,
          hls: 'https://arc.gt/16swn',
          slug: 'jesus-spends-time-with-sinners-2/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604423-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'The Woman with the Issue of Blood'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604423-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'The Woman with the Issue of Blood'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'A woman suffering from 12 years of bleeding could find no one to help her.'
          }
        ],
        slug: 'the-woman-with-the-issue-of-blood',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604423-0-0',
          duration: 190,
          hls: 'https://arc.gt/0sgr2',
          slug: 'the-woman-with-the-issue-of-blood/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604424-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "Jairus' Daughter Brought Back to Life"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604424-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "Jairus' Daughter Brought Back to Life"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jairus is told that his daughter is dead. Jesus says, "don\'t be afraid, only believe."'
          }
        ],
        slug: 'jairus-daughter-brought-back-to-life-2',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604424-0-0',
          duration: 113,
          hls: 'https://arc.gt/im9jh',
          slug: 'jairus-daughter-brought-back-to-life-2/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604425-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Jesus Feeds 5,000' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604425-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Jesus Feeds 5,000' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'A large crowd of people is with Jesus in the wilderness. It is late in the day so the disciples tell Jesus to send the people to get their own food.  But Jesus challenges them to feed the people.'
          }
        ],
        slug: 'jesus-feeds-5000-2',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604425-0-0',
          duration: 99,
          hls: 'https://arc.gt/9dmh6',
          slug: 'jesus-feeds-5000-2/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604426-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Teaching about Following Him' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604426-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Teaching about Following Him' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus tells his followers that there would be a cost to follow Him.'
          }
        ],
        slug: 'teaching-about-following-him',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604426-0-0',
          duration: 99,
          hls: 'https://arc.gt/qvk27',
          slug: 'teaching-about-following-him/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604427-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Healing on the Sabbath' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604427-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Healing on the Sabbath' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus is in the synagogue on the Sabbath where He heals a woman who has been crippled for 18 years.'
          }
        ],
        slug: 'healing-on-the-sabbath-2',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604427-0-0',
          duration: 118,
          hls: 'https://arc.gt/62wr3',
          slug: 'healing-on-the-sabbath-2/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604428-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Roman and Religious Leaders Upset with Jesus'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604428-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Roman and Religious Leaders Upset with Jesus'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The religious and government leaders are afraid that more and more people are following Jesus.'
          }
        ],
        slug: 'roman-and-religious-leaders-upset-with-jesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604428-0-0',
          duration: 53,
          hls: 'https://arc.gt/qf097',
          slug: 'roman-and-religious-leaders-upset-with-jesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604429-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: "Widow's Offering" }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604429-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: "Widow's Offering" }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus observed a widow put two small coins in the offering box.'
          }
        ],
        slug: 'widow-offering-2',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604429-0-0',
          duration: 80,
          hls: 'https://arc.gt/eg2y4',
          slug: 'widow-offering-2/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604430-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'The Adulterous Woman Forgiven' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604430-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Adulterous Woman Forgiven' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The religious leaders bring an adulterous woman to Jesus in front of a crowd.'
          }
        ],
        slug: 'the-adulterous-woman-forgiven',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604430-0-0',
          duration: 179,
          hls: 'https://arc.gt/nf1a9',
          slug: 'the-adulterous-woman-forgiven/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604431-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Judas agrees to Betray Jesus' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604431-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Judas agrees to Betray Jesus' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Judas goes to the religious leaders intending to betray Jesus into their hands.'
          }
        ],
        slug: 'judas-agrees-to-betray-jesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604431-0-0',
          duration: 58,
          hls: 'https://arc.gt/wl9z6',
          slug: 'judas-agrees-to-betray-jesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604432-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus Is Betrayed, Arrested' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604432-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus Is Betrayed, Arrested' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Judas leads some soldiers and religious leaders to where Jesus and His disciples are praying. Judas betrays Jesus and the soldiers arrest Jesus.'
          }
        ],
        slug: 'jesus-is-betrayed-arrested',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604432-0-0',
          duration: 120,
          hls: 'https://arc.gt/ks29s',
          slug: 'jesus-is-betrayed-arrested/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604433-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Jesus on Trial' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604433-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Jesus on Trial' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus goes on trial before several religious leaders, and then is taken to Pilate, the Roman civil leader, who finally condemns Jesus to death on the cross.'
          }
        ],
        slug: 'jesus-on-trial',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604433-0-0',
          duration: 270,
          hls: 'https://arc.gt/q5fl0',
          slug: 'jesus-on-trial/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604434-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Jesus Carries His Cross and Is Crucified'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604434-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Jesus Carries His Cross and Is Crucified'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus carries His cross until He can no longer carry it. The soldiers made Simon of Cyrene carry it for Him. Then they crucified Jesus on the cross between two thieves.'
          }
        ],
        slug: 'jesus-carries-his-cross-and-is-crucified',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604434-0-0',
          duration: 261,
          hls: 'https://arc.gt/oiqhl',
          slug: 'jesus-carries-his-cross-and-is-crucified/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604435-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: "Mary Recalls Simeon's Words" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604435-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Mary Recalls Simeon's Words" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Simeon had told Joseph and Mary that the child would be a sign to the people from God and be the fall and rise of many in Israel. He also told Mary that a sword would pierce her own soul.'
          }
        ],
        slug: 'mary-recalls-simeon-words',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604435-0-0',
          duration: 48,
          hls: 'https://arc.gt/b62kj',
          slug: 'mary-recalls-simeon-words/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604436-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'The Thief Promised Paradise' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604436-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Thief Promised Paradise' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Hanging between two thieves, Jesus was asked by one to remember him when He came into His Kingdom. Jesus promised that that very day he would be with Him in Paradise.'
          }
        ],
        slug: 'the-thief-promised-paradise',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604436-0-0',
          duration: 59,
          hls: 'https://arc.gt/wmnbu',
          slug: 'the-thief-promised-paradise/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604437-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: "Darkness and Jesus' Death" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604437-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Darkness and Jesus' Death" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Darkness came over all of the land for three hours and then Jesus "gave up His spirit" and died. At the same moment of His death, the curtain in the temple was torn in two from top to bottom.'
          }
        ],
        slug: 'darkness-and-jesus-death',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604437-0-0',
          duration: 67,
          hls: 'https://arc.gt/pxwnj',
          slug: 'darkness-and-jesus-death/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604438-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Burial of Jesus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604438-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Burial of Jesus' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "As women observed and with permission from Pilate, Joseph of Arimathea placed Jesus' body, wrapped in linen and spices, in his own tomb."
          }
        ],
        slug: 'burial-of-jesus-2',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604438-0-0',
          duration: 141,
          hls: 'https://arc.gt/st6t0',
          slug: 'burial-of-jesus-2/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604439-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Women at the Tomb, Body Gone' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604439-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Women at the Tomb, Body Gone' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Early Sunday, some women went to the tomb to anoint Jesus' body but find the tomb already open and empty. They run to tell the disciples."
          }
        ],
        slug: 'women-at-the-tomb-body-gone',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604439-0-0',
          duration: 83,
          hls: 'https://arc.gt/8s4d5',
          slug: 'women-at-the-tomb-body-gone/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604440-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Magdalena Sees the Resurrected Jesus'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604440-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Magdalena Sees the Resurrected Jesus'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'After viewing the empty tomb, angels ask Mary Magdalene why she is crying. Another also questions her and when He speaks her name she realizes that He is not the gardener, but is Jesus.'
          }
        ],
        slug: 'magdalena-sees-the-resurrected-jesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604440-0-0',
          duration: 157,
          hls: 'https://arc.gt/h820i',
          slug: 'magdalena-sees-the-resurrected-jesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604441-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "Magdalena Explains Jesus' Death and Resurrection"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604441-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "Magdalena Explains Jesus' Death and Resurrection"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Mary Magdalene explains why Jesus' death and resurrection are significant to our lives."
          }
        ],
        slug: 'magdalena-explains-jesus-death-and-resurrection',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604441-0-0',
          duration: 139,
          hls: 'https://arc.gt/ibynj',
          slug: 'magdalena-explains-jesus-death-and-resurrection/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604442-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Knowing God Personally' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604442-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Knowing God Personally' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus showed His great compassion for people, His authority over evil and every spirit, and His power even over death.'
          }
        ],
        slug: 'knowing-god-personally',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604442-0-0',
          duration: 115,
          hls: 'https://arc.gt/wzwqm',
          slug: 'knowing-god-personally/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604443-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Rivka Believes' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604443-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Rivka Believes' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus died to restore our broken relationship with God. Rivka chooses to believe all that Mary Magdalene has told her and asks Jesus to be her Lord and Savior.'
          }
        ],
        slug: 'rivka-believes',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604443-0-0',
          duration: 192,
          hls: 'https://arc.gt/scdlu',
          slug: 'rivka-believes/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl604444-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Living the Christian Life' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl604444-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Living the Christian Life' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Rivka learns that this relationship with God is eternal and Mary Magdalene and Dinah share ideas about how she can grow in that faith/relationship.'
          }
        ],
        slug: 'living-the-christian-life',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl604444-0-0',
          duration: 99,
          hls: 'https://arc.gt/gyuus',
          slug: 'living-the-christian-life/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_0-ThisIsFreedom',
        label: VideoLabel.shortFilm,
        title: [{ __typename: 'Translation', value: 'This Is Freedom' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-ThisIsFreedom.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'This Is Freedom' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'A woman shares her journey through song, of finding true freedom in Christ and what it means.'
          }
        ],
        slug: 'this-is-freedom',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-0-ThisIsFreedom',
          duration: 255,
          hls: 'https://arc.gt/ff5b9',
          slug: 'this-is-freedom/english'
        }
      }
    ]
  },
  {
    __typename: 'Video',
    id: '1_wl7-0-0',
    label: VideoLabel.series,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/ROH.mobileCinematicHigh.jpg',
    imageAlt: [{ __typename: 'Translation', value: 'Reflections of Hope' }],
    snippet: [
      {
        __typename: 'Translation',
        value:
          "Reflections of Hope is an eight-lesson Bible study that helps women deepen their understanding of Jesus' love and care for them. They learn of His promise to be with them each step of life's journey."
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          "Reflections of Hope is an eight-lesson Bible study that helps women deepen their understanding of Jesus' love and care for them. They learn of His promise to be with them each step of life's journey. This collection includes seven short clips from Magdalena that correspond with the lessons in the study. It also provides thought provoking questions to help women go deeper into God's Word and find the value that God placed in each one of them."
      }
    ],
    studyQuestions: [],
    title: [{ __typename: 'Translation', value: 'Reflections of Hope' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '1_529-wl7-0-0',
      duration: 0,
      hls: null,
      downloads: [],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'reflections-of-hope/english'
    },
    slug: 'reflections-of-hope',
    children: [
      {
        __typename: 'Video',
        id: '1_wl71-0-0',
        label: VideoLabel.episode,
        title: [
          { __typename: 'Translation', value: '1. Jesus, Our Loving Pursuer' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl71-0-0.mobileCinematicHigh.v2.jpg',
        imageAlt: [
          { __typename: 'Translation', value: '1. Jesus, Our Loving Pursuer' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Does God see me? Rivka wonders if God even sees her.'
          }
        ],
        slug: '1-jesus-our-loving-pursuer',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl71-0-0',
          duration: 70,
          hls: 'https://arc.gt/420k6',
          slug: '1-jesus-our-loving-pursuer/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl72-0-0',
        label: VideoLabel.episode,
        title: [
          {
            __typename: 'Translation',
            value: '2. Jesus, Our Gracious Forgiver'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl72-0-0.mobileCinematicHigh.v2.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: '2. Jesus, Our Gracious Forgiver'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Will He forgive me? An adulterous woman finds forgiveness instead of condemnation.'
          }
        ],
        slug: '2-jesus-our-gracious-forgiver',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl72-0-0',
          duration: 176,
          hls: 'https://arc.gt/ez214',
          slug: '2-jesus-our-gracious-forgiver/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl73-0-0',
        label: VideoLabel.episode,
        title: [
          { __typename: 'Translation', value: '3. Jesus, Our Power for Living' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl73-0-0.mobileCinematicHigh.v2.jpg',
        imageAlt: [
          { __typename: 'Translation', value: '3. Jesus, Our Power for Living' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Will God give me strength? Mary, the mother of Jesus finds strength for daily life as she discovers that she will become the mother of the Messiah.'
          }
        ],
        slug: '3-jesus-our-power-for-living',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl73-0-0',
          duration: 116,
          hls: 'https://arc.gt/ti0z9',
          slug: '3-jesus-our-power-for-living/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl74-0-0',
        label: VideoLabel.episode,
        title: [
          {
            __typename: 'Translation',
            value: '4. Jesus, Our Powerful Deliverer'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl74-0-0.mobileCinematicHigh.v2.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: '4. Jesus, Our Powerful Deliverer'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Will He free me? Mary Magdalene is freed from demons and becomes a follower of Jesus.'
          }
        ],
        slug: '4-jesus-our-powerful-deliverer',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl74-0-0',
          duration: 230,
          hls: 'https://arc.gt/1j2w1',
          slug: '4-jesus-our-powerful-deliverer/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl75-0-0',
        label: VideoLabel.episode,
        title: [
          {
            __typename: 'Translation',
            value: '5. Jesus, Our Compassionate Provider'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl75-0-0.mobileCinematicHigh.v2.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: '5. Jesus, Our Compassionate Provider'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Will He take care of me? Jesus raises the only son of a poor widow from the dead. Do you sometimes wonder if God will provide for your needs?'
          }
        ],
        slug: '5-jesus-our-compassionate-provider',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl75-0-0',
          duration: 88,
          hls: 'https://arc.gt/gon3b',
          slug: '5-jesus-our-compassionate-provider/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl76-0-0',
        label: VideoLabel.episode,
        title: [
          {
            __typename: 'Translation',
            value: '6. Jesus, Our Complete Restorer'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl76-0-0.mobileCinematicHigh.v2.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: '6. Jesus, Our Complete Restorer'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Will He heal me? A woman displays courage by approaching Jesus and finds complete healing after 12 years. Is something preventing you from reaching out to Jesus?'
          }
        ],
        slug: '6-jesus-our-complete-restorer',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl76-0-0',
          duration: 190,
          hls: 'https://arc.gt/lzbjp',
          slug: '6-jesus-our-complete-restorer/english'
        }
      },
      {
        __typename: 'Video',
        id: '1_wl77-0-0',
        label: VideoLabel.episode,
        title: [
          { __typename: 'Translation', value: '7. Jesus Our Living Water' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl77-0-0.mobileCinematicHigh.v2.jpg',
        imageAlt: [
          { __typename: 'Translation', value: '7. Jesus Our Living Water' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Will He satisfy me? Jesus reveals Himself as the Living Water who satisfies our deepest needs. How was the Samaritan woman trying to meet her own needs? What are ways you are trying to meet your own needs today?'
          }
        ],
        slug: '7-jesus-our-living-water',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-wl77-0-0',
          duration: 354,
          hls: 'https://arc.gt/ikllg',
          slug: '7-jesus-our-living-water/english'
        }
      }
    ]
  },
  {
    __typename: 'Video',
    id: '3_0-8DWJ-WIJ_06-0-0',
    label: VideoLabel.episode,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/3_0-8DWJ-WIJ_06-0-0.mobileCinematicHigh.jpg',
    imageAlt: [
      { __typename: 'Translation', value: 'Day 6: Jesus Died for Me' }
    ],
    snippet: [
      {
        __typename: 'Translation',
        value:
          'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          "They arrive at the place where the crosses are being set up. Others are being tied to their crosses. Jesus is stripped and led to His own cross. They throw Him down on it. There are cries as the others are nailed to their crosses.\n\nThe nails are hammered through Jesus's wrists and feet as He screams. Then slowly, the crosses are erected as Romans pulls the ropes. Jesus is lifted high in the air. He hangs on the cross, tired and in pain. He prays for those in the crowd. He asks God to forgive them because they don't know what they do.\n\nThe crowd murmurs at the feet of the cross. Annas and Caiaphas comment that He saved others. They wonder why He doesn't save Himself. The crowd starts to jeer. They urge Him to save Himself. But He doesn't."
      }
    ],
    studyQuestions: [
      {
        __typename: 'Translation',
        value: 'How do I feel about Jesus being crucified?'
      },
      {
        __typename: 'Translation',
        value: "How do Jesus' words to the thief on the cross give me hope?"
      }
    ],
    title: [{ __typename: 'Translation', value: 'Day 6: Jesus Died for Me' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '3_529-0-8DWJ-WIJ_06-0-0',
      duration: 488,
      hls: 'https://arc.gt/xqav7',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 13079055,
          url: 'https://arc.gt/yx9gl'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 149873025,
          url: 'https://arc.gt/qr1ht'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'day-6-jesus-died-for-me/english'
    },
    slug: 'day-6-jesus-died-for-me',
    children: []
  },
  {
    __typename: 'Video',
    id: '2_Acts-0-0',
    label: VideoLabel.featureFilm,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts-0-0.mobileCinematicHigh.jpg',
    imageAlt: [{ __typename: 'Translation', value: 'Book of Acts' }],
    snippet: [
      {
        __typename: 'Translation',
        value:
          'This film depicts the birth of the early church through the eyes of Luke, the author of the Gospel of Luke.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          'This film depicts the birth of the early church through the eyes of Luke, the author of the Gospel of Luke.'
      }
    ],
    studyQuestions: [
      {
        __typename: 'Translation',
        value: 'What did you like best or what caught your attention?'
      },
      { __typename: 'Translation', value: 'Why?' }
    ],
    title: [{ __typename: 'Translation', value: 'Book of Acts' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '2_529-Acts-0-0',
      duration: 11530,
      hls: 'https://arc.gt/6x6ke',
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
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'book-of-acts/english'
    },
    slug: 'book-of-acts',
    children: [
      {
        __typename: 'Video',
        id: '2_Acts7301-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Introduction of Luke' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7301-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Introduction of Luke' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Introduction to Doctor Luke, the author.'
          }
        ],
        slug: 'introduction-of-luke',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7301-0-0',
          duration: 123,
          hls: 'https://arc.gt/l9eqj',
          slug: 'introduction-of-luke/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7302-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Jesus Taken Up Into Heaven' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Jesus Taken Up Into Heaven' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus promises the Holy Spirit; then ascends into the clouds.'
          }
        ],
        slug: 'jesus-taken-up-into-heaven',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7302-0-0',
          duration: 144,
          hls: 'https://arc.gt/opsgn',
          slug: 'jesus-taken-up-into-heaven/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7303-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Matthias Chosen to Replace Judas'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7303-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Matthias Chosen to Replace Judas'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Disciples return to Jerusalem and choose a replacement for fallen Judas.'
          }
        ],
        slug: 'matthias-chosen-to-replace-judas',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7303-0-0',
          duration: 170,
          hls: 'https://arc.gt/bzfme',
          slug: 'matthias-chosen-to-replace-judas/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7304-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'The Holy Spirit Comes at Pentecost'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7304-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'The Holy Spirit Comes at Pentecost'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The Holy Spirit comes upon all the disciples and they preach about Jesus in different languages.'
          }
        ],
        slug: 'the-holy-spirit-comes-at-pentecost',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7304-0-0',
          duration: 162,
          hls: 'https://arc.gt/6fb9x',
          slug: 'the-holy-spirit-comes-at-pentecost/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7305-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Peter Addresses the Crowd' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7305-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Peter Addresses the Crowd' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Peter preaches and thousands follow Jesus.'
          }
        ],
        slug: 'peter-addresses-the-crowd',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7305-0-0',
          duration: 278,
          hls: 'https://arc.gt/d7e44',
          slug: 'peter-addresses-the-crowd/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7306-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'The Fellowship of the Believers'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7306-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'The Fellowship of the Believers'
          }
        ],
        snippet: [{ __typename: 'Translation', value: 'Abundant blessing.' }],
        slug: 'the-fellowship-of-the-believers',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7306-0-0',
          duration: 54,
          hls: 'https://arc.gt/un9bj',
          slug: 'the-fellowship-of-the-believers/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7307-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Peter Heals a Lame Beggar' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7307-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Peter Heals a Lame Beggar' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Peter & John heal a lame man in the temple.'
          }
        ],
        slug: 'peter-heals-a-lame-beggar',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7307-0-0',
          duration: 131,
          hls: 'https://arc.gt/k3vyl',
          slug: 'peter-heals-a-lame-beggar/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7308-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Peter Speaks to the Onlookers' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7308-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Peter Speaks to the Onlookers' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Peter explains to the crowd the message of the Messiah who suffered for our sins so that we could turn to God and receive times of refreshing.'
          }
        ],
        slug: 'peter-speaks-to-the-onlookers',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7308-0-0',
          duration: 159,
          hls: 'https://arc.gt/hjmdk',
          slug: 'peter-speaks-to-the-onlookers/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7309-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Peter and John before the Sanhedrin'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7309-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Peter and John before the Sanhedrin'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Peter and John are questioned by the Sadducees, threatened and released.'
          }
        ],
        slug: 'peter-and-john-before-the-sanhedrin',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7309-0-0',
          duration: 181,
          hls: 'https://arc.gt/6607l',
          slug: 'peter-and-john-before-the-sanhedrin/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7310-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Believers Pray' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7310-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'The Believers Pray' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'The disciples pray for boldness.'
          }
        ],
        slug: 'the-believers-pray',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7310-0-0',
          duration: 88,
          hls: 'https://arc.gt/g2cxi',
          slug: 'the-believers-pray/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7311-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'The Believers Share Their Possessions'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7311-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'The Believers Share Their Possessions'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'The disciples experience supernatural unity and sharing.'
          }
        ],
        slug: 'the-believers-share-their-possessions',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7311-0-0',
          duration: 51,
          hls: 'https://arc.gt/z086z',
          slug: 'the-believers-share-their-possessions/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7312-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Ananias and Sapphira' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7312-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Ananias and Sapphira' }
        ],
        snippet: [
          { __typename: 'Translation', value: 'A couple lies to God.' }
        ],
        slug: 'ananias-and-sapphira',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7312-0-0',
          duration: 110,
          hls: 'https://arc.gt/q2wij',
          slug: 'ananias-and-sapphira/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7313-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Apostles Heal Many' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7313-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Apostles Heal Many' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'More people believe as the disciples heal many people.'
          }
        ],
        slug: 'the-apostles-heal-many',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7313-0-0',
          duration: 68,
          hls: 'https://arc.gt/tjozl',
          slug: 'the-apostles-heal-many/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7314-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'The Apostles Persecuted' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7314-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Apostles Persecuted' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The apostles are arrested, threatened, released by an angel and continue reaching people.'
          }
        ],
        slug: 'the-apostles-persecuted',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7314-0-0',
          duration: 359,
          hls: 'https://arc.gt/7pqk1',
          slug: 'the-apostles-persecuted/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7315-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'The Choosing of the Seven' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7315-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Choosing of the Seven' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Church leaders divide the responsibilities of leadership.'
          }
        ],
        slug: 'the-choosing-of-the-seven',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7315-0-0',
          duration: 73,
          hls: 'https://arc.gt/uzmlb',
          slug: 'the-choosing-of-the-seven/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7316-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Stephen Seized' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7316-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Stephen Seized' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Stephen falsely accused before the Sanhedrin.'
          }
        ],
        slug: 'stephen-seized',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7316-0-0',
          duration: 98,
          hls: 'https://arc.gt/nnvqh',
          slug: 'stephen-seized/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7317-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "Stephen's Speech to the Sanhedrin"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7317-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "Stephen's Speech to the Sanhedrin"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Stephen defends himself against false accusations.'
          }
        ],
        slug: 'stephen-speech-to-the-sanhedrin',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7317-0-0',
          duration: 534,
          hls: 'https://arc.gt/xta3j',
          slug: 'stephen-speech-to-the-sanhedrin/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7318-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Stoning of Stephen' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7318-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Stoning of Stephen' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Stephen prayed forgiveness on those who stoned him to death.'
          }
        ],
        slug: 'stoning-of-stephen',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7318-0-0',
          duration: 87,
          hls: 'https://arc.gt/2298i',
          slug: 'stoning-of-stephen/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7319-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'The Church Persecuted and Scattered'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7319-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'The Church Persecuted and Scattered'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Strong persecution of the Church began.'
          }
        ],
        slug: 'the-church-persecuted-and-scattered',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7319-0-0',
          duration: 32,
          hls: 'https://arc.gt/j6mnd',
          slug: 'the-church-persecuted-and-scattered/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7320-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Philip in Samaria' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7320-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Philip in Samaria' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Philip’s great ministry success in Samaria.'
          }
        ],
        slug: 'philip-in-samaria',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7320-0-0',
          duration: 29,
          hls: 'https://arc.gt/ztzgv',
          slug: 'philip-in-samaria/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7321-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Simon the Sorcerer' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7321-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Simon the Sorcerer' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Peter and John reach Simon the Sorcerer and others in Samaria.'
          }
        ],
        slug: 'simon-the-sorcerer',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7321-0-0',
          duration: 188,
          hls: 'https://arc.gt/012hm',
          slug: 'simon-the-sorcerer/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7322-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Philip and the Ethiopian' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7322-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Philip and the Ethiopian' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'God leads Philip to encounter and evangelize a visiting Ethiopian.'
          }
        ],
        slug: 'philip-and-the-ethiopian',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7322-0-0',
          duration: 165,
          hls: 'https://arc.gt/28799',
          slug: 'philip-and-the-ethiopian/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7323-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: "Saul's Conversion" }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7323-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: "Saul's Conversion" }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Saul is confronted by Jesus and believes.'
          }
        ],
        slug: 'saul-conversion',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7323-0-0',
          duration: 257,
          hls: 'https://arc.gt/eijqa',
          slug: 'saul-conversion/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7324-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Saul in Damascus and Jerusalem' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7324-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Saul in Damascus and Jerusalem' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Saul gains acceptance among believers and witnesses for Jesus.'
          }
        ],
        slug: 'saul-in-damascus-and-jerusalem',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7324-0-0',
          duration: 129,
          hls: 'https://arc.gt/ektp8',
          slug: 'saul-in-damascus-and-jerusalem/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7325-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Aeneas and Dorcas' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7325-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Aeneas and Dorcas' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Peter heals and preaches in Joppa and Lydda.'
          }
        ],
        slug: 'aeneas-and-dorcas',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7325-0-0',
          duration: 126,
          hls: 'https://arc.gt/62y7y',
          slug: 'aeneas-and-dorcas/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7326-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Cornelius Sees an Angel' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7326-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Cornelius Sees an Angel' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'A God-fearing Roman encounters an angel.'
          }
        ],
        slug: 'cornelius-sees-an-angel',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7326-0-0',
          duration: 76,
          hls: 'https://arc.gt/1d3qg',
          slug: 'cornelius-sees-an-angel/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7327-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: "Peter's Vision" }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7327-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: "Peter's Vision" }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Peter has a vision about impurity.'
          }
        ],
        slug: 'peter-vision',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7327-0-0',
          duration: 115,
          hls: 'https://arc.gt/j03n6',
          slug: 'peter-vision/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7328-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: "Peter at Cornelius's House" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7328-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Peter at Cornelius's House" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Peter shares the gospel with Romans!'
          }
        ],
        slug: 'peter-at-cornelius-house',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7328-0-0',
          duration: 235,
          hls: 'https://arc.gt/cfirx',
          slug: 'peter-at-cornelius-house/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7329-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Peter Explains His Actions' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7329-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Peter Explains His Actions' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Peter’s defense before racist Jews.'
          }
        ],
        slug: 'peter-explains-his-actions',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7329-0-0',
          duration: 175,
          hls: 'https://arc.gt/2mmoo',
          slug: 'peter-explains-his-actions/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7330-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Church in Antioch' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7330-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Church in Antioch' }
        ],
        snippet: [
          { __typename: 'Translation', value: 'The Antioch Church is founded.' }
        ],
        slug: 'the-church-in-antioch',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7330-0-0',
          duration: 144,
          hls: 'https://arc.gt/b098m',
          slug: 'the-church-in-antioch/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7331-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "Peter's Miraculous Escape From Prison"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7331-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "Peter's Miraculous Escape From Prison"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Peter escapes "death row" with help from an angel.'
          }
        ],
        slug: 'peter-miraculous-escape-from-prison',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7331-0-0',
          duration: 298,
          hls: 'https://arc.gt/esnsq',
          slug: 'peter-miraculous-escape-from-prison/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7332-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: "Herod's Death" }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7332-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: "Herod's Death" }],
        snippet: [
          { __typename: 'Translation', value: 'God strikes down Herod.' }
        ],
        slug: 'herod-death',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7332-0-0',
          duration: 64,
          hls: 'https://arc.gt/v4lzw',
          slug: 'herod-death/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7333-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'The Sending of Barnabas and Saul'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7333-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'The Sending of Barnabas and Saul'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Barnabas and Saul become missionaries.'
          }
        ],
        slug: 'the-sending-of-barnabas-and-saul',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7333-0-0',
          duration: 37,
          hls: 'https://arc.gt/1e8wv',
          slug: 'the-sending-of-barnabas-and-saul/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7334-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Ministry On Cyprus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7334-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Ministry On Cyprus' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Barnabas & Saul cover Cyprus with the gospel.'
          }
        ],
        slug: 'ministry-on-cyprus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7334-0-0',
          duration: 90,
          hls: 'https://arc.gt/vopsp',
          slug: 'ministry-on-cyprus/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7335-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Paul’s Ministry In Pisidian Antioch'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7335-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Paul’s Ministry In Pisidian Antioch'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul preaches in the synagogue of Pisidian Antioch.'
          }
        ],
        slug: 'paul-s-ministry-in-pisidian-antioch',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7335-0-0',
          duration: 417,
          hls: 'https://arc.gt/foae1',
          slug: 'paul-s-ministry-in-pisidian-antioch/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7336-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Paul & Barnabas preach In Iconium'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7336-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Paul & Barnabas preach In Iconium'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Iconium is divided in response to the preaching of Paul and Barnabas.'
          }
        ],
        slug: 'paul-barnabas-preach-in-iconium',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7336-0-0',
          duration: 58,
          hls: 'https://arc.gt/1qp1j',
          slug: 'paul-barnabas-preach-in-iconium/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7337-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Mistaken Identity In Lystra' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7337-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Mistaken Identity In Lystra' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul & Barnabas considered gods.'
          }
        ],
        slug: 'mistaken-identity-in-lystra',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7337-0-0',
          duration: 314,
          hls: 'https://arc.gt/rbr42',
          slug: 'mistaken-identity-in-lystra/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7338-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'The Return to Antioch in Syria' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7338-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Return to Antioch in Syria' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul and Barnabas reverse direction and return to Antioch.'
          }
        ],
        slug: 'the-return-to-antioch-in-syria',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7338-0-0',
          duration: 80,
          hls: 'https://arc.gt/e2924',
          slug: 'the-return-to-antioch-in-syria/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7339-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'The Council at Jerusalem' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7339-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Council at Jerusalem' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Church leaders meet in Jerusalem to consider how the Law relates to Gentile believers.'
          }
        ],
        slug: 'the-council-at-jerusalem',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7339-0-0',
          duration: 219,
          hls: 'https://arc.gt/pmpr7',
          slug: 'the-council-at-jerusalem/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7340-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "The Council's Letter to Gentile Believers"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7340-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "The Council's Letter to Gentile Believers"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Jerusalem Council makes a monumental decision.'
          }
        ],
        slug: 'the-council-letter-to-gentile-believers',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7340-0-0',
          duration: 116,
          hls: 'https://arc.gt/7do6v',
          slug: 'the-council-letter-to-gentile-believers/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7341-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Disagreement Between Paul and Barnabas'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7341-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Disagreement Between Paul and Barnabas'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul and Barnabas argue over the future of Mark.'
          }
        ],
        slug: 'disagreement-between-paul-and-barnabas',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7341-0-0',
          duration: 48,
          hls: 'https://arc.gt/tpfpc',
          slug: 'disagreement-between-paul-and-barnabas/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7342-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Timothy Joins Paul and Silas' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7342-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Timothy Joins Paul and Silas' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul recruits Timothy to join his team.'
          }
        ],
        slug: 'timothy-joins-paul-and-silas',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7342-0-0',
          duration: 47,
          hls: 'https://arc.gt/0o1xk',
          slug: 'timothy-joins-paul-and-silas/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7343-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "Paul's Vision of the Man of Macedonia"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7343-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "Paul's Vision of the Man of Macedonia"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'God shuts doors and opens another.'
          }
        ],
        slug: 'paul-vision-of-the-man-of-macedonia',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7343-0-0',
          duration: 79,
          hls: 'https://arc.gt/z03dv',
          slug: 'paul-vision-of-the-man-of-macedonia/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7344-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: "Lydia's Conversion in Philippi" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7344-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Lydia's Conversion in Philippi" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul’s first converts in Europe.'
          }
        ],
        slug: 'lydia-conversion-in-philippi',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7344-0-0',
          duration: 62,
          hls: 'https://arc.gt/leumz',
          slug: 'lydia-conversion-in-philippi/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7345-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Paul and Silas in Prison' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7345-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Paul and Silas in Prison' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Paul and Silas beaten and imprisoned for casting out a demon.'
          }
        ],
        slug: 'paul-and-silas-in-prison',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7345-0-0',
          duration: 369,
          hls: 'https://arc.gt/cpywt',
          slug: 'paul-and-silas-in-prison/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7346-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Riots in Thessalonica' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7346-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Riots in Thessalonica' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'False accusations cause riots in Thessalonica.'
          }
        ],
        slug: 'riots-in-thessalonica',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7346-0-0',
          duration: 92,
          hls: 'https://arc.gt/ft6sb',
          slug: 'riots-in-thessalonica/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7347-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Noble Bereans' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7347-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'The Noble Bereans' }],
        snippet: [
          { __typename: 'Translation', value: 'The gospel spreads in Berea.' }
        ],
        slug: 'the-noble-bereans',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7347-0-0',
          duration: 67,
          hls: 'https://arc.gt/tybyf',
          slug: 'the-noble-bereans/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7348-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Idols in Athens' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7348-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Idols in Athens' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul’s unique message to the Athenians.'
          }
        ],
        slug: 'idols-in-athens',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7348-0-0',
          duration: 232,
          hls: 'https://arc.gt/2kyn9',
          slug: 'idols-in-athens/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7349-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Division in Corinth' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7349-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Division in Corinth' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Belief and opposition in Corinth.'
          }
        ],
        slug: 'division-in-corinth',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7349-0-0',
          duration: 198,
          hls: 'https://arc.gt/jg5ml',
          slug: 'division-in-corinth/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7350-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Priscilla, Aquila, and Apollos' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7350-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Priscilla, Aquila, and Apollos' }
        ],
        snippet: [
          { __typename: 'Translation', value: 'Other Leaders in Ministry.' }
        ],
        slug: 'priscilla-aquila-and-apollos',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7350-0-0',
          duration: 110,
          hls: 'https://arc.gt/gtxno',
          slug: 'priscilla-aquila-and-apollos/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7351-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Paul in Ephesus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7351-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Paul in Ephesus' }],
        snippet: [
          { __typename: 'Translation', value: 'The gospel spreads in Ephesus.' }
        ],
        slug: 'paul-in-ephesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7351-0-0',
          duration: 191,
          hls: 'https://arc.gt/obzmd',
          slug: 'paul-in-ephesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7352-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Riot in Ephesus' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7352-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'The Riot in Ephesus' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Gospel effectiveness causes a riot!'
          }
        ],
        slug: 'the-riot-in-ephesus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7352-0-0',
          duration: 242,
          hls: 'https://arc.gt/4ekht',
          slug: 'the-riot-in-ephesus/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7353-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Through Macedonia and Greece' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7353-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Through Macedonia and Greece' }
        ],
        snippet: [
          { __typename: 'Translation', value: 'Taking the long road to Troas.' }
        ],
        slug: 'through-macedonia-and-greece',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7353-0-0',
          duration: 142,
          hls: 'https://arc.gt/qmg4z',
          slug: 'through-macedonia-and-greece/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7354-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Eutychus Raised From the Dead at Troas'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7354-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Eutychus Raised From the Dead at Troas'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Eutychus faints, falls dead and is revived.'
          }
        ],
        slug: 'eutychus-raised-from-the-dead-at-troas',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7354-0-0',
          duration: 89,
          hls: 'https://arc.gt/h4dgq',
          slug: 'eutychus-raised-from-the-dead-at-troas/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7355-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: "Paul's Farewell to the Ephesian Elders"
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7355-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: "Paul's Farewell to the Ephesian Elders"
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'A sorrowful goodbye to the Ephesians.'
          }
        ],
        slug: 'paul-farewell-to-the-ephesian-elders',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7355-0-0',
          duration: 314,
          hls: 'https://arc.gt/61481',
          slug: 'paul-farewell-to-the-ephesian-elders/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7356-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'On to Jerusalem' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7356-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'On to Jerusalem' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul says goodbye as he returns to Jerusalem.'
          }
        ],
        slug: 'on-to-jerusalem',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7356-0-0',
          duration: 149,
          hls: 'https://arc.gt/a6z0o',
          slug: 'on-to-jerusalem/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7357-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: "Paul's Arrival at Jerusalem" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7357-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Paul's Arrival at Jerusalem" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul’s return home causes concern.'
          }
        ],
        slug: 'paul-arrival-at-jerusalem',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7357-0-0',
          duration: 131,
          hls: 'https://arc.gt/0g5ds',
          slug: 'paul-arrival-at-jerusalem/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7358-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Paul Arrested' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7358-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Paul Arrested' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul is beaten by a mob and arrested by Romans.'
          }
        ],
        slug: 'paul-arrested',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7358-0-0',
          duration: 118,
          hls: 'https://arc.gt/alky5',
          slug: 'paul-arrested/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7359-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Paul Speaks to the Crowd' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7359-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Paul Speaks to the Crowd' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul gives a defense before the mob.'
          }
        ],
        slug: 'paul-speaks-to-the-crowd',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7359-0-0',
          duration: 299,
          hls: 'https://arc.gt/rhbd1',
          slug: 'paul-speaks-to-the-crowd/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7360-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Paul the Roman Citizen' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7360-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Paul the Roman Citizen' }
        ],
        snippet: [
          { __typename: 'Translation', value: 'The mob erupts against Paul.' }
        ],
        slug: 'paul-the-roman-citizen',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7360-0-0',
          duration: 102,
          hls: 'https://arc.gt/gmb52',
          slug: 'paul-the-roman-citizen/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7361-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Paul before the Sanhedrin' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7361-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Paul before the Sanhedrin' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'The Sanhedrin divide over Paul.'
          }
        ],
        slug: 'paul-before-the-sanhedrin',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7361-0-0',
          duration: 150,
          hls: 'https://arc.gt/q3rdx',
          slug: 'paul-before-the-sanhedrin/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7362-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Plot to Kill Paul' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7362-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'The Plot to Kill Paul' }
        ],
        snippet: [
          { __typename: 'Translation', value: '40 men plot to kill Paul.' }
        ],
        slug: 'the-plot-to-kill-paul',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7362-0-0',
          duration: 138,
          hls: 'https://arc.gt/rx19t',
          slug: 'the-plot-to-kill-paul/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7363-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Paul Transferred to Caesarea' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7363-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Paul Transferred to Caesarea' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul is escorted by soldiers to Caesarea.'
          }
        ],
        slug: 'paul-transferred-to-caesarea',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7363-0-0',
          duration: 113,
          hls: 'https://arc.gt/669vk',
          slug: 'paul-transferred-to-caesarea/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7364-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: "Paul's Trial Before Felix" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7364-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Paul's Trial Before Felix" }
        ],
        snippet: [
          { __typename: 'Translation', value: 'Both sides argue before Felix.' }
        ],
        slug: 'paul-trial-before-felix',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7364-0-0',
          duration: 277,
          hls: 'https://arc.gt/6x5a0',
          slug: 'paul-trial-before-felix/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7365-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: "Paul's Trial Before Festus" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7365-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Paul's Trial Before Festus" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Both sides argue before Festus.'
          }
        ],
        slug: 'paul-trial-before-festus',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7365-0-0',
          duration: 131,
          hls: 'https://arc.gt/bed5t',
          slug: 'paul-trial-before-festus/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7366-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Festus Consults King Agrippa' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7366-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Festus Consults King Agrippa' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Festus explains his view of Paul’s case.'
          }
        ],
        slug: 'festus-consults-king-agrippa',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7366-0-0',
          duration: 114,
          hls: 'https://arc.gt/9bry4',
          slug: 'festus-consults-king-agrippa/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7367-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Paul before Agrippa' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7367-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Paul before Agrippa' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul gives testimony before Agrippa and Festus.'
          }
        ],
        slug: 'paul-before-agrippa',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7367-0-0',
          duration: 426,
          hls: 'https://arc.gt/6zdye',
          slug: 'paul-before-agrippa/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7368-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Paul Sails for Rome' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7368-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Paul Sails for Rome' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Prisoner Paul and others sail towards Rome.'
          }
        ],
        slug: 'paul-sails-for-rome',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7368-0-0',
          duration: 128,
          hls: 'https://arc.gt/9za77',
          slug: 'paul-sails-for-rome/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7369-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Storm' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7369-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'The Storm' }],
        snippet: [{ __typename: 'Translation', value: 'Lost at sea.' }],
        slug: 'the-storm',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7369-0-0',
          duration: 133,
          hls: 'https://arc.gt/yr1x7',
          slug: 'the-storm/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7370-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'The Shipwreck' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7370-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'The Shipwreck' }],
        snippet: [
          {
            __typename: 'Translation',
            value: 'The ship finally runs aground and dissolves.'
          }
        ],
        slug: 'the-shipwreck',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7370-0-0',
          duration: 199,
          hls: 'https://arc.gt/qv694',
          slug: 'the-shipwreck/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7371-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'Paul Ashore on Malta' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7371-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Paul Ashore on Malta' }
        ],
        snippet: [
          { __typename: 'Translation', value: 'Survivors honored in Malta.' }
        ],
        slug: 'paul-ashore-on-malta',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7371-0-0',
          duration: 124,
          hls: 'https://arc.gt/yflll',
          slug: 'paul-ashore-on-malta/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7372-0-0',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'Paul Finally Reaches Rome' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7372-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Paul Finally Reaches Rome' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'The last three stops on the way to Rome.'
          }
        ],
        slug: 'paul-finally-reaches-rome',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7372-0-0',
          duration: 58,
          hls: 'https://arc.gt/qo40b',
          slug: 'paul-finally-reaches-rome/english'
        }
      },
      {
        __typename: 'Video',
        id: '2_Acts7373-0-0',
        label: VideoLabel.segment,
        title: [
          {
            __typename: 'Translation',
            value: 'Paul Preaches in Rome Under Guard'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7373-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Paul Preaches in Rome Under Guard'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value: 'Paul explains his situation to the locals.'
          }
        ],
        slug: 'paul-preaches-in-rome-under-guard',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '2_529-Acts7373-0-0',
          duration: 229,
          hls: 'https://arc.gt/e9esk',
          slug: 'paul-preaches-in-rome-under-guard/english'
        }
      }
    ]
  },
  {
    __typename: 'Video',
    id: '2_GOJ4904-0-0',
    label: VideoLabel.segment,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ4904-0-0.mobileCinematicHigh.jpg',
    imageAlt: [{ __typename: 'Translation', value: 'Wedding in Cana' }],
    snippet: [
      {
        __typename: 'Translation',
        value:
          'Jesus performs His first recorded miracle at a Wedding by transforming water into Wine.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          'Jesus performs His first recorded miracle at a Wedding by transforming water into Wine.'
      }
    ],
    studyQuestions: [
      { __typename: 'Translation', value: 'Who was affected by this miracle?' },
      {
        __typename: 'Translation',
        value: 'What does this first miracle tell you about Jesus?'
      }
    ],
    title: [{ __typename: 'Translation', value: 'Wedding in Cana' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '2_529-GOJ4904-0-0',
      duration: 213,
      hls: 'https://arc.gt/29cgr',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 5741430,
          url: 'https://arc.gt/5h7zk'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 65652285,
          url: 'https://arc.gt/fcuyv'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'wedding-in-cana/english'
    },
    slug: 'wedding-in-cana',
    children: []
  },
  {
    __typename: 'Video',
    id: 'LUMOCollection',
    label: VideoLabel.collection,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/LUMOCollection.mobileCinematicHigh.jpg',
    imageAlt: [{ __typename: 'Translation', value: 'LUMO' }],
    snippet: [{ __typename: 'Translation', value: 'LUMO content collection' }],
    description: [
      { __typename: 'Translation', value: 'LUMO content collection' }
    ],
    studyQuestions: [],
    title: [{ __typename: 'Translation', value: 'LUMO' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '529-LUMOCollection',
      duration: 0,
      hls: null,
      downloads: [],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'lumo/english'
    },
    slug: 'lumo',
    children: [
      {
        __typename: 'Video',
        id: 'GOJohnCollection',
        label: VideoLabel.collection,
        title: [
          { __typename: 'Translation', value: 'LUMO - The Gospel of John' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/GOJohnCollection.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - The Gospel of John' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "The Gospel of John is a word-for-word portrayal of the biblical text. This profound film sheds new light on one of history's most sacred texts. Beautifully shot and informed by the latest theological, historical, and archeological research, this film is something to be enjoyed and treasured.\n\nFor more information please visit - https://lumoproject.com\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project"
          }
        ],
        slug: 'lumo-the-gospel-of-john',
        children: [
          { __typename: 'Video', id: '6_GOJohn2201' },
          { __typename: 'Video', id: '6_GOJohn2202' },
          { __typename: 'Video', id: '6_GOJohn2203' },
          { __typename: 'Video', id: '6_GOJohn2204' },
          { __typename: 'Video', id: '6_GOJohn2205' },
          { __typename: 'Video', id: '6_GOJohn2206' },
          { __typename: 'Video', id: '6_GOJohn2207' },
          { __typename: 'Video', id: '6_GOJohn2208' },
          { __typename: 'Video', id: '6_GOJohn2209' },
          { __typename: 'Video', id: '6_GOJohn2210' },
          { __typename: 'Video', id: '6_GOJohn2211' },
          { __typename: 'Video', id: '6_GOJohn2212' },
          { __typename: 'Video', id: '6_GOJohn2213' },
          { __typename: 'Video', id: '6_GOJohn2214' },
          { __typename: 'Video', id: '6_GOJohn2215' },
          { __typename: 'Video', id: '6_GOJohn2216' },
          { __typename: 'Video', id: '6_GOJohn2217' },
          { __typename: 'Video', id: '6_GOJohn2218' },
          { __typename: 'Video', id: '6_GOJohn2219' },
          { __typename: 'Video', id: '6_GOJohn2220' },
          { __typename: 'Video', id: '6_GOJohn2221' },
          { __typename: 'Video', id: '6_GOJohn2222' }
        ],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '529-GOJohnCollection',
          duration: 0,
          hls: null,
          slug: 'lumo-the-gospel-of-john/english'
        }
      },
      {
        __typename: 'Video',
        id: 'GOLukeCollection',
        label: VideoLabel.collection,
        title: [
          { __typename: 'Translation', value: 'LUMO - The Gospel of Luke' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/GOLukeCollection.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - The Gospel of Luke' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Luke's Gospel, more than any other, fits the category of ancient biography. Luke acts as a 'narrator' of events rather than the conventional author, painting a picture of Jesus as a very human character, full of compassion for all the suffering world. Luke sees Jesus as the 'Savior' of all people irrespective of their beliefs, always on the side of the needy and the deprived against the rich and the powerful. He constantly challenges those in power for their self-righteousness. This film about the life of Jesus takes the actual Gospel text as it's script, word-for-word, unedited. Five years in the making, this epic production has been critically acclaimed by leading religious scholars as a unique and highly authentic telling of the Jesus story. \n \nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject"
          }
        ],
        slug: 'lumo-the-gospel-of-luke',
        children: [
          { __typename: 'Video', id: '6_GOLuke2601' },
          { __typename: 'Video', id: '6_GOLuke2602' },
          { __typename: 'Video', id: '6_GOLuke2603' },
          { __typename: 'Video', id: '6_GOLuke2604' },
          { __typename: 'Video', id: '6_GOLuke2605' },
          { __typename: 'Video', id: '6_GOLuke2606' },
          { __typename: 'Video', id: '6_GOLuke2607' },
          { __typename: 'Video', id: '6_GOLuke2608' },
          { __typename: 'Video', id: '6_GOLuke2609' },
          { __typename: 'Video', id: '6_GOLuke2610' },
          { __typename: 'Video', id: '6_GOLuke2611' },
          { __typename: 'Video', id: '6_GOLuke2612' },
          { __typename: 'Video', id: '6_GOLuke2613' },
          { __typename: 'Video', id: '6_GOLuke2614' },
          { __typename: 'Video', id: '6_GOLuke2615' },
          { __typename: 'Video', id: '6_GOLuke2616' },
          { __typename: 'Video', id: '6_GOLuke2617' },
          { __typename: 'Video', id: '6_GOLuke2618' },
          { __typename: 'Video', id: '6_GOLuke2619' },
          { __typename: 'Video', id: '6_GOLuke2620' },
          { __typename: 'Video', id: '6_GOLuke2621' },
          { __typename: 'Video', id: '6_GOLuke2622' },
          { __typename: 'Video', id: '6_GOLuke2623' },
          { __typename: 'Video', id: '6_GOLuke2624' },
          { __typename: 'Video', id: '6_GOLuke2625' },
          { __typename: 'Video', id: '6_GOLuke2626' }
        ],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '529-GOLukeCollection',
          duration: 0,
          hls: null,
          slug: 'lumo-the-gospel-of-luke/english'
        }
      },
      {
        __typename: 'Video',
        id: 'GOMarkCollection',
        label: VideoLabel.collection,
        title: [
          { __typename: 'Translation', value: 'LUMO - The Gospel of Mark' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/GOMarkCollection.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - The Gospel of Mark' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "According to THE GOSPEL OF MARK, Jesus is a heroic man of action, healer, and miracle worker - the Son of God who keeps his identity secret. This critically acclaimed, epic production - five years in the making - is based on the latest theological, historical, and archaeological research, and offers an unforgettable, highly authentic telling of the Jesus story - ending with the empty tomb, a promise to meet again in Galilee, and Jesus's instructions to spread the good news of the resurrection.\n\nFor more information please visit - https://lumoproject.com\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project"
          }
        ],
        slug: 'lumo-the-gospel-of-mark',
        children: [
          { __typename: 'Video', id: '6_GOMark1501' },
          { __typename: 'Video', id: '6_GOMark1502' },
          { __typename: 'Video', id: '6_GOMark1503' },
          { __typename: 'Video', id: '6_GOMark1504' },
          { __typename: 'Video', id: '6_GOMark1505' },
          { __typename: 'Video', id: '6_GOMark1506' },
          { __typename: 'Video', id: '6_GOMark1507' },
          { __typename: 'Video', id: '6_GOMark1508' },
          { __typename: 'Video', id: '6_GOMark1509' },
          { __typename: 'Video', id: '6_GOMark1510' },
          { __typename: 'Video', id: '6_GOMark1511' },
          { __typename: 'Video', id: '6_GOMark1512' },
          { __typename: 'Video', id: '6_GOMark1513' },
          { __typename: 'Video', id: '6_GOMark1514' },
          { __typename: 'Video', id: '6_GOMark1515' }
        ],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '529-GOMarkCollection',
          duration: 0,
          hls: null,
          slug: 'lumo-the-gospel-of-mark/english'
        }
      },
      {
        __typename: 'Video',
        id: 'GOMattCollection',
        label: VideoLabel.collection,
        title: [
          { __typename: 'Translation', value: 'LUMO - The Gospel of Matthew' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/GOMattCollection.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - The Gospel of Matthew' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The Gospel of Matthew begins by highlighting the royal genealogy of Jesus before disclosing who he is - the Messiah! The entire narrative gives insight into who Jesus is in a historical context and what that means for his followers. Watch and listen to gain a better understanding of the life of Jesus in this documentary style, word-for-word telling of the Gospel of Matthew.\n\nFor more information please visit - https://lumoproject.com\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-the-gospel-of-matthew',
        children: [
          { __typename: 'Video', id: '6_GOMatt2501' },
          { __typename: 'Video', id: '6_GOMatt2502' },
          { __typename: 'Video', id: '6_GOMatt2503' },
          { __typename: 'Video', id: '6_GOMatt2504' },
          { __typename: 'Video', id: '6_GOMatt2505' },
          { __typename: 'Video', id: '6_GOMatt2506' },
          { __typename: 'Video', id: '6_GOMatt2507' },
          { __typename: 'Video', id: '6_GOMatt2508' },
          { __typename: 'Video', id: '6_GOMatt2509' },
          { __typename: 'Video', id: '6_GOMatt2510' },
          { __typename: 'Video', id: '6_GOMatt2511' },
          { __typename: 'Video', id: '6_GOMatt2512' },
          { __typename: 'Video', id: '6_GOMatt2513' },
          { __typename: 'Video', id: '6_GOMatt2514' },
          { __typename: 'Video', id: '6_GOMatt2515' },
          { __typename: 'Video', id: '6_GOMatt2516' },
          { __typename: 'Video', id: '6_GOMatt2517' },
          { __typename: 'Video', id: '6_GOMatt2518' },
          { __typename: 'Video', id: '6_GOMatt2519' },
          { __typename: 'Video', id: '6_GOMatt2520' },
          { __typename: 'Video', id: '6_GOMatt2521' },
          { __typename: 'Video', id: '6_GOMatt2522' },
          { __typename: 'Video', id: '6_GOMatt2523' },
          { __typename: 'Video', id: '6_GOMatt2524' },
          { __typename: 'Video', id: '6_GOMatt2525' }
        ],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '529-GOMattCollection',
          duration: 0,
          hls: null,
          slug: 'lumo-the-gospel-of-matthew/english'
        }
      }
    ]
  },
  {
    __typename: 'Video',
    id: '2_Acts7331-0-0',
    label: VideoLabel.segment,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7331-0-0.mobileCinematicHigh.jpg',
    imageAlt: [
      {
        __typename: 'Translation',
        value: "Peter's Miraculous Escape From Prison"
      }
    ],
    snippet: [
      {
        __typename: 'Translation',
        value: 'Peter escapes "death row" with help from an angel.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value: 'Peter escapes "death row" with help from an angel.'
      }
    ],
    studyQuestions: [
      {
        __typename: 'Translation',
        value: 'What did you like best or what caught your attention?'
      },
      { __typename: 'Translation', value: 'Why?' },
      {
        __typename: 'Translation',
        value:
          'Herod also imprisoned John the Baptist. What happened to John? [See Matthew 14:1-12.]'
      },
      {
        __typename: 'Translation',
        value: 'How secure was Peter in prison? Any chance of escape?'
      },
      {
        __typename: 'Translation',
        value: 'How do you think the non-believers explained Peter’s escape?'
      }
    ],
    title: [
      {
        __typename: 'Translation',
        value: "Peter's Miraculous Escape From Prison"
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '2_529-Acts7331-0-0',
      duration: 298,
      hls: 'https://arc.gt/esnsq',
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
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'peter-miraculous-escape-from-prison/english'
    },
    slug: 'peter-miraculous-escape-from-prison',
    children: []
  },
  {
    __typename: 'Video',
    id: '3_0-8DWJ-WIJ',
    label: VideoLabel.series,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/3_0-8DWJ-WIJ.mobileCinematicHigh.jpg',
    imageAlt: [
      { __typename: 'Translation', value: '8 Days with Jesus: Who is Jesus?' }
    ],
    snippet: [
      {
        __typename: 'Translation',
        value:
          'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.\n\nAbout Days with Jesus:\nMentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specially designed to help users deepen their walk with Christ. "Days with Jesus" uses The JESUS Film, an already-successful means for reaching people with the Gospel, and unpacks it one step further. Each video segment from The JESUS Film is carefully selected to convey God’s message of truth, and each question has been deliberately chosen and worded. Our prayer for this series is that people would learn from Jesus how to be like Jesus.\n\n8 Days with Jesus: Who is Jesus? will introduce you to Jesus and who He is. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. \n\nVisit www.mentorlink.org for more information.'
      }
    ],
    studyQuestions: [],
    title: [
      { __typename: 'Translation', value: '8 Days with Jesus: Who is Jesus?' }
    ],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '3_529-0-8DWJ-WIJ',
      duration: 0,
      hls: null,
      downloads: [],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: '8-days-with-jesus-who-is-jesus/english'
    },
    slug: '8-days-with-jesus-who-is-jesus',
    children: [
      {
        __typename: 'Video',
        id: '3_0-8DWJ-WIJ_01-0-0',
        label: VideoLabel.episode,
        title: [
          { __typename: 'Translation', value: 'Day 1: Jesus is God Among Us' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/3_0-8DWJ-WIJ_01-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Day 1: Jesus is God Among Us' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
          }
        ],
        slug: 'day-1-jesus-is-god-among-us',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '3_529-0-8DWJ-WIJ_01-0-0',
          duration: 474,
          hls: 'https://arc.gt/t0ih0',
          slug: 'day-1-jesus-is-god-among-us/english'
        }
      },
      {
        __typename: 'Video',
        id: '3_0-8DWJ-WIJ_02-0-0',
        label: VideoLabel.episode,
        title: [
          { __typename: 'Translation', value: "Day 2: Jesus Taught God's Ways" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/3_0-8DWJ-WIJ_02-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Day 2: Jesus Taught God's Ways" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
          }
        ],
        slug: 'day-2-jesus-taught-god-ways',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '3_529-0-8DWJ-WIJ_02-0-0',
          duration: 353,
          hls: 'https://arc.gt/kev1l',
          slug: 'day-2-jesus-taught-god-ways/english'
        }
      },
      {
        __typename: 'Video',
        id: '3_0-8DWJ-WIJ_03-0-0',
        label: VideoLabel.episode,
        title: [
          { __typename: 'Translation', value: 'Day 3: Jesus Has All Power' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/3_0-8DWJ-WIJ_03-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Day 3: Jesus Has All Power' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
          }
        ],
        slug: 'day-3-jesus-has-all-power',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '3_529-0-8DWJ-WIJ_03-0-0',
          duration: 460,
          hls: 'https://arc.gt/vqxsj',
          slug: 'day-3-jesus-has-all-power/english'
        }
      },
      {
        __typename: 'Video',
        id: '3_0-8DWJ-WIJ_04-0-0',
        label: VideoLabel.episode,
        title: [
          { __typename: 'Translation', value: "Day 4: Jesus Is God's Son" }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/3_0-8DWJ-WIJ_04-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: "Day 4: Jesus Is God's Son" }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
          }
        ],
        slug: 'day-4-jesus-is-god-son',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '3_529-0-8DWJ-WIJ_04-0-0',
          duration: 300,
          hls: 'https://arc.gt/1dmvq',
          slug: 'day-4-jesus-is-god-son/english'
        }
      },
      {
        __typename: 'Video',
        id: '3_0-8DWJ-WIJ_05-0-0',
        label: VideoLabel.episode,
        title: [
          { __typename: 'Translation', value: 'Day 5: Jesus Suffered for Me' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/3_0-8DWJ-WIJ_05-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Day 5: Jesus Suffered for Me' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
          }
        ],
        slug: 'day-5-jesus-suffered-for-me',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '3_529-0-8DWJ-WIJ_05-0-0',
          duration: 568,
          hls: 'https://arc.gt/oawks',
          slug: 'day-5-jesus-suffered-for-me/english'
        }
      },
      {
        __typename: 'Video',
        id: '3_0-8DWJ-WIJ_06-0-0',
        label: VideoLabel.episode,
        title: [
          { __typename: 'Translation', value: 'Day 6: Jesus Died for Me' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/3_0-8DWJ-WIJ_06-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'Day 6: Jesus Died for Me' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
          }
        ],
        slug: 'day-6-jesus-died-for-me',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '3_529-0-8DWJ-WIJ_06-0-0',
          duration: 488,
          hls: 'https://arc.gt/xqav7',
          slug: 'day-6-jesus-died-for-me/english'
        }
      },
      {
        __typename: 'Video',
        id: '3_0-8DWJ-WIJ_07-0-0',
        label: VideoLabel.episode,
        title: [
          {
            __typename: 'Translation',
            value: 'Day 7: Jesus Rose from the Dead'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/3_0-8DWJ-WIJ_07-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          {
            __typename: 'Translation',
            value: 'Day 7: Jesus Rose from the Dead'
          }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
          }
        ],
        slug: 'day-7-jesus-rose-from-the-dead',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '3_529-0-8DWJ-WIJ_07-0-0',
          duration: 359,
          hls: 'https://arc.gt/abvki',
          slug: 'day-7-jesus-rose-from-the-dead/english'
        }
      },
      {
        __typename: 'Video',
        id: '3_0-8DWJ-WIJ_08-0-0',
        label: VideoLabel.episode,
        title: [{ __typename: 'Translation', value: 'Day 8: Invitation' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/3_0-8DWJ-WIJ_08-0-0.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'Day 8: Invitation' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'MentorLink International and The JESUS Film Project have partnered to develop "Days with Jesus", a series of innovative tools specifically designed to help users deepen their walk with Christ. "Days with Jesus" delivers video clips from The JESUS Film along with thought-provoking questions designed to challenge and transform a person’s heart, character, values and motives. Take this opportunity to enhance and deepen your understanding of Jesus, the Son of God. Visit www.mentorlink.org for more information.'
          }
        ],
        slug: 'day-8-invitation',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '3_529-0-8DWJ-WIJ_08-0-0',
          duration: 366,
          hls: 'https://arc.gt/oj8qd',
          slug: 'day-8-invitation/english'
        }
      }
    ]
  },
  {
    __typename: 'Video',
    id: '2_ChosenWitness',
    label: VideoLabel.shortFilm,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_ChosenWitness.mobileCinematicHigh.jpg?version=2',
    imageAlt: [{ __typename: 'Translation', value: 'Chosen Witness' }],
    snippet: [
      {
        __typename: 'Translation',
        value:
          "An unlikely woman's life is dramatically transformed by a man who will soon change the world forever. In this animated short film, experience the life of Jesus through the eyes of one of his followers, Mary Magdalene."
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          "An unlikely woman's life is dramatically transformed by a man who will soon change the world forever. In this animated short film, experience the life of Jesus through the eyes of one of his followers, Mary Magdalene."
      }
    ],
    studyQuestions: [
      {
        __typename: 'Translation',
        value:
          'In what ways do you identify with the main character, Mary Magdalene?'
      },
      {
        __typename: 'Translation',
        value: "Why do you think the elders didn't approve of Jesus?"
      },
      {
        __typename: 'Translation',
        value:
          'After his resurrection, why do you think Jesus chose to speak first with Mary?'
      },
      {
        __typename: 'Translation',
        value:
          'How do you respond to the life of Jesus? What emotions come to mind, and why?'
      }
    ],
    title: [{ __typename: 'Translation', value: 'Chosen Witness' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '2_529-ChosenWitness',
      duration: 566,
      hls: 'https://arc.gt/3mcdc',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 15193611,
          url: 'https://arc.gt/gkvqh'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 172701431,
          url: 'https://arc.gt/6vvi2'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'chosen-witness/english'
    },
    slug: 'chosen-witness',
    children: []
  },
  {
    __typename: 'Video',
    id: 'GOLukeCollection',
    label: VideoLabel.collection,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/GOLukeCollection.mobileCinematicHigh.jpg',
    imageAlt: [
      { __typename: 'Translation', value: 'LUMO - The Gospel of Luke' }
    ],
    snippet: [
      {
        __typename: 'Translation',
        value:
          "Luke's Gospel, more than any other, fits the category of ancient biography. Luke acts as a 'narrator' of events rather than the conventional author, painting a picture of Jesus as a very human character, full of compassion for all the suffering world. Luke sees Jesus as the 'Savior' of all people irrespective of their beliefs, always on the side of the needy and the deprived against the rich and the powerful. He constantly challenges those in power for their self-righteousness. This film about the life of Jesus takes the actual Gospel text as it's script, word-for-word, unedited. Five years in the making, this epic production has been critically acclaimed by leading religious scholars as a unique and highly authentic telling of the Jesus story. \n \nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject"
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          "Luke's Gospel, more than any other, fits the category of ancient biography. Luke acts as a 'narrator' of events rather than the conventional author, painting a picture of Jesus as a very human character, full of compassion for all the suffering world. Luke sees Jesus as the 'Savior' of all people irrespective of their beliefs, always on the side of the needy and the deprived against the rich and the powerful. He constantly challenges those in power for their self-righteousness. This film about the life of Jesus takes the actual Gospel text as it's script, word-for-word, unedited. Five years in the making, this epic production has been critically acclaimed by leading religious scholars as a unique and highly authentic telling of the Jesus story. \n \nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject"
      }
    ],
    studyQuestions: [],
    title: [{ __typename: 'Translation', value: 'LUMO - The Gospel of Luke' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '529-GOLukeCollection',
      duration: 0,
      hls: null,
      downloads: [],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'lumo-the-gospel-of-luke/english'
    },
    slug: 'lumo-the-gospel-of-luke',
    children: [
      {
        __typename: 'Video',
        id: '6_GOLuke2601',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 1:1-56' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2601.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 1:1-56' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Introduction (1:1-4)\nThe Birth of John the Baptist Foretold (1:5-25)\nThe Birth of Jesus Foretold (1:26-38)\nMary Visits Elizabeth (1:39-45)\nMary's Song (1:46-56)\n\nFor more information please visit - https://lumoproject.com\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project"
          }
        ],
        slug: 'lumo-luke-1-1-56',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2601',
          duration: 589,
          hls: 'https://arc.gt/u32wu',
          slug: 'lumo-luke-1-1-56/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2602',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 1:57-2:40' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2602.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - Luke 1:57-2:40' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "The Birth of John the Baptist (1:57-66)\nZechariah's Song (1:67-80)\nThe Birth of Jesus (2:1-21)\nJesus Presented in the Temple (2:22-40)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project"
          }
        ],
        slug: 'lumo-luke-1-57-2-40',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2602',
          duration: 569,
          hls: 'https://arc.gt/2b5gh',
          slug: 'lumo-luke-1-57-2-40/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2603',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 2:41-3:38' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2603.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - Luke 2:41-3:38' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The Boy Jesus at the Temple (2:41-52)\nJohn the Baptist Prepares the Way (3:1-20)\nThe Baptism and Genealogy of Jesus (3:21-38)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-2-41-3-38',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2603',
          duration: 498,
          hls: 'https://arc.gt/au7dx',
          slug: 'lumo-luke-2-41-3-38/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2604',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 4:1-44' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2604.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 4:1-44' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus Tested in the Wilderness (4:1-13)\nJesus Rejected at Nazareth (4:14-30)\nJesus Drives Out an Impure Spirit (4:31-37)\nJesus Heals Many (4:38-44)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-4-1-44',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2604',
          duration: 462,
          hls: 'https://arc.gt/fc93c',
          slug: 'lumo-luke-4-1-44/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2605',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 5:1-39' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2605.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 5:1-39' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus Calls His First Disciples (5:1-11)\nJesus Heals a Man With Leprosy (5:12-16)\nJesus Forgives and Heals a Paralyzed Man (5:17-26)\nJesus Calls Levi and Eats With Sinners (5:27-32)\nJesus Questioned About Fasting (5:33-39)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-5-1-39',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2605',
          duration: 504,
          hls: 'https://arc.gt/z2vgh',
          slug: 'lumo-luke-5-1-39/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2606',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 6:1-49' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2606.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 6:1-49' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus Is Lord of the Sabbath (6:1-11)\nThe Twelve Apostles (6:12-16)\nBlessings and Woes (6:17-26)\nLove for Enemies (6:27-36)\nJudging Others (6:37-42)\nA Tree and Its Fruit (6:43-45)\nThe Wise and Foolish Builders (6:46-49)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-6-1-49',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2606',
          duration: 557,
          hls: 'https://arc.gt/5maud',
          slug: 'lumo-luke-6-1-49/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2607',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 7:1-50' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2607.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 7:1-50' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "The Faith of the Centurion (7:1-10)\nJesus Raises a Widow's Son (7:11-17)\nJesus and John the Baptist (7:18-35)\nJesus Anointed by a Sinful Woman (7:36-50)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project"
          }
        ],
        slug: 'lumo-luke-7-1-50',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2607',
          duration: 566,
          hls: 'https://arc.gt/p1hfg',
          slug: 'lumo-luke-7-1-50/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2608',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 8:1-39' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2608.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 8:1-39' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "The Parable of the Sower (8:1-15)\nA Lamp on a Stand (8:16-18)\nJesus' Mother and Brothers (8:19-21)\nJesus Calms the Storm (8:22-25)\nJesus Restores a Demon-Possessed Man (8:26-39)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project"
          }
        ],
        slug: 'lumo-luke-8-1-39',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2608',
          duration: 512,
          hls: 'https://arc.gt/k82tz',
          slug: 'lumo-luke-8-1-39/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2609',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 8:40-9:17' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2609.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - Luke 8:40-9:17' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus Raises a Dead Girl and Heals a Sick Woman (8:40-56)\nJesus Sends Out the Twelve (9:1-9)\nJesus Feeds the Five Thousand (9:10-17)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-8-40-9-17',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2609',
          duration: 392,
          hls: 'https://arc.gt/6ju4l',
          slug: 'lumo-luke-8-40-9-17/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2610',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 9:18-62' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2610.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 9:18-62' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Peter Declares That Jesus Is the Messiah (9:18-20)\nJesus Predicts His Death (9:21-27)\nThe Transfiguration (9:28-36)\nJesus Heals a Demon-Possessed Boy (9:37-43)\nJesus Predicts His Death a Second Time (9:44-50)\nSamaritan Opposition (9:51-56)\nThe Cost of Following Jesus (9:57-62)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-9-18-62',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2610',
          duration: 522,
          hls: 'https://arc.gt/8netz',
          slug: 'lumo-luke-9-18-62/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2611',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 10:1-42' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2611.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 10:1-42' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus Sends Out the Seventy-Two (10:1-24)\nThe Parable of Good Samaritan (10:25-37)\nAt the Home of Martha and Mary (10:38-42)\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-10-1-42',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2611',
          duration: 471,
          hls: 'https://arc.gt/6ubai',
          slug: 'lumo-luke-10-1-42/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2612',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 11:1-54' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2612.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 11:1-54' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus' Teaching on Prayer (11:1-13)\nJesus and Beelzebul (11:14-28)\nThe Sign of Jonah (11:29-32)\nThe Lamp of the Body (11:33-36)\nWoes on the Pharisees and the Experts in the Law (11:37-54)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project"
          }
        ],
        slug: 'lumo-luke-11-1-54',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2612',
          duration: 571,
          hls: 'https://arc.gt/7vrkg',
          slug: 'lumo-luke-11-1-54/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2613',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 12:1-59' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2613.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 12:1-59' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Warning and Encouragements (12:1-12)\nThe Parable of the Rich Fool (12:13-21)\nDo Not Worry (12:22-34)\nWatchfulness (12:35-48)\nNot Peace But Division (12:49-53)\nInterpreting the Times (12:54-59)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-12-1-59',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2613',
          duration: 559,
          hls: 'https://arc.gt/aemhe',
          slug: 'lumo-luke-12-1-59/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2614',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 13:1-35' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2614.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 13:1-35' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Repent or Perish (13:1-9)\nJesus Heals a Crippled Woman on the Sabbath (13:10-17)\nThe Parables of the Mustard Seed and the Yeast (13:18-21)\nThe Narrow Door (13:22-30)\nJesus' Sorrow for Jerusalem (13:31-35)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project"
          }
        ],
        slug: 'lumo-luke-13-1-35',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2614',
          duration: 401,
          hls: 'https://arc.gt/dr554',
          slug: 'lumo-luke-13-1-35/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2615',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 14:1-15:10' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2615.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - Luke 14:1-15:10' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "Jesus at a Pharisee's House (14:1-14)\nThe Parable of the Great Banquet (14:15-24)\nThe Cost of Being a Disciple (14:25-35)\nThe Parable of the Lost Sheep (15:1-7)\nThe Parable of the Lost Coin (15:8-10)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project"
          }
        ],
        slug: 'lumo-luke-14-1-15-10',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2615',
          duration: 456,
          hls: 'https://arc.gt/q1b8f',
          slug: 'lumo-luke-14-1-15-10/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2616',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'LUMO - Luke 15:11-16:31' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2616.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - Luke 15:11-16:31' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The Parable of the Lost Son (15:11-32)\nThe Parable of the Shrewd Manager (16:1-15)\nAdditional Teachings (16:16-18)\nThe Rich Man and Lazarus (16:19-31)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-15-11-16-31',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2616',
          duration: 560,
          hls: 'https://arc.gt/ilq90',
          slug: 'lumo-luke-15-11-16-31/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2617',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 17:1-18:8' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2617.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - Luke 17:1-18:8' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Sin, Faith, Duty (17:1-10)\nJesus Heals Ten Men With Leprosy (17:11-19)\nThe Coming of the Kingdom of God (17:20-37)\nThe Parable of the Persistent Widow (18:1-8)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-17-1-18-8',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2617',
          duration: 426,
          hls: 'https://arc.gt/pgarl',
          slug: 'lumo-luke-17-1-18-8/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2618',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 18:9-43' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2618.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 18:9-43' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The Parable of the Pharisee and the Tax Collector (18:9-14)\nThe Little Children and Jesus (18:15-17)\nThe Rich and the Kingdom of God (18:18-30)\nJesus Predicts His Death a Third Time (18:31-34)\nA Blind Beggar Receives His Sight (18:35-43)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-18-9-43',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2618',
          duration: 337,
          hls: 'https://arc.gt/uu5v0',
          slug: 'lumo-luke-18-9-43/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2619',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 19:1-44' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2619.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 19:1-44' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Zacchaeus the Tax Collector (19:1-10)\nThe Parable of the Ten Minas (19:11-27)\nJesus Comes to Jerusalem as King (19:28-44)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-19-1-44',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2619',
          duration: 368,
          hls: 'https://arc.gt/evb0i',
          slug: 'lumo-luke-19-1-44/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2620',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'LUMO - Luke 19:45-20:47' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2620.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - Luke 19:45-20:47' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus at the Temple (19:45-48)\nThe Authority of Jesus Questioned (20:1-8)\nThe Parable of the Tenants (20:9-19)\nPaying Taxes to Caesar (20:20-26)\nThe Resurrection and Marriage (20:27-40)\nWhose Son is the Messiah? (20:41-44)\nWarning Against the Teachers of the Law (20:45-47)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-19-45-20-47',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2620',
          duration: 500,
          hls: 'https://arc.gt/wde7d',
          slug: 'lumo-luke-19-45-20-47/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2621',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 21:1-36' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2621.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 21:1-36' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "The Widow's Offering (21:1-4)\nThe Destruction of the Temple and Signs of the End Times (21:5-36)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project"
          }
        ],
        slug: 'lumo-luke-21-1-36',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2621',
          duration: 345,
          hls: 'https://arc.gt/vezpq',
          slug: 'lumo-luke-21-1-36/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2622',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'LUMO - Luke 21:37-22:38' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2622.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - Luke 21:37-22:38' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Introduction (21:37-38)\nJudas Agrees to Betray Jesus (22:1-6)\nThe Last Supper (22:7-38)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-21-37-22-38',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2622',
          duration: 381,
          hls: 'https://arc.gt/6r72l',
          slug: 'lumo-luke-21-37-22-38/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2623',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'LUMO - Luke 22:39-23:25' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2623.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - Luke 22:39-23:25' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus Prays on the Mount of Olives (22:39-46)\nJesus Arrested (22:47-53)\nPeter Disowns Jesus (22:54-62)\nThe Guards Mock Jesus (22:63-65)\nJesus Before Pilate and Herod (22:66-23:25)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-22-39-23-25',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2623',
          duration: 552,
          hls: 'https://arc.gt/fu2n2',
          slug: 'lumo-luke-22-39-23-25/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2624',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 23:26-56' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2624.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - Luke 23:26-56' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'The Crucifixion of Jesus (23:26-43)\nThe Death of Jesus (23:44-49)\nThe Burial of Jesus (23:50-56)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-23-26-56',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2624',
          duration: 387,
          hls: 'https://arc.gt/7ntzj',
          slug: 'lumo-luke-23-26-56/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2625',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'LUMO - Luke 24:1-53' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2625.mobileCinematicHigh.jpg',
        imageAlt: [{ __typename: 'Translation', value: 'LUMO - Luke 24:1-53' }],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'Jesus is Risen (24:1-12)\nOn the Road to Emmaus (24:13-35)\nJesus Appears to the Disciples (24:36-49)\nThe Ascension of Jesus (24:50-53)\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-24-1-53',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2625',
          duration: 530,
          hls: 'https://arc.gt/y5vu6',
          slug: 'lumo-luke-24-1-53/english'
        }
      },
      {
        __typename: 'Video',
        id: '6_GOLuke2626',
        label: VideoLabel.segment,
        title: [
          { __typename: 'Translation', value: 'LUMO - Luke End Credits' }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/6_GOLuke2626.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'LUMO - Luke End Credits' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              'End Credits\n\nFor more information please visit: https://lumoproject.com/\nFollow us on Facebook - https://www.facebook.com/thelumoproject\nFollow us on Twitter - https://twitter.com/TheLumoProject\nFollow us on Instragram - https://www.instagram.com/lumo.project'
          }
        ],
        slug: 'lumo-luke-end-credits',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '6_529-GOLuke2626',
          duration: 205,
          hls: 'https://arc.gt/0swho',
          slug: 'lumo-luke-end-credits/english'
        }
      }
    ]
  },
  {
    __typename: 'Video',
    id: '1_cl1309-0-0',
    label: VideoLabel.episode,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl1309-0-0.mobileCinematicHigh.jpg',
    imageAlt: [
      { __typename: 'Translation', value: 'StoryClubs: Jesus and Zacchaeus' }
    ],
    snippet: [
      {
        __typename: 'Translation',
        value:
          "Jesus enters the town surrounded by crowds pushing in on Him. Zacchaeus, a short man, tries to see Jesus. But he can't see above the crowds or get through them. He climbs a tree. Jesus calls out to him."
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          "Jesus enters the town surrounded by crowds pushing in on Him. Zacchaeus, a short man, tries to see Jesus. But he can't see above the crowds or get through them. He climbs a tree. Jesus calls out to him.\n\nHe tells Zacchaeus to come down from the tree because He wants to have dinner with him. People are appalled. Zacchaeus is the town tax collector. But Zacchaeus is more than happy. He comes down from the tree and leads the way.\n\nTo download the entire lesson, go to: http://katw-kidstory.com/download/english-kidstory-jesus-film-lessons/"
      }
    ],
    studyQuestions: [
      {
        __typename: 'Translation',
        value: 'What part of the story did you really like?'
      },
      {
        __typename: 'Translation',
        value:
          'If Jesus asked to come to your house, how would you respond?  How would that make you feel?  What would you do with him while He was there?'
      },
      {
        __typename: 'Translation',
        value:
          'Zacchaeus wanted to get as close as he could to see Jesus.  Why would he do that?  Why would you want to be close to Jesus?'
      },
      {
        __typename: 'Translation',
        value:
          'How can we get close to Jesus today?  (This would be a good opportunity to give children an opportunity to become Christ followers.)'
      },
      {
        __typename: 'Translation',
        value: 'Something I learned about God is ________.'
      },
      {
        __typename: 'Translation',
        value:
          'From what you learned today, what do you feel God is asking you to do?'
      }
    ],
    title: [
      { __typename: 'Translation', value: 'StoryClubs: Jesus and Zacchaeus' }
    ],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '1_529-cl1309-0-0',
      duration: 124,
      hls: 'https://arc.gt/2174d',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 3306004,
          url: 'https://arc.gt/v21pv'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 38139266,
          url: 'https://arc.gt/fd0p5'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'storyclubs-jesus-and-zacchaeus/english'
    },
    slug: 'storyclubs-jesus-and-zacchaeus',
    children: []
  },
  {
    __typename: 'Video',
    id: '1_jf6102-0-0',
    label: VideoLabel.segment,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6102-0-0.mobileCinematicHigh.jpg',
    imageAlt: [{ __typename: 'Translation', value: 'Birth of Jesus' }],
    snippet: [
      {
        __typename: 'Translation',
        value:
          'Luke makes his introduction as the careful author of this Gospel. The angel Gabriel appears to Mary, a virgin in Nazareth. He announces to her that she has found favor with God and will give birth to Jesus, the Son of God.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          "Luke makes his introduction as the careful author of this Gospel. The angel Gabriel appears to Mary, a virgin in Nazareth. He announces to her that she has found favor with God and will give birth to Jesus, the Son of God.\n\nThrough Jesus' birth, prophecies are fulfilled by the arrangement of events. God leaves no detail unnoticed. The same can be said of our own lives."
      }
    ],
    studyQuestions: [
      {
        __typename: 'Translation',
        value: 'How does Mary respond to the angel?'
      },
      {
        __typename: 'Translation',
        value: 'How does Jesus happen to be born in Bethlehem?'
      },
      {
        __typename: 'Translation',
        value: 'Who are the first to know and tell of the birth of Jesus? Why?'
      }
    ],
    title: [{ __typename: 'Translation', value: 'Birth of Jesus' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '1_529-jf6102-0-0',
      duration: 223,
      hls: 'https://arc.gt/ijec5',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 5928704,
          url: 'https://arc.gt/hgxom'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 68130346,
          url: 'https://arc.gt/9lrr6'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'birth-of-jesus/english'
    },
    slug: 'birth-of-jesus',
    children: []
  },
  {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    label: VideoLabel.shortFilm,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
    imageAlt: [{ __typename: 'Translation', value: '#FallingPlates' }],
    snippet: [
      {
        __typename: 'Translation',
        value:
          '#FallingPlates leads through a series of visual metaphors: creation, the fall, Christ’s coming and resurrection, redemption, and our salvation. The video ends with Jesus asking you to respond to His life altering question, “Will you follow me?”.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          '#FallingPlates leads through a series of visual metaphors: creation, the fall, Christ’s coming and resurrection, redemption, and our salvation. The video ends with Jesus asking you to respond to His life altering question, “Will you follow me?”.\n\n#FallingPlates is an award winning short film about life, death & love of a Savior. It’s a flying 4 minute video depiction of the Gospel message with viral momentum (over 4 million views).\n\nAfter you showing the #FallingPlates video to a friend, ask: “Sometime, I’d like to hear more about your spiritual journey... would you be up for that?” And, during that conversation (or in the next one) you will ask if you can meet to hear his or her story.\n\nAn Easy Approach...\nExplore Past Experiences: Where they’ve been\n- What was your religious background as a child?\n- What have you tried in your spiritual journey since?\n\nExplore Present Attitudes: Where they are\n- Where are you now in your spiritual journey?\n- How has your search left you feeling?\n\nExplore Future Direction: Where they are going\n- Do you think you are moving toward God, away from God, or staying about the same?\n- On a scale of 1-10, how would you rate your desire to know God personally?\n- Proceed with sharing the Gospel.\n\nContinue the Conversation: http://www.fallingplates.com/ \n\nTRANSLATION requests for this video email: FallingPlatesVideo@gmail.com'
      }
    ],
    studyQuestions: [
      {
        __typename: 'Translation',
        value:
          'Life is portrayed as falling plates. What do you think about that?'
      },
      {
        __typename: 'Translation',
        value:
          'Everyone is on a spiritual journey. Where do you think you are on that journey?'
      },
      {
        __typename: 'Translation',
        value:
          'Do you think you are moving toward God, away from God, or staying about the same?'
      },
      {
        __typename: 'Translation',
        value: 'Would you like to hear how you can know God personally?'
      }
    ],
    title: [{ __typename: 'Translation', value: '#FallingPlates' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '2_529-0-FallingPlates',
      duration: 247,
      hls: 'https://arc.gt/zbrvj',
      downloads: [],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'fallingplates/english'
    },
    slug: 'fallingplates',
    children: []
  },
  {
    __typename: 'Video',
    id: '2_Acts7345-0-0',
    label: VideoLabel.segment,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7345-0-0.mobileCinematicHigh.jpg',
    imageAlt: [
      { __typename: 'Translation', value: 'Paul and Silas in Prison' }
    ],
    snippet: [
      {
        __typename: 'Translation',
        value: 'Paul and Silas beaten and imprisoned for casting out a demon.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value: 'Paul and Silas beaten and imprisoned for casting out a demon.'
      }
    ],
    studyQuestions: [
      {
        __typename: 'Translation',
        value: 'What did you like best or what caught your attention?'
      },
      { __typename: 'Translation', value: 'Why?' },
      {
        __typename: 'Translation',
        value:
          'Paul cast out a demon. Why did he go to jail? Was this charge correct?'
      },
      {
        __typename: 'Translation',
        value:
          'How did God resolve the problem? Do you think this is what Paul prayed for in verse 25?'
      }
    ],
    title: [{ __typename: 'Translation', value: 'Paul and Silas in Prison' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '2_529-Acts7345-0-0',
      duration: 369,
      hls: 'https://arc.gt/cpywt',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 9982369,
          url: 'https://arc.gt/9uhpf'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 113616766,
          url: 'https://arc.gt/6n6h0'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'paul-and-silas-in-prison/english'
    },
    slug: 'paul-and-silas-in-prison',
    children: []
  },
  {
    __typename: 'Video',
    id: '1_mld-0-0',
    label: VideoLabel.shortFilm,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_mld-0-0.mobileCinematicHigh.jpg',
    imageAlt: [{ __typename: 'Translation', value: 'My Last Day' }],
    snippet: [
      {
        __typename: 'Translation',
        value:
          'In a beautiful animé style, a prisoner watches as Jesus gets flogged in Pilate’s courtyard. He remembers Jesus teaching and wonders why they’re hurting an innocent man. Horrified, he remembers his own crime.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          "In a beautiful animé style, a prisoner watches as Jesus gets flogged in Pilate's courtyard. He remembers Jesus teaching and wonders why they're hurting an innocent man. Horrified, he remembers his own crime.\n\nThe crowds in the courtyard scream for Jesus to be crucified. The thief, another man, and Jesus are loaded with the beams for their crosses and march to Golgotha. \n\nThey arrive and nails are driven through their wrists. Each man is hung on a cross, their feet nailed to a wooden shelf.Our thief claims Jesus is the Messiah and asks that Jesus remember him. Jesus promises him they will be in paradise together that day. A dark storm overwhelms the hill and Jesus dies.\n\nThe thief passes away with a gasp and sees Jesus in a beautiful place."
      }
    ],
    studyQuestions: [
      {
        __typename: 'Translation',
        value: 'What message do you get from this story?'
      },
      {
        __typename: 'Translation',
        value: 'How do you deal with things you feel guilty about?'
      },
      {
        __typename: 'Translation',
        value:
          'What do you think about the idea of being with Jesus in paradise?'
      }
    ],
    title: [{ __typename: 'Translation', value: 'My Last Day' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '1_529-mld-0-0',
      duration: 554,
      hls: 'https://arc.gt/1b10x',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 14955855,
          url: 'https://arc.gt/zquza'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 170469865,
          url: 'https://arc.gt/xcf7k'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'my-last-day/english'
    },
    slug: 'my-last-day',
    children: [
      {
        __typename: 'Video',
        id: '1_mld11-0-0',
        label: VideoLabel.segment,
        title: [{ __typename: 'Translation', value: 'My Last Day - Trailer' }],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_mld11-0-0.mobileCinematicHigh.jpg',
        imageAlt: [
          { __typename: 'Translation', value: 'My Last Day - Trailer' }
        ],
        snippet: [
          {
            __typename: 'Translation',
            value:
              "In this Japanese-style animation, a criminal reflects on his crime as he witnesses the brutal beating of Christ. Ultimately receiving the same crucifixion sentence as Christ, his own guilt causes him to realize Christ's innocence."
          }
        ],
        slug: 'my-last-day-trailer',
        children: [],
        variant: {
          __typename: 'VideoVariant',
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: false
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: true
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ],
          id: '1_529-mld11-0-0',
          duration: 124,
          hls: 'https://arc.gt/qamjc',
          slug: 'my-last-day-trailer/english'
        }
      }
    ]
  },
  {
    __typename: 'Video',
    id: '1_jf6101-0-0',
    label: VideoLabel.segment,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
    imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
    snippet: [
      {
        __typename: 'Translation',
        value:
          'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
      }
    ],
    description: [
      {
        __typename: 'Translation',
        value:
          'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.\n\nAll of creation speaks of the majesty of God. As God created man and woman he intended them to live in peace with him forever. But because of their disobedience mankind was separated from God. But God still loved mankind so throughout the Scriptures God reveals his plan to save the world.'
      }
    ],
    studyQuestions: [],
    title: [{ __typename: 'Translation', value: 'The Beginning' }],
    variant: {
      __typename: 'VideoVariant',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: false
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: true
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      id: '1_529-jf6101-0-0',
      duration: 488,
      hls: 'https://arc.gt/pm6g1',
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 13138402,
          url: 'https://arc.gt/ist3s'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 149736452,
          url: 'https://arc.gt/zxqki'
        }
      ],
      language: {
        __typename: 'Language',
        id: '529',
        name: [{ __typename: 'Translation', value: 'English' }]
      },
      slug: 'the-beginning/english'
    },
    slug: 'the-beginning',
    children: []
  }
]
