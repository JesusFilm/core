'use client'
import type { VariantProps } from '@gluestack-ui/nativewind-utils'
import { tva } from '@gluestack-ui/nativewind-utils/tva'
import { withStates } from '@gluestack-ui/nativewind-utils/withStates'
import {
  useStyleContext,
  withStyleContext
} from '@gluestack-ui/nativewind-utils/withStyleContext'
import { withStyleContextAndStates } from '@gluestack-ui/nativewind-utils/withStyleContextAndStates'
import { createRadio } from '@gluestack-ui/radio'
import { cssInterop } from 'nativewind'
import React, { useMemo } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { Svg } from 'react-native-svg'

const IndicatorWrapper = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View>
>(({ ...props }, ref) => {
  return <View {...props} ref={ref} />
})

const LabelWrapper = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentProps<typeof Text>
>(({ ...props }, ref) => {
  return <Text {...props} ref={ref} />
})

const IconWrapper = React.forwardRef<
  React.ElementRef<typeof PrimitiveIcon>,
  React.ComponentProps<typeof PrimitiveIcon>
>(({ ...props }, ref) => {
  return <PrimitiveIcon {...props} ref={ref} />
})

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

const radioStyle = tva({
  base: 'group/radio web:cursor-pointer data-[disabled=true]:web:cursor-not-allowed flex-row items-center justify-start',
  variants: {
    size: {
      sm: 'gap-1.5',
      md: 'gap-2',
      lg: 'gap-2'
    }
  }
})

const radioGroupStyle = tva({
  base: 'gap-2'
})

const radioIconStyle = tva({
  base: 'text-background-800 fill-background-800 items-center justify-center rounded-full',

  parentVariants: {
    size: {
      sm: 'h-[9px] w-[9px]',
      md: 'h-3 w-3',
      lg: 'h-4 w-4'
    }
  }
})

const radioIndicatorStyle = tva({
  base: 'border-outline-400 data-[focus-visible=true]:web:outline-2 data-[focus-visible=true]:web:outline-primary-700 data-[focus-visible=true]:web:outline data-[checked=true]:border-primary-600 data-[hover=true]:border-outline-500 data-[hover=true]:data-[checked=true]:border-primary-700 data-[hover=true]:data-[invalid=true]:border-error-700 data-[hover=true]:data-[disabled=true]:border-outline-400 data-[hover=true]:data-[disabled=true]:data-[invalid=true]:border-error-400 data-[active=true]:border-primary-800 data-[invalid=true]:border-error-700 data-[disabled=true]:data-[checked=true]:border-outline-400 data-[disabled=true]:data-[invalid=true]:border-error-400 items-center justify-center rounded-full border-2 bg-transparent data-[active=true]:bg-transparent data-[checked=true]:bg-transparent data-[disabled=true]:data-[checked=true]:bg-transparent data-[hover=true]:bg-transparent data-[hover=true]:data-[checked=true]:bg-transparent data-[disabled=true]:opacity-40 data-[hover=true]:data-[disabled=true]:opacity-40',
  parentVariants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    }
  }
})

const radioLabelStyle = tva({
  base: 'text-typography-600 data-[checked=true]:text-typography-900 data-[hover=true]:text-typography-900 data-[hover=true]:data-[disabled=true]:text-typography-600 data-[hover=true]:data-[disabled=true]:data-[checked=true]:text-typography-900 data-[active=true]:text-typography-900 data-[active=true]:data-[checked=true]:text-typography-900 web:select-none data-[disabled=true]:opacity-40',
  parentVariants: {
    size: {
      '2xs': 'text-2xs',
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
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

const SCOPE = 'Radio'

const UIRadio = createRadio({
  Root: (Platform.OS === 'web'
    ? withStyleContext(View, SCOPE)
    : withStyleContextAndStates(Pressable, SCOPE)) as ReturnType<
    typeof withStyleContextAndStates<typeof Pressable>
  >,
  Group: View,
  Icon: Platform.OS === 'web' ? IconWrapper : withStates(IconWrapper),
  Indicator:
    Platform.OS === 'web' ? IndicatorWrapper : withStates(IndicatorWrapper),
  Label: Platform.OS === 'web' ? LabelWrapper : withStates(LabelWrapper)
})

cssInterop(UIRadio, { className: 'style' })
cssInterop(UIRadio.Group, { className: 'style' })
cssInterop(IndicatorWrapper, { className: 'style' })
cssInterop(LabelWrapper, { className: 'style' })
// @ts-expect-error
cssInterop(IconWrapper, {
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

type IRadioProps = Omit<React.ComponentProps<typeof UIRadio>, 'context'> &
  VariantProps<typeof radioStyle>
const Radio = React.forwardRef<React.ElementRef<typeof UIRadio>, IRadioProps>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <UIRadio
        className={radioStyle({ class: className, size })}
        {...props}
        ref={ref}
        context={{ size }}
      />
    )
  }
)

type IRadioGroupProps = React.ComponentProps<typeof UIRadio.Group> &
  VariantProps<typeof radioGroupStyle>
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof UIRadio.Group>,
  IRadioGroupProps
>(({ className, ...props }, ref) => {
  return (
    <UIRadio.Group
      className={radioGroupStyle({ class: className })}
      {...props}
      ref={ref}
    />
  )
})

type IRadioIndicatorProps = React.ComponentProps<typeof UIRadio.Indicator> &
  VariantProps<typeof radioIndicatorStyle>
const RadioIndicator = React.forwardRef<
  React.ElementRef<typeof UIRadio.Indicator>,
  IRadioIndicatorProps
>(({ className, ...props }, ref) => {
  const { size } = useStyleContext(SCOPE)
  return (
    <UIRadio.Indicator
      className={radioIndicatorStyle({
        parentVariants: { size },
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

type IRadioLabelProps = React.ComponentProps<typeof UIRadio.Label> &
  VariantProps<typeof radioIndicatorStyle>
const RadioLabel = React.forwardRef<
  React.ElementRef<typeof UIRadio.Label>,
  IRadioLabelProps
>(({ className, ...props }, ref) => {
  const { size } = useStyleContext(SCOPE)
  return (
    <UIRadio.Label
      className={radioLabelStyle({
        parentVariants: { size },
        class: className
      })}
      ref={ref}
      {...props}
    />
  )
})

type IRadioIconProps = React.ComponentProps<typeof UIRadio.Icon> &
  VariantProps<typeof radioIconStyle>
const RadioIcon = React.forwardRef<
  React.ElementRef<typeof UIRadio.Icon>,
  IRadioIconProps
>(({ className, size, ...props }, ref) => {
  const { size: parentSize } = useStyleContext(SCOPE)

  if (typeof size === 'number') {
    return (
      <UIRadio.Icon
        ref={ref}
        {...props}
        className={radioIconStyle({ class: className })}
        size={size}
      />
    )
  } else if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIRadio.Icon
        ref={ref}
        {...props}
        className={radioIconStyle({ class: className })}
      />
    )
  }

  return (
    <UIRadio.Icon
      {...props}
      className={radioIconStyle({
        parentVariants: {
          size: parentSize
        },
        size,
        class: className
      })}
      ref={ref}
    />
  )
})

Radio.displayName = 'Radio'
RadioGroup.displayName = 'RadioGroup'
RadioIndicator.displayName = 'RadioIndicator'
RadioLabel.displayName = 'RadioLabel'
RadioIcon.displayName = 'RadioIcon'

export { Radio, RadioGroup, RadioIndicator, RadioLabel, RadioIcon }
