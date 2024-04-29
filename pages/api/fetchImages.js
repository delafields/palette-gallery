import supabase from '../../database';


export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const { id } = req.query;

    if (!id) {
        res.status(400).json({ error: 'Missing id parameter' });
        return;
    }

    try {
        const { data, error } = await supabase
            .from('palette_data')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            res.status(404).json({ error: 'No data found for this ID' });
            return;
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}