const axios = require('axios');

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { hex } = req.query;
        const ajaxUrl = `https://artsexperiments.withgoogle.com/artpalette/search/${hex}`;

        try {
            const response = await axios.get(ajaxUrl, { responseType: 'text' });
            let dataString = response.data;

            // Clean up the data if it starts with unexpected characters
            dataString = dataString.trim(); // Remove whitespace
            if (dataString.startsWith(')]}\',\n')) {
                dataString = dataString.substring(5); // Adjust index based on actual characters to remove
            }

            const imagesData = JSON.parse(dataString); // Now parse the cleaned string into JSON            

            // Parse the data to exclude RGB palette information and keep other details
            const images = imagesData.map(image => ({
                id: image.id,
                imageUrl: image.imageUrl,
                title: image.title,
                creator: image.creator,
                date: image.date,
                imageWidthPx: image.imageWidthPx,
                imageHeightPx: image.imageHeightPx,
                // partner: image.partner,
                // distance: image.distance
            }));

            // console.log('Simplified Images fetched:', images);
            res.status(200).json(images);
        } catch (error) {
            console.error('Error fetching images:', error);
            res.status(500).json({ message: 'Failed to fetch images' });
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
}