import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useOutletContext } from '@remix-run/react'
import { ReactElement, useEffect } from 'react'
import { RxDatabase } from 'rxdb'

interface Context {
  rxDatabase: RxDatabase | null
}

export default function Index(): ReactElement {
  const { rxDatabase } = useOutletContext<Context>()

  useEffect(() => {
    const fetchTodos = async (): Promise<void> => {
      if (rxDatabase?.todo != null) {
        await rxDatabase?.todo.find().$.subscribe((todo) => {
          console.log('Fetched todos:', todo)
        })
      }
    }
    void fetchTodos()
  }, [rxDatabase])

  return (
    <Box>
      <Typography variant="h1">Welcome to Next.js!</Typography>
    </Box>
  )
}
