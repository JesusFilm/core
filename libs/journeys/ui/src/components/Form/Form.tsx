import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useUser } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { FormiumForm } from '@core/shared/ui/FormiumForm'

import { handleAction } from '../../libs/action'
import { TreeBlock } from '../../libs/block'

import { FormFields } from './__generated__/FormFields'

export function Form({
  id,
  form,
  action
}: TreeBlock<FormFields>): ReactElement {
  const router = useRouter()
  const user = useUser()

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
      <FormiumForm
        form={form}
        userId={user.id}
        email={user.email}
        submitText="Submit"
        onSubmit={handleSubmit}
      />
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
      <Typography color="black">Form</Typography>
    </Box>
  )
}
