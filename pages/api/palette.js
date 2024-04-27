const axios = require('axios');
const db = require('../../database');
const clients = [];

async function processImageData(dataString) {
    dataString = dataString.trim();
    if (dataString.startsWith(')]}\',\n')) {
        dataString = dataString.substring(5);
    }
    const imagesData = JSON.parse(dataString);
    return imagesData.map(image => ({
        id: image.id,
        imageUrl: image.imageUrl,
        title: image.title,
        creator: image.creator,
        date: image.date,
        imageWidthPx: image.imageWidthPx,
        imageHeightPx: image.imageHeightPx,
        partner: image.partner,
        distance: image.distance
    }));
}

export default async function handler(req, res) {
    const { hex } = req.query;

    if (req.method === 'GET' && hex) {
        const sortedHex = hex.split('-').sort().join('-');
        const stmt = db.prepare('SELECT data FROM palette_data WHERE hex_codes = ?');
        const dbResult = stmt.get(sortedHex);

        if (dbResult) {
            let images = JSON.parse(dbResult.data);
            // Send SSE update
            sendSSEImagesUpdate({ images, palette: sortedHex });
            res.status(200).json({ images, palette: sortedHex });
        } else {
            const ajaxUrl = `https://artsexperiments.withgoogle.com/artpalette/search/${hex}`;
            try {
                const response = await axios.get(ajaxUrl, { responseType: 'text' });
                let images = await processImageData(response.data);
                const insertStmt = db.prepare('INSERT INTO palette_data (hex_codes, data) VALUES (?, ?)');
                insertStmt.run(sortedHex, JSON.stringify(images));
                
                // Send SSE update
                sendSSEImagesUpdate({ images, palette: sortedHex });

                res.status(200).json({ images, palette: sortedHex });
            } catch (error) {
                console.error('Error fetching images:', error);
                res.status(500).json({ message: 'Failed to fetch images' });
            }
        }
    } else if (req.method === 'GET' && req.headers.accept === 'text/event-stream') {
        // SSE request, register client
        registerClient(req, res);
    } else {
        res.status(405).send('Method Not Allowed');
    }
}

// Function to send SSE updates
function sendSSEImagesUpdate(data) {
    // console.log('SSE update sent');
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(data)}\n\n`));
}

export function registerClient(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    // This is a must. Really annoying issue described here https://github.com/vercel/next.js/issues/9965
    res.setHeader('Content-Encoding', 'none');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send a keep-alive message every 30 seconds
    const intervalId = setInterval(() => {
        res.write(':\n\n');
    }, 30000);

    // Clean up on connection close
    req.on('close', () => {
        clearInterval(intervalId);
        const index = clients.findIndex(client => client.res === res);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });

    // Register client
    clients.push({ req, res });
    console.log('added client, current client count', clients.length)
}

