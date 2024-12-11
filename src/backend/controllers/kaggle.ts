import puppeteer, { Browser, Page } from 'puppeteer';
import { ILoginToKaggleFn, ISyncDataToWebFormFn, ISyncKaggleCSVFn } from '../models/ipcApi';
import { KaggleCssSelectors, KaggleUrls } from '../../common/models/kaggle';
import { IFileWithData } from '../../common/models/file';
import { unzip } from './file';
import { sendMainWindowEvent } from './window';
import { IPCChannels } from '../../common/models/ipc';
import { WebFormCssSelectors } from '../../common/models/webForm';
import { IBabyNameData } from '../../common/models/babyName';
import database from './database';


let browser:Browser;

const getBrowser = async () => {
    // Check if browser exists
    if (browser?.connected)
        return browser;
    // Init new browser and page
    browser = await puppeteer.launch({
        userDataDir: "./assets"
    });
}

const sleep = async (duration: number = 1000) => (new Promise((resolve) => setTimeout(() => resolve(true), duration)));

const mapName = (data: string) => data.replace("Welcome, ", "").replace("!", "");

const close = async () => await browser?.close();

const compareUrl = async (page: Page, url: string) => url === page.url().replace(/#+[^?]*/, "");

const navigateTo = async (page: Page, url: string) => Promise.all([
    page.goto(url),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
]);

const navigateToWithRetry = async (page: Page, url: string) => {
    let waitTime = 300;
    for (let i = 0; i < 5; i++) {
        try {
            return await navigateTo(page, url);
        } catch (error) {
            if ((error.message as string).indexOf("net::ERR_ABORTED") < 0)
                throw error;
        }
        // Sleep
        waitTime += 100;
        await sleep(waitTime);
    }
    console.log("UNABLE TO NAVIGATE TO WEB FORM");
}

const clickAndWait = async (page: Page, selector: string) => Promise.all([
    page.click(selector),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
]);

const makeLogin = async (page: Page, email: string, password: string) => {
    // console.log("makeLogin 1", page.url());
    // Got to login page
    if (page.url() !== KaggleUrls.LOGIN) {
        // console.log("makeLogin 5", page.url());
        await page.reload();
        await navigateTo(page, KaggleUrls.LOGIN);
    }
    // console.log("makeLogin 2", page.url());
    // Fill form and submit
    await page.waitForSelector(KaggleCssSelectors.LOGIN_EMAIL_INPUT);
    await page.locator(KaggleCssSelectors.LOGIN_EMAIL_INPUT).fill(email);
    // console.log("makeLogin 3", page.url());
    await page.locator(KaggleCssSelectors.LOGIN_PASSWORD_INPUT).fill(password);
    // console.log("makeLogin 4", page.url());
    // Wait for page to be redirected or reloaded
    return clickAndWait(page, KaggleCssSelectors.LOGIN_SUBMIT);
}

const logout = async (page: Page) => {
    // console.log("logout");
    // Open profile menu
    await page.waitForSelector(KaggleCssSelectors.USER_MENU_BUTTON);
    await page.click(KaggleCssSelectors.USER_MENU_BUTTON);
    // console.log("logout 1", page.url());
    // Click logout and wait for page to be redirected or reloaded
    return clickAndWait(page, KaggleCssSelectors.LOGOUT_BUTTON);
}

const isLogged = async (page: Page) => {
    // console.log("isLogged", page.url());
    // Got to login page
    await navigateTo(page, KaggleUrls.LOGIN);
    // console.log("isLogged 1", page.url());
    // Check if redirected to home page
    return compareUrl(page, KaggleUrls.DASHBOARD);
}

const decorator = (fn:CallableFunction) => {
    async function wrapper() {
        const start = Date.now();
        const result: any = await fn(...Array.from(arguments));
        console.log("TIME:", Math.round(((Date.now() - start) / 1000) * 100) / 100, "seg");
        return result;
    }
    return wrapper;
}

const login: ILoginToKaggleFn = async (event, {email, password}) => {
    console.log("login");
    // Init browser and page
    await getBrowser();
    const page = await browser.newPage();
    // Check if session open in browser
    // console.log("login 1")
    if (await isLogged(page))
        await logout(page);
    // console.log("login 2", page.url())
    // Got to login page
    await makeLogin(page, email, password);
    // console.log("login 3", page.url());
    // Check if redirected to home page
    if (!compareUrl(page, KaggleUrls.DASHBOARD))
        throw new Error("Invalid kaggle crendentials");
    // console.log("login 4")
    // Wait for h1 to get the name
    await page.waitForSelector('h1');
    // console.log("login 5")
    const name = mapName(await page.evaluate(() => document.querySelector('h1').textContent));
    // console.log("login 6")
    // Close page
    await page.close();
    // Get and map name
    return name;
}

const downloadCSV = async (page: Page) => {
    let fileData: IFileWithData;
    // Init new page with download permits
    (await page.createCDPSession()).send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: './assets'
    });
    // Promise to ensure to wait until the file url was generated
    const waitToGetFileUrl = new Promise(resolve => page.on('response', async (response) => {
        const headers = response.headers();
        if (!(headers['content-type'] === 'application/zip'))
            return;
        fileData = {
            url: response.url(), mime: headers['content-type'],
            size: headers['content-length'], modifiedAt: new Date(headers['last-modified'])
        };
        resolve(true);
    }));
    // Navigate to file
    await navigateTo(page, KaggleUrls.CSV_FILE);
    // Click button and wait for file
    await Promise.all([
        waitToGetFileUrl,
        page.click(KaggleCssSelectors.CSV_DOWNLOAD_BUTTON)
    ]);
    // Get file
    const response = await fetch(fileData.url, {method: 'GET'});
    if (!response.ok)
        throw new Error("Failed to got file: " + await response.text());
    // Save file in buffer
    fileData.data = await response.arrayBuffer();
    return fileData;
}

const syncCSV: ISyncKaggleCSVFn = async (event, {email, password}) => {
    console.log("syncCSV");
    await getBrowser();
    const page = await browser.newPage();
    // Check if logged
    if (!await isLogged(page))
        await makeLogin(page, email, password);
    // Download file
    const fileData = await downloadCSV(page);
    // Close page
    await page.close();
    // Unzip
    sendMainWindowEvent(IPCChannels.SYNC_KAGGLE_UPDATES, "Unzipping CSV file");
    const csvPath = await unzip(fileData.data);
    // Adding to database
    sendMainWindowEvent(IPCChannels.SYNC_KAGGLE_UPDATES, "Processing CSV file");
    delete fileData.data;

    return {
        ...fileData,
        processedAt: new Date(),
        recordsCount: await database.loadFile(csvPath),
        syncRecordsCount: 0,
    }
}

const submitWebForm = async (page: Page, formUrl: string, data: IBabyNameData) => {
    // Navigate to web form
    await navigateToWithRetry(page, formUrl);
    // Fill form and submit
    await page.waitForSelector(WebFormCssSelectors.YEAR_INPUT);
    await page.locator(WebFormCssSelectors.YEAR_INPUT).fill(data.year);
    await page.locator(WebFormCssSelectors.NAME_INPUT).fill(data.name);
    await page.locator(WebFormCssSelectors.SEX_INPUT).fill(data.sex);
    await page.locator(WebFormCssSelectors.NUMBER_INPUT).fill(data.number.toString());
    // Wait for page to be redirected or reloaded
    await clickAndWait(page, WebFormCssSelectors.SUBMIT);
}

const syncDataToWebForm: ISyncDataToWebFormFn = async (event, formUrl) => {
    console.log("syncDataToWebForm");
    await getBrowser();
    const page = await browser.newPage();
    let batch: any[], count: number = 0;
    let ids: number[] = [];
    // Sync 600 records
    for (let i = 0; i < 6; i++) {
        try {
            // Get data
            batch = await database.getBatch();
            for (const e of batch) {
                try {
                    await submitWebForm(page, formUrl, e.toJSON());
                    count++;
                    ids.push(e.id);
                } catch (error) {  }
                if (!(count % 10))
                    sendMainWindowEvent(IPCChannels.SYNC_WEB_FORM_UPDATES, 10);
            }
        } catch (error) {  }
        if (ids.length)
            await database.markBatch(ids);
        ids = [];
    }
}

export default {
    login: decorator(login), syncCSV: decorator(syncCSV),
    close, syncDataToWebForm: decorator(syncDataToWebForm)
}