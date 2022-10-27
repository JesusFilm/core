import { Story, Meta } from '@storybook/react'
import Typography from '@mui/material/Typography'
import { MockedProvider } from '@apollo/client/testing'
import { StoryCard } from '../StoryCard'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconSize
} from '../../../__generated__/globalTypes'
import { Button } from '.'

const ButtonDemo = {
  ...journeyUiConfig,
  component: Button,
  title: 'Journeys-Ui/Button'
}

const Template: Story<
  Parameters<typeof Button>[0] & { variants: ButtonVariant[] }
> = ({ ...args }) => (
  <MockedProvider>
    <StoryCard>
      {args.variants.map((variant, i) => (
        <Button
          {...args}
          id="id"
          key={i}
          label={`${variant ?? ''}`}
          buttonVariant={variant}
        />
      ))}
    </StoryCard>
  </MockedProvider>
)

export const Variant = Template.bind({})
Variant.args = {
  variants: [ButtonVariant.contained],
  children: []
}

const ColorTemplate: Story<
  Parameters<typeof Button>[0] & { variants: ButtonColor[] }
> = ({ ...args }) => (
  <MockedProvider>
    <StoryCard>
      {args.variants.map((variant, i) => (
        <Button
          {...args}
          id="id"
          key={i}
          label={`${variant} ${variant === 'primary' ? '(Default)' : ''}`}
          buttonColor={variant}
        />
      ))}
    </StoryCard>
  </MockedProvider>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  variants: [ButtonColor.primary, ButtonColor.secondary, ButtonColor.error],
  children: []
}

const SizeTemplate: Story<
  Parameters<typeof Button>[0] & { variants: ButtonSize[] }
> = ({ ...args }) => (
  <MockedProvider>
    <StoryCard>
      <Typography variant="overline" gutterBottom>
        Some element above
      </Typography>
      {args.variants.map((variant, i) => (
        <Button
          {...args}
          id="id"
          key={i}
          label={`${variant ?? ''}`}
          size={variant}
        />
      ))}
      <Typography variant="body1" gutterBottom>
        Some element below
      </Typography>
    </StoryCard>
  </MockedProvider>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  variants: [ButtonSize.small, ButtonSize.medium, ButtonSize.large],
  children: []
}

const IconTemplate: Story<
  Parameters<typeof Button>[0] & { variants: Array<'Start' | 'End'> }
> = ({ ...args }) => {
  return (
    <MockedProvider>
      <StoryCard>
        {args.variants.map((variant: string, i) => (
          <Button
            {...args}
            id="id"
            key={i}
            label={`${variant} Icon`}
            startIconId="start"
            endIconId="end"
            // eslint-disable-next-line react/no-children-prop
            children={
              variant === 'Start'
                ? [
                    {
                      id: 'start',
                      __typename: 'IconBlock',
                      parentBlockId: 'id',
                      parentOrder: 0,
                      iconName: IconName.CheckCircleRounded,
                      iconColor: null,
                      iconSize: IconSize.md,
                      children: []
                    }
                  ]
                : [
                    {
                      id: 'end',
                      __typename: 'IconBlock',
                      parentBlockId: 'id',
                      parentOrder: 0,
                      iconName: IconName.CheckCircleRounded,
                      iconColor: null,
                      iconSize: IconSize.md,
                      children: []
                    }
                  ]
            }
          />
        ))}
      </StoryCard>
    </MockedProvider>
  )
}

export const Icon = IconTemplate.bind({})
Icon.args = { variants: ['Start', 'End'] }

export const RTL = IconTemplate.bind({})
RTL.args = { ...Icon.args }
RTL.parameters = { rtl: true }

// Only added here since Urdu language uses separate typography theme
export const Urdu = IconTemplate.bind({})
Urdu.args = { ...RTL.args }
Urdu.parameters = {
  rtl: true,
  locale: 'ur',
  // Disable until we get i18n translations in SB
  chromatic: { disableSnapshot: true }
}

export default ButtonDemo as Meta
