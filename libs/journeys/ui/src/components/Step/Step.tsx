import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'
import { TreeBlock } from '../..'
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { StepFields } from './__generated__/StepFields'
import { StepResponseCreate } from './__generated__/StepResponseCreate'

export const STEP_RESPONSE_CREATE = gql`
  mutation StepResponseCreate($input: StepResponseCreateInput!) {
    stepResponseCreate(input: $input) {
      id
    }
  }
`

interface StepProps extends TreeBlock<StepFields> {
  wrappers?: WrappersProps
}

export function Step({ id, children, wrappers }: StepProps): ReactElement {
  const [stepResponseCreate] =
    useMutation<StepResponseCreate>(STEP_RESPONSE_CREATE)
  const uuid = uuidv4()

  async function createResponse(): Promise<void> {
    await stepResponseCreate({
      variables: { input: { id: uuid, blockId: id } },
      optimisticResponse: {
        stepResponseCreate: {
          id: uuid,
          __typename: 'StepResponse'
        }
      }
    })
  }

  return (
    <>
      {children.map((block) => (
        <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
      ))}
    </>
  )
}
