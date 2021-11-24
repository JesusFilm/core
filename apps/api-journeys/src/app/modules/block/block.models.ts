import { Directive, Field, ID, Int, InterfaceType, ObjectType } from '@nestjs/graphql'
import { Action } from '../action/action.models'
import { ButtonColor, ButtonSize, ButtonVariant } from '../button/button.models'
import { GridAlignItems, GridDirection, GridJustifyContent } from '../grid/grid.models'
import { Icon } from '../icon/icon.models'
import { Journey } from '../journey/journey.models'
import { ThemeMode, ThemeName } from '../theme/theme.models'
import { TypographyAlign, TypographyColor, TypographyVariant } from '../typography/typography.models'
import { VideoContent } from '../video/video.models'

@InterfaceType({
  resolveType(obj) {
    switch(obj.type) {
      case 'ButtonBlock':
        return ButtonBlock;
      case 'CardBlock':
        return CardBlock;
      case 'GridContainerBlock':
        return GridContainerBlock;
      case 'GridItemBlock':
        return GridItemBlock;
      case 'ImageBlock':
        return ImageBlock;
      case 'RadioOptionBlock':
        return RadioOptionBlock;
      case 'RadioQuestionBlock':
        return RadioQuestionBlock;
      case 'SignUpBlock':
        return SignUpBlock;
      case 'StepBlock':
        return StepBlock;
      case 'TypographyBlock':
        return TypographyBlock;
      case 'VideoBlock':
        return VideoBlock;
      case 'VideoTriggerBlock':
        return VideoTriggerBlock;
      default:
        console.log('Bad Block', obj);
    }
  }
})
@Directive('@key(fields: "id")')
export abstract class Block {
  @Field(type => ID, { name: 'id' })
  readonly _key: string

  @Field(type => ID, { nullable: true })
  readonly parentBlockId?: string

  // @Field(type => Journey)
  // readonly journey: Journey
  readonly journeyId: string;

  type: string;
  readonly parentOrder: number;  
}

@ObjectType({ implements: () => [Block]})
export class ButtonBlock extends Block {
  @Field()
  readonly label: string;
  
  @Field(type => ButtonVariant, { nullable: true })
  readonly variant?: ButtonVariant

  @Field(type => ButtonColor, { nullable: true })
  readonly color?: ButtonColor

  @Field(type => ButtonSize, { nullable: true })
  readonly size?: ButtonSize

  @Field(type => Icon, { nullable: true })
  readonly startIcon?: Icon

  @Field(type => Icon, { nullable: true })
  readonly endIcon?: Icon

  @Field(type => Action, { nullable: true })
  readonly action?: Action
}

@ObjectType({ implements: () => [Block] })
export class CardBlock extends Block {
  type: 'CardBlock'
  @Field({ nullable: true,
    description:
      'backgroundColor should be a HEX color value e.g #FFFFFF for white.'
  })
  readonly backgroundColor?: string

  @Field({ nullable: true,
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
  readonly fullscreen: boolean

  @Field((type) => ThemeMode, { nullable: true,
    description: `themeMode can override journey themeMode. If nothing is set then use
    themeMode from journey`
  })
  themeMode?: ThemeMode

  @Field((type) => ThemeName, { nullable: true,
    description: `themeName can override journey themeName. If nothing is set then use
    themeName from journey`
  })
  themeName?: ThemeName
}

@ObjectType({ implements: () => [Block]})
export class GridContainerBlock extends Block {
  type: 'GridContainerBlock'
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
  type: 'GridItemBlock';
  @Field(type => Int)
  readonly xl: number

  @Field(type => Int)
  readonly lg: number

  @Field(type => Int)
  readonly sm: number
}

@ObjectType({ implements: () => [Block]})
export class ImageBlock extends Block {
  type: 'ImageBlock'
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
  type: 'RadioOptionBlock'
  @Field()
  readonly label: string

  @Field(type => Action, { nullable: true })
  readonly action?: Action
}

@ObjectType({ implements: () => [Block]})
export class RadioQuestionBlock extends Block {
  type: 'RadioQuestionBlock'
  @Field()
  readonly label: string

  @Field({ nullable: true })
  readonly description?: string
}

@ObjectType({ implements: () => [Block]})  
export class SignUpBlock extends Block {
  type: 'SignUpBlock';
    @Field(type => Action, { nullable: true })
    readonly action?: Action

    @Field(type => Icon, { nullable: true })
    readonly submitIcon?: Icon

    @Field({ nullable: true })
    readonly submitLabel?: string
}

@ObjectType({ implements: () => [Block]})
export class StepBlock extends Block {
  type: 'StepBlock'
  @Field(type => ID, { nullable: true, description: `
  nextBlockId contains the preferred block to navigate to when a
  NavigateAction occurs or if the user manually tries to advance to the next
  step. If no nextBlockId is set it can be assumed that this step represents
  the end of the current journey.`})
  readonly nextBlockId?: string

  @Field(type => Boolean, { description: `locked will be set to true if the user should not be able to manually
  advance to the next step.`})
  readonly locked: Boolean
}

@ObjectType({ implements: () => [Block]})
export class TypographyBlock extends Block {
  type: 'TypographyBlock';
  @Field()
  readonly content: string

  @Field(type => TypographyVariant, { nullable: true })
  readonly variant?: TypographyVariant

  @Field(type => TypographyColor, { nullable: true })
  readonly color?: TypographyColor

  @Field(type => TypographyAlign, { nullable: true })
  readonly align?: TypographyAlign
}

@ObjectType({ implements: () => [Block]})
export class VideoBlock extends Block {
  type: 'VideoBlock'
  @Field()
  readonly title: string

  @Field(type => Int, { nullable: true,description: 'startAt dictates at which point of time the video should start playing'})
  readonly startAt?: number

  @Field(type => Int, { nullable: true, description: 'endAt dictates at which point of time the video should end'})
  readonly endAt?: number

  @Field({ nullable: true })
  readonly description?: string

  @Field(type => Boolean, { nullable: true })
  readonly muted?: Boolean

  @Field(type => Boolean, { nullable: true })
  readonly autoplay?: Boolean

  @Field(type => VideoContent)
  readonly videoContent: VideoContent

  @Field(type => ID, { nullable: true, description: `posterBlockId is present if a child block should be used as a poster.
  This child block should not be rendered normally, instead it should be used
  as the video poster. PosterBlock should be of type ImageBlock.`})
  readonly posterBlockId?: string
}

@ObjectType({ implements: () => [Block], description: `VideoTriggerBlock is a block that indicates the video to navigate
to the next block at the designated time.`})
export class VideoTriggerBlock extends Block {
  type: 'VideoTriggerBlock'
  @Field(type => Int, { nullable: true, description: `triggerStart sets the time as to when a video navigates to the next block,
  this is the number of seconds since the start of the video`})
  readonly triggerStart: number

  @Field(type => Action, { nullable: true })
  readonly action: Action
}