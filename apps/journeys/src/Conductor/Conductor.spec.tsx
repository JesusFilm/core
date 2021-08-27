import { render } from '@testing-library/react';
import Conductor from './Conductor';
import { data1 } from '../data/data';
import { Transformer } from '../Transformer/Transformer';

const transformed1 = Transformer(data1)

describe('Conductor', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Conductor {...transformed1} />
    );

    expect(baseElement).toBeTruthy();
  });

});
