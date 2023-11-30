import { FormiumClient } from '@formium/client'
import { Form as FormType } from '@formium/types'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { ReactElement, useEffect, useState } from 'react'

import { FormiumForm, getFormiumClient } from '@core/shared/ui/FormiumForm'

import { handleAction } from '../../libs/action'
import { TreeBlock } from '../../libs/block'

import { FormFields } from './__generated__/FormFields'

export function Form({
  projectId,
  apiToken,
  formSlug,
  action
}: TreeBlock<FormFields>): ReactElement {
  const router = useRouter()
  const [form, setForm] = useState<FormType | undefined>(undefined)
  const [formiumClient, setFormiumClient] = useState<FormiumClient | undefined>(
    undefined
  )

  useEffect(() => {
    if (projectId == null || apiToken == null || formSlug == null) return
    const init = async (): Promise<void> => {
      const formiumClient = await getFormiumClient(projectId, apiToken)
      const form = await formiumClient.getFormBySlug(formSlug)

      if (formiumClient != null && form != null) {
        setFormiumClient(formiumClient)
        setForm(form)
      }
    }
    init().catch(console.error)
  }, [projectId, apiToken, formSlug])

  // TODO: add real user
  const user = {
    id: 'test_id',
    email: 'test_email'
  } as unknown as User

  function handleSubmit(): void {
    handleAction(router, action)
  }

  return form != null && formiumClient != null ? (
    <div
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <FormiumForm
        form={form}
        formiumClient={formiumClient}
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
