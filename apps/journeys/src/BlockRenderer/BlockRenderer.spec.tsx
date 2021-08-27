import { render } from '@testing-library/react';
import { BlockRenderer } from './BlockRenderer';
import Transformer from '../Transformer/Transformer';
import { data1 } from '../data/data';


describe('BlockRenderer', () => {
  it('should render successfully', () => {

    const { baseElement } = render(
      <BlockRenderer {...Transformer(data1)[0]} />
    );

    expect(baseElement).toBeTruthy();
  });

});
