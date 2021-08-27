import { render } from '@testing-library/react';
import { RadioOption } from './RadioOption';
import transformer from '../../../libs/transformer';
import { radioOptions } from '../../../data';

const transformed1 = transformer(radioOptions)


describe('BlockRendererRadioOption', () => {
  it('should render successfully', () => {

    const { baseElement } = render(
      <RadioOption {...transformed1[0]} />
    );

    expect(baseElement).toBeTruthy();
  });

});
