import { BlockType } from '../types'

export const data1: BlockType[] = [
  {
    __typename: 'Step',
    id: 'Step1'
  },
  {
    __typename: 'Video',
    id: 'Video1',
    src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
    parentBlockId: 'step1',
    title: 'testVideo',
    provider: null
  },
  {
    __typename: 'RadioQuestion',
    label: 'Choose a step to jump to:',
    id: 'Question1',
    variant: 'light',
    parent: {
      id: 'Step1'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'Option1',
    label: 'Step 2',
    action: null,
    parent: {
      id: 'Question1'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'Option2',
    label: 'No Step',
    action: null,
    parent: {
      id: 'Question1'
    }
  },
  {
    __typename: 'Step',
    id: 'Step2'
  },
  {
    __typename: 'Video',
    id: 'Video2',
    src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
    parentBlockId: 'step2',
    title: 'testVideo',
    provider: null
  },
  {
    __typename: 'RadioQuestion',
    id: 'Question2',
    label: 'This is a test question 2!',
    parent: {
      id: 'Step2'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'Option3',
    label: 'RadioOption',
    parent: {
      id: 'Question2'
    }
  }
]

export const data3: BlockType[] = [
  {
    __typename: 'Step',
    id: 'Step1'
  },
  {
    __typename: 'Video',
    id: 'Video1',
    src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
    parentBlockId: 'step1',
    title: 'testVideo',
    provider: null
  },
  {
    __typename: 'RadioQuestion',
    id: 'MoreQuestions',
    label: 'How can we help you know more about Jesus?',
    description:
      'What do you think would be the next step to help you grow in your relationship with Jesus?',
    variant: 'light',
    parent: {
      id: 'onPause'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedOptions',
    label: 'Chat Privately',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedOptions2',
    label: 'Get a bible',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedOptions3',
    label: 'Watch more vidoes about Jesus',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedOptions4',
    label: 'Ask a question',
    parent: {
      id: 'MoreQuestions'
    }
  }
]
