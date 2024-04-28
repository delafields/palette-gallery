import supabase from '../../database';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { creator, title, imageUrl } = req.body;
    console.log('favorite request', creator, title, imageUrl);

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert([
          { creator: creator, title: title, image_url: imageUrl }
        ]);

      if (error) throw error;

      console.log('favorite saved', data);
      res.status(200).json({ message: 'Image favorited successfully' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ message: 'Failed to favorite image' });
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}