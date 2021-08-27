import { render } from '@testing-library/react';
import {BlockRendererVideo} from './BlockRendererVideo';
import Transformer from '../Transformer/Transformer';
import { videos } from '../data/data';

const transformed1 = Transformer(videos)


describe('BlockRendererVideo', () => {
  it('should render successfully', () => {

    const { baseElement } = render(
      <BlockRendererVideo {...transformed1[0]} />
    );

    expect(baseElement).toBeTruthy();
  });

});
