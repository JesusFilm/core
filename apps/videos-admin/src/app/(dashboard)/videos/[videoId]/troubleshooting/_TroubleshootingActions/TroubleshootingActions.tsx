'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface TroubleshootingActionsProps {
  loadingLanguages: boolean
  fixingLanguages: boolean
  checkingAlgoliaVideo: boolean
  checkingAlgoliaVariants: boolean
  updatingAlgoliaVideo: boolean
  updatingAlgoliaVariants: boolean
  handleFetchLanguages: () => void
  handleFixLanguages: () => void
  handleCheckAlgoliaVideo: () => void
  handleCheckAlgoliaVariants: () => void
  handleUpdateVideoAlgolia: () => void
  handleUpdateVariantsAlgolia: () => void
}

export function TroubleshootingActions({
  loadingLanguages,
  fixingLanguages,
  checkingAlgoliaVideo,
  checkingAlgoliaVariants,
  updatingAlgoliaVideo,
  updatingAlgoliaVariants,
  handleFetchLanguages,
  handleFixLanguages,
  handleCheckAlgoliaVideo,
  handleCheckAlgoliaVariants,
  handleUpdateVideoAlgolia,
  handleUpdateVariantsAlgolia
}: TroubleshootingActionsProps): ReactElement {
  return (
    <>
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Language Troubleshooting
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleFetchLanguages}
            disabled={loadingLanguages}
          >
            Fetch Available Languages
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleFixLanguages}
            disabled={fixingLanguages}
          >
            Fix Available Languages
          </Button>
        </Stack>
      </Box>

      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Algolia Troubleshooting
        </Typography>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handleCheckAlgoliaVideo}
              disabled={checkingAlgoliaVideo}
            >
              Check Video in Algolia
            </Button>
            <Button
              variant="contained"
              onClick={handleCheckAlgoliaVariants}
              disabled={checkingAlgoliaVariants}
            >
              Check Variants in Algolia
            </Button>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleUpdateVideoAlgolia}
              disabled={updatingAlgoliaVideo}
            >
              Update Video Index
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleUpdateVariantsAlgolia}
              disabled={updatingAlgoliaVariants}
            >
              Update Variants Index
            </Button>
          </Stack>
        </Stack>
      </Box>
    </>
  )
}
