import { registerEnumType } from '@nestjs/graphql'

export enum ButtonColor {
    error = 'error',
    inherit = 'inherit',
    primary = 'primary',
    secondary = 'secondary'
}
registerEnumType(ButtonColor, { name: 'ButtonColor' })

export enum ButtonVariant {
  contained = 'contained',
  text = 'text'
}
registerEnumType(ButtonVariant, { name: 'ButtonVariant' })

export enum ButtonSize {
    large = 'large',
    medium = 'medium',
    small = 'small'
}
registerEnumType(ButtonSize, { name: 'ButtonSize' })

