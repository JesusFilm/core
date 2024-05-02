import { NextRequest } from 'next/server'

import { paramsToRecord } from '../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
    metadataLanguageTags
*/

export async function GET(req: NextRequest): Promise<Response> {
  const query = req.nextUrl.searchParams
  const metadataLanguageTags = query.get('metadataLanguageTags') ?? 'en'

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const queryString = new URLSearchParams(queryObject).toString()
  const response = {
    _links: {
      self: {
        href: `https://api.arclight.com/v2/taxonomies${queryString}`
      }
    },
    _embedded: {
      taxonomies: {
        // TODO: handle translations
        contentTypes: await contentTypes(metadataLanguageTags, queryString),
        // TODO: investigate
        genres: await genres(metadataLanguageTags, queryString),
        // TODO: investigate
        osisBibleBooks: await osisBibleBooks(metadataLanguageTags, queryString),
        // TODO: handle translations
        subTypes: await subTypes(metadataLanguageTags, queryString),
        // TODO: handle translations
        types: await types(metadataLanguageTags, queryString)
      }
    }
  }
  return new Response(JSON.stringify(response), { status: 200 })
}

export async function contentTypes(
  metadataLanguageTag: string,
  queryString: string
): Promise<{
  terms: Record<string, { label: string; metadataLanguageTag: string }>
  _links: Record<string, { href: string }>
}> {
  return {
    terms: {
      audio: {
        label: 'audio',
        metadataLanguageTag
      },
      video: {
        label: 'video',
        metadataLanguageTag
      }
    },
    _links: {
      self: {
        href: `http://api.arclight.org/v2/taxonomies/contentTypes?${queryString}`
      },
      taxonomies: {
        href: `http://api.arclight.org/v2/taxonomies?${queryString}`
      }
    }
  }
}

export async function genres(
  metadataLanguageTag: string,
  queryString: string
): Promise<{
  terms: Record<string, { label: string; metadataLanguageTag: string }>
  _links: Record<string, { href: string }>
}> {
  return {
    terms: {},
    _links: {
      self: {
        href: `http://api.arclight.org/v2/taxonomies/genres?${queryString}`
      },
      taxonomies: {
        href: `http://api.arclight.org/v2/taxonomies?${queryString}`
      }
    }
  }
}

export async function osisBibleBooks(
  metadataLanguageTag: string,
  queryString: string
): Promise<{
  terms: Record<string, { label: string; metadataLanguageTag: string }>
  _links: Record<string, { href: string }>
}> {
  return {
    terms: {},
    _links: {
      self: {
        href: `http://api.arclight.org/v2/taxonomies/osisBibleBooks?${queryString}`
      },
      taxonomies: {
        href: `http://api.arclight.org/v2/taxonomies?${queryString}`
      }
    }
  }
}

export async function subTypes(
  metadataLanguageTag: string,
  queryString: string
): Promise<{
  terms: Record<string, { label: string; metadataLanguageTag: string }>
  _links: Record<string, { href: string }>
}> {
  return {
    terms: {
      collection: {
        label: 'Collection',
        metadataLanguageTag
      },
      episode: {
        label: 'Episode',
        metadataLanguageTag
      },
      featureFilm: {
        label: 'Feature Film',
        metadataLanguageTag
      },
      segment: {
        label: 'Segment',
        metadataLanguageTag
      },
      series: {
        label: 'Series',
        metadataLanguageTag
      },
      shortFilm: {
        label: 'Short Film',
        metadataLanguageTag
      }
    },
    _links: {
      self: {
        href: `http://api.arclight.org/v2/taxonomies/subTypes?${queryString}`
      },
      taxonomies: {
        href: `http://api.arclight.org/v2/taxonomies?${queryString}`
      }
    }
  }
}

export async function types(
  metadataLanguageTag: string,
  queryString: string
): Promise<{
  terms: Record<string, { label: string; metadataLanguageTag: string }>
  _links: Record<string, { href: string }>
}> {
  return {
    terms: {
      container: {
        label: 'Container',
        metadataLanguageTag
      },
      content: {
        label: 'Content',
        metadataLanguageTag
      }
    },
    _links: {
      self: {
        href: `http://api.arclight.org/v2/taxonomies/types?${queryString}`
      },
      taxonomies: {
        href: `http://api.arclight.org/v2/taxonomies?${queryString}`
      }
    }
  }
}
