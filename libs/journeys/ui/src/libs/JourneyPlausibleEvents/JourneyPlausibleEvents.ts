import {
  ButtonClickEventCreateInput,
  ChatOpenEventCreateInput,
  RadioQuestionSubmissionEventCreateInput,
  SignUpSubmissionEventCreateInput,
  StepNextEventCreateInput,
  StepPreviousEventCreateInput,
  StepViewEventCreateInput,
  TextResponseSubmissionEventCreateInput,
  VideoCollapseEventCreateInput,
  VideoCompleteEventCreateInput,
  VideoExpandEventCreateInput,
  VideoPauseEventCreateInput,
  VideoPlayEventCreateInput,
  VideoProgressEventCreateInput,
  VideoStartEventCreateInput
} from '../../../__generated__/globalTypes'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = Record<string, any> | never

interface Events {
  [K: string]: Props
}

export interface JourneyPlausibleEvents extends Events {
  footerThumbsUpButtonClick: {
    stepId: string
  }
  footerThumbsDownButtonClick: {
    stepId: string
  }
  shareButtonClick: {
    stepId: string
  }
  pageview: StepViewEventCreateInput
  navigatePreviousStep: StepPreviousEventCreateInput
  navigateNextStep: StepNextEventCreateInput
  buttonClick: ButtonClickEventCreateInput
  chatButtonClick: ChatOpenEventCreateInput
  footerChatButtonClick: ChatOpenEventCreateInput
  radioQuestionSubmit: RadioQuestionSubmissionEventCreateInput
  signUpSubmit: SignUpSubmissionEventCreateInput
  textResponseSubmit: TextResponseSubmissionEventCreateInput
  videoPlay: VideoPlayEventCreateInput
  videoPause: VideoPauseEventCreateInput
  videoExpand: VideoExpandEventCreateInput
  videoCollapse: VideoCollapseEventCreateInput
  videoStart: VideoStartEventCreateInput
  videoProgress: VideoProgressEventCreateInput
  videoComplete: VideoCompleteEventCreateInput
}
