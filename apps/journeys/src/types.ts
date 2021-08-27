interface BaseBlockType {
  id: string
  parent?: {
    id: string
  }
  children?: BlockType[]
}

export type RadioOptionType = BaseBlockType & {
  __typename: 'RadioOption'
  label: string
  image?: string
}

export type RadioQuestionType = BaseBlockType & {
  __typename: 'RadioQuestion'
  label: string
  description?: string
  variant?: 'light' | 'dark'
}

export type StepType = BaseBlockType & {
  __typename: 'Step'
}

export type VideoType = BaseBlockType & {
  __typename: 'Video'
}

export type BlockType = RadioOptionType | StepType | VideoType | RadioQuestionType
