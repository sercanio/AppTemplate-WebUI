import { useRouteLoading } from '../hooks/useRouteLoading';
import { LoadingSplash } from './LoadingSplash';

interface RouteLoaderProps {
  children: React.ReactNode;
}

export function RouteLoader({ children }: RouteLoaderProps) {
  const isLoading = useRouteLoading();

  if (isLoading) {
    return <LoadingSplash message="Loading page..." />;
  }

  return <>{children}</>;
}
