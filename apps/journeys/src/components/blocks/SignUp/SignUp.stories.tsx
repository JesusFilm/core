import { Meta } from '@storybook/react'
import { TypographyVariant } from '../../../../__generated__/globalTypes'
import { journeysConfig } from '../../../libs/storybook/decorators'
import { SignUp } from './SignUp'
import { MockedProvider } from '@apollo/client/testing'
import { Conductor } from '../../Conductor'
import { ReactElement } from 'react'

const Demo = {
  ...journeysConfig,
  component: SignUp,
  title: 'Journeys/Blocks/SignUp'
}

export const Default = (): ReactElement => (
  <MockedProvider>
    <Conductor
      blocks={[
        {
          id: 'step1.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: true,
          nextBlockId: 'step2.id',
          children: [
            {
              id: 'card1.id',
              __typename: 'CardBlock',
              parentBlockId: 'step1.id',
              backgroundColor: null,
              coverBlockId: null,
              themeMode: null,
              themeName: null,

              children: [
                {
                  id: 'typographyBlockId1',
                  __typename: 'TypographyBlock',
                  parentBlockId: null,
                  align: null,
                  color: null,
                  content: 'Sign up',
                  variant: TypographyVariant.h1,
                  children: []
                },
                {
                  id: 'signUpBlockId1',
                  __typename: 'SignUpBlock',
                  parentBlockId: null,
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step2.id'
                  },
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 'step2.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: true,
          nextBlockId: null,
          children: [
            {
              id: 'card2.id',
              __typename: 'CardBlock',
              parentBlockId: 'step2.id',
              backgroundColor: null,
              coverBlockId: null,
              themeMode: null,
              themeName: null,
              children: [
                {
                  id: 'typographyBlockId2',
                  __typename: 'TypographyBlock',
                  parentBlockId: null,
                  align: null,
                  color: null,
                  content: 'Success',
                  variant: TypographyVariant.h1,
                  children: []
                }
              ]
            }
          ]
        }
      ]}
    />
  </MockedProvider>
)

// export const SubmitError = Template.bind({})
// SubmitError.args = {
//   label: 'Label',
//   description: 'Description'
// }

export default Demo as Meta
