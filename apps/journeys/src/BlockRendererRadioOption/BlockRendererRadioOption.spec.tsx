import { render } from '@testing-library/react';
import {BlockRendererRadioOption} from './BlockRendererRadioOption';
import Transformer from '../Transformer/Transformer';
import { radioOptions } from '../data/data';

const transformed1 = Transformer(radioOptions)


describe('BlockRendererRadioOption', () => {
  it('should render successfully', () => {

    const { baseElement } = render(
      <BlockRendererRadioOption {...transformed1[0]} />
    );

    expect(baseElement).toBeTruthy();
  });

});
