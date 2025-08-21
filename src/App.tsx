// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Register } from './screens/register/Register'
import { Login } from './screens/login/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
