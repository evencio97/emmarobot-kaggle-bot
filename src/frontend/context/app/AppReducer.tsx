import { IFileInfo } from "../../../common/models/file";
import { IUser } from "../../../common/models/user";
import storageSevice from "../../services/storageSevice";


export type AppState = {
    user: IUser | undefined,
    loading: boolean,
    fileInfo: IFileInfo | undefined
};

export type AppActions = {
    type: "SET_USER" | "SET_LOADING" | "SET_FILE_INFO" | "INCREMENT_FILE_INFO_SRC",
    payload: IUser | undefined | boolean | IFileInfo | number
};

export const initialState: AppState = {
    user: storageSevice.getUser(), loading: false, fileInfo: storageSevice.getFileInfo()
}

export const appReducer = (state: AppState = initialState, action: AppActions): AppState => {
    switch (action.type) {
        case "SET_USER":
            storageSevice.setUser(action.payload as IUser);
            return {...state, user: action.payload as IUser};
        case "SET_FILE_INFO":
            storageSevice.setFileInfo(action.payload as IFileInfo);
            return {...state, fileInfo: action.payload as IFileInfo};
        case "SET_LOADING":
            return {...state, loading: action.payload as boolean};
            case "INCREMENT_FILE_INFO_SRC":
            const aux = {
                ...state.fileInfo,
                syncRecordsCount: state.fileInfo.syncRecordsCount + (action.payload as number)
            };
            storageSevice.setFileInfo(aux);
            return {
                ...state, fileInfo: aux
            };
        default:
            return state;
    }
}