const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

export default async function fetchPalette (req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    let { hex } = req.query

    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });

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
    return res.status(200).json( images );
}