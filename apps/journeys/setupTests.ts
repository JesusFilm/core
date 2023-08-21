import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

jest.mock('next/router', () => require('next-router-mock'))

configure({ asyncUtilTimeout: 2500 })
