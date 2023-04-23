import { ReactElement } from 'react'
import type { TreeBlock } from '@core/journeys/ui/block'
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../__generated__/GetJourney'
import { ContainedIconButton } from '../../../../ContainedIconButton'

interface SourceFromYouTubeProps {
  selectedBlock: TreeBlock<VideoBlock>
  onClick: () => void
}

export function SourceFromYouTube({
  selectedBlock,
  onClick
}: SourceFromYouTubeProps): ReactElement {
  return (
    <>
      <ContainedIconButton
        label={selectedBlock.title ?? ''}
        imageSrc={selectedBlock.image ?? ''}
        imageAlt={selectedBlock.title ?? ''}
        thumbnailIcon={VideocamRoundedIcon}
        description="YouTube"
        onClick={onClick}
        actionIcon={<EditRoundedIcon color="primary" />}
      />
    </>
  )
}
