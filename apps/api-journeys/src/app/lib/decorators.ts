import * as _ from 'lodash';
import { Block, VideoArclight, VideoBlock } from '../graphql';

const idAsKey = (obj): any  => _.omit({...obj, _key: obj.id }, ['id'])
const keyAsId = (obj): any  => _.omit({...obj, id: obj._key }, ['_key'])

export function IdAsKey() {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    const childFunction = descriptor.value;
    descriptor.value = async function (...args) {
      const result = await childFunction.apply(this, args);
      return Array.isArray(result)
        ? result.map(idAsKey)
        : idAsKey(result);
    }
  }
}

export function KeyAsId() {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    const childFunction = descriptor.value;
    descriptor.value = async function (...args) {
      const result = await childFunction.apply(this, args);
      return Array.isArray(result)
        ? result.map(keyAsId)
        : keyAsId(result);
    }
  }
}

const arcLightVideoSrc = (obj: VideoBlock): Block => {
  if (obj.type === 'VideoBlock' && obj.videoContent.hasOwnProperty('mediaComponentId')) {
    (obj.videoContent as VideoArclight).src = `https://arc.gt/hls/${(obj.videoContent as VideoArclight).mediaComponentId}/${(obj.videoContent as VideoArclight).languageId}`;
  }
  return obj;
}

const blockMiddleWares = _.flow([arcLightVideoSrc]);
  export function BlockMiddleware() {
    return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
      const childFunction = descriptor.value;
      descriptor.value = async function (...args){
        const result = await childFunction.apply(this, args);
        return Array.isArray(result)
          ? result.map(blockMiddleWares)
          : blockMiddleWares(result);
      }
    }
}

    