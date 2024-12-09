import { useContext } from "react";
import { AppContext } from "../context/app/AppProvider";

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("Missing AppProvider");

  return context;
}