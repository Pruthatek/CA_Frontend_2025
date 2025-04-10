import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ColorProvider } from './components/ColorContext/ColorContext.jsx'
import { YearProvider } from './components/YearContext/YearContext.jsx'
// import { AuthProvider } from './context/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  // <AuthProvider>
  <StrictMode>
    <YearProvider>
    <ColorProvider>
    <App />
    </ColorProvider>
    </YearProvider>
  </StrictMode>
  // </AuthProvider>,
)






          