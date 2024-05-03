import {
  ButtonClickEventCreateInput,
  ChatOpenEventCreateInput,
  RadioQuestionSubmissionEventCreateInput,
  SignUpSubmissionEventCreateInput,
  StepNextEventCreateInput,
  StepPreviousEventCreateInput,
  StepViewEventCreateInput,
  TextResponseSubmissionEventCreateInput
} from '../../../__generated__/globalTypes'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = Record<string, any> | never

interface Events {
  [K: string]: Props
}

export interface JourneyPlausibleEvents extends Events {
  pageview: StepViewEventCreateInput
  navigatePreviousStep: StepPreviousEventCreateInput
  navigateNextStep: StepNextEventCreateInput
  buttonClick: ButtonClickEventCreateInput
  chatButtonClick: ChatOpenEventCreateInput
  footerChatButtonClick: ChatOpenEventCreateInput
  radioQuestionSubmit: RadioQuestionSubmissionEventCreateInput
  signUpSubmit: SignUpSubmissionEventCreateInput
  footerThumbsUpButtonClick: {
    stepId: string
  }
  footerThumbsDownButtonClick: {
    stepId: string
  }
  shareButtonClick: {
    stepId: string
  }
  textResponseSubmit: TextResponseSubmissionEventCreateInput
}
