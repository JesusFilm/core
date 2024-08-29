import { builder } from '../../builder'

const SegmindModelEnum = {
  sdxl1__0_txt2img: 'sdxl1__0_txt2img',
  kandinsky2__2_txt2img: 'kandinsky2__2_txt2img',
  sd1__5_paragon: 'sd1__5_paragon',
  tinysd1__5_txt2img: 'tinysd1__5_txt2img'
} as const

export const SegmindModel = builder.enumType('SegmindModel', {
  values: Object.values(SegmindModelEnum)
})
