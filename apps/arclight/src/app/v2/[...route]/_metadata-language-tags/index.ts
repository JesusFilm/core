import { Hono } from 'hono'

import { metadataLanguageTag } from './[metadataLanguageTag]'
import { languages } from './languages'

export const metadataLanguageTags = new Hono()
metadataLanguageTags.route('/:metadataLanguageTag', metadataLanguageTag)
metadataLanguageTags.get('/', async (c) => {
  const apiKey = c.req.query('apiKey') ?? ''

  const languagesList = languages
    .map((language) => ({
      tag: language.tag,
      name: language.name,
      nameNative: language.nameNative,
      _links: {
        self: {
          href: `http://api.arclight.org/v2/metadata-language-tags/${language.tag}?apiKey=${apiKey}`
        },
        metadataLanguageTags: {
          href: `http://api.arclight.org/v2/metadata-language-tags?apiKey=${apiKey}`
        }
      }
    }))
    .sort((a, b) => a.tag.localeCompare(b.tag))

  const response = {
    _links: {
      self: {
        href: `http://api.arclight.org/v2/metadata-language-tags?apiKey=${apiKey}`
      }
    },
    _embedded: {
      metadataLanguageTags: languagesList
    }
  }

  return c.json(response)
})
