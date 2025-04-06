import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { DialogAction } from '../../../../../../../../components/CrudDialog'
import {
  GetAdminVideo_AdminVideo_VideoEdition as Edition,
  GetAdminVideo_AdminVideo_VideoEdition_VideoSubtitle as Subtitle
} from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useCrudState } from '../../../../../../../../libs/useCrudState'
import { Section } from '../../../Section'
import { SubtitleCard } from '../../Subtitles/SubtitleCard'
import { SubtitleDialog } from '../../Subtitles/SubtitleDialog'

interface EditionViewProps {
  edition: Edition
}

export function EditionView({ edition }: EditionViewProps): ReactElement {
  const { selectedItem, action, dispatch } = useCrudState<Subtitle>(
    edition.videoSubtitles
  )

  return (
    <Box>
      <Section
        title="Subtitles"
        action={{
          label: 'New Subtitle',
          onClick: () => dispatch({ type: DialogAction.CREATE }),
          startIcon: <Plus2 />
        }}
      >
        {edition.videoSubtitles.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              minHeight: 200
            }}
          >
            {edition.videoSubtitles.map((subtitle) => (
              <SubtitleCard
                key={subtitle.id}
                subtitle={subtitle}
                onClick={() =>
                  dispatch({ type: DialogAction.EDIT, item: subtitle })
                }
                actions={{
                  edit: () =>
                    dispatch({ type: DialogAction.EDIT, item: subtitle }),
                  delete: () =>
                    dispatch({ type: DialogAction.DELETE, item: subtitle })
                }}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', placeItems: 'center', height: 200 }}>
            <Typography>No subtitles</Typography>
          </Box>
        )}
      </Section>
      <SubtitleDialog
        action={action}
        close={() => dispatch({ type: 'reset' })}
        subtitle={selectedItem}
        edition={edition}
      />
    </Box>
  )
}
