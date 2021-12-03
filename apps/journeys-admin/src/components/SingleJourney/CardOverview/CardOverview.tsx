import { ReactElement } from 'react'
import { Button, Box, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

export interface CardOverviewProps {
  slug: string
}

const CardOverview = ({ slug }: CardOverviewProps): ReactElement => {
  return (
    <Box>
      <Typography variant="h4">Cards</Typography>
      {/* <StoryCards /> goes here */}
      <Button
        variant="contained"
        startIcon={<EditIcon />}
        sx={{ backgroundColor: '#C52D3A', borderRadius: '20px' }}
        href={`/journeys/${slug}/edit`}
      >
        Edit
      </Button>
    </Box>
  )
}

export default CardOverview
