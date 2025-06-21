import { lazy } from 'react';

// Lazy load your components
export const Dashboard = lazy(() => import('../pages/dashboard'));
export const UsersManagement = lazy(() => import('../users/components/UsersManagement'));
export const RolesManagement = lazy(() => import('../roles/components/RolesManagement'));
export const Settings = lazy(() => import('../pages/Settings'));
export const ConfirmEmail = lazy(() => import('../pages/ConfirmEmail'));
