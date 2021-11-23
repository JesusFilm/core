import { Field, ObjectType } from "@nestjs/graphql";
import { registerEnumType } from '@nestjs/graphql'

@ObjectType()
export class Icon {
    @Field(type => IconName)
    readonly name: IconName

    @Field(type => IconColor)
    readonly color?: IconColor

    @Field(type => IconSize)
    readonly size?: IconSize
}

export enum IconName {
    ArrowForwardRounded = 'ArrowForwardRounded',
    BeenhereRounded = 'BeenhereRounded',
    ChatBubbleOutlineRounded = 'ChatBubbleOutlineRounded',
    CheckCircleRounded = 'seconCheckCircleRoundeddary',
    ChevronRightRounded = 'ChevronRightRounded',
    ContactSupportRounded = 'ContactSupportRounded',
    FormatQuoteRounded = 'FormatQuoteRounded',
    LiveTvRounded = 'LiveTvRounded',
    LockOpenRounded = 'LockOpenRounded',
    MenuBookRounded = 'MenuBookRounded',
    PlayArrowRounded = 'PlayArrowRounded',
    RadioButtonUncheckedRounded = 'RadioButtonUncheckedRounded',
    SendRounded = 'SendRounded',
    SubscriptionsRounded = 'SubscriptionsRounded',
    TranslateRounded = 'TranslateRounded'
}
registerEnumType(IconName, { name: 'IconName' })

export enum IconColor {
    action = 'action', 
    disabled = 'disabled',
    error = 'error',
    inherit = 'inherit',
    primary = 'primary',
    secondary = 'secondary'
}
registerEnumType(IconColor, { name: 'IconColor' })

export enum IconSize {
    inherit = 'inherit',
    lg = 'lg',
    md = 'md',
    sm = 'sm',
    xl = 'xl'
}
registerEnumType(IconSize, { name: 'IconSize' })