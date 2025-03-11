import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { ArrayElement } from '../../../../../../../../../types/array-types'

interface EditionViewProps {
  edition: ArrayElement<GetAdminVideo_AdminVideo_VideoEditions>
}

export function EditionView({ edition }: EditionViewProps): ReactElement {
  return (
    <Box>
      <pre>{JSON.stringify(edition, null, 2)}</pre>
    </Box>
  )
}
