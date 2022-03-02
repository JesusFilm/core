import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import {
  BUTTON_FIELDS,
  IMAGE_FIELDS,
  RADIO_QUESTION_FIELDS,
  SIGN_UP_FIELDS,
  TYPOGRAPHY_FIELDS,
  useEditor,
  VIDEO_FIELDS
} from '@core/journeys/ui'
import { BlockDelete } from '../../../../__generated__/BlockDelete'
import { useJourney } from '../../../libs/context'
import { Alert } from './Alert'
import { DeleteBlock } from './DeleteBlock'
import { Menu } from './Menu'

export const BLOCK_DELETE = gql`
  ${BUTTON_FIELDS}
  ${IMAGE_FIELDS}
  ${RADIO_QUESTION_FIELDS}
  ${SIGN_UP_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${VIDEO_FIELDS}
  mutation BlockDelete($id: ID!, $journeyId: ID!, $parentBlockId: ID!) {
    blockDelete(id: $id, journeyId: $journeyId, parentBlockId: $parentBlockId) {
      id
      journeyId
      parentBlockId
      ...ButtonFields
      ...ImageFields
      ...RadioQuestionFields
      ...SignUpFields
      ...TypographyFields
      ...VideoFields
    }
  }
`

export function EditToolbar(): ReactElement {
  const [blockDelete] = useMutation<BlockDelete>(BLOCK_DELETE)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const { id: journeyId } = useJourney()
  const {
    state: { selectedBlock }
  } = useEditor()

  const handleDeleteBlock = async (): Promise<void> => {
    if (selectedBlock != null && selectedBlock.__typename !== 'CardBlock') {
      await blockDelete({
        variables: {
          id: selectedBlock.id,
          journeyId,
          parentBlockId: selectedBlock.parentBlockId
        }
      })
    }

    setShowDeleteAlert(true)
  }

  return (
    <>
      <DeleteBlock handleDeleteBlock={handleDeleteBlock} />
      <Menu handleDeleteBlock={handleDeleteBlock} />
      <Alert
        open={showDeleteAlert}
        setOpen={setShowDeleteAlert}
        message="Block Deleted"
      />
    </>
  )
}
