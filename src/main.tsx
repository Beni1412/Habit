// Entry point utama aplikasi React.
// File ini me-render komponen <App /> ke dalam elemen HTML dengan id "root" di index.html.

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
