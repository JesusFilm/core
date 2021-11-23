import { registerEnumType } from "@nestjs/graphql";

export enum GridDirection {
    columnReverse = 'columnReverse',
    column = 'column',
    row = 'row',
    rowReverse = 'rowReverse'
}
registerEnumType(GridDirection, { name: 'GridDirection' })

export enum GridJustifyContent {
    flexStart = 'flexStart',
    flexEnd = 'flexEnd',
    center = 'center'
}
registerEnumType(GridJustifyContent, { name: 'GridJustifyContent' })

export enum GridAlignItems {
    baseline = 'baseline',
    flexStart = 'flexStart',
    flexEnd = 'flexEnd',
    center = 'center'
}
registerEnumType(GridAlignItems, { name: 'GridAlignItems' })