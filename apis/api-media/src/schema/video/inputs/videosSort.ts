import { builder } from '../../builder'

export const VideoSortDirection = builder.enumType('VideoSortDirection', {
  values: {
    asc: {},
    desc: {}
  }
})

export const VideoSortField = builder.enumType('VideoSortField', {
  values: {
    id: {},
    published: {},
    locked: {},
    label: {},
    primaryLanguageId: {}
  }
})

export const VideoSort = builder.inputType('VideoSort', {
  fields: (t) => ({
    field: t.field({
      type: VideoSortField,
      required: true
    }),
    direction: t.field({
      type: VideoSortDirection,
      required: true
    })
  })
}) 