import { IpcRendererEvent } from 'electron';
import { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { Skeleton } from '@mui/material';
import { useAppContext } from '../../hooks/useAppContext';
import Header from '../../components/header/Header';
import { getIPCClient, mapDateToString } from '../../helpers/web';
import "./Home.css";


let syncingKaggleCSV = false;
let syncingToWebForm = false;

export default function Home() {
  const { state, addNotification, setFileInfo, incrementSyncRecordsCount } = useAppContext();
  const [text, setText] = useState("Downloading CSV file");
  const [diff, setDiff] = useState(0);

  const listenToFileSync = (event: IpcRendererEvent, message: string) => setText(message);
  
  const syncKaggleCSV = async (email: string, password: string) => {
    if (syncingKaggleCSV) return;
    
    const client = getIPCClient();
    syncingKaggleCSV = true;
    console.log("Starting sync file");
    try {
      // Init listener
      client.listenKaggleSync(listenToFileSync);
      // Download file
      const result = await client.syncKaggleCSV({email, password});
      console.log("syncKaggleCSV", result);
      setFileInfo(result);
    } catch (error) {
      console.error(error);
      addNotification({variant: 'error', message: "Unexpected error processing CSV file"});
    }
    console.log("Ended sync file");
    // cleanup
    client.unlistenKaggleSync();
    syncingKaggleCSV = false;
  };

  const listenWebFormSync = (event: IpcRendererEvent, count: number) => incrementSyncRecordsCount(count);

  const syncToWebForm = async () => {
    if (syncingToWebForm) return;
    syncingToWebForm = true;
    const client = getIPCClient();
    console.log("Starting sync to web form");
    try {
      // Init listener
      client.listenWebFormSync(listenWebFormSync);
      // Start sync data
      await client.syncDataToWebForm();
    } catch (error) {
      console.error(error);
      addNotification({variant: 'error', message: "Unexpected error sending data to web form"});
    }
    console.log("Ended sync to web form");
    // cleanup
    await (new Promise((r) => {setTimeout(() => r(true), 3000)}));
    client.unlistenWebFormSync();
    syncingToWebForm = false;
  };


  useEffect(() => {
    console.log("Home", state?.fileInfo);
    if (!state.fileInfo)
      syncKaggleCSV(state.user.email, state.user.password);
  }, []);
  
  useEffect(() => {
    if (!state?.fileInfo) return;
    // Sync data
    syncToWebForm();
    // Update UI
    setDiff(1000 - state.fileInfo.syncRecordsCount); 
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
                        { id: 0, color: "cornflowerblue", value: 1000 - diff, label: 'Records downloaded' },
                        { id: 1, color: "darkslategrey", value: diff, label: 'Records synchronized' },
                      ],
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  );
}
