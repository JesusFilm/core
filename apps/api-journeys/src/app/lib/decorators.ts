import * as _ from 'lodash';
import { Block, VideoArclight, VideoBlock } from '../graphql';

function omit(key: string, obj: any): any {
  const { [key]: omitted, ...rest } = obj;
  return rest;
}

const idAsKey = (obj): any  => omit('_key', {...obj, id: obj._key })
const keyAsId = (obj): any  => omit('id', {...obj, id: obj._key })

export function IdAsKey() {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    const childFunction = descriptor.value;
    descriptor.value = async function (...args){
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
    descriptor.value = async function (...args){
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

    