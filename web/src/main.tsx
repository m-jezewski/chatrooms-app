import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.scss'
import App from './App.tsx'
import {BrowserRouter} from "react-router";
import {store} from "./store.ts";
import {Provider} from "react-redux";
import { RoomKeyContextProvider } from './features/chatrooms/RoomKeyContext.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <RoomKeyContextProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </RoomKeyContextProvider>
        </Provider>
    </StrictMode>,
)
