import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAppContext } from "../../hooks/useAppContext";
import "./Header.css";


export default function Header() {
  const { state, logout } = useAppContext();

  const logoutHandler = () => logout();

  return (
    <Box sx={{ flexGrow: 1 }} className="header">
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {state?.user?.name}
          </Typography>
          <Button color="inherit" onClick={logoutHandler}>Logout</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
