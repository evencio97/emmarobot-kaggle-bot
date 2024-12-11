import { IpcRendererEvent } from 'electron';
import { useEffect, useState } from 'react';
import { CircularProgress, Snackbar } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { Skeleton } from '@mui/material';
import { useAppContext } from '../../hooks/useAppContext';
import Header from '../../components/header/Header';
import { getIPCClient, mapDateToString } from '../../helpers/web';
import "./Home.css";


let syncingKaggleCSV = false;
let syncingToWebForm = false;
const syncingWFMaxCount = 600;

export default function Home() {
  const {
    state, addNotification, setFileInfo,
    incrementSyncRecordsCount, setSynchronizing
  } = useAppContext();
  const [text, setText] = useState("Downloading CSV file");
  const [syncedRecordsCount, setSyncedRecordsCount] = useState(0);
  const [showWebFormSyncSnackbar, setShowWebFormSyncSnackbar] = useState(false);

  const listenToFileSync = (event: IpcRendererEvent, message: string) => setText(message);
  
  const listenWebFormSync = (event: IpcRendererEvent, count: number) => incrementSyncRecordsCount(count);
  
  const syncKaggleCSV = async (email: string, password: string) => {
    if (syncingKaggleCSV || state.synchronizing) return;
    
    syncingKaggleCSV = true;
    setSynchronizing(true);
    const client = getIPCClient();
    console.log("Starting sync file");
    try {
      // Init listener
      client.listenKaggleSync(listenToFileSync);
      // Download file
      const result = await client.syncKaggleCSV({email, password});
      console.log("syncKaggleCSV", result);
      setFileInfo(result);
      addNotification({variant: 'success', message: "CSV file downloaded and ready to start synchronization"});
    } catch (error) {
      console.error(error);
      addNotification({variant: 'error', message: "Unexpected error processing CSV file"});
    }
    console.log("Ended sync file");
    // cleanup
    client.unlistenKaggleSync();
    setSynchronizing(false);
    syncingKaggleCSV = false;
  };

  const syncToWebForm = async () => {
    if (syncingToWebForm || state.synchronizing) return;
    
    syncingToWebForm = true;
    setSynchronizing(true);
    setShowWebFormSyncSnackbar(true);
    const client = getIPCClient();
    console.log("Starting sync to web form");
    try {
      // Init listener
      client.listenWebFormSync(listenWebFormSync);
      // Start sync data
      await client.syncDataToWebForm(state.user.form);
      addNotification({variant: 'success', message: "Records synchronized with web form"});
    } catch (error) {
      console.error(error);
      addNotification({variant: 'error', message: "Unexpected error sending data to web form"});
    }
    console.log("Ended sync to web form");
    // cleanup
    client.unlistenWebFormSync();
    setSynchronizing(false);
    setShowWebFormSyncSnackbar(false);
    syncingToWebForm = false;
  };

  useEffect(() => {
    console.log("Home", state?.fileInfo);
    if (!state.fileInfo && !syncingKaggleCSV)
      syncKaggleCSV(state.user.email, state.user.password);
  }, []);
  
  useEffect(() => {
    if (!state?.fileInfo || state?.fileInfo?.syncRecordsCount === state?.fileInfo?.recordsCount) return;
    // Sync data
    syncToWebForm();
    // Update UI
    const mod = state.fileInfo.syncRecordsCount % syncingWFMaxCount;
    setSyncedRecordsCount(syncedRecordsCount && mod === 0? syncingWFMaxCount : mod);
  }, [state.fileInfo]);
  
  return (
    <div className="home">
      <Header />
      <div className="hm-content">
        { !state.fileInfo? 
          <div className="hm-info-loading">
            <Skeleton sx={{ bgcolor: 'grey.400', borderRadius: "20px" }} animation="wave" variant="rounded" width={"80vw"} height={"40vh"} />
            <div className="hm-info-loading-svg">
              <CircularProgress />
            </div>
            <div className="hm-info-loading-text">
              <p>{text}....</p>
            </div>
          </div>:
          <div className="hm-info">
            <h3>Kaggle CSV File Info</h3>
            <div>
              <div className="hm-file-info">
                <p><b>Size</b>: {state.fileInfo.size} Bytes</p>
                <p><b>Records #</b>: {state.fileInfo.recordsCount}</p>
                <p><b>Records synchronized #</b>: {state.fileInfo.syncRecordsCount}</p>
                <p><b>Modified at</b>: {mapDateToString(state.fileInfo.modifiedAt)}</p>
                <p><b>Processed at</b>: {mapDateToString(state.fileInfo.processedAt)}</p>
              </div>
              <div className="hm-form-info">
                <PieChart series={[
                    {
                      data: [
                        { id: 0, color: "cornflowerblue", value: syncingWFMaxCount - syncedRecordsCount, label: 'Remaining records' },
                        { id: 1, color: "darkslategrey", value: syncedRecordsCount, label: 'Records synchronized' },
                      ],
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        }
      </div>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={showWebFormSyncSnackbar}
        className="webform-sync-snackbar"
        message={
          <>
            <CircularProgress />
            <p>Synchronizing records to the web form</p>
          </>
        }
        key="snackbar-synchronizing"
      />
    </div>
  );
}
