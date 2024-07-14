import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'

import { AIPrompt } from './AIPrompt'

describe('AIPrompt', () => {
  const imageBlock: ImageBlock = {
    id: 'imageBlockId',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'Prompt: example prompt',
    width: 1600,
    height: 1067,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    parentBlockId: 'card',
    parentOrder: 0
  }

  it('should have prefilled textfield on existing prompt', async () => {
    const { getByRole } = render(
      <>
        <AIPrompt handleSubmit={noop} selectedBlock={imageBlock} />
      </>
    )

    expect(getByRole('textbox', { name: 'Prompt' })).toHaveValue(
      'example prompt'
    )
  })

  it('should not prefill textbox on alt text that is not a prompt', async () => {
    const { getByRole } = render(
      <>
        <AIPrompt
          handleSubmit={noop}
          selectedBlock={{ ...imageBlock, alt: 'example prompt' }}
        />
      </>
    )

    expect(getByRole('textbox', { name: 'Prompt' })).toHaveValue('')
  })

  it('should validate form on incorrect input', async () => {
    const { getByText, getByRole } = render(
      <>
        <AIPrompt handleSubmit={noop} />
      </>
    )

    const promptBox = getByRole('textbox', { name: 'Prompt' })
    const promptSubmitButton = getByRole('button', { name: 'Prompt' })
    fireEvent.click(promptBox)
    await fireEvent.change(promptBox, { target: { value: '' } })
    await fireEvent.click(promptSubmitButton)
    await waitFor(() =>
      expect(
        getByText('Prompt must be at least one character')
      ).toBeInTheDocument()
    )
  })
})
