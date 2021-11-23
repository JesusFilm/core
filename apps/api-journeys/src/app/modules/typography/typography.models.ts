import { registerEnumType } from "@nestjs/graphql";

export enum TypographyVariant {
    h1 = 'h1',
    h2 = 'h2',
    h3 = 'h3',
    h4 = 'h4',
    h5 = 'h5',
    h6 = 'h6',
    subtitle1 = 'subtitle1',
    subtitle2 = 'subtitle2',
    body1 = 'body1',
    body2 = 'body2',
    caption = 'caption',
    overline = 'overline'
}
registerEnumType(TypographyVariant, { name: 'TypographyVariant' })

export enum TypographyColor {
    primary = 'primary',
    secondary = 'secondary',
    error = 'error'
}
registerEnumType(TypographyColor, { name: 'TypographyColor' })

export enum TypographyAlign {
    left = 'left',
    center = 'center',
    right = 'right'
}

registerEnumType(TypographyAlign, { name: 'TypographyAlign' })