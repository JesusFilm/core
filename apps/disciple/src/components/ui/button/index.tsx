'use client'
import { createButton } from '@gluestack-ui/button'
import type { VariantProps } from '@gluestack-ui/nativewind-utils'
import { tva } from '@gluestack-ui/nativewind-utils/tva'
import { withStates } from '@gluestack-ui/nativewind-utils/withStates'
import {
  useStyleContext,
  withStyleContext
} from '@gluestack-ui/nativewind-utils/withStyleContext'
import { withStyleContextAndStates } from '@gluestack-ui/nativewind-utils/withStyleContextAndStates'
import { cssInterop } from 'nativewind'
import React, { useMemo } from 'react'
import type { PressableProps } from 'react-native'
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View
} from 'react-native'
import { Svg } from 'react-native-svg'

const SCOPE = 'BUTTON'
const ButtonWrapper = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PressableProps
>(({ ...props }, ref) => {
  return <Pressable {...props} ref={ref} />
})

type IPrimitiveIcon = React.ComponentPropsWithoutRef<typeof Svg> & {
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

const Root =
  Platform.OS === 'web'
    ? withStyleContext(ButtonWrapper, SCOPE)
    : withStyleContextAndStates(ButtonWrapper, SCOPE)

const UIButton = createButton({
  Root,
  Text,
  Group: View,
  Spinner: ActivityIndicator,
  Icon: withStates(PrimitiveIcon)
})

cssInterop(Root, { className: 'style' })
cssInterop(UIButton.Text, { className: 'style' })
cssInterop(UIButton.Group, { className: 'style' })
cssInterop(UIButton.Spinner, {
  className: { target: 'style', nativeStyleToProp: { color: true } }
})
// @ts-expect-error
cssInterop(PrimitiveIcon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      // @ts-expect-error
      fill: true,
      color: 'classNameColor',
      stroke: true
    }
  }
})

const buttonStyle = tva({
  base: 'group/button bg-primary-500 data-[focus-visible=true]:web:outline-none data-[focus-visible=true]:web:ring-2 flex-row items-center justify-center gap-2 rounded data-[disabled=true]:opacity-40',
  variants: {
    action: {
      primary:
        'bg-primary-500 data-[hover=true]:bg-primary-600 data-[active=true]:bg-primary-700 border-primary-300 data-[hover=true]:border-primary-400 data-[active=true]:border-primary-500 data-[focus-visible=true]:web:ring-indicator-info',
      secondary:
        'bg-secondary-500 border-secondary-300 data-[hover=true]:bg-secondary-600 data-[hover=true]:border-secondary-400 data-[active=true]:bg-secondary-700 data-[active=true]:border-secondary-500 data-[focus-visible=true]:web:ring-indicator-info',
      positive:
        'bg-success-500 border-success-300 data-[hover=true]:bg-success-600 data-[hover=true]:border-success-400 data-[active=true]:bg-success-700 data-[active=true]:border-success-500 data-[focus-visible=true]:web:ring-indicator-info',
      negative:
        'bg-error-500 border-error-300 data-[hover=true]:bg-error-600 data-[hover=true]:border-error-400 data-[active=true]:bg-error-700 data-[active=true]:border-error-500 data-[focus-visible=true]:web:ring-indicator-info',
      default:
        'data-[hover=true]:bg-background-50 bg-transparent data-[active=true]:bg-transparent'
    },
    variant: {
      link: 'px-0',
      outline:
        'data-[hover=true]:bg-background-50 border bg-transparent data-[active=true]:bg-transparent',
      solid: ''
    },

    size: {
      xs: 'h-8 px-3.5',
      sm: 'h-9 px-4',
      md: 'h-10 px-5',
      lg: 'h-11 px-6',
      xl: 'h-12 px-7'
    }
  },
  compoundVariants: [
    {
      action: 'primary',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[active=true]:bg-transparent data-[hover=true]:bg-transparent'
    },
    {
      action: 'secondary',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[active=true]:bg-transparent data-[hover=true]:bg-transparent'
    },
    {
      action: 'positive',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[active=true]:bg-transparent data-[hover=true]:bg-transparent'
    },
    {
      action: 'negative',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[active=true]:bg-transparent data-[hover=true]:bg-transparent'
    },
    {
      action: 'primary',
      variant: 'outline',
      class:
        'data-[hover=true]:bg-background-50 bg-transparent data-[active=true]:bg-transparent'
    },
    {
      action: 'secondary',
      variant: 'outline',
      class:
        'data-[hover=true]:bg-background-50 bg-transparent data-[active=true]:bg-transparent'
    },
    {
      action: 'positive',
      variant: 'outline',
      class:
        'data-[hover=true]:bg-background-50 bg-transparent data-[active=true]:bg-transparent'
    },
    {
      action: 'negative',
      variant: 'outline',
      class:
        'data-[hover=true]:bg-background-50 bg-transparent data-[active=true]:bg-transparent'
    }
  ]
})

const buttonTextStyle = tva({
  base: 'text-typography-0 web:select-none font-semibold',
  parentVariants: {
    action: {
      primary:
        'text-primary-600 data-[hover=true]:text-primary-600 data-[active=true]:text-primary-700',
      secondary:
        'text-secondary-600 data-[hover=true]:text-secondary-600 data-[active=true]:text-secondary-700',
      positive:
        'text-success-600 data-[hover=true]:text-success-600 data-[active=true]:text-success-700',
      negative:
        'text-error-600 data-[hover=true]:text-error-600 data-[active=true]:text-error-700'
    },
    variant: {
      link: 'data-[active=true]:underline data-[hover=true]:underline',
      outline: '',
      solid:
        'text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0'
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    }
  },
  parentCompoundVariants: [
    {
      variant: 'solid',
      action: 'primary',
      class:
        'text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0'
    },
    {
      variant: 'solid',
      action: 'secondary',
      class:
        'text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0'
    },
    {
      variant: 'solid',
      action: 'positive',
      class:
        'text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0'
    },
    {
      variant: 'solid',
      action: 'negative',
      class:
        'text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0'
    },
    {
      variant: 'outline',
      action: 'primary',
      class:
        'text-primary-500 data-[hover=true]:text-primary-500 data-[active=true]:text-primary-500'
    },
    {
      variant: 'outline',
      action: 'secondary',
      class:
        'text-primary-500 data-[hover=true]:text-primary-500 data-[active=true]:text-primary-500'
    },
    {
      variant: 'outline',
      action: 'positive',
      class:
        'text-primary-500 data-[hover=true]:text-primary-500 data-[active=true]:text-primary-500'
    },
    {
      variant: 'outline',
      action: 'negative',
      class:
        'text-primary-500 data-[hover=true]:text-primary-500 data-[active=true]:text-primary-500'
    }
  ]
})

const buttonIconStyle = tva({
  base: 'fill-none',
  parentVariants: {
    variant: {
      link: 'data-[active=true]:underline data-[hover=true]:underline',
      outline: '',
      solid:
        'text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0'
    },
    size: {
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-[18px] w-[18px]',
      lg: 'h-[18px] w-[18px]',
      xl: 'h-5 w-5'
    },
    action: {
      primary:
        'text-primary-600 data-[hover=true]:text-primary-600 data-[active=true]:text-primary-700',
      secondary:
        'text-secondary-600 data-[hover=true]:text-secondary-600 data-[active=true]:text-secondary-700',
      positive:
        'text-success-600 data-[hover=true]:text-success-600 data-[active=true]:text-success-700',

      negative:
        'text-error-600 data-[hover=true]:text-error-600 data-[active=true]:text-error-700'
    }
  },
  parentCompoundVariants: [
    {
      variant: 'solid',
      action: 'primary',
      class:
        'text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0'
    },
    {
      variant: 'solid',
      action: 'secondary',
      class:
        'text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0'
    },
    {
      variant: 'solid',
      action: 'positive',
      class:
        'text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0'
    },
    {
      variant: 'solid',
      action: 'negative',
      class:
        'text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0'
    }
  ]
})

const buttonGroupStyle = tva({
  base: '',
  variants: {
    space: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-5',
      '2xl': 'gap-6',
      '3xl': 'gap-7',
      '4xl': 'gap-8'
    },
    isAttached: {
      true: 'gap-0'
    }
  }
})

type IButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof UIButton>,
  'context'
> &
  VariantProps<typeof buttonStyle> & { className?: string }

const Button = React.forwardRef<
  React.ElementRef<typeof UIButton>,
  IButtonProps
>(
  (
    { className, variant = 'solid', size = 'md', action = 'primary', ...props },
    ref
  ) => {
    return (
      <UIButton
        ref={ref}
        {...props}
        className={buttonStyle({ variant, size, action, class: className })}
        context={{ variant, size, action }}
      />
    )
  }
)

type IButtonTextProps = React.ComponentPropsWithoutRef<typeof UIButton.Text> &
  VariantProps<typeof buttonTextStyle> & { className?: string }

const ButtonText = React.forwardRef<
  React.ElementRef<typeof UIButton.Text>,
  IButtonTextProps
>(({ className, variant, size, action, ...props }, ref) => {
  const {
    variant: parentVariant,
    size: parentSize,
    action: parentAction
  } = useStyleContext(SCOPE)

  return (
    <UIButton.Text
      ref={ref}
      {...props}
      className={buttonTextStyle({
        parentVariants: {
          variant: parentVariant,
          size: parentSize,
          action: parentAction
        },
        variant,
        size,
        action,
        class: className
      })}
    />
  )
})

const ButtonSpinner = UIButton.Spinner

type IButtonIcon = React.ComponentPropsWithoutRef<typeof UIButton.Icon> &
  VariantProps<typeof buttonIconStyle> & {
    className?: string | undefined
    as?: React.ElementType
  }

const ButtonIcon = React.forwardRef<
  React.ElementRef<typeof UIButton.Icon>,
  IButtonIcon
>(({ className, size, ...props }, ref) => {
  const {
    variant: parentVariant,
    size: parentSize,
    action: parentAction
  } = useStyleContext(SCOPE)

  if (typeof size === 'number') {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({ class: className })}
        size={size}
      />
    )
  } else if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({ class: className })}
      />
    )
  }
  return (
    <UIButton.Icon
      {...props}
      className={buttonIconStyle({
        parentVariants: {
          size: parentSize,
          variant: parentVariant,
          action: parentAction
        },
        size,
        class: className
      })}
      ref={ref}
    />
  )
})

type IButtonGroupProps = React.ComponentPropsWithoutRef<typeof UIButton.Group> &
  VariantProps<typeof buttonGroupStyle>

const ButtonGroup = React.forwardRef<
  React.ElementRef<typeof UIButton.Group>,
  IButtonGroupProps
>(({ className, space = 'md', isAttached = false, ...props }, ref) => {
  return (
    <UIButton.Group
      className={buttonGroupStyle({ class: className, space, isAttached })}
      {...props}
      ref={ref}
    />
  )
})

Button.displayName = 'Button'
ButtonText.displayName = 'ButtonText'
ButtonSpinner.displayName = 'ButtonSpinner'
ButtonIcon.displayName = 'ButtonIcon'
ButtonGroup.displayName = 'ButtonGroup'

export { Button, ButtonText, ButtonSpinner, ButtonIcon, ButtonGroup }
