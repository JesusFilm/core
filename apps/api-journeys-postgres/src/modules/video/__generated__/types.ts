/* eslint-disable */
import * as Types from '../../../__generated__/types'
import * as gm from 'graphql-modules'
export namespace VideoModule {
  interface DefinedFields {
    VideoArclight: 'mediaComponentId' | 'languageId' | 'src'
    VideoGeneric: 'src'
    VideoBlock:
      | 'id'
      | 'parentBlockId'
      | 'title'
      | 'startAt'
      | 'endAt'
      | 'description'
      | 'muted'
      | 'autoplay'
      | 'videoContent'
      | 'posterBlockId'
    VideoResponse: 'id' | 'userId' | 'state' | 'position' | 'block'
    Mutation: 'videoResponseCreate'
    VideoContent: 'src'
  }

  interface DefinedEnumValues {
    VideoResponseStateEnum: 'PLAYING' | 'PAUSED' | 'FINISHED'
  }

  interface DefinedInputFields {
    VideoResponseCreateInput: 'id' | 'blockId' | 'state' | 'position'
  }

  export type VideoResponseStateEnum =
    DefinedEnumValues['VideoResponseStateEnum']
  export type VideoResponseCreateInput = Pick<
    Types.VideoResponseCreateInput,
    DefinedInputFields['VideoResponseCreateInput']
  >
  export type VideoContent = Pick<
    Types.VideoContent,
    DefinedFields['VideoContent']
  >
  export type VideoArclight = Pick<
    Types.VideoArclight,
    DefinedFields['VideoArclight']
  >
  export type VideoGeneric = Pick<
    Types.VideoGeneric,
    DefinedFields['VideoGeneric']
  >
  export type VideoBlock = Pick<Types.VideoBlock, DefinedFields['VideoBlock']>
  export type Block = Types.Block
  export type VideoResponse = Pick<
    Types.VideoResponse,
    DefinedFields['VideoResponse']
  >
  export type Response = Types.Response
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>

  export type VideoArclightResolvers = Pick<
    Types.VideoArclightResolvers,
    DefinedFields['VideoArclight'] | '__isTypeOf'
  >
  export type VideoGenericResolvers = Pick<
    Types.VideoGenericResolvers,
    DefinedFields['VideoGeneric'] | '__isTypeOf'
  >
  export type VideoBlockResolvers = Pick<
    Types.VideoBlockResolvers,
    DefinedFields['VideoBlock'] | '__isTypeOf'
  >
  export type VideoResponseResolvers = Pick<
    Types.VideoResponseResolvers,
    DefinedFields['VideoResponse'] | '__isTypeOf'
  >
  export type MutationResolvers = Pick<
    Types.MutationResolvers,
    DefinedFields['Mutation']
  >
  export type VideoContentResolvers = Pick<
    Types.VideoContentResolvers,
    DefinedFields['VideoContent']
  >

  export interface Resolvers {
    VideoArclight?: VideoArclightResolvers
    VideoGeneric?: VideoGenericResolvers
    VideoBlock?: VideoBlockResolvers
    VideoResponse?: VideoResponseResolvers
    Mutation?: MutationResolvers
  }

  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[]
    }
    VideoArclight?: {
      '*'?: gm.Middleware[]
      mediaComponentId?: gm.Middleware[]
      languageId?: gm.Middleware[]
      src?: gm.Middleware[]
    }
    VideoGeneric?: {
      '*'?: gm.Middleware[]
      src?: gm.Middleware[]
    }
    VideoBlock?: {
      '*'?: gm.Middleware[]
      id?: gm.Middleware[]
      parentBlockId?: gm.Middleware[]
      title?: gm.Middleware[]
      startAt?: gm.Middleware[]
      endAt?: gm.Middleware[]
      description?: gm.Middleware[]
      muted?: gm.Middleware[]
      autoplay?: gm.Middleware[]
      videoContent?: gm.Middleware[]
      posterBlockId?: gm.Middleware[]
    }
    VideoResponse?: {
      '*'?: gm.Middleware[]
      id?: gm.Middleware[]
      userId?: gm.Middleware[]
      state?: gm.Middleware[]
      position?: gm.Middleware[]
      block?: gm.Middleware[]
    }
    Mutation?: {
      '*'?: gm.Middleware[]
      videoResponseCreate?: gm.Middleware[]
    }
  }
}
