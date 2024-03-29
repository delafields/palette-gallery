import chrome from 'chrome-aws-lambda'

// Importing Puppeteer core as default otherwise
// it won't function correctly with "launch()"
import puppeteer, { errors } from 'puppeteer-core'

export default async function fetchPalette (req, res) {
    // how to handle arguments
    // https://www.slingacademy.com/article/next-js-api-routes-how-to-get-parameters-query-string/
    let { hex } = req.query

    const options = process.env.AWS_REGION
    ? {
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless
        }
    : {
        args: [],
        executablePath:
            process.platform === 'win32'
            ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
            : process.platform === 'linux'
            ? '/usr/bin/google-chrome'
            : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        };

    const browser = await puppeteer.launch(options);

    const page = await browser.newPage()

    const url = 'https://artsexperiments.withgoogle.com/artpalette/colors/' + hex

    await page.goto(url, { waitUntil: 'networkidle0' });

    // scrape images
    const els = await page.$$('div.result-item');

    const images = [];

    for (let i = 0; i < els.length; i++) {
        let url = await els[i].$eval('div.item-image > img', i => i.getAttribute('src'));
        // grab a larger version of the image
            url = url.replace(/=w(\d)+/, '=w1000')
        // console.log(img);
        let title = await els[i].$eval('a.more-details', a => a.getAttribute('title'));
              title = title.replace(/<\/?i>/g, '')
        // console.log(link);

        images.push({"title": title, "url": url})
    }
    
    // console.log(images)
    // return res.status(200).json({ images });
    return res.status(200).json( images );
}