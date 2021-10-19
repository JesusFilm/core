import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  type CardBlock implements Block {
    id: ID!
    parentBlockId: ID
    """
    backgroundColor should be a HEX color value e.g #FFFFFF for white.
    """
    backgroundColor: String
    """
    coverBlockId is present if a child block should be used as a cover.
    This child block should not be rendered normally, instead it should be used
    as a background. Blocks are often of type ImageBlock or VideoBlock.
    """
    coverBlockId: ID
    """
    fullscreen should control how the coverBlock is displayed. When fullscreen
    is set to true the coverBlock Image should be displayed as a blur in the
    background.
    """
    fullscreen: Boolean
    """
    themeMode can override journey themeMode. If nothing is set then use
    themeMode from journey
    """
    themeMode: ThemeMode
    """
    themeName can override journey themeName. If nothing is set then use
    themeName from journey
    """
    themeName: ThemeName
  }
`

export const cardModule = createModule({
  id: 'card',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
