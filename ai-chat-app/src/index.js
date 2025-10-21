import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWithMe from './ChatWithMe';
import './ChatWithMe.css'; 

const rootElement = document.getElementById('virtual-me-root');


if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ChatWithMe />
    </React.StrictMode>
  );
}