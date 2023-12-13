import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { FormiumForm } from '@core/shared/ui/FormiumForm'

import { handleAction } from '../../libs/action'
import { TreeBlock } from '../../libs/block'

import { FormFields } from './__generated__/FormFields'

export function Form({
  id,
  form,
  action
}: TreeBlock<FormFields>): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const router = useRouter()

  function handleSubmit(): void {
    handleAction(router, action)
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
        borderRadius: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Typography color="black">{t('Form')}</Typography>
    </Box>
  )
}
