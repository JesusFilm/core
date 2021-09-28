import { MockedProvider } from '@apollo/client/testing'
import { Meta } from '@storybook/react'
import { ReactElement } from 'react'
import { Conductor } from '.'
import { journeysConfig } from '../../libs/storybook/decorators'

const Demo = {
  ...journeysConfig,
  component: Conductor,
  title: 'Journeys/Conductor',
  parameters: {
    layout: 'fullscreen'
  }
}

export const Default = (): ReactElement => (
  <MockedProvider>
    <Conductor
      blocks={[
        {
          id: 'step1.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: false,
          nextBlockId: 'step2.id',
          children: [
            {
              id: 'radioQuestion0.id',
              __typename: 'RadioQuestionBlock',
              parentBlockId: 'step1.id',
              label: 'Step 1',
              description: null,
              variant: null,
              children: [
                {
                  id: 'radioOption1.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Go to Step 2',
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
          locked: false,
          nextBlockId: 'step3.id',
          children: [
            {
              id: 'radioQuestion1.id',
              __typename: 'RadioQuestionBlock',
              parentBlockId: 'step2.id',
              label: 'Step 2',
              description: null,
              variant: null,
              children: [
                {
                  id: 'radioOption3.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Go to Step 1',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step1.id'
                  },
                  children: []
                },
                {
                  id: 'radioOption4.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  label: 'Go to Step 3',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'step3.id'
                  },
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 'step3.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: false,
          nextBlockId: null,
          children: [
            {
              id: 'radioQuestion2.id',
              __typename: 'RadioQuestionBlock',
              parentBlockId: 'step3.id',
              label: 'Step 3',
              description: null,
              variant: null,
              children: [
                {
                  id: 'radioOption5.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion2.id',
                  label: 'Go to Step 2',
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
        }
      ]}
    />
  </MockedProvider>
)

export default Demo as Meta
