// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Register } from './screens/register/Register'
import { Login } from './screens/login/Login'
import { Dashboard } from './screens/dashboard'
import { CreateTrip } from './screens/create-trip'
import { TripDetails } from './screens/trip-details'
import { ForgotPassword } from './screens/forgot-password'
import { VerifyOtp } from './screens/verify-otp'
import { VerifyRegistration } from './screens/verify-registration'
import { ResetPassword } from './screens/reset-password'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-registration" element={<VerifyRegistration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-trip"
          element={
            <ProtectedRoute>
              <CreateTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip/:tripId"
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />
        {/* Redireciona qualquer rota não encontrada para o login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
