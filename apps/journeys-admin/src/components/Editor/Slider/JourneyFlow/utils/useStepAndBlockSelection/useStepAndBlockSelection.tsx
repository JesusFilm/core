import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActiveAction } from '@core/journeys/ui/EditorProvider/EditorProvider'

export function useStepAndBlockSelection(): (stepId: string) => void {
  const {
    state: { steps, showAnalytics, selectedStep, activeAction },
    dispatch
  } = useEditor()

  return function handleStepSelection(stepId: string): void {
    const currentStep = steps?.find((innerStep) => innerStep.id === stepId)

    if (selectedStep?.id === currentStep?.id && showAnalytics !== true) {
      dispatch({
        type: 'SetSelectedBlockAction',
        selectedBlock: selectedStep
      })
      dispatch({
        type: 'SetSelectedAttributeIdAction',
        selectedAttributeId: `${selectedStep?.id ?? ''}-next-block`
      })

      if (activeAction === ActiveAction.Idle) {
        dispatch({
          type: 'SetActiveAction',
          activeAction: ActiveAction.View
        })
      }
    } else {
      dispatch({ type: 'SetSelectedStepAction', selectedStep: currentStep })
    }
  }
}
