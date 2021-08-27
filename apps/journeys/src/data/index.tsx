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

export const videos = [{
  __typename: 'Video' as const,
  id: 'Root Video',
  src: 'yoyo'
}]

export const data1 = [
  {
    __typename: 'Video' as const,
    id: 'Root',
    src: 'https://media.vimejs.com/720p.mp4'
  },
  {
    __typename: 'Video' as const,
    id: 'Second Video',
    src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
  },
  {
    __typename: 'RadioQuestion' as const,
    label: 'This is a test question 1!',
    id: 'Questions',
    variant: 'light' as const,
    parent: {
      id: 'Root'
    }
  },
  {
    __typename: 'Step' as const,
    id: 'SecondBlock'
  },
  {
    __typename: 'Step' as const,
    id: 'ThirdBlock'
  },
  {
    __typename: 'RadioQuestion' as const,
    id: 'MoreQuestions',
    label: 'This is a test question 2!',
    parent: {
      id: 'ThirdBlock'
    }
  },
  {
    __typename: 'RadioOption' as const,
    id: 'NestedMoreQuestions',
    label: 'Radio Option',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption' as const,
    id: 'Questions',
    label: 'Radio Option',
    parent: {
      id: 'Questions'
    }
  },
  {
    __typename: 'RadioOption' as const,
    id: 'Questions again',
    label: 'another Radio Option',
    parent: {
      id: 'Questions'
    }
  }
]

export const data2 = [
  {
    __typename: 'Video' as const,
    id: 'Root Video',
    src: 'another video'
  },
  {
    __typename: 'RadioQuestion' as const,
    id: 'MoreQuestions',
    label: 'How are you today?',
    variant: 'dark' as const,
    parent: {
      id: 'Root Video'
    }
  },
  {
    __typename: 'Step' as const,
    id: 'Signup'
  }
]

export const data3 = [
  {
    __typename: 'Video' as const,
    id: 'Root Video',
    src: 'another root video'
  },
  {
    __typename: 'RadioQuestion' as const,
    id: 'MoreQuestions',
    label: 'How can we help you know more about Jesus?',
    description:
      'What do you think would be the next step to help you grow in your relationship with Jesus?',
    variant: 'light' as const,
    parent: {
      id: 'Root Video'
    }
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
