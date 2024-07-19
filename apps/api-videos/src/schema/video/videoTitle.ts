import { builder } from '../builder'
import { Language } from './language'

export const VideoTitle = builder.prismaObject('VideoTitle', {
  fields: (t) => ({
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.field({
      type: Language,
      resolve: (parent) => ({ id: parent.languageId })
    })
  })
})
