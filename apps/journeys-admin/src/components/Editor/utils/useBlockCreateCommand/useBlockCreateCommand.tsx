import {
  ApolloCache,
  DefaultContext,
  MutationFunction,
  MutationHookOptions,
  OperationVariables
} from '@apollo/client'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useBlockDeleteMutation } from '../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../libs/useBlockRestoreMutation'

interface BlockCreateCommandReturn {
  addBlockCommand: <T, K extends OperationVariables>(
    apolloFunction: MutationFunction<T, K>,
    apolloFnOptions: MutationHookOptions<T, K, DefaultContext, ApolloCache<any>>
  ) => Promise<{ data: T | null | undefined }>
}

export function useBlockCreateCommand(): BlockCreateCommandReturn {
  const { add } = useCommand()
  const [blockDelete] = useBlockDeleteMutation()
  const [blockRestore] = useBlockRestoreMutation()
  const {
    state: { selectedStep, selectedBlock },
    dispatch
  } = useEditor()

  async function addBlockCommand<T, K extends OperationVariables>(
    apolloFunction: MutationFunction<T, K>,
    apolloFnOptions: MutationHookOptions<T, K>
  ): Promise<{ data: T | null | undefined }> {
    let newBlockRef: T | null | undefined
    await add({
      parameters: {
        execute: {},
        undo: {
          stepBeforeDelete: selectedStep,
          selectedBlockBeforeDelete: selectedBlock
        }
      },
      execute: async () => {
        const { data } = await apolloFunction(apolloFnOptions)
        newBlockRef = data
        if (data == null) return
        dispatch({
          type: 'SetSelectedBlockByIdAction',
          selectedBlockId: data[Object.keys(data)[0]].id
        })
      },
      undo: async ({ stepBeforeDelete, selectedBlockBeforeDelete }) => {
        if (newBlockRef != null)
          await blockDelete(newBlockRef[Object.keys(newBlockRef)[0]])
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep: stepBeforeDelete,
          selectedBlock: selectedBlockBeforeDelete,
          activeSlide: ActiveSlide.Content
        })
      },
      redo: async () => {
        if (
          newBlockRef != null &&
          newBlockRef[Object.keys(newBlockRef)[0]]?.id != null
        ) {
          await blockRestore({
            variables: {
              blockRestoreId: newBlockRef[Object.keys(newBlockRef)[0]].id
            }
          })
          dispatch({
            type: 'SetSelectedBlockByIdAction',
            selectedBlockId: newBlockRef[Object.keys(newBlockRef)[0]].id
          })
          dispatch({
            type: 'SetEditorFocusAction',
            selectedStep,
            activeSlide: ActiveSlide.Content
          })
        }
      }
    })
    return { data: newBlockRef }
  }

  return { addBlockCommand }
}
