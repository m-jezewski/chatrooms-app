import { createListenerMiddleware } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from './store.ts';

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>();

export type AppStartListening = typeof startAppListening;
