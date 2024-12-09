import { lazy, Suspense } from 'react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import LoadingSpinner from './components/loadingSpinner/LoadingSpinner';
import AuthGuard from './views/authGuard/AuthGuard';
import { useAppContext } from './hooks/useAppContext';

const AuthView = lazy(() => import('./views/auth/Auth'));
const HomeView = lazy(() => import('./views/home/Home'));


export default function AppRouter() {
  const { state } = useAppContext();
  
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/login" element={
          <Suspense>
            <AuthView />
          </Suspense>
        } />
        <Route element={<AuthGuard />} >
          <Route path="/" element={
            <Suspense>
              <HomeView />
            </Suspense>
          } index />
        </Route>
      </Routes>
      <LoadingSpinner active={state.loading}/>
    </MemoryRouter>
  );
}