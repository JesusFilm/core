import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { CampaignImageSlot } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_HEADER_BLOCK_UPDATE_LOGO } from '../../../libs/useCampaignHeaderLogoMutation'
import {
  CAMPAIGN_IMAGE_BLOCK_CREATE,
  newOwnedImageBlock
} from '../../../libs/useCampaignImageBlockCreateMutation'
import { CREATE_CLOUDFLARE_UPLOAD_BY_URL } from '../../../libs/useCloudflareUploadByUrlMutation'
import { useImageUpload } from '../../../libs/useImageUpload'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { WithBlock, blockOf } from '../styleTesting'
import { CommandProbe, QueriedEditor } from '../testing'

import { ChromeEdit } from './ChromeEdit'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'newId') }))
vi.mock('../../../libs/useImageUpload', () => ({
  useImageUpload: vi.fn(() => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    open: vi.fn(),
    loading: false,
    isDragAccept: false
  }))
}))

const header = blockOf<'CampaignHeaderBlock'>('headerId')
const PASTED = 'https://example.com/logo.png'
const STORED = 'https://imagedelivery.net/accountHash/cfId'
const SRC = `${STORED}/public`

const uploadByUrlMock = {
  request: {
    query: CREATE_CLOUDFLARE_UPLOAD_BY_URL,
    variables: { url: PASTED, teamId: 'teamId' }
  },
  result: vi.fn(() => ({
    data: {
      createCloudflareUploadByUrl: {
        __typename: 'CloudflareImage',
        id: 'cfId',
        url: STORED
      }
    }
  }))
}

const imageCreateMock = {
  request: {
    query: CAMPAIGN_IMAGE_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        parentBlockId: 'headerId',
        slot: CampaignImageSlot.logo,
        src: SRC
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignImageBlockCreate: {
        ...newOwnedImageBlock('newId', header, SRC),
        width: 320,
        height: 80
      }
    }
  }))
}

function logoMock(logoBlockId: string | null) {
  return {
    request: {
      query: CAMPAIGN_HEADER_BLOCK_UPDATE_LOGO,
      variables: { id: 'headerId', input: { logoBlockId } }
    },
    result: vi.fn(() => ({
      data: {
        campaignHeaderBlockUpdate: {
          __typename: 'CampaignHeaderBlock',
          id: 'headerId',
          logoBlockId
        }
      }
    }))
  }
}

function HeaderEdit(): ReactElement {
  return (
    <QueriedEditor
      mocks={[
        uploadByUrlMock,
        imageCreateMock,
        logoMock('newId'),
        logoMock(null),
        logoMock('newId')
      ]}
      initialState={{ selectedBlockId: 'headerId' }}
    >
      <CommandUndoItem variant="button" />
      <CommandProbe />
      <WithBlock blockId="headerId" typename="CampaignHeaderBlock">
        {(block) => <ChromeEdit block={block} />}
      </WithBlock>
    </QueriedEditor>
  )
}

async function pasteLogo(): Promise<void> {
  fireEvent.change(await screen.findByRole('textbox', { name: 'Image URL' }), {
    target: { value: PASTED }
  })
  fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
  fireEvent.click(screen.getByRole('button', { name: 'Use as logo' }))
}

describe('ChromeEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(uuidv4).mockImplementation(() => 'newId')
  })

  it('offers the logo picker (upload or paste) when the header has no logo, and no Clear logo', async () => {
    render(<HeaderEdit />)

    expect(await screen.findByText('Header')).toBeInTheDocument()
    expect(
      screen.getByText('No logo: the campaign title shows as the brand mark.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload a file' })).toBeEnabled()
    expect(
      screen.getByRole('textbox', { name: 'Image URL' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear logo' })).toBeNull()
    expect(vi.mocked(useImageUpload).mock.calls[0][0].teamId).toBe('teamId')
  })

  it('picks a logo as one Command: fetches the paste, creates the owned image and points logoBlockId at it; undo clears it again', async () => {
    render(<HeaderEdit />)
    await pasteLogo()

    await waitFor(() => expect(uploadByUrlMock.result).toHaveBeenCalled())
    await waitFor(() => expect(imageCreateMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByTestId('CampaignChromeEditLogo')).toHaveAttribute(
        'src',
        SRC
      )
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(screen.getByRole('button', { name: 'Clear logo' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() =>
      expect(
        screen.getByText('No logo: the campaign title shows as the brand mark.')
      ).toBeInTheDocument()
    )
    // The image itself is not created twice and not deleted: only the slot moves.
    expect(imageCreateMock.result).toHaveBeenCalledTimes(1)
  })

  it('clears the logo as one Command, and undo restores it', async () => {
    render(<HeaderEdit />)
    await pasteLogo()
    await waitFor(() =>
      expect(screen.getByTestId('CampaignChromeEditLogo')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Clear logo' }))

    await waitFor(() =>
      expect(
        screen.getByText('No logo: the campaign title shows as the brand mark.')
      ).toBeInTheDocument()
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() =>
      expect(screen.getByTestId('CampaignChromeEditLogo')).toHaveAttribute(
        'src',
        SRC
      )
    )
  })
})
