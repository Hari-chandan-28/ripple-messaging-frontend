import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import ProfileSetupPage from './pages/ProfileSetupPage'
import AppPage from './pages/AppPage'

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup" element={<ProfileSetupPage />} />
          <Route path="/app" element={<AppPage />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App