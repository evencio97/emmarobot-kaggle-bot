import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';


export default function AuthGuard({ }) {
  const navigate = useNavigate();
  const {state} = useAppContext();

  useEffect(() => {
    if (!state.user)
      navigate("/login");
  }, [state.user]);

  return (
    <Outlet />
  );
}
