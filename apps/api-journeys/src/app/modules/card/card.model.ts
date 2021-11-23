import { Field, ObjectType } from '@nestjs/graphql'
import { Block } from '../block/block.models'
import { ThemeMode, ThemeName } from '../theme/theme.models'

@ObjectType({ implements: () => [Block] })
export class CardBlock extends Block {
  @Field({
    description:
      'backgroundColor should be a HEX color value e.g #FFFFFF for white.'
  })
  readonly backgroundColor?: string

  @Field({
    description: `coverBlockId is present if a child block should be used as a cover.
    This child block should not be rendered normally, instead it should be used
    as a background. Blocks are often of type ImageBlock or VideoBlock.`
  })
  readonly coverBlockId?: string

  @Field({
    description: `fullscreen should control how the coverBlock is displayed. When fullscreen
    is set to true the coverBlock Image should be displayed as a blur in the
    background.`
  })
  readonly fullscreen?: boolean


  @Field()
  readonly parentBlockId?: string

  @Field((type) => ThemeMode, {
    description: `themeMode can override journey themeMode. If nothing is set then use
    themeMode from journey`
  })
  themeMode?: ThemeMode

  @Field((type) => ThemeName, {
    description: `themeName can override journey themeName. If nothing is set then use
    themeName from journey`
  })
  themeName?: ThemeName
}
