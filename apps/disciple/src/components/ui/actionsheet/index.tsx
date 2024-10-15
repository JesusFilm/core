'use client'
import { H4 } from '@expo/html-elements'
import { createActionsheet } from '@gluestack-ui/actionsheet'
import type { VariantProps } from '@gluestack-ui/nativewind-utils'
import { tva } from '@gluestack-ui/nativewind-utils/tva'
import { withStates } from '@gluestack-ui/nativewind-utils/withStates'
import {
  AnimatePresence,
  Motion,
  createMotionAnimatedComponent
} from '@legendapp/motion'
import { cssInterop } from 'nativewind'
import React, { useMemo } from 'react'
import {
  FlatList,
  Platform,
  Pressable,
  PressableProps,
  ScrollView,
  SectionList,
  Text,
  View,
  VirtualizedList
} from 'react-native'
import { Svg } from 'react-native-svg'

interface IPrimitiveIcon {
  height?: number | string
  width?: number | string
  fill?: string
  color?: string
  size?: number | string
  stroke?: string
  as?: React.ElementType
  className?: string
  classNameColor?: string
}
const PrimitiveIcon = React.forwardRef<
  React.ElementRef<typeof Svg>,
  IPrimitiveIcon
>(
  (
    {
      height,
      width,
      fill,
      color,
      classNameColor,
      size,
      stroke = 'currentColor',
      as: AsComp,
      ...props
    },
    ref
  ) => {
    color = color ?? classNameColor
    const sizeProps = useMemo(() => {
      if (size) return { size }
      if (height && width) return { height, width }
      if (height) return { height }
      if (width) return { width }
      return {}
    }, [size, height, width])

    let colorProps = {}
    if (fill) {
      colorProps = { ...colorProps, fill }
    }
    if (stroke !== 'currentColor') {
      colorProps = { ...colorProps, stroke }
    } else if (stroke === 'currentColor' && color !== undefined) {
      colorProps = { ...colorProps, stroke: color }
    }

    if (AsComp) {
      return <AsComp ref={ref} {...props} {...sizeProps} {...colorProps} />
    }
    return (
      <Svg ref={ref} height={height} width={width} {...colorProps} {...props} />
    )
  }
)

const ItemWrapper = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PressableProps
>(({ ...props }, ref) => {
  return <Pressable {...props} ref={ref} />
})

const AnimatedPressable = createMotionAnimatedComponent(Pressable)

export const UIActionsheet = createActionsheet({
  Root: View,
  Content: Motion.View,
  Item: Platform.OS === 'web' ? ItemWrapper : withStates(ItemWrapper),
  ItemText: Text,
  DragIndicator: View,
  IndicatorWrapper: View,
  Backdrop: AnimatedPressable,
  ScrollView,
  VirtualizedList,
  FlatList,
  SectionList,
  SectionHeaderText: H4,
  Icon: PrimitiveIcon,
  AnimatePresence
})

cssInterop(UIActionsheet, { className: 'style' })
cssInterop(UIActionsheet.Content, { className: 'style' })
cssInterop(ItemWrapper, { className: 'style' })
cssInterop(UIActionsheet.ItemText, { className: 'style' })
cssInterop(UIActionsheet.DragIndicator, { className: 'style' })
cssInterop(UIActionsheet.DragIndicatorWrapper, { className: 'style' })
cssInterop(UIActionsheet.Backdrop, { className: 'style' })
cssInterop(UIActionsheet.ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
  indicatorClassName: 'indicatorStyle'
})
cssInterop(UIActionsheet.VirtualizedList, {
  className: 'style',
  ListFooterComponentClassName: 'ListFooterComponentStyle',
  ListHeaderComponentClassName: 'ListHeaderComponentStyle',
  contentContainerClassName: 'contentContainerStyle',
  indicatorClassName: 'indicatorStyle'
})
cssInterop(UIActionsheet.FlatList, {
  className: 'style',
  ListFooterComponentClassName: 'ListFooterComponentStyle',
  ListHeaderComponentClassName: 'ListHeaderComponentStyle',
  columnWrapperClassName: 'columnWrapperStyle',
  contentContainerClassName: 'contentContainerStyle',
  indicatorClassName: 'indicatorStyle'
})
cssInterop(UIActionsheet.SectionList, { className: 'style' })
cssInterop(UIActionsheet.SectionHeaderText, { className: 'style' })
// @ts-expect-error
cssInterop(UIActionsheet.Icon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: 'classNameColor',
      stroke: true
    }
  }
})

const actionsheetStyle = tva({ base: 'web:pointer-events-none h-full w-full' })

const actionsheetContentStyle = tva({
  base: 'bg-background-0 web:pointer-events-auto web:select-none shadow-hard-5 border-outline-100 items-center rounded-tl-3xl rounded-tr-3xl border border-b-0 p-5 pt-2'
})

const actionsheetItemStyle = tva({
  base: 'data-[disabled=true]:web:pointer-events-auto data-[disabled=true]:web:cursor-not-allowed hover:bg-background-50 active:bg-background-100 data-[focus=true]:bg-background-100 web:data-[focus-visible=true]:bg-background-100 web:data-[focus-visible=true]:outline-indicator-primary w-full flex-row items-center gap-2 rounded-sm p-3 data-[disabled=true]:opacity-40'
})

const actionsheetItemTextStyle = tva({
  base: 'text-typography-700 font-body font-normal',
  variants: {
    isTruncated: {
      true: ''
    },
    bold: {
      true: 'font-bold'
    },
    underline: {
      true: 'underline'
    },
    strikeThrough: {
      true: 'line-through'
    },
    size: {
      '2xs': 'text-2xs',
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-md',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl'
    }
  }
})

const actionsheetDragIndicatorStyle = tva({
  base: 'bg-background-400 h-1 w-16 rounded-full'
})

const actionsheetDragIndicatorWrapperStyle = tva({
  base: 'w-full items-center py-1'
})

const actionsheetBackdropStyle = tva({
  base: 'bg-background-dark web:cursor-default web:pointer-events-auto absolute bottom-0 left-0 right-0 top-0'
})

const actionsheetScrollViewStyle = tva({
  base: 'h-auto w-full'
})

const actionsheetVirtualizedListStyle = tva({
  base: 'h-auto w-full'
})

const actionsheetFlatListStyle = tva({
  base: 'h-auto w-full'
})

const actionsheetSectionListStyle = tva({
  base: 'h-auto w-full'
})

const actionsheetSectionHeaderTextStyle = tva({
  base: 'font-heading text-typography-500 my-0 p-3 font-bold uppercase leading-5',
  variants: {
    isTruncated: {
      true: ''
    },
    bold: {
      true: 'font-bold'
    },
    underline: {
      true: 'underline'
    },
    strikeThrough: {
      true: 'line-through'
    },
    size: {
      '5xl': 'text-5xl',
      '4xl': 'text-4xl',
      '3xl': 'text-3xl',
      '2xl': 'text-2xl',
      xl: 'text-xl',
      lg: 'text-lg',
      md: 'text-md',
      sm: 'text-sm',
      xs: 'text-xs'
    },

    sub: {
      true: 'text-xs'
    },
    italic: {
      true: 'italic'
    },
    highlight: {
      true: 'bg-yellow500'
    }
  },
  defaultVariants: {
    size: 'xs'
  }
})

const actionsheetIconStyle = tva({
  base: 'text-background-500 fill-none',
  variants: {
    size: {
      '2xs': 'h-3 w-3',
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-[18px] w-[18px]',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6'
    }
  }
})

type IActionsheetProps = VariantProps<typeof actionsheetStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet>

type IActionsheetContentProps = VariantProps<typeof actionsheetContentStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.Content> & {
    className?: string
  }

type IActionsheetItemProps = VariantProps<typeof actionsheetItemStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.Item>

type IActionsheetItemTextProps = VariantProps<typeof actionsheetItemTextStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.ItemText>

type IActionsheetDragIndicatorProps = VariantProps<
  typeof actionsheetDragIndicatorStyle
> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.DragIndicator>

type IActionsheetDragIndicatorWrapperProps = VariantProps<
  typeof actionsheetDragIndicatorWrapperStyle
> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.DragIndicatorWrapper>

type IActionsheetBackdropProps = VariantProps<typeof actionsheetBackdropStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.Backdrop> & {
    className?: string
  }

type IActionsheetScrollViewProps = VariantProps<
  typeof actionsheetScrollViewStyle
> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.ScrollView>

type IActionsheetVirtualizedListProps = VariantProps<
  typeof actionsheetVirtualizedListStyle
> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.VirtualizedList>

type IActionsheetFlatListProps = VariantProps<typeof actionsheetFlatListStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.FlatList>

type IActionsheetSectionListProps = VariantProps<
  typeof actionsheetSectionListStyle
> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.SectionList>

type IActionsheetSectionHeaderTextProps = VariantProps<
  typeof actionsheetSectionHeaderTextStyle
> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.SectionHeaderText>

type IActionsheetIconProps = VariantProps<typeof actionsheetIconStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.Icon> & {
    className?: string
    as?: React.ElementType
  }

const Actionsheet = React.forwardRef<
  React.ElementRef<typeof UIActionsheet>,
  IActionsheetProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet
      className={actionsheetStyle({
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

const ActionsheetContent = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.Content>,
  IActionsheetContentProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.Content
      className={actionsheetContentStyle({
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

const ActionsheetItem = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.Item>,
  IActionsheetItemProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.Item
      className={actionsheetItemStyle({
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

const ActionsheetItemText = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.ItemText>,
  IActionsheetItemTextProps
>(
  (
    {
      isTruncated,
      bold,
      underline,
      strikeThrough,
      size = 'sm',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <UIActionsheet.ItemText
        className={actionsheetItemTextStyle({
          class: className,
          isTruncated,
          bold,
          underline,
          strikeThrough,
          size
        })}
        ref={ref}
        {...props}
      />
    )
  }
)

const ActionsheetDragIndicator = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.DragIndicator>,
  IActionsheetDragIndicatorProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.DragIndicator
      className={actionsheetDragIndicatorStyle({
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

const ActionsheetDragIndicatorWrapper = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.DragIndicatorWrapper>,
  IActionsheetDragIndicatorWrapperProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.DragIndicatorWrapper
      className={actionsheetDragIndicatorWrapperStyle({
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

const ActionsheetBackdrop = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.Backdrop>,
  IActionsheetBackdropProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.Backdrop
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 0.5
      }}
      exit={{
        opacity: 0
      }}
      {...props}
      className={actionsheetBackdropStyle({
        class: className
      })}
      ref={ref}
    />
  )
})

const ActionsheetScrollView = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.ScrollView>,
  IActionsheetScrollViewProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.ScrollView
      className={actionsheetScrollViewStyle({
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

const ActionsheetVirtualizedList = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.VirtualizedList>,
  IActionsheetVirtualizedListProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.VirtualizedList
      className={actionsheetVirtualizedListStyle({
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

const ActionsheetFlatList = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.FlatList>,
  IActionsheetFlatListProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.FlatList
      className={actionsheetFlatListStyle({
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

const ActionsheetSectionList = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.SectionList>,
  IActionsheetSectionListProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.SectionList
      className={actionsheetSectionListStyle({
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

const ActionsheetSectionHeaderText = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.SectionHeaderText>,
  IActionsheetSectionHeaderTextProps
>(
  (
    {
      className,
      isTruncated,
      bold,
      underline,
      strikeThrough,
      size,
      sub,
      italic,
      highlight,
      ...props
    },
    ref
  ) => {
    return (
      <UIActionsheet.SectionHeaderText
        className={actionsheetSectionHeaderTextStyle({
          class: className,
          isTruncated,
          bold,
          underline,
          strikeThrough,
          size,
          sub,
          italic,
          highlight
        })}
        ref={ref}
        {...props}
      />
    )
  }
)

const ActionsheetIcon = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.Icon>,
  IActionsheetIconProps
>(({ className, size = 'sm', ...props }, ref) => {
  if (typeof size === 'number') {
    return (
      <UIActionsheet.Icon
        ref={ref}
        {...props}
        className={actionsheetIconStyle({ class: className })}
        size={size}
      />
    )
  } else if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIActionsheet.Icon
        ref={ref}
        {...props}
        className={actionsheetIconStyle({ class: className })}
      />
    )
  }
  return (
    <UIActionsheet.Icon
      className={actionsheetIconStyle({
        class: className,
        size
      })}
      ref={ref}
      {...props}
    />
  )
})

export {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
  ActionsheetScrollView,
  ActionsheetVirtualizedList,
  ActionsheetFlatList,
  ActionsheetSectionList,
  ActionsheetSectionHeaderText,
  ActionsheetIcon
}
