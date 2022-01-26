import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { TYPOGRAPHY_BLOCK_UPDATE } from './Variant'
import { Variant } from '.'

const VariantStory = {
  ...simpleComponentConfig,
  component: Variant,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/Variant'
}

export const Default: Story = () => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-variant-id',
              journeyId: undefined,
              input: {
                variant: 'h1'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-variant-id',
                variant: 'h1'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-variant-id',
              journeyId: undefined,
              input: {
                variant: 'h2'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-variant-id',
                variant: 'h2'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-variant-id',
              journeyId: undefined,
              input: {
                variant: 'h3'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-variant-id',
                variant: 'h3'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-variant-id',
              journeyId: undefined,
              input: {
                variant: 'h4'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-variant-id',
                variant: 'h4'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-variant-id',
              journeyId: undefined,
              input: {
                variant: 'h5'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-variant-id',
                variant: 'h5'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-variant-id',
              journeyId: undefined,
              input: {
                variant: 'h6'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-variant-id',
                variant: 'h6'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-variant-id',
              journeyId: undefined,
              input: {
                variant: 'subtitle1'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-variant-id',
                variant: 'subtitle1'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-variant-id',
              journeyId: undefined,
              input: {
                variant: 'subititle2'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-variant-id',
                variant: 'subititle2'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-variant-id',
              journeyId: undefined,
              input: {
                variant: 'body1'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-variant-id',
                variant: 'body1'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-variant-id',
              journeyId: undefined,
              input: {
                variant: 'body2'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-variant-id',
                variant: 'body2'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-variant-id',
              journeyId: undefined,
              input: {
                variant: 'caption'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-variant-id',
                variant: 'caption'
              }
            }
          }
        },
        {
          request: {
            query: TYPOGRAPHY_BLOCK_UPDATE,
            variables: {
              id: 'typography-variant-id',
              journeyId: undefined,
              input: {
                variant: 'overline'
              }
            }
          },
          result: {
            data: {
              typographyBlockUpdate: {
                id: 'typography-variant-id',
                variant: 'overline'
              }
            }
          }
        }
      ]}
    >
      <Variant id={'typography-variant-id'} variant={null} />
    </MockedProvider>
  )
}

export default VariantStory as Meta
