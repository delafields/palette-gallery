const axios = require('axios');
import supabase from '../../database';
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
        try {
            let { data: dbResult, error } = await supabase
                .from('palette_data')
                .select('data')
                .eq('hex_codes', sortedHex)
                .single();

            // this will throw if there's no match in the db
            // if (error) throw error;

            if (dbResult) {
                let images = JSON.parse(dbResult.data);
                sendSSEImagesUpdate({ images, palette: sortedHex });
                res.status(200).json({ images, palette: sortedHex });
            } else {
                const ajaxUrl = `https://artsexperiments.withgoogle.com/artpalette/search/${hex}`;
                const response = await axios.get(ajaxUrl, { responseType: 'text' });
                let images = await processImageData(response.data);
                const { error: insertError } = await supabase
                    .from('palette_data')
                    .insert([
                        { hex_codes: sortedHex, data: JSON.stringify(images) }
                    ]);

                if (insertError) throw insertError;

                sendSSEImagesUpdate({ images, palette: sortedHex });
                res.status(200).json({ images, palette: sortedHex });
            }
        } catch (error) {
            console.error('Error:', error.message);
            res.status(500).json({ message: 'Failed to fetch images' });
        }
    }  else if (req.method === 'GET' && req.headers.accept === 'text/event-stream') {
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

