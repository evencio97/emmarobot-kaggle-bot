import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../hooks/useAppContext";
import Login from "../../components/login/Login";
import "./Auth.css";


export default function Auth({ }) {
  const navigate = useNavigate();
  const {state} = useAppContext();

  useEffect(() => {
    if (state.user)
      navigate("/");
  }, [state.user]);
  
  return (
    <div className="auth">
      <div className="ah-content">
        <h1>Wellcome</h1>
        <span className="ah-content-description">Please enter your Kaggle credentials and web form url.</span>
        <Login formId="authForm" />
      </div>
    </div>
  );
}
