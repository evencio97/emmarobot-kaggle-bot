import { FormEvent } from "react";
import { Button, TextField } from "@mui/material";
import { useAppContext } from "../../hooks/useAppContext";
import { getFormHTMLData, getIPCClient } from "../../helpers/web";
import { IUser } from "../../../common/models/user";
import "./Login.css";


interface LoginPropsI {
  formId: string
}

export default function Login({formId}: LoginPropsI) {
  const { setUser, setLoading, addNotification } = useAppContext();

  const resetFrom = () => {
    let element: any = document.querySelector('input[name="password"]');
    if (element)
      element.value = ""
  }

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const data = getFormHTMLData(event.target) as IUser;
    try {
      // Login and get name
      data.name = await getIPCClient().loginToKaggle({email: data.email, password: data.password});
      setUser(data);
    } catch (error) {
      // Show alert
      addNotification({
        variant: "error",
        message: (error.message as string).indexOf("TimeoutError") >= 0? "Unable to connect with Kaggle":"Invalid Kaggle credentials"
      });
      // Reset form
      resetFrom();
    }
    setLoading(false);
  };

  return (
    <form id={formId} onSubmit={handlerSubmit} >
      <div className="form-field">
        <TextField name="email" type="email" label="Email" required />
      </div>
      <div className="form-field">
        <TextField type="password" name="password" label="Password" required />
      </div>
      <Button variant="contained" type="submit">
        Continue
      </Button>
    </form>
  );
}
