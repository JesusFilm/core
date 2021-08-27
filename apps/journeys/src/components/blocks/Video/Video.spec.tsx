import { render } from '@testing-library/react';
import { Video } from './Video';
import transformer from '../../../libs/transformer';
import { videos } from '../../../data';

const transformed1 = transformer(videos)


describe('BlockRendererVideo', () => {
  it('should render successfully', () => {

    const { baseElement } = render(
      <Video {...transformed1[0]} />
    );

    expect(baseElement).toBeTruthy();
  });

});
