import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Landing from './pages/Landing'
import RootLayout from './layouts/RootLayout'
import Events from './pages/Events'
import CreateEvent from './pages/CreateEvent'
import Notifications from './pages/Notifications'
import Admin from './pages/Admin'
import AuthPage from './pages/AuthPage'
import AuthLayout from './layouts/AuthLayout'
import SignInPage from './pages/SignInPage'
import RegisterPage from './pages/RegisterPage'
import SignUpPage from './pages/SignUpPage'
import { RequireAdmin, RequireAuth } from './components/RouteGuards'

function App() {

  return (
    <Router>
      <Routes>
        {/* Public default landing */}
        <Route path='/' element={<Landing />} />
        <Route path='/welcome' element={<Landing />} />

        {/* Authenticated app under /app */}
        <Route path='/app' element={<RootLayout />}>
          <Route element={<RequireAuth />}>
            <Route index element={<Home />} />
            <Route path='events' element={<Events />} />
            <Route path='notifications' element={<Notifications />} />
            <Route element={<RequireAdmin />}>
              <Route path='create-event' element={<CreateEvent />} />
              <Route path='admin' element={<Admin />} />
            </Route>
          </Route>
        </Route>
        {/* SIGN IN / SIGN UP */}
        <Route path='auth' element={<AuthLayout />}>
          <Route index element={<AuthPage />} />
          <Route path='sign-in' element={<SignInPage />} />
          <Route path='register' element={<RegisterPage />} />
          <Route path='sign-up' element={<SignUpPage />} />
        </Route>
        
      </Routes>
    </Router>
  )
}

export default App
