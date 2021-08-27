import { render } from '@testing-library/react';
import Conductor from './Conductor';
import { data1 } from '../data/data';
import transformer from '../transformer';

const transformed1 = transformer(data1)

describe('Conductor', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Conductor blocks={transformed1} />
    );

    expect(baseElement).toBeTruthy();
  });

});
