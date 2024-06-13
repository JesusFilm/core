import React from 'react'

export const Swiper = ({ children, 'data-testid': dataTestId }) => (
  <div data-testid={dataTestId}>{children}</div>
)
export const SwiperSlide = ({ children, 'data-testid': dataTestId }) => (
  <div data-testid={dataTestId}>{children}</div>
)
export const SwiperClass = {}
