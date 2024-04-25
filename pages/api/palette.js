const axios = require('axios');

function processImageData(dataString) {
    dataString = dataString.trim(); // Remove whitespace
    if (dataString.startsWith(')]}\',\n')) {
        dataString = dataString.substring(5); // Adjust index based on actual characters to remove
    }

    const imagesData = JSON.parse(dataString); // Now parse the cleaned string into JSON            

    // Parse the data to exclude RGB palette information and keep other details
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
    if (req.method === 'GET') {
        const { hex } = req.query;

        const db = require('../../database');

        // sort the hex to check if we've already retrieved it
        const sortedHex = hex.split('-').sort().join('-');
        const stmt = db.prepare('SELECT data FROM palette_data WHERE hex_codes = ?');
        const dbResult = stmt.get(sortedHex);

        // If data exists in the database, send it directly
        if (dbResult) {
            console.log('data found in db')
            let images = JSON.parse(dbResult.data);
            res.status(200).json(images);
            return;
        }
        // If not, fetch the data 
        else {
            console.log('data not found in db, fetching')
            const ajaxUrl = `https://artsexperiments.withgoogle.com/artpalette/search/${hex}`;

            try {
                const response = await axios.get(ajaxUrl, { responseType: 'text' });

                let images = processImageData(response.data);

                // Write this data to the database
                const stmt = db.prepare('INSERT INTO palette_data (hex_codes, data) VALUES (?, ?)');
                stmt.run(sortedHex, JSON.stringify(images));

                res.status(200).json(images);
    
            } catch (error) {
                console.error('Error fetching images:', error);
                res.status(500).json({ message: 'Failed to fetch images' });
            }
        }

    } else {
        res.status(405).send('Method Not Allowed');
    }
}