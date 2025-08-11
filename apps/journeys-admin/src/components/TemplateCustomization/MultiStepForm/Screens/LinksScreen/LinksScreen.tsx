import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'next-i18next'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'
import { transformer } from '@core/journeys/ui/transformer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { getJourneyLinks } from '../../../utils/getJourneyLinks'

interface LinksScreenProps {
  handleNext: () => void
}

export function LinksScreen({ handleNext }: LinksScreenProps): ReactElement {
  const { t } = useTranslation()
  const { journey } = useJourney()
  const links = getJourneyLinks(journey)
  const treeBlocks = transformer(journey?.blocks ?? []).filter((block) =>
    links.some(
      (link) => link.linkType === 'block' && link.parentStepId === block.id
    )
  )

  console.log(links)

  async function handleSubmit(): Promise<void> {
    //TODO: handle submit
    handleNext()
  }

  return (
    <Stack
      alignItems="center"
      sx={{ px: { xs: 2, md: 8 }, maxWidth: '1000px' }}
      gap={6}
    >
      {/* //TODO: Card Previews */}
      <Typography variant="h6" color="text.secondary">
        {t('This invite has buttons leading to external links')}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {t('Check them and change them here')}
      </Typography>
      {/* //TODO: loop through links */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleSubmit}
        sx={{ width: '300px', alignSelf: 'center', mt: 4 }}
        endIcon={<ArrowRightIcon />}
      >
        {t('Replace the links')}
      </Button>
    </Stack>
  )
}
