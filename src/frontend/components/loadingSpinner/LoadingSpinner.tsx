import { CircularProgress } from '@mui/material';
import './LoadingSpinner.css';

export default function LoadingSpinner({
    className = "", margin = "0 0 0 0", active = false
}) {
    const spinner =(
        <div className={"loading-spinner "+className} style={{margin: margin}}>
            <CircularProgress />
        </div>
    );
    return ( active? spinner : null );
}