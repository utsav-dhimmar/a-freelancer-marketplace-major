import { Suspense } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingFallback } from './components/layout';
import { routes } from './routes';
import './index.css';

function AppRoutes() {
  const element = useRoutes(routes);
  return <Suspense fallback={<LoadingFallback />}>{element}</Suspense>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
