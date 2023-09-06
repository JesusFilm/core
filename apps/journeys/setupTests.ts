import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/router', () => require('next-router-mock'))
