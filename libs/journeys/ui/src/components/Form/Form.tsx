import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { FormiumForm } from '@core/shared/ui/FormiumForm'

import { handleAction } from '../../libs/action'
import { TreeBlock } from '../../libs/block'
import { getNextStepSlug } from '../../libs/getNextStepSlug'
import { useJourney } from '../../libs/JourneyProvider'

import { FormFields } from './__generated__/FormFields'

export function Form({
  id,
  form,
  action
}: TreeBlock<FormFields>): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { journey } = useJourney()
  const router = useRouter()

  function handleSubmit(): void {
    const nextStepSlug = getNextStepSlug(journey, action)
    handleAction(router, action, nextStepSlug)
  }

  return form != null ? (
    <div
      data-testid={`FormBlock-${id}`}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <FormiumForm form={form} submitText="Submit" onSubmit={handleSubmit} />
    </div>
  ) : (
    <Box
      sx={{
        height: '200px',
        width: '100%',
        backgroundColor: 'white',
        border: '1px solid grey',
        borderRadius: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Typography color="black">{t('Form')}</Typography>
    </Box>
  )
}
