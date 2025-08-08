export interface CloudflareImage {
  mobileCinematicHigh: string
}

export interface Video {
  id: string
  label: string
  images: CloudflareImage[]
  imageAlt: {
    value: string
  }[]
  snippet: {
    value: string
  }[]
  description: {
    value: string
  }[]
  title: {
    value: string
  }[]
  variant: {
    id: string
    duration: number
    language: {
      id: string
      name: {
        value: string
        primary: boolean
      }
      bcp47: string
    }
    slug: string
  }
  variantLanguagesCount: number
  slug: string
}

export const mockVideos: Video[] = [
  {
    id: "1_jf-0-0",
    label: "featureFilm",
    images: [
      {
        mobileCinematicHigh: "https://example.com/image1.jpg"
      }
    ],
    imageAlt: [
      {
        value: "JESUS film"
      }
    ],
    snippet: [
      {
        value: "THE LIFE OF CHRIST"
      }
    ],
    description: [
      {
        value: "Experience the life of Jesus through authentic films"
      }
    ],
    title: [
      {
        value: "JESUS"
      }
    ],
    variant: {
      id: "1_jf-0-0-en",
      duration: 7020, // 117 minutes in seconds
      language: {
        id: "529",
        name: {
          value: "English",
          primary: true
        },
        bcp47: "en"
      },
      slug: "jesus"
    },
    variantLanguagesCount: 2000,
    slug: "jesus"
  },
  {
    id: "2_GOJ-0-0",
    label: "featureFilm",
    images: [
      {
        mobileCinematicHigh: "https://example.com/image2.jpg"
      }
    ],
    imageAlt: [
      {
        value: "Gospel of Matthew film"
      }
    ],
    snippet: [
      {
        value: "Luma-word-by-word-video-gospel"
      }
    ],
    description: [
      {
        value: "The Gospel of Matthew in video format"
      }
    ],
    title: [
      {
        value: "THE GOSPEL OF MATTHEW"
      }
    ],
    variant: {
      id: "2_GOJ-0-0-en",
      duration: 3720, // 62 minutes in seconds
      language: {
        id: "529",
        name: {
          value: "English",
          primary: true
        },
        bcp47: "en"
      },
      slug: "gospel-matthew"
    },
    variantLanguagesCount: 900,
    slug: "gospel-matthew"
  }
]

export const mockVideosData = {
  videos: [
    {
      id: "1_jf-0-0",
      label: "featureFilm",
      images: [
        {
          mobileCinematicHigh: "https://example.com/image1.jpg"
        }
      ],
      imageAlt: [
        {
          value: "JESUS film"
        }
      ],
      snippet: [
        {
          value: "THE LIFE OF CHRIST"
        }
      ],
      description: [
        {
          value: "Experience the life of Jesus through authentic films"
        }
      ],
      title: [
        {
          value: "JESUS"
        }
      ],
      variant: {
        id: "1_jf-0-0-en",
        duration: 7020, // 117 minutes in seconds
        language: {
          id: "529",
          name: {
            value: "English",
            primary: true
          },
          bcp47: "en"
        },
        slug: "jesus"
      },
      variantLanguagesCount: 2000,
      slug: "jesus",
      published: true
    },
    {
      id: "2_GOJ-0-0",
      label: "featureFilm",
      images: [
        {
          mobileCinematicHigh: "https://example.com/image2.jpg"
        }
      ],
      imageAlt: [
        {
          value: "Gospel of Matthew film"
        }
      ],
      snippet: [
        {
          value: "Luma-word-by-word-video-gospel"
        }
      ],
      description: [
        {
          value: "The Gospel of Matthew in video format"
        }
      ],
      title: [
        {
          value: "THE GOSPEL OF MATTHEW"
        }
      ],
      variant: {
        id: "2_GOJ-0-0-en",
        duration: 3720, // 62 minutes in seconds
        language: {
          id: "529",
          name: {
            value: "English",
            primary: true
          },
          bcp47: "en"
        },
        slug: "gospel-matthew"
      },
      variantLanguagesCount: 900,
      slug: "gospel-matthew",
      published: true
    }
  ]
} 