import { Story, Meta } from '@storybook/react'
import { Button, ButtonProps } from '.'
import { ButtonBlockVariant, ButtonColor, ButtonSize, IconColor, IconName, IconSize } from '../../../__generated__/globalTypes'

const ButtonDemo = {
  component: Button,
  title: 'shared-ui/Button'
}

interface ButtonStoryProps extends ButtonProps {
  variants: string[]
}

const Template: Story<ButtonStoryProps> = (...args) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    <Button {...args} __typename='ButtonBlock' id='' parentBlockId='' label="this is text" variant={ButtonBlockVariant.contained} color={ButtonColor.primary} size={ButtonSize.large} startIcon={{ __typename: 'Icon', name: IconName.CheckCircle, color: IconColor.primary, size: IconSize.small }} endIcon={{ __typename: 'Icon', name: IconName.CheckCircle, color: IconColor.primary, size: IconSize.small }} action={null} />
  </div>
)

export const Primary = Template.bind({})
Primary.args = {
  label: 'Button Text'
}

// const VariantTemplate: Story<ButtonStoryProps> = (args) => (
//   <div style={{
//     display: 'flex',
//     flexDirection: 'column'
//   }}>
//     {args.variants.map((variant) => (
//       <Button label={`${variant}`} variant={variant as ButtonVariant} />
//     ))}
//   </div>
// )

// export const Variant = VariantTemplate.bind({})
// Variant.args = {
//   variants: ['contained', 'outlined', 'text']
// }

// const ColorTemplate: Story<ButtonStoryProps> = (args) => (
//   <div style={{
//     display: 'flex',
//     flexDirection: 'column'
//   }}>
//     {args.variants.map((variant) => (
//       <Button label={`${variant}`} color={variant as ButtonColor} variant="contained" />
//     ))}
//   </div>
// )

// export const Color = ColorTemplate.bind({})
// Color.args = {
//   variants: ['primary', 'secondary']
// }

// const SizeTemplate: Story<ButtonStoryProps> = (args) => (
//   <div style={{
//     display: 'flex',
//     flexDirection: 'column'
//   }}>
//     {args.variants.map((variant) => (
//       <Button label={`${variant}`} size={variant as ButtonSize} variant="outlined" />
//     ))}
//   </div>
// )

// export const Size = SizeTemplate.bind({})
// Size.args = {
//   variants: ['small', 'medium', 'large']
// }

// const startIconTemplate: Story<ButtonStoryProps> = (args) => (
//   <div style={{
//     display: 'flex',
//     flexDirection: 'column'
//   }}>
//     {args.variants.map((variant) => (
//       <Button label={`${variant}`} variant="contained" startIcon={{ icon: variant as IconList }} />
//     ))}
//   </div>
// )

// export const startIcon = startIconTemplate.bind({})
// startIcon.args = {
//   variants: ['playArrow']
// }

// const endIconTemplate: Story<ButtonStoryProps> = (args) => (
//   <div style={{
//     display: 'flex',
//     flexDirection: 'column'
//   }}>
//     {args.variants.map((variant) => (
//       <Button label={`${variant}`} variant="contained" endIcon={{ icon: variant as IconList }} />
//     ))}
//   </div>
// )

// export const endIcon = endIconTemplate.bind({})
// endIcon.args = {
//   variants: ['playArrow']
// }

// const loadingTemplate: Story<ButtonStoryProps> = () => (
//   <div style={{
//     display: 'flex',
//     flexDirection: 'column'
//   }}>
//     <Button label='' variant="contained" loading={false} />
//   </div>
// )

// export const Loading = loadingTemplate.bind({})
// Loading.args = {
//   variants: []
// }

export default ButtonDemo as Meta
