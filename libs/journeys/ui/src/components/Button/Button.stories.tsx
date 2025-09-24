import { MockedProvider } from '@apollo/client/testing'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  IconSize
} from '../../../__generated__/globalTypes'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { StoryCard } from '../StoryCard'

import { Button } from '.'

const ButtonDemo: Meta<typeof Button> = {
  ...journeyUiConfig,
  component: Button,
  title: 'Journeys-Ui/Button',
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
}

type Story = StoryObj<
  ComponentProps<typeof Button> & { variants: ButtonVariant[] }
>

const Template: Story = {
  render: ({ ...args }) => (
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
}

export const Variant = {
  ...Template,
  args: {
    variants: [ButtonVariant.contained],
    children: []
  }
}

type ColorStory = StoryObj<
  ComponentProps<typeof Button> & { variants: ButtonColor[] }
>

const ColorTemplate: ColorStory = {
  render: ({ ...args }) => (
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
}

export const Color = {
  ...ColorTemplate,
  args: {
    variants: [ButtonColor.primary, ButtonColor.secondary, ButtonColor.error],
    children: []
  }
}

type SizeStory = StoryObj<
  ComponentProps<typeof Button> & { variants: ButtonSize[] }
>

const SizeTemplate: SizeStory = {
  render: ({ ...args }) => (
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
}

export const Size = {
  ...SizeTemplate,
  args: {
    variants: [ButtonSize.small, ButtonSize.medium, ButtonSize.large],
    children: []
  }
}

type IconStory = StoryObj<
  ComponentProps<typeof Button> & { variants: Array<'Start' | 'End'> }
>

const IconTemplate: IconStory = {
  render: ({ ...args }) => {
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
}

export const Icon = {
  ...IconTemplate,
  args: { variants: ['Start', 'End'] }
}

export const RTL = {
  ...IconTemplate,
  args: { ...Icon.args },
  parameters: { rtl: true }
}

// Only added here since Urdu language uses separate typography theme
export const Urdu = {
  ...IconTemplate,
  args: { ...RTL.args },
  parameters: {
    rtl: true,
    locale: 'ur',
    // Disable until we get i18n translations in SB
    chromatic: { disableSnapshot: true }
  }
}

export default ButtonDemo
