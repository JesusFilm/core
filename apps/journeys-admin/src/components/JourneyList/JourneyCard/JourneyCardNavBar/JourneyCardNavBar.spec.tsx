import { render } from '@testing-library/react'
import JourneyCardNavBar from '.'

describe('JourneyCardNavBar', () => {
    it('NavBar back button should link to journeys', () => {
       const {getByRole} = render(<JourneyCardNavBar/>);
       expect(getByRole('Link')).toBeInTheDocument();
    })
});