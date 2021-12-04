
import { flow, has, omit } from 'lodash'
import { Block, VideoArclight, VideoBlock } from '../graphql'

const idAsKey = (obj): any => has(obj, "id") ? omit({ ...obj, _key: obj.id }, ['id']) : obj
const keyAsId = (obj): any => has(obj, "_key") ? omit({ ...obj, id: obj._key }, ['_key']) : obj

export function IdAsKey() {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    const childFunction = descriptor.value
    descriptor.value = async function (...args) {
      args = Array.isArray(args)
        ? args.map(idAsKey)
        : idAsKey(args)
      const result = await childFunction.apply(this, args)
      return Array.isArray(result)
        ? result.map(keyAsId)
        : keyAsId(result)
    }
  }
}

export function KeyAsId() {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    const childFunction = descriptor.value
    descriptor.value = async function (...args) {
      const result = await childFunction.apply(this, args)
      return Array.isArray(result)
        ? result.map(keyAsId)
        : keyAsId(result)
    }
  }
}

const arcLightVideoSrc = (obj: VideoBlock): Block => {
  if (obj?.type === 'VideoBlock' && obj?.videoContent?.hasOwnProperty('mediaComponentId')) {
    (obj.videoContent as VideoArclight).src = `https://arc.gt/hls/${(obj.videoContent as VideoArclight).mediaComponentId}/${(obj.videoContent as VideoArclight).languageId}`
  }
  return obj
}

const blockMiddleWares = flow([arcLightVideoSrc])

export function BlockMiddleware() {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    const childFunction = descriptor.value
    descriptor.value = async function (...args) {
      const result = await childFunction.apply(this, args)
      return Array.isArray(result)
        ? result.map(blockMiddleWares)
        : blockMiddleWares(result)
    }
  }
}

