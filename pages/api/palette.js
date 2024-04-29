const axios = require('axios');
import supabase from '../../database';
const pusher = require('../../utils/pusher');
import { processImageData } from '../../utils/processImageData';

export default async function handler(req, res) {
    const { hex } = req.query;

    if (req.method === 'GET' && hex) {
        const sortedHex = hex.split('-').sort().join('-');
        try {
            let { data: dbResult, error } = await supabase
                .from('palette_data')
                .select('id')
                .eq('hex_codes', sortedHex)
                .single();

            if (dbResult) {
                let id = JSON.parse(dbResult.id);

                pusher.trigger('palette-channel', 'palette-update', {
                    id: id
                });
                res.status(200).json({ id: id });
            } else {
                const ajaxUrl = `https://artsexperiments.withgoogle.com/artpalette/search/${hex}`;
                const response = await axios.get(ajaxUrl, { responseType: 'text' });
                let images = await processImageData(response.data);
                const { data: insertResult, error: insertError } = await supabase
                    .from('palette_data')
                    .insert([
                        { hex_codes: sortedHex, data: JSON.stringify(images) }
                    ])
                    .select('id');

                if (insertError) throw insertError;

                pusher.trigger('palette-channel', 'palette-update', {
                    id: insertResult[0].id
                });
                res.status(200).json({ id: insertResult.id });
            }
        } catch (error) {
            console.error('Error:', error.message);
            res.status(500).json({ message: 'Failed to fetch images' });
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
}