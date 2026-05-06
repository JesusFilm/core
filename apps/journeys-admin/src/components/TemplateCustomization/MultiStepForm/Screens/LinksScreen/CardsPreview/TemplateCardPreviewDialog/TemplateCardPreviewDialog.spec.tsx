import { fireEvent, render, screen } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'

import {
  TemplateCardPreviewDialog,
  TemplateCardPreviewDialogProps
} from './TemplateCardPreviewDialog'

jest.mock(
  '@core/journeys/ui/TemplateView/TemplatePreviewTabs/TemplateCardPreview',
  () => ({
    TemplateCardPreview: ({
      steps,
      variant,
      initialStepId
    }: {
      steps: unknown[]
      variant: string
      initialStepId: string | null
    }) => (
      <div
        data-testid="TemplateCardPreview"
        data-variant={variant}
        data-initial-step-id={initialStepId}
      >
        {steps?.length ?? 0} steps
      </div>
    )
  })
)

function buildSteps(count: number): Array<TreeBlock<StepBlock>> {
  return Array.from({ length: count }, (_, i) => ({
    id: `step-${i}`,
    __typename: 'StepBlock' as const,
    parentBlockId: null,
    parentOrder: i,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: []
  })) as Array<TreeBlock<StepBlock>>
}

describe('TemplateCardPreviewDialog', () => {
  const defaultProps: TemplateCardPreviewDialogProps = {
    open: true,
    onClose: jest.fn(),
    steps: buildSteps(3),
    initialStepId: 'step-1'
  }

  it('should render dialog with TemplateCardPreview when open', () => {
    render(<TemplateCardPreviewDialog {...defaultProps} />)

    expect(screen.getByTestId('TemplateCardPreviewDialog')).toBeInTheDocument()
    const preview = screen.getByTestId('TemplateCardPreview')
    expect(preview).toBeInTheDocument()
    expect(preview).toHaveAttribute('data-variant', 'guestPreview')
    expect(preview).toHaveTextContent('3 steps')
  })

  it('should pass initialStepId to TemplateCardPreview', () => {
    render(<TemplateCardPreviewDialog {...defaultProps} />)

    const preview = screen.getByTestId('TemplateCardPreview')
    expect(preview).toHaveAttribute('data-initial-step-id', 'step-1')
  })

  it('should call onClose when dialog backdrop is clicked', () => {
    const handleClose = jest.fn()
    render(
      <TemplateCardPreviewDialog {...defaultProps} onClose={handleClose} />
    )

    const backdrop = screen
      .getByTestId('TemplateCardPreviewDialog')
      .parentElement?.querySelector('.MuiBackdrop-root')

    expect(backdrop).toBeDefined()
    fireEvent.click(backdrop as Element)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
