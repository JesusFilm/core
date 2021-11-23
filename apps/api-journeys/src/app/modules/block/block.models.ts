import { Directive, Field, ID, Int, InterfaceType, ObjectType } from '@nestjs/graphql'
import { Action } from '../action/action.model'
import { ButtonColor, ButtonSize, ButtonVariant } from '../button/button.models'
import { GridAlignItems, GridDirection, GridJustifyContent } from '../grid/grid.models'
import { Icon } from '../icon/icon.models'
import { Journey } from '../journey/journey.models'
import { ThemeMode, ThemeName } from '../theme/theme.models'
import { TypographyAlign, TypographyColor, TypographyVariant } from '../typography/typography.models'
import { VideoContent } from '../video/video.models'

@InterfaceType()
@Directive('@key(fields: "id")')
export abstract class Block {
  @Field(type => ID, { name: 'id' })
  readonly _key: string

  @Field(type => ID)
  readonly parentBlockId?: string

  @Field(type => Journey)
  readonly journey: Journey
}

@ObjectType({ implements: () => [Block]})
export class ButtonBlock extends Block {
  @Field()
  readonly label: string;
  
  @Field(type => ButtonVariant)
  readonly variant?: ButtonVariant

  @Field(type => ButtonColor)
  readonly color?: ButtonColor

  @Field(type => ButtonSize)
  readonly size?: ButtonSize

  @Field(type => Icon)
  readonly startIcon?: Icon

  @Field(type => Icon)
  readonly endIcon?: Icon

  @Field(type => Action)
  readonly action?: Action
}

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

@ObjectType({ implements: () => [Block]})
export class GridContainerBlock extends Block {
  @Field(type => Int)
  readonly spacing: number

  @Field(type => GridDirection)
  readonly direction: GridDirection

  @Field(type => GridJustifyContent)
  readonly justifyContent: GridJustifyContent

  @Field(type => GridAlignItems)
  readonly alignItems: GridAlignItems
}

@ObjectType({ implements: () => [Block]})
export class GridItemBlock extends Block {
  @Field(type => Int)
  readonly xl: number

  @Field(type => Int)
  readonly lg: number

  @Field(type => Int)
  readonly sm: number
}

@ObjectType({ implements: () => [Block]})
export class ImageBlock extends Block {
  @Field()
  readonly src: string

  @Field(type => Int)
  readonly width: number
  
  @Field(type => Int)
  readonly height: number

  @Field()
  readonly alt: string

  @Field({ description: `blurhash is a compact representation of a placeholder for an image.
  Find a frontend implementation at https://github.com/woltapp/blurhash`})
  readonly blurhash: string
}

@ObjectType({ implements: () => [Block]})
export class RadioOptionBlock extends Block {
  @Field()
  readonly label: string

  @Field(type => Action)
  readonly action?: Action
}

@ObjectType({ implements: () => [Block]})
export class RadioQuestionBlock extends Block {
  @Field()
  readonly label: string

  @Field()
  readonly description?: string
}

@ObjectType({ implements: () => [Block]})  
export class SignUpBlock extends Block {
    @Field(type => Action)
    readonly action?: Action

    @Field(type => Icon)
    readonly submitIcon?: Icon

    @Field()
    readonly submitLabel?: string
}

@ObjectType({ implements: () => [Block]})
export class StepBlock extends Block {
  @Field(type => ID, { description: `
  nextBlockId contains the preferred block to navigate to when a
  NavigateAction occurs or if the user manually tries to advance to the next
  step. If no nextBlockId is set it can be assumed that this step represents
  the end of the current journey.`})
  readonly nextBlockId?: string

  @Field(type => Boolean, { description: `locked will be set to true if the user should not be able to manually
  advance to the next step.`})
  readonly locked: Boolean
  
  @Field(type => ID)
  readonly parentBlockId?: string
}

@ObjectType({ implements: () => [Block]})
export class TypographyBlock extends Block {
  @Field()
  readonly content: string

  @Field(type => TypographyVariant)
  readonly variant?: TypographyVariant

  @Field(type => TypographyColor)
  readonly color?: TypographyColor

  @Field(type => TypographyAlign)
  readonly align?: TypographyAlign
}

@ObjectType({ implements: () => [Block]})
export class VideoBlock extends Block {
  @Field()
  readonly title: string

  @Field(type => Int, { description: 'startAt dictates at which point of time the video should start playing'})
  readonly startAt?: number

  @Field(type => Int, { description: 'endAt dictates at which point of time the video should end'})
  readonly endAt?: number

  @Field()
  readonly description?: string

  @Field(type => Boolean)
  readonly muted?: Boolean

  @Field(type => Boolean)
  readonly autoplay?: Boolean

  @Field(type => VideoContent)
  readonly videoContent: VideoContent

  @Field(type => ID, { description: `posterBlockId is present if a child block should be used as a poster.
  This child block should not be rendered normally, instead it should be used
  as the video poster. PosterBlock should be of type ImageBlock.`})
  readonly posterBlockId?: string
}

@ObjectType({ implements: () => [Block], description: `VideoTriggerBlock is a block that indicates the video to navigate
to the next block at the designated time.`})
export class VideoTriggerBlock extends Block {

  @Field(type => Int, { description: `triggerStart sets the time as to when a video navigates to the next block,
  this is the number of seconds since the start of the video`})
  readonly triggerStart: number

  @Field(type => Action)
  readonly action: Action
}