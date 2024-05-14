interface EdgeSourceNone {
  sourceType: 'none'
}

interface EdgeSourceStep {
  stepId: string
  sourceType: 'step'
}

interface EdgeSourceAction {
  stepId: string
  blockId: string
  sourceType: 'action'
}

interface EdgeSourceSocialPreview {
  sourceType: 'socialPreview'
}

export type EdgeSource =
  | EdgeSourceNone
  | EdgeSourceStep
  | EdgeSourceAction
  | EdgeSourceSocialPreview

export interface RawEdgeSource {
  source?: string | null
  sourceHandle?: string | null
}

export function convertToEdgeSource({
  source,
  sourceHandle
}: RawEdgeSource): EdgeSource {
  if (source == null) {
    return { sourceType: 'none' }
  }

  if (source === 'SocialPreview') {
    return { sourceType: 'socialPreview' }
  }

  if (source === sourceHandle || sourceHandle == null) {
    return { sourceType: 'step', stepId: source }
  }

  return {
    sourceType: 'action',
    stepId: source,
    blockId: sourceHandle
  }
}
