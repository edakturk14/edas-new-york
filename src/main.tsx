import React from 'react';
import ReactDOM from 'react-dom/client';
// Loaded here, before App.css, so the app's map rules still override MapLibre's
// (.maplibregl-map sets position:relative) now that the map code is a lazy chunk.
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css';
import App from './App';
import {CreatorAdmin} from './components/CreatorAdmin';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {new URLSearchParams(location.search).get('creators')==='admin'?<CreatorAdmin/>:<App />}
  </React.StrictMode>
);
