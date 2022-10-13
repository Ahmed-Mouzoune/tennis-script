require('dotenv').config();
const CronJob = require('cron').CronJob;

const main = async () => {
    if(!process.env.EMAIL || !process.env.PASSWORD) console.log(`Définissez un nom d'utilisteur et un mot de passe`)
    // return console.log('process.env.EMAIL', process.env.EMAIL)
    const puppeteer = require('puppeteer');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        userDataDir: `${__dirname}/eylonSession`
    })
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();
    await page.setDefaultTimeout(10000);
    await page.setViewport({
        width: 1920,
        height: 1080
    })
    // Date du jour pour le sélecteur de la colonne de réservation
    const fmt = (int) => {
        return ((int < 10) ? "0" : "") + int.toString();
    }
    const today = new Date();
    const date = `${fmt(today.getDate())}-${fmt(today.getMonth()+ 1)}-${today.getFullYear()}`
    // Date pour tester
    // const date = `13-10-2022`;
    const heure = '21'
    let partenaire = {
        firstname: 'John ',
        id: '5049'
    }
    // let partenaire = {
    //     firstname: 'Lior ',
    //     id: '48441'
    // }
    try {
        await page.goto('https://paris-jean-bouin.kirola.fr/users/sign_in', {
            waitUntil: 'networkidle2'
        })
        let url = await page.url();
        if (url == 'https://paris-jean-bouin.kirola.fr/users/sign_in') {
            await page.waitForTimeout(200);
            await page.waitForSelector('[id="user_login"]');
            await page.type('[id="user_login"]', process.env.EMAIL, {delay: 100});
            await page.waitForTimeout(200);
            await page.waitForSelector('[id="user_password"]');
            await page.type('[id="user_password"]', process.env.PASSWORD, {delay: 100});
            await page.waitForTimeout(200);
            await page.waitForSelector('[id="user_remember_me"]');
            await page.click('[id="user_remember_me"]');
            await page.waitForTimeout(200);
            await page.waitForSelector('[value="Me connecter"]');
            await page.click('[value="Me connecter"]');
            await page.waitForNavigation({
                waitUntil: 'networkidle2'
            })
        }
        await page.waitForTimeout(200);
        await page.waitForSelector('[id="scroll-right"]');
        await page.waitForTimeout(200);
        await page.click('[id="scroll-right"]');
        await page.waitForTimeout(200);
        await page.click('[id="scroll-right"]');
        await page.waitForTimeout(200);
        await page.click('[id="scroll-right"]');
        await page.waitForTimeout(200);
        await page.waitForSelector(`[id="col-526-${date}"] > [data-start-hour="${heure}"]`);
        await page.click(`[id="col-526-${date}"] > [data-start-hour="${heure}"]`);
        await page.waitForSelector('.modal--js-active');
        await page.type('[data-target="app--autocomplete.input"]', partenaire.firstname, {delay: 100});
        await page.waitForSelector(`[data-id="${partenaire.id}"]`, {
            visible: true
        });
        await page.waitForTimeout(200);
        await page.click(`[data-id="${partenaire.id}"]`);
        await page.waitForSelector('[value="enregistrer"]');
        await page.click('[value="enregistrer"]');
        await page.screenshot({
            path: `${__dirname}/reservation/resa-${date}:${heure}.png`,
            fullPage: true,
            type: 'png'
        })
    } catch (error) {
        console.log('error', error)
    } finally {
        await browser.close();
    }

}
// main()
const reservation = new CronJob({
    // cronTime: '0 * 12 * * *',
    cronTime: '1 0 8 * * *',
    onTick: main(),
    timeZone: 'Europe/Paris',
    start: true
})