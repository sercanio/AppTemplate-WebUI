import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from '../layouts/RootLayout'
import Dashboard from '../pages/dashboard'
import Users from '../pages/Users'
import Settings from '../pages/Settings'
import Login from '../pages/Login'
import ErrorPage from '../pages/ErrorPage'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import PublicRoute from '../components/auth/PublicRoute'
import Roles from '../pages/Roles'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'admin',
        element: <Dashboard />,
      },
      {
        path: 'admin/users',
        element: <Users />,
      },
      {
        path: 'admin/roles',
        element: <Roles />,
      },
      {
        path: 'admin/settings',
        element: <Settings />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
