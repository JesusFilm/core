import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EMPTY_LINK_FORM_VALUES, LinkForm, LinkFormValues } from './LinkForm'

const domains = [
  {
    id: 'domain-1',
    hostname: 'nxstp.is',
    services: [],
    slugAllowedChars: 'A-Za-z0-9_-',
    slugMinLength: 1,
    slugMaxLength: 64,
    slugCaseSensitive: true,
    reservedPaths: ['admin']
  }
]

function renderForm(
  overrides: Partial<LinkFormValues>,
  props: Partial<Parameters<typeof LinkForm>[0]> = {}
) {
  const onSubmit = vi.fn()
  render(
    <LinkForm
      mode="edit"
      initialValues={{
        ...EMPTY_LINK_FORM_VALUES,
        hostname: 'nxstp.is',
        pathname: 'abc123',
        to: 'https://www.jesusfilm.org/watch/jesus.html',
        name: 'JESUS film QR',
        ...overrides
      }}
      domains={domains}
      campaigns={[]}
      isAdmin
      submitting={false}
      videoLabel="video 1_jf-0-0"
      onSubmit={onSubmit}
      {...props}
    />
  )
  return { onSubmit }
}

async function changeDestination(): Promise<void> {
  const destination = screen.getByRole('textbox', { name: 'Destination URL' })
  await userEvent.clear(destination)
  await userEvent.type(destination, 'https://www.jesusfilm.org/new')
  await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
}

describe('LinkForm destination protection', () => {
  it('submits a standard link without confirmation', async () => {
    const { onSubmit } = renderForm({ assetClass: 'standard' })

    await changeDestination()

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      to: 'https://www.jesusfilm.org/new',
      note: ''
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('asks for confirmation for a permanent link and submits without a note', async () => {
    const { onSubmit } = renderForm({ assetClass: 'permanent' })

    await changeDestination()

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Change a permanent destination?')
    expect(onSubmit).not.toHaveBeenCalled()

    await userEvent.click(
      screen.getByRole('button', { name: 'Change destination' })
    )

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      to: 'https://www.jesusfilm.org/new',
      note: ''
    })
  })

  it('requires a change note for a video-embedded link', async () => {
    const { onSubmit } = renderForm({ assetClass: 'videoEmbedded' })

    await changeDestination()

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('embedded in video 1_jf-0-0')

    await userEvent.click(
      screen.getByRole('button', { name: 'Change destination' })
    )
    expect(
      await screen.findByText(
        'A change note is required for video-embedded links'
      )
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Change note' }),
      'Moved to the new watch page'
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Change destination' })
    )

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      to: 'https://www.jesusfilm.org/new',
      note: 'Moved to the new watch page'
    })
  })

  it('does not confirm when the destination is unchanged', async () => {
    const { onSubmit } = renderForm({ assetClass: 'videoEmbedded' })

    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), '!')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('locks the destination for editors on protected links', () => {
    renderForm({ assetClass: 'videoEmbedded' }, { isAdmin: false })

    expect(
      screen.getByRole('textbox', { name: 'Destination URL' })
    ).toBeDisabled()
    expect(
      screen.getByText(/Only a short-link admin can change the destination/)
    ).toBeInTheDocument()
  })
})
