import { ReactElement, useReducer } from "react";
import { createFilledContext } from "../../../../../../../libs/createFilledContext";

export enum ActiveDrawerContent {
  StudyQuestion = 0
}

export interface EditorState {
  activeDrawerContent: ActiveDrawerContent
  showDrawer: boolean
}




const EditorContext = createFilledContext<EditorContext>({
  activeDrawerContent: ActiveDrawerContent.StudyQuestion,
  showDrawer: false
})

export function EditorProvider({ initialState, children }): ReactElement {
  const [state, dispatch] = useReducer()

  return <Provider value={{ state, dispatch }}></Provider>
}