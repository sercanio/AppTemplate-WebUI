import { useRouteError, Link } from 'react-router-dom'

type RouteError = {
  statusText?: string;
  message?: string;
};

export default function ErrorPage() {
  const error = useRouteError() as RouteError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Oops!</h1>
        <p className="text-lg text-muted-foreground">
          Sorry, an unexpected error has occurred.
        </p>
        <p className="text-sm text-muted-foreground">
          <i>{error?.statusText || error?.message}</i>
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
