/* eslint-disable */
import * as Types from '../../../__generated__/types'
import * as gm from 'graphql-modules'
export namespace CardModule {
  interface DefinedFields {
    CardBlock:
      | 'id'
      | 'parentBlockId'
      | 'backgroundColor'
      | 'coverBlockId'
      | 'fullscreen'
      | 'themeMode'
      | 'themeName'
  }

  export type CardBlock = Pick<Types.CardBlock, DefinedFields['CardBlock']>
  export type ThemeMode = Types.ThemeMode
  export type ThemeName = Types.ThemeName
  export type Block = Types.Block

  export type CardBlockResolvers = Pick<
    Types.CardBlockResolvers,
    DefinedFields['CardBlock'] | '__isTypeOf'
  >

  export interface Resolvers {
    CardBlock?: CardBlockResolvers
  }

  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[]
    }
    CardBlock?: {
      '*'?: gm.Middleware[]
      id?: gm.Middleware[]
      parentBlockId?: gm.Middleware[]
      backgroundColor?: gm.Middleware[]
      coverBlockId?: gm.Middleware[]
      fullscreen?: gm.Middleware[]
      themeMode?: gm.Middleware[]
      themeName?: gm.Middleware[]
    }
  }
}
