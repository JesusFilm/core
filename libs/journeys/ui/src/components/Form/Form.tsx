import { FormiumClient } from '@formium/client'
import { Form as FormType } from '@formium/types'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { User } from 'next-firebase-auth'
import { ReactElement, useEffect, useState } from 'react'

import { FormiumForm, getFormiumClient } from '@core/shared/ui/FormiumForm'

import { TreeBlock } from '../../libs/block'
import { WrappersProps } from '../BlockRenderer'

import { FormFields } from './__generated__/FormFields'

interface FormProps extends TreeBlock<FormFields> {
  wrappers?: WrappersProps
}

export function Form({
  projectId,
  apiToken,
  formSlug,
  wrappers
}: FormProps): ReactElement {
  // const form = await formiumClient.getFormBySlug(formSlug)
  const [form, setForm] = useState<FormType | undefined>(undefined)
  const [formiumClient, setFormiumClient] = useState<FormiumClient | undefined>(
    undefined
  )

  // const projectId = '6525eb824f0b2e0001234bab'
  // const apiToken =
  //   'FQRIJgbWxDXvfYCjmnXKNEhduJOfimJKeeTHz2B7S4VKn8a1JkOUtXiJY9NiRGWx'
  // const formSlug = 'ns-onboarding-form-dev'

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

  const user = {
    id: 'test_id',
    email: 'test_email'
  } as unknown as User

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
        hiddenPageTitle
        submitText="Next"
        // submitIcon={<ArrowRightIcon />}
        // onSubmit={handleSubmit}
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
