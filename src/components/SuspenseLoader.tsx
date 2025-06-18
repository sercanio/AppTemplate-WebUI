import { Suspense } from 'react';
import { LoadingSplash } from './LoadingSplash';

interface SuspenseLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SuspenseLoader({ 
  children, 
  fallback = <LoadingSplash message="Loading component..." /> 
}: SuspenseLoaderProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}
