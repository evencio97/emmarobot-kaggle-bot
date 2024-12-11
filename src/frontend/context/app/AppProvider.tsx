import { useReducer, createContext, Dispatch, ReactNode } from 'react';
import { useSnackbar } from 'notistack';
import { Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { appReducer, AppActions, AppState, initialState } from './AppReducer';
import { IUser } from '../../../common/models/user';
import { IFileInfo } from '../../../common/models/file';


type addNotificationFnParam = {
    variant?: "default" | "error" | "success" | "warning" | "info",
    message: string,
    duration?:number
};

type addNotificationFn = (param: addNotificationFnParam) => void;

type AppContextProps = {
    state: AppState,
    dispatch: Dispatch<AppActions>,
    setUser: (value: IUser | undefined) => void,
    setFileInfo: (value: IFileInfo | undefined) => void,
    setLoading: (value: boolean) => void,
    setSynchronizing: (value: boolean) => void,
    addNotification: addNotificationFn,
    logout: () => void,
    incrementSyncRecordsCount: (value: number) => void
}

export const AppContext = createContext<AppContextProps>({} as AppContextProps);

export const AppProvider = ({ children }: { children: ReactNode}) => {
    // Dispatch for exec actions
    const [state, dispatch] = useReducer(appReducer, initialState);
    // Notifications State
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    // Functions
    const action = (key: string) => (
        <Button onClick={() => { closeSnackbar(key) }}>
            <CloseIcon className="notistack-close-btn" />
        </Button>
    );
    const addNotification = ({ variant="default", message, duration=4000 }: addNotificationFnParam) => {
        enqueueSnackbar( message, { variant: variant, autoHideDuration: duration, action } );
    };
    const setUser = (value: IUser | undefined) => dispatch({ type: 'SET_USER', payload: value});
    const setFileInfo = (value: IFileInfo | undefined) => {
        dispatch({ type: 'SET_FILE_INFO', payload: value});
    }
    const incrementSyncRecordsCount = (value: number) => {
        dispatch({ type: 'INCREMENT_FILE_INFO_SRC', payload: value});
    }
    const setLoading = (value: boolean) => dispatch({ type: 'SET_LOADING', payload: value});
    const setSynchronizing = (value: boolean) => dispatch({ type: 'SET_SYNCHRONIZING', payload: value});
    const logout = () => {
        dispatch({ type: 'SET_FILE_INFO', payload: undefined});
        dispatch({ type: 'SET_USER', payload: undefined});
    };

    return (
        <AppContext.Provider value={{
            state, dispatch, setUser, setLoading, addNotification,
            setFileInfo, logout, incrementSyncRecordsCount,
            setSynchronizing
        }}>
            {children}
        </AppContext.Provider>
    )
}