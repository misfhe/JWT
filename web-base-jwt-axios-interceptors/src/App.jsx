
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from '~/pages/Login'
import Dashboard from '~/pages/Dashboard'

//Sử dụng <Outlet/> của react-router-dom để bảo vệ các Child route
const ProtectedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  if(!user) return <Navigate to="/login" replace={true} />
  return <Outlet />
}

const UnauthorizedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  if(user) return <Navigate to="/dashboard" replace={true} />
  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path='/' element={
        <Navigate to="/login" replace={true} />
      } />

      <Route element={<UnauthorizedRoutes />}>
        <Route path='/login' element={<Login />} />
      </Route>

      <Route element={<ProtectedRoutes />}>
        {/* <Outlet/> của react-dom sẽ chạy vào các child route trong này */}
        <Route path='/dashboard' element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App
