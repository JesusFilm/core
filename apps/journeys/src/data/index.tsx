export const radioOptions = [
  {
    __typename: 'RadioOption' as const,
    id: 'MoreQuestions',
    label: 'This is a test question 2!',
    parent: {
      id: 'ThirdBlock'
    }
  }
]

export const radioQuestion = [
  {
    __typename: 'RadioQuestion' as const,
    id: 'MoreQuestions',
    label: 'How can we help you know more about Jesus?',
    description:
      'What do you think would be the next step to help you grow in your relationship with Jesus?',
    variant: 'light' as const
  }
]

export const videos = [
  {
    __typename: 'Video' as const,
    id: 'Root Video',
    src: 'yoyo'
  }
]

export const data1 = [
  {
    __typename: 'RadioQuestion' as const,
    label: 'This is a test question 1!',
    id: 'Questions',
    variant: 'light' as const
  },
  {
    __typename: 'RadioOption' as const,
    id: 'Option',
    label: 'RadioOption',
    parent: {
      id: 'Questions'
    }
  },
  {
    __typename: 'RadioOption' as const,
    id: 'Option again',
    label: 'another Radio Option',
    parent: {
      id: 'Questions'
    }
  },
  {
    __typename: 'RadioQuestion' as const,
    id: 'MoreQuestions',
    label: 'This is a test question 2!'
  },
  {
    __typename: 'RadioOption' as const,
    id: 'NestedMoreQuestions',
    label: 'RadioOption',
    parent: {
      id: 'MoreQuestions'
    }
  }
]

export const data2 = [
  {
    __typename: 'RadioQuestion' as const,
    id: 'MoreQuestions',
    label: 'How are you today?',
    variant: 'dark' as const
  },
  {
    __typename: 'RadioOption' as const,
    id: 'NestedOptions',
    label: 'Chat Privately',
    parent: {
      id: 'MoreQuestions'
    }
  }
]

export const data3 = [
  {
    __typename: 'RadioQuestion' as const,
    id: 'MoreQuestions',
    label: 'How can we help you know more about Jesus?',
    description:
      'What do you think would be the next step to help you grow in your relationship with Jesus?',
    variant: 'light' as const
  },
  {
    __typename: 'RadioOption' as const,
    id: 'NestedOptions',
    label: 'Chat Privately',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption' as const,
    id: 'NestedOptions2',
    label: 'Get a bible',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption' as const,
    id: 'NestedOptions3',
    label: 'Watch more vidoes about Jesus',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption' as const,
    id: 'NestedOptions4',
    label: 'Ask a question',
    parent: {
      id: 'MoreQuestions'
    }
  }
]
