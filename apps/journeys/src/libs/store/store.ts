import { configureStore, EnhancedStore } from '@reduxjs/toolkit'
import { conductorReducer } from '../../components/Conductor'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { PreloadedState } from 'redux'

const config = {
  reducer: {
    conductor: conductorReducer
  }
}

export const store = configureStore(config)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const configureStoreWithState = (preloadedState?: PreloadedState<RootState>): EnhancedStore => {
  return configureStore({ ...config, preloadedState })
}

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
