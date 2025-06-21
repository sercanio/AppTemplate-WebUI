import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from '../layouts/RootLayout'
import Dashboard from '../pages/dashboard'
import Users from '../pages/Users'
import Settings from '../pages/Settings'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import ConfirmEmail from '../pages/ConfirmEmail'
import ErrorPage from '../pages/ErrorPage'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import PublicRoute from '../components/auth/PublicRoute'
import Roles from '../pages/Roles'
import Profile from '../pages/Profile'

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
      // Profile routes with sub-paths for tabs
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'profile/security',
        element: <Profile />,
      },
      {
        path: 'profile/notifications',
        element: <Profile />,
      },
      {
        path: 'profile/settings',
        element: <Profile />,
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
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    ),
  },
  {
    path: '/confirm-email',
    element: <ConfirmEmail />,
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
