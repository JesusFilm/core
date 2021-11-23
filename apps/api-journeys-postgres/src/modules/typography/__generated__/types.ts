/* eslint-disable */
import * as Types from '../../../__generated__/types'
import * as gm from 'graphql-modules'
export namespace TypographyModule {
  interface DefinedFields {
    TypographyBlock:
      | 'id'
      | 'parentBlockId'
      | 'content'
      | 'variant'
      | 'color'
      | 'align'
  }

  interface DefinedEnumValues {
    TypographyVariant:
      | 'h1'
      | 'h2'
      | 'h3'
      | 'h4'
      | 'h5'
      | 'h6'
      | 'subtitle1'
      | 'subtitle2'
      | 'body1'
      | 'body2'
      | 'caption'
      | 'overline'
    TypographyColor: 'primary' | 'secondary' | 'error'
    TypographyAlign: 'left' | 'center' | 'right'
  }

  export type TypographyVariant = DefinedEnumValues['TypographyVariant']
  export type TypographyColor = DefinedEnumValues['TypographyColor']
  export type TypographyAlign = DefinedEnumValues['TypographyAlign']
  export type TypographyBlock = Pick<
    Types.TypographyBlock,
    DefinedFields['TypographyBlock']
  >
  export type Block = Types.Block

  export type TypographyBlockResolvers = Pick<
    Types.TypographyBlockResolvers,
    DefinedFields['TypographyBlock'] | '__isTypeOf'
  >

  export interface Resolvers {
    TypographyBlock?: TypographyBlockResolvers
  }

  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[]
    }
    TypographyBlock?: {
      '*'?: gm.Middleware[]
      id?: gm.Middleware[]
      parentBlockId?: gm.Middleware[]
      content?: gm.Middleware[]
      variant?: gm.Middleware[]
      color?: gm.Middleware[]
      align?: gm.Middleware[]
    }
  }
}
