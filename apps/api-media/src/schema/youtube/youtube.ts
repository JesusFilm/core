//currently just an extended object from videoblock

import { builder } from '../builder'

interface YoutubeShape {
  id: string
}

const YouTube = builder.objectRef<YoutubeShape>('Youtube')
YouTube.implement({
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false })
  })
})
