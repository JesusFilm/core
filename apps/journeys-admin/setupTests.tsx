import '@testing-library/jest-dom'
import './test/createMatchMedia'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} />
  }
}))
