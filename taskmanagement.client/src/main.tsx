import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux';
import store from './store';
import Notifications from './components/Notifications';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Notifications />
      <App />
    </Provider>
  </StrictMode>,
)
