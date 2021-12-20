import { flow, has } from 'lodash'
import { Block, VideoArclight, VideoBlock } from '../__generated__/graphql'

const arcLightVideoSrc = (obj: VideoBlock): Block => {
  if (
    obj?.__typename === 'VideoBlock' &&
    has(obj.videoContent, 'mediaComponentId')
  ) {
    ;(obj.videoContent as VideoArclight).src = `https://arc.gt/hls/${
      (obj.videoContent as VideoArclight).mediaComponentId
    }/${(obj.videoContent as VideoArclight).languageId}`
  }
  return obj
}

const blockMiddleWares = flow([arcLightVideoSrc])

export function BlockMiddleware() {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const childFunction = descriptor.value
    descriptor.value = async function (...args) {
      const result = await childFunction.apply(this, args)
      return Array.isArray(result)
        ? result.map(blockMiddleWares)
        : blockMiddleWares(result)
    }
  }
}
