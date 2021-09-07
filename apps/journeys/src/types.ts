export type TypeName = 'RadioOption' | 'RadioQuestion' | 'Step' | 'Video'
interface BaseBlockType {
  id: string
  parent?: {
    id: string
  }
  children?: BlockType[]
  action?: string
  __typename: TypeName
}

export interface RadioOptionType extends BaseBlockType {
  __typename: 'RadioOption'
  label: string
  image?: string
}

export interface RadioQuestionType extends BaseBlockType {
  __typename: 'RadioQuestion'
  label: string
  description?: string
  action?: string
  variant?: 'light' | 'dark'
}

export interface StepType extends BaseBlockType {
  __typename: 'Step'
}

export interface VideoType extends BaseBlockType {
  __typename: 'Video'
  src: string
  poster?: string
}

export type BlockType = RadioOptionType | StepType | VideoType | RadioQuestionType

export type NextStepProps = (id?: string) => void
export interface GoTo {
  goTo: NextStepProps
}
export interface ConductorProps {
  blocks: BlockType[]
}
