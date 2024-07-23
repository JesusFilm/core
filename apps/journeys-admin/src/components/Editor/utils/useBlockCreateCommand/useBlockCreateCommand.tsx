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
    blockCreateMutationFn: MutationFunction<T, K>,
    blockCreateMutationFnOptions: MutationHookOptions<
      T,
      K,
      DefaultContext,
      ApolloCache<any>
    >
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
    blockCreateMutationFn: MutationFunction<T, K>,
    blockCreateMutationFnOptions: MutationHookOptions<T, K>
  ): Promise<{ data: T | null | undefined }> {
    let apolloFnRes: T | null | undefined
    await add({
      parameters: {
        execute: {},
        undo: {
          stepBeforeDelete: selectedStep,
          selectedBlockBeforeDelete: selectedBlock
        }
      },
      execute: async () => {
        const { data } = await blockCreateMutationFn(
          blockCreateMutationFnOptions
        )
        apolloFnRes = data
        if (data == null) return
        dispatch({
          type: 'SetSelectedBlockByIdAction',
          selectedBlockId: data[Object.keys(data)[0]].id
        })
      },
      undo: async ({ stepBeforeDelete, selectedBlockBeforeDelete }) => {
        if (apolloFnRes != null) {
          const block = apolloFnRes[Object.keys(apolloFnRes)[0]]
          await blockDelete(block)
        }
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep: stepBeforeDelete,
          selectedBlock: selectedBlockBeforeDelete,
          activeSlide: ActiveSlide.Content
        })
      },
      redo: async () => {
        if (
          apolloFnRes != null &&
          apolloFnRes[Object.keys(apolloFnRes)[0]]?.id != null
        ) {
          const block = apolloFnRes[Object.keys(apolloFnRes)[0]]

          await blockRestore({
            variables: {
              id: block.id
            }
          })
          dispatch({
            type: 'SetSelectedBlockByIdAction',
            selectedBlockId: block.id
          })
          dispatch({
            type: 'SetEditorFocusAction',
            selectedStep,
            activeSlide: ActiveSlide.Content
          })
        }
      }
    })
    return { data: apolloFnRes }
  }

  return { addBlockCommand }
}
