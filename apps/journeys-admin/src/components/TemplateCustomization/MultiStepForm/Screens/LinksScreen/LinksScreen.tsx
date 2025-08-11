import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { Formik, FormikProvider } from 'formik'
import { object, string } from 'yup'
import { useTranslation } from 'next-i18next'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'
import { transformer } from '@core/journeys/ui/transformer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { getJourneyLinks } from '../../../utils/getJourneyLinks'
import { BlockFields_StepBlock as StepBlock } from '../../../../../../__generated__/BlockFields'
import { CardsPreview } from './CardsPreview'
import { TreeBlock } from '@core/journeys/ui/block'
import { LinksForm } from './LinksForm'

interface LinksScreenProps {
  handleNext: () => void
}

export function LinksScreen({ handleNext }: LinksScreenProps): ReactElement {
  const { t } = useTranslation()
  const { journey } = useJourney()
  const links = getJourneyLinks(t, journey)
  const treeBlocks = transformer(journey?.blocks ?? []).filter((block) =>
    links.some(
      (link) =>
        (link.linkType === 'url' || link.linkType === 'email') &&
        link.parentStepId === block.id
    )
  ) as Array<TreeBlock<StepBlock>>

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
      <CardsPreview steps={treeBlocks} />
      <Typography variant="h6" color="text.secondary">
        {t('This invite has buttons leading to external links')}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {t('Check them and change them here')}
      </Typography>
      <Formik
        enableReinitialize
        initialValues={links.reduce<Record<string, string>>((acc, link) => {
          acc[link.id] = link.url ?? ''
          return acc
        }, {})}
        validationSchema={object().shape(
          links.reduce<Record<string, ReturnType<typeof string>>>(
            (acc, link) => {
              if (link.linkType === 'email') {
                acc[link.id] = string().email(t('Enter a valid email'))
              } else {
                acc[link.id] = string().url(t('Enter a valid URL'))
              }
              return acc
            },
            {}
          )
        )}
        onSubmit={async () => {}}
        validateOnMount
      >
        {(formik) => (
          <FormikProvider value={formik}>
            <LinksForm links={links} />
          </FormikProvider>
        )}
      </Formik>
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
