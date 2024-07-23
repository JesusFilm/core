import { Hit } from 'instantsearch.js'
import { CurrentRefinementsConnectorParamsItem } from 'instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements'
import { AlgoliaJourney } from './useAlgoliaJourneys'

export const algoliaJourneys = [
  {
    title: 'onboarding template3',
    date: '2024-07-09T00:37:24.569Z',
    description: 'template-id-3',
    image: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    },
    featuredAt: null,
    language: {
      localName: '',
      nativeName: 'English',
      continents: [
        'Asia',
        'North America',
        'Oceania',
        'Africa',
        'South America',
        'Europe'
      ]
    },
    tags: {
      Topics: ['Anger'],
      'Felt Needs': ['Depression'],
      Holidays: ['Easter']
    },
    objectID: 'template-id-3',
    _highlightResult: {
      title: {
        value: 'onboarding template3',
        matchLevel: 'none',
        matchedWords: []
      },
      description: {
        value: 'template-id-3',
        matchLevel: 'none',
        matchedWords: []
      },
      language: {
        localName: {
          value: '',
          matchLevel: 'none',
          matchedWords: []
        },
        nativeName: {
          value: 'English',
          matchLevel: 'none',
          matchedWords: []
        },
        continents: [
          {
            value: 'Asia',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'North America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Oceania',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Africa',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'South America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Europe',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      },
      tags: {
        Topics: [
          {
            value: 'Anger',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        'Felt Needs': [
          {
            value: 'Depression',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        Holidays: [
          {
            value: 'Easter',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      }
    },
    __position: 1
  },
  {
    title: 'onboarding template2',
    date: '2024-07-09T00:37:24.569Z',
    description: 'template-id-2',
    image: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    },
    featuredAt: null,
    language: {
      localName: 'Farsi, Western',
      nativeName: 'فارسی',
      continents: ['Asia', 'Europe', 'Oceania', 'North America']
    },
    tags: {
      'Felt Needs': [
        'Acceptance',
        'Anxiety',
        'Depression',
        'Fear/Power',
        'Forgiveness',
        'Guilt/Righteousness'
      ]
    },
    objectID: 'template-id-2',
    _highlightResult: {
      title: {
        value: 'onboarding template2',
        matchLevel: 'none',
        matchedWords: []
      },
      description: {
        value: 'template-id-2',
        matchLevel: 'none',
        matchedWords: []
      },
      language: {
        localName: {
          value: 'Farsi, Western',
          matchLevel: 'none',
          matchedWords: []
        },
        nativeName: {
          value: 'فارسی',
          matchLevel: 'none',
          matchedWords: []
        },
        continents: [
          {
            value: 'Asia',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Europe',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Oceania',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'North America',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      },
      tags: {
        'Felt Needs': [
          {
            value: 'Acceptance',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Anxiety',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Depression',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Fear/Power',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Forgiveness',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Guilt/Righteousness',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      }
    },
    __position: 2
  },
  {
    title: 'Dev Onboarding Journey',
    date: '2024-07-09T00:37:24.547Z',
    description:
      'Only used for development and staging. Production should use actual onboarding journey.',
    image: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    },
    featuredAt: null,
    language: {
      localName: '',
      nativeName: 'English',
      continents: [
        'Asia',
        'North America',
        'Oceania',
        'Africa',
        'South America',
        'Europe'
      ]
    },
    tags: {},
    objectID: 'template-id',
    _highlightResult: {
      title: {
        value: 'Dev Onboarding Journey',
        matchLevel: 'none',
        matchedWords: []
      },
      description: {
        value:
          'Only used for development and staging. Production should use actual onboarding journey.',
        matchLevel: 'none',
        matchedWords: []
      },
      language: {
        localName: {
          value: '',
          matchLevel: 'none',
          matchedWords: []
        },
        nativeName: {
          value: 'English',
          matchLevel: 'none',
          matchedWords: []
        },
        continents: [
          {
            value: 'Asia',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'North America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Oceania',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Africa',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'South America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Europe',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      }
    },
    __position: 3
  },
  {
    title: 'onboarding template4',
    date: '2024-07-09T00:37:24.569Z',
    description: 'template-id-4',
    image: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    },
    featuredAt: null,
    language: {
      localName: 'Georgian',
      nativeName: 'ქართული',
      continents: ['Asia', 'Europe']
    },
    tags: {
      'Felt Needs': ['Acceptance'],
      Topics: ['Addiction'],
      Audience: ['Adults']
    },
    objectID: 'template-id-4',
    _highlightResult: {
      title: {
        value: 'onboarding template4',
        matchLevel: 'none',
        matchedWords: []
      },
      description: {
        value: 'template-id-4',
        matchLevel: 'none',
        matchedWords: []
      },
      language: {
        localName: {
          value: 'Georgian',
          matchLevel: 'none',
          matchedWords: []
        },
        nativeName: {
          value: 'ქართული',
          matchLevel: 'none',
          matchedWords: []
        },
        continents: [
          {
            value: 'Asia',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Europe',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      },
      tags: {
        'Felt Needs': [
          {
            value: 'Acceptance',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        Topics: [
          {
            value: 'Addiction',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        Audience: [
          {
            value: 'Adults',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      }
    },
    __position: 4
  },
  {
    title: 'onboarding template5',
    date: '2024-07-09T00:37:24.569Z',
    description: 'template-id-5',
    image: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    },
    featuredAt: null,
    language: {
      localName: '',
      nativeName: 'English',
      continents: [
        'Asia',
        'North America',
        'Oceania',
        'Africa',
        'South America',
        'Europe'
      ]
    },
    tags: {
      Topics: ['Addiction', 'Anger'],
      Audience: ['Adults'],
      Holidays: ['Easter'],
      Collections: ['Jesus Film', 'NUA']
    },
    objectID: 'template-id-5',
    _highlightResult: {
      title: {
        value: 'onboarding template5',
        matchLevel: 'none',
        matchedWords: []
      },
      description: {
        value: 'template-id-5',
        matchLevel: 'none',
        matchedWords: []
      },
      language: {
        localName: {
          value: '',
          matchLevel: 'none',
          matchedWords: []
        },
        nativeName: {
          value: 'English',
          matchLevel: 'none',
          matchedWords: []
        },
        continents: [
          {
            value: 'Asia',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'North America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Oceania',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Africa',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'South America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Europe',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      },
      tags: {
        Topics: [
          {
            value: 'Addiction',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Anger',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        Audience: [
          {
            value: 'Adults',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        Holidays: [
          {
            value: 'Easter',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        Collections: [
          {
            value: 'Jesus Film',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'NUA',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      }
    },
    __position: 5
  },
  {
    title: 'onboarding template1',
    date: '2024-07-09T00:37:24.569Z',
    description: 'template-id-1',
    image: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    },
    featuredAt: null,
    language: {
      localName: '',
      nativeName: 'English',
      continents: [
        'Asia',
        'North America',
        'Oceania',
        'Africa',
        'South America',
        'Europe'
      ]
    },
    tags: {},
    objectID: 'template-id-1',
    _highlightResult: {
      title: {
        value: 'onboarding template1',
        matchLevel: 'none',
        matchedWords: []
      },
      description: {
        value: 'template-id-1',
        matchLevel: 'none',
        matchedWords: []
      },
      language: {
        localName: {
          value: '',
          matchLevel: 'none',
          matchedWords: []
        },
        nativeName: {
          value: 'English',
          matchLevel: 'none',
          matchedWords: []
        },
        continents: [
          {
            value: 'Asia',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'North America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Oceania',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Africa',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'South America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Europe',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      }
    },
    __position: 6
  }
] as unknown as Hit<AlgoliaJourney>[]

export const transformedAlgoliaJourneys = [
  {
    title: 'onboarding template3',
    date: '2023-08-14T04:24:24.392Z',
    description: 'template-id-3',
    image: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    },
    featuredAt: null,
    language: {
      localName: '',
      nativeName: 'English',
      continents: [
        'Asia',
        'North America',
        'Oceania',
        'Africa',
        'South America',
        'Europe'
      ]
    },
    tags: {
      Topics: ['Anger'],
      'Felt Needs': ['Acceptance', 'Depression'],
      Holidays: ['Easter']
    },
    objectID: 'template-id-3',
    _highlightResult: {
      title: {
        value: 'onboarding template3',
        matchLevel: 'none',
        matchedWords: []
      },
      description: {
        value: 'template-id-3',
        matchLevel: 'none',
        matchedWords: []
      },
      language: {
        localName: {
          value: '',
          matchLevel: 'none',
          matchedWords: []
        },
        nativeName: {
          value: 'English',
          matchLevel: 'none',
          matchedWords: []
        },
        continents: [
          {
            value: 'Asia',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'North America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Oceania',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Africa',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'South America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Europe',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      },
      tags: {
        Topics: [
          {
            value: 'Anger',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        'Felt Needs': [
          {
            value: 'Depression',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Acceptance',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        Holidays: [
          {
            value: 'Easter',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      }
    },
    __position: 1,
    id: 'template-id-3',
    createdAt: '2023-08-14T04:24:24.392Z',
    primaryImageBlock: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    }
  },
  {
    title: 'onboarding template2',
    date: '2024-07-09T00:37:24.569Z',
    description: 'template-id-2',
    image: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    },
    featuredAt: null,
    language: {
      localName: 'Farsi, Western',
      nativeName: 'فارسی',
      continents: ['Asia', 'Europe', 'Oceania', 'North America']
    },
    tags: {
      'Felt Needs': [
        'Acceptance',
        'Anxiety',
        'Depression',
        'Fear/Power',
        'Forgiveness',
        'Guilt/Righteousness'
      ]
    },
    objectID: 'template-id-2',
    _highlightResult: {
      title: {
        value: 'onboarding template2',
        matchLevel: 'none',
        matchedWords: []
      },
      description: {
        value: 'template-id-2',
        matchLevel: 'none',
        matchedWords: []
      },
      language: {
        localName: {
          value: 'Farsi, Western',
          matchLevel: 'none',
          matchedWords: []
        },
        nativeName: {
          value: 'فارسی',
          matchLevel: 'none',
          matchedWords: []
        },
        continents: [
          {
            value: 'Asia',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Europe',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Oceania',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'North America',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      },
      tags: {
        'Felt Needs': [
          {
            value: 'Acceptance',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Anxiety',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Depression',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Fear/Power',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Forgiveness',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Guilt/Righteousness',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      }
    },
    __position: 2,
    id: 'template-id-2',
    createdAt: '2024-07-09T00:37:24.569Z',
    primaryImageBlock: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    }
  },
  {
    title: 'Dev Onboarding Journey',
    date: '2024-07-09T00:37:24.547Z',
    description:
      'Only used for development and staging. Production should use actual onboarding journey.',
    image: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    },
    featuredAt: null,
    language: {
      localName: '',
      nativeName: 'English',
      continents: [
        'Asia',
        'North America',
        'Oceania',
        'Africa',
        'South America',
        'Europe'
      ]
    },
    tags: {},
    objectID: 'template-id',
    _highlightResult: {
      title: {
        value: 'Dev Onboarding Journey',
        matchLevel: 'none',
        matchedWords: []
      },
      description: {
        value:
          'Only used for development and staging. Production should use actual onboarding journey.',
        matchLevel: 'none',
        matchedWords: []
      },
      language: {
        localName: {
          value: '',
          matchLevel: 'none',
          matchedWords: []
        },
        nativeName: {
          value: 'English',
          matchLevel: 'none',
          matchedWords: []
        },
        continents: [
          {
            value: 'Asia',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'North America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Oceania',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Africa',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'South America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Europe',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      }
    },
    __position: 3,
    id: 'template-id',
    createdAt: '2024-07-09T00:37:24.547Z',
    primaryImageBlock: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    }
  },
  {
    title: 'onboarding template4',
    date: '2024-07-09T00:37:24.569Z',
    description: 'template-id-4',
    image: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    },
    featuredAt: null,
    language: {
      localName: 'Georgian',
      nativeName: 'ქართული',
      continents: ['Asia', 'Europe']
    },
    tags: {
      'Felt Needs': ['Acceptance'],
      Topics: ['Addiction'],
      Audience: ['Adults']
    },
    objectID: 'template-id-4',
    _highlightResult: {
      title: {
        value: 'onboarding template4',
        matchLevel: 'none',
        matchedWords: []
      },
      description: {
        value: 'template-id-4',
        matchLevel: 'none',
        matchedWords: []
      },
      language: {
        localName: {
          value: 'Georgian',
          matchLevel: 'none',
          matchedWords: []
        },
        nativeName: {
          value: 'ქართული',
          matchLevel: 'none',
          matchedWords: []
        },
        continents: [
          {
            value: 'Asia',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Europe',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      },
      tags: {
        'Felt Needs': [
          {
            value: 'Acceptance',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        Topics: [
          {
            value: 'Addiction',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        Audience: [
          {
            value: 'Adults',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      }
    },
    __position: 4,
    id: 'template-id-4',
    createdAt: '2024-07-09T00:37:24.569Z',
    primaryImageBlock: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    }
  },
  {
    title: 'onboarding template5',
    date: '2024-07-09T00:37:24.569Z',
    description: 'template-id-5',
    image: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    },
    featuredAt: null,
    language: {
      localName: '',
      nativeName: 'English',
      continents: [
        'Asia',
        'North America',
        'Oceania',
        'Africa',
        'South America',
        'Europe'
      ]
    },
    tags: {
      Topics: ['Addiction', 'Anger'],
      Audience: ['Adults'],
      Holidays: ['Easter'],
      Collections: ['Jesus Film', 'NUA'],
      'Felt Needs': ['Acceptance']
    },
    objectID: 'template-id-5',
    _highlightResult: {
      title: {
        value: 'onboarding template5',
        matchLevel: 'none',
        matchedWords: []
      },
      description: {
        value: 'template-id-5',
        matchLevel: 'none',
        matchedWords: []
      },
      language: {
        localName: {
          value: '',
          matchLevel: 'none',
          matchedWords: []
        },
        nativeName: {
          value: 'English',
          matchLevel: 'none',
          matchedWords: []
        },
        continents: [
          {
            value: 'Asia',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'North America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Oceania',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Africa',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'South America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Europe',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      },
      tags: {
        Topics: [
          {
            value: 'Addiction',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Anger',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        Audience: [
          {
            value: 'Adults',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        Holidays: [
          {
            value: 'Easter',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        Collections: [
          {
            value: 'Jesus Film',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'NUA',
            matchLevel: 'none',
            matchedWords: []
          }
        ],
        'Felt Needs': [
          {
            value: 'Acceptance',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      }
    },
    __position: 5,
    id: 'template-id-5',
    createdAt: '2024-07-09T00:37:24.569Z',
    primaryImageBlock: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    }
  },
  {
    title: 'onboarding template1',
    date: '2024-07-09T00:37:24.569Z',
    description: 'template-id-1',
    image: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    },
    featuredAt: null,
    language: {
      localName: '',
      nativeName: 'English',
      continents: [
        'Asia',
        'North America',
        'Oceania',
        'Africa',
        'South America',
        'Europe'
      ]
    },
    tags: {},
    objectID: 'template-id-1',
    _highlightResult: {
      title: {
        value: 'onboarding template1',
        matchLevel: 'none',
        matchedWords: []
      },
      description: {
        value: 'template-id-1',
        matchLevel: 'none',
        matchedWords: []
      },
      language: {
        localName: {
          value: '',
          matchLevel: 'none',
          matchedWords: []
        },
        nativeName: {
          value: 'English',
          matchLevel: 'none',
          matchedWords: []
        },
        continents: [
          {
            value: 'Asia',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'North America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Oceania',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Africa',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'South America',
            matchLevel: 'none',
            matchedWords: []
          },
          {
            value: 'Europe',
            matchLevel: 'none',
            matchedWords: []
          }
        ]
      }
    },
    __position: 6,
    id: 'template-id-1',
    createdAt: '2024-07-09T00:37:24.569Z',
    primaryImageBlock: {
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'onboarding primary'
    }
  }
] as unknown as AlgoliaJourney[]

export const algoliaResults = {
  _rawResults: [
    {
      hits: [
        {
          title: 'onboarding template3',
          date: '2024-07-09T00:37:24.569Z',
          description: 'template-id-3',
          image: {
            src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
            alt: 'onboarding primary'
          },
          featuredAt: null,
          language: {
            localName: '',
            nativeName: 'English',
            continents: [
              'Asia',
              'North America',
              'Oceania',
              'Africa',
              'South America',
              'Europe'
            ]
          },
          tags: {
            Topics: ['Anger'],
            'Felt Needs': ['Depression'],
            Holidays: ['Easter']
          },
          objectID: 'template-id-3',
          _highlightResult: {
            title: {
              value: 'onboarding template3',
              matchLevel: 'none',
              matchedWords: []
            },
            description: {
              value: 'template-id-3',
              matchLevel: 'none',
              matchedWords: []
            },
            language: {
              localName: {
                value: '',
                matchLevel: 'none',
                matchedWords: []
              },
              nativeName: {
                value: 'English',
                matchLevel: 'none',
                matchedWords: []
              },
              continents: [
                {
                  value: 'Asia',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'North America',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Oceania',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Africa',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'South America',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Europe',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ]
            },
            tags: {
              Topics: [
                {
                  value: 'Anger',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ],
              'Felt Needs': [
                {
                  value: 'Depression',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ],
              Holidays: [
                {
                  value: 'Easter',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ]
            }
          }
        },
        {
          title: 'onboarding template2',
          date: '2024-07-09T00:37:24.569Z',
          description: 'template-id-2',
          image: {
            src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
            alt: 'onboarding primary'
          },
          featuredAt: null,
          language: {
            localName: 'Farsi, Western',
            nativeName: 'فارسی',
            continents: ['Asia', 'Europe', 'Oceania', 'North America']
          },
          tags: {
            'Felt Needs': [
              'Acceptance',
              'Anxiety',
              'Depression',
              'Fear/Power',
              'Forgiveness',
              'Guilt/Righteousness'
            ]
          },
          objectID: 'template-id-2',
          _highlightResult: {
            title: {
              value: 'onboarding template2',
              matchLevel: 'none',
              matchedWords: []
            },
            description: {
              value: 'template-id-2',
              matchLevel: 'none',
              matchedWords: []
            },
            language: {
              localName: {
                value: 'Farsi, Western',
                matchLevel: 'none',
                matchedWords: []
              },
              nativeName: {
                value: 'فارسی',
                matchLevel: 'none',
                matchedWords: []
              },
              continents: [
                {
                  value: 'Asia',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Europe',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Oceania',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'North America',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ]
            },
            tags: {
              'Felt Needs': [
                {
                  value: 'Acceptance',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Anxiety',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Depression',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Fear/Power',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Forgiveness',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Guilt/Righteousness',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ]
            }
          }
        },
        {
          title: 'Dev Onboarding Journey',
          date: '2024-07-09T00:37:24.547Z',
          description:
            'Only used for development and staging. Production should use actual onboarding journey.',
          image: {
            src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
            alt: 'onboarding primary'
          },
          featuredAt: null,
          language: {
            localName: '',
            nativeName: 'English',
            continents: [
              'Asia',
              'North America',
              'Oceania',
              'Africa',
              'South America',
              'Europe'
            ]
          },
          tags: {},
          objectID: 'template-id',
          _highlightResult: {
            title: {
              value: 'Dev Onboarding Journey',
              matchLevel: 'none',
              matchedWords: []
            },
            description: {
              value:
                'Only used for development and staging. Production should use actual onboarding journey.',
              matchLevel: 'none',
              matchedWords: []
            },
            language: {
              localName: {
                value: '',
                matchLevel: 'none',
                matchedWords: []
              },
              nativeName: {
                value: 'English',
                matchLevel: 'none',
                matchedWords: []
              },
              continents: [
                {
                  value: 'Asia',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'North America',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Oceania',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Africa',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'South America',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Europe',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ]
            }
          }
        },
        {
          title: 'onboarding template4',
          date: '2024-07-09T00:37:24.569Z',
          description: 'template-id-4',
          image: {
            src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
            alt: 'onboarding primary'
          },
          featuredAt: null,
          language: {
            localName: 'Georgian',
            nativeName: 'ქართული',
            continents: ['Asia', 'Europe']
          },
          tags: {
            'Felt Needs': ['Acceptance'],
            Topics: ['Addiction'],
            Audience: ['Adults']
          },
          objectID: 'template-id-4',
          _highlightResult: {
            title: {
              value: 'onboarding template4',
              matchLevel: 'none',
              matchedWords: []
            },
            description: {
              value: 'template-id-4',
              matchLevel: 'none',
              matchedWords: []
            },
            language: {
              localName: {
                value: 'Georgian',
                matchLevel: 'none',
                matchedWords: []
              },
              nativeName: {
                value: 'ქართული',
                matchLevel: 'none',
                matchedWords: []
              },
              continents: [
                {
                  value: 'Asia',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Europe',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ]
            },
            tags: {
              'Felt Needs': [
                {
                  value: 'Acceptance',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ],
              Topics: [
                {
                  value: 'Addiction',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ],
              Audience: [
                {
                  value: 'Adults',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ]
            }
          }
        },
        {
          title: 'onboarding template5',
          date: '2024-07-09T00:37:24.569Z',
          description: 'template-id-5',
          image: {
            src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
            alt: 'onboarding primary'
          },
          featuredAt: null,
          language: {
            localName: '',
            nativeName: 'English',
            continents: [
              'Asia',
              'North America',
              'Oceania',
              'Africa',
              'South America',
              'Europe'
            ]
          },
          tags: {
            Topics: ['Addiction', 'Anger'],
            Audience: ['Adults'],
            Holidays: ['Easter'],
            Collections: ['Jesus Film', 'NUA']
          },
          objectID: 'template-id-5',
          _highlightResult: {
            title: {
              value: 'onboarding template5',
              matchLevel: 'none',
              matchedWords: []
            },
            description: {
              value: 'template-id-5',
              matchLevel: 'none',
              matchedWords: []
            },
            language: {
              localName: {
                value: '',
                matchLevel: 'none',
                matchedWords: []
              },
              nativeName: {
                value: 'English',
                matchLevel: 'none',
                matchedWords: []
              },
              continents: [
                {
                  value: 'Asia',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'North America',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Oceania',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Africa',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'South America',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Europe',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ]
            },
            tags: {
              Topics: [
                {
                  value: 'Addiction',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Anger',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ],
              Audience: [
                {
                  value: 'Adults',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ],
              Holidays: [
                {
                  value: 'Easter',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ],
              Collections: [
                {
                  value: 'Jesus Film',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'NUA',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ]
            }
          }
        },
        {
          title: 'onboarding template1',
          date: '2024-07-09T00:37:24.569Z',
          description: 'template-id-1',
          image: {
            src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
            alt: 'onboarding primary'
          },
          featuredAt: null,
          language: {
            localName: '',
            nativeName: 'English',
            continents: [
              'Asia',
              'North America',
              'Oceania',
              'Africa',
              'South America',
              'Europe'
            ]
          },
          tags: {},
          objectID: 'template-id-1',
          _highlightResult: {
            title: {
              value: 'onboarding template1',
              matchLevel: 'none',
              matchedWords: []
            },
            description: {
              value: 'template-id-1',
              matchLevel: 'none',
              matchedWords: []
            },
            language: {
              localName: {
                value: '',
                matchLevel: 'none',
                matchedWords: []
              },
              nativeName: {
                value: 'English',
                matchLevel: 'none',
                matchedWords: []
              },
              continents: [
                {
                  value: 'Asia',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'North America',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Oceania',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Africa',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'South America',
                  matchLevel: 'none',
                  matchedWords: []
                },
                {
                  value: 'Europe',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ]
            }
          }
        }
      ],
      nbHits: 6,
      page: 0,
      nbPages: 1,
      hitsPerPage: 20,
      facets: {
        'tags.Topics': {
          Addiction: 2,
          Anger: 2
        },
        'tags.Audience': {
          Adults: 2
        },
        'tags.Holidays': {
          Easter: 2
        },
        'tags.Felt Needs': {
          Acceptance: 2,
          Depression: 2,
          Anxiety: 1,
          'Fear/Power': 1,
          Forgiveness: 1,
          'Guilt/Righteousness': 1
        },
        'tags.Collections': {
          'Jesus Film': 1,
          NUA: 1
        }
      },
      exhaustiveFacetsCount: true,
      exhaustiveNbHits: true,
      exhaustiveTypo: true,
      exhaustive: {
        facetsCount: true,
        nbHits: true,
        typo: true
      },
      query: '',
      params:
        'facets=%5B%22tags.Audience%22%2C%22tags.Collections%22%2C%22tags.Felt%20Needs%22%2C%22tags.Holidays%22%2C%22tags.Topics%22%5D&highlightPostTag=__%2Fais-highlight__&highlightPreTag=__ais-highlight__&maxValuesPerFacet=10&query=&tagFilters=',
      index: 'api-journeys-journeys-dev',
      renderingContent: {},
      processingTimeMS: 3,
      processingTimingsMS: {
        _request: {
          roundTrip: 187
        },
        getIdx: {
          load: {
            settings: 1,
            total: 2
          },
          total: 2
        },
        total: 3
      },
      serverTimeMS: 4
    }
  ],
  hits: [
    {
      title: 'onboarding template3',
      date: '2024-07-09T00:37:24.569Z',
      description: 'template-id-3',
      image: {
        src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
        alt: 'onboarding primary'
      },
      featuredAt: null,
      language: {
        localName: '',
        nativeName: 'English',
        continents: [
          'Asia',
          'North America',
          'Oceania',
          'Africa',
          'South America',
          'Europe'
        ]
      },
      tags: {
        Topics: ['Anger'],
        'Felt Needs': ['Depression'],
        Holidays: ['Easter']
      },
      objectID: 'template-id-3',
      _highlightResult: {
        title: {
          value: 'onboarding template3',
          matchLevel: 'none',
          matchedWords: []
        },
        description: {
          value: 'template-id-3',
          matchLevel: 'none',
          matchedWords: []
        },
        language: {
          localName: {
            value: '',
            matchLevel: 'none',
            matchedWords: []
          },
          nativeName: {
            value: 'English',
            matchLevel: 'none',
            matchedWords: []
          },
          continents: [
            {
              value: 'Asia',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'North America',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Oceania',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Africa',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'South America',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Europe',
              matchLevel: 'none',
              matchedWords: []
            }
          ]
        },
        tags: {
          Topics: [
            {
              value: 'Anger',
              matchLevel: 'none',
              matchedWords: []
            }
          ],
          'Felt Needs': [
            {
              value: 'Depression',
              matchLevel: 'none',
              matchedWords: []
            }
          ],
          Holidays: [
            {
              value: 'Easter',
              matchLevel: 'none',
              matchedWords: []
            }
          ]
        }
      }
    },
    {
      title: 'onboarding template2',
      date: '2024-07-09T00:37:24.569Z',
      description: 'template-id-2',
      image: {
        src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
        alt: 'onboarding primary'
      },
      featuredAt: null,
      language: {
        localName: 'Farsi, Western',
        nativeName: 'فارسی',
        continents: ['Asia', 'Europe', 'Oceania', 'North America']
      },
      tags: {
        'Felt Needs': [
          'Acceptance',
          'Anxiety',
          'Depression',
          'Fear/Power',
          'Forgiveness',
          'Guilt/Righteousness'
        ]
      },
      objectID: 'template-id-2',
      _highlightResult: {
        title: {
          value: 'onboarding template2',
          matchLevel: 'none',
          matchedWords: []
        },
        description: {
          value: 'template-id-2',
          matchLevel: 'none',
          matchedWords: []
        },
        language: {
          localName: {
            value: 'Farsi, Western',
            matchLevel: 'none',
            matchedWords: []
          },
          nativeName: {
            value: 'فارسی',
            matchLevel: 'none',
            matchedWords: []
          },
          continents: [
            {
              value: 'Asia',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Europe',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Oceania',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'North America',
              matchLevel: 'none',
              matchedWords: []
            }
          ]
        },
        tags: {
          'Felt Needs': [
            {
              value: 'Acceptance',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Anxiety',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Depression',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Fear/Power',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Forgiveness',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Guilt/Righteousness',
              matchLevel: 'none',
              matchedWords: []
            }
          ]
        }
      }
    },
    {
      title: 'Dev Onboarding Journey',
      date: '2024-07-09T00:37:24.547Z',
      description:
        'Only used for development and staging. Production should use actual onboarding journey.',
      image: {
        src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
        alt: 'onboarding primary'
      },
      featuredAt: null,
      language: {
        localName: '',
        nativeName: 'English',
        continents: [
          'Asia',
          'North America',
          'Oceania',
          'Africa',
          'South America',
          'Europe'
        ]
      },
      tags: {},
      objectID: 'template-id',
      _highlightResult: {
        title: {
          value: 'Dev Onboarding Journey',
          matchLevel: 'none',
          matchedWords: []
        },
        description: {
          value:
            'Only used for development and staging. Production should use actual onboarding journey.',
          matchLevel: 'none',
          matchedWords: []
        },
        language: {
          localName: {
            value: '',
            matchLevel: 'none',
            matchedWords: []
          },
          nativeName: {
            value: 'English',
            matchLevel: 'none',
            matchedWords: []
          },
          continents: [
            {
              value: 'Asia',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'North America',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Oceania',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Africa',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'South America',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Europe',
              matchLevel: 'none',
              matchedWords: []
            }
          ]
        }
      }
    },
    {
      title: 'onboarding template4',
      date: '2024-07-09T00:37:24.569Z',
      description: 'template-id-4',
      image: {
        src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
        alt: 'onboarding primary'
      },
      featuredAt: null,
      language: {
        localName: 'Georgian',
        nativeName: 'ქართული',
        continents: ['Asia', 'Europe']
      },
      tags: {
        'Felt Needs': ['Acceptance'],
        Topics: ['Addiction'],
        Audience: ['Adults']
      },
      objectID: 'template-id-4',
      _highlightResult: {
        title: {
          value: 'onboarding template4',
          matchLevel: 'none',
          matchedWords: []
        },
        description: {
          value: 'template-id-4',
          matchLevel: 'none',
          matchedWords: []
        },
        language: {
          localName: {
            value: 'Georgian',
            matchLevel: 'none',
            matchedWords: []
          },
          nativeName: {
            value: 'ქართული',
            matchLevel: 'none',
            matchedWords: []
          },
          continents: [
            {
              value: 'Asia',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Europe',
              matchLevel: 'none',
              matchedWords: []
            }
          ]
        },
        tags: {
          'Felt Needs': [
            {
              value: 'Acceptance',
              matchLevel: 'none',
              matchedWords: []
            }
          ],
          Topics: [
            {
              value: 'Addiction',
              matchLevel: 'none',
              matchedWords: []
            }
          ],
          Audience: [
            {
              value: 'Adults',
              matchLevel: 'none',
              matchedWords: []
            }
          ]
        }
      }
    },
    {
      title: 'onboarding template5',
      date: '2024-07-09T00:37:24.569Z',
      description: 'template-id-5',
      image: {
        src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
        alt: 'onboarding primary'
      },
      featuredAt: null,
      language: {
        localName: '',
        nativeName: 'English',
        continents: [
          'Asia',
          'North America',
          'Oceania',
          'Africa',
          'South America',
          'Europe'
        ]
      },
      tags: {
        Topics: ['Addiction', 'Anger'],
        Audience: ['Adults'],
        Holidays: ['Easter'],
        Collections: ['Jesus Film', 'NUA']
      },
      objectID: 'template-id-5',
      _highlightResult: {
        title: {
          value: 'onboarding template5',
          matchLevel: 'none',
          matchedWords: []
        },
        description: {
          value: 'template-id-5',
          matchLevel: 'none',
          matchedWords: []
        },
        language: {
          localName: {
            value: '',
            matchLevel: 'none',
            matchedWords: []
          },
          nativeName: {
            value: 'English',
            matchLevel: 'none',
            matchedWords: []
          },
          continents: [
            {
              value: 'Asia',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'North America',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Oceania',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Africa',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'South America',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Europe',
              matchLevel: 'none',
              matchedWords: []
            }
          ]
        },
        tags: {
          Topics: [
            {
              value: 'Addiction',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Anger',
              matchLevel: 'none',
              matchedWords: []
            }
          ],
          Audience: [
            {
              value: 'Adults',
              matchLevel: 'none',
              matchedWords: []
            }
          ],
          Holidays: [
            {
              value: 'Easter',
              matchLevel: 'none',
              matchedWords: []
            }
          ],
          Collections: [
            {
              value: 'Jesus Film',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'NUA',
              matchLevel: 'none',
              matchedWords: []
            }
          ]
        }
      }
    },
    {
      title: 'onboarding template1',
      date: '2024-07-09T00:37:24.569Z',
      description: 'template-id-1',
      image: {
        src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
        alt: 'onboarding primary'
      },
      featuredAt: null,
      language: {
        localName: '',
        nativeName: 'English',
        continents: [
          'Asia',
          'North America',
          'Oceania',
          'Africa',
          'South America',
          'Europe'
        ]
      },
      tags: {},
      objectID: 'template-id-1',
      _highlightResult: {
        title: {
          value: 'onboarding template1',
          matchLevel: 'none',
          matchedWords: []
        },
        description: {
          value: 'template-id-1',
          matchLevel: 'none',
          matchedWords: []
        },
        language: {
          localName: {
            value: '',
            matchLevel: 'none',
            matchedWords: []
          },
          nativeName: {
            value: 'English',
            matchLevel: 'none',
            matchedWords: []
          },
          continents: [
            {
              value: 'Asia',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'North America',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Oceania',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Africa',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'South America',
              matchLevel: 'none',
              matchedWords: []
            },
            {
              value: 'Europe',
              matchLevel: 'none',
              matchedWords: []
            }
          ]
        }
      }
    }
  ],
  nbHits: 6,
  page: 0,
  nbPages: 1,
  hitsPerPage: 20,
  facets: [],
  exhaustiveFacetsCount: true,
  exhaustiveNbHits: true,
  exhaustiveTypo: true,
  exhaustive: {
    facetsCount: true,
    nbHits: true,
    typo: true
  },
  query: '',
  params:
    'facets=%5B%22tags.Audience%22%2C%22tags.Collections%22%2C%22tags.Felt%20Needs%22%2C%22tags.Holidays%22%2C%22tags.Topics%22%5D&highlightPostTag=__%2Fais-highlight__&highlightPreTag=__ais-highlight__&maxValuesPerFacet=10&query=&tagFilters=',
  index: 'api-journeys-journeys-dev',
  renderingContent: {},
  processingTimeMS: 3,
  processingTimingsMS: {
    _request: {
      roundTrip: 187
    },
    getIdx: {
      load: {
        settings: 1,
        total: 2
      },
      total: 2
    },
    total: 3
  },
  serverTimeMS: 4,
  persistHierarchicalRootCount: false,
  disjunctiveFacets: [
    {
      name: 'tags.Collections',
      data: {
        'Jesus Film': 1,
        NUA: 1
      },
      exhaustive: true
    },
    {
      name: 'tags.Topics',
      data: {
        Addiction: 2,
        Anger: 2
      },
      exhaustive: true
    },
    {
      name: 'tags.Holidays',
      data: {
        Easter: 2
      },
      exhaustive: true
    },
    {
      name: 'tags.Audience',
      data: {
        Adults: 2
      },
      exhaustive: true
    },
    {
      name: 'tags.Felt Needs',
      data: {
        Acceptance: 2,
        Depression: 2,
        Anxiety: 1,
        'Fear/Power': 1,
        Forgiveness: 1,
        'Guilt/Righteousness': 1
      },
      exhaustive: true
    }
  ],
  hierarchicalFacets: [],
  _state: {
    facets: [],
    disjunctiveFacets: [
      'tags.Collections',
      'tags.Topics',
      'tags.Holidays',
      'tags.Audience',
      'tags.Felt Needs'
    ],
    hierarchicalFacets: [],
    facetsRefinements: {},
    facetsExcludes: {},
    disjunctiveFacetsRefinements: {
      'tags.Topics': [],
      'tags.Holidays': [],
      'tags.Audience': [],
      'tags.Collections': [],
      'tags.Felt Needs': []
    },
    numericRefinements: {},
    tagRefinements: [],
    hierarchicalFacetsRefinements: {},
    index: 'api-journeys-journeys-dev',
    query: '',
    maxValuesPerFacet: 10,
    highlightPreTag: '__ais-highlight__',
    highlightPostTag: '__/ais-highlight__'
  }
}

export const algoliaTagsRefinements = [
  {
    indexName: 'api-journeys-journeys-dev',
    indexId: 'api-journeys-journeys-dev',
    attribute: 'tags.Felt Needs',
    label: 'tags.Felt Needs',
    refinements: [
      {
        attribute: 'tags.Felt Needs',
        type: 'disjunctive',
        value: 'Depression',
        label: 'Depression',
        count: 2,
        exhaustive: true
      },
      {
        attribute: 'tags.Felt Needs',
        type: 'disjunctive',
        value: 'Acceptance',
        label: 'Acceptance',
        count: 2,
        exhaustive: true
      }
    ]
  }
] as unknown as CurrentRefinementsConnectorParamsItem[]

export const algoliaLanguageRefinements = [
  {
    indexName: 'api-journeys-journeys-dev',
    indexId: 'api-journeys-journeys-dev',
    attribute: 'language.nativeName',
    label: 'language.nativeName',
    refinements: [
      {
        attribute: 'language.nativeName',
        type: 'disjunctive',
        value: 'English',
        label: 'English',
        count: 1,
        exhaustive: true
      }
    ]
  }
] as unknown as CurrentRefinementsConnectorParamsItem[]

export const algoliaRefinements = [
  ...algoliaTagsRefinements,
  ...algoliaLanguageRefinements
] as unknown as CurrentRefinementsConnectorParamsItem[]
