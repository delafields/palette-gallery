const pusher = require('../../utils/pusher');

export default function handler(req, res) {
    if (req.method === 'POST') {
      const { action } = req.body;

      pusher.trigger('carousel', 'carousel-update', {
        action: action
      });
      
      res.status(200).json({ message: 'Action updated' });
      return;
    }
    else {
        res.status(405).send('Method Not Allowed');
    }
}