const clients = [];

export default function handler(req, res) {
    if (req.method === 'POST') {
      // Handle the POST request to change direction
      const { action } = req.body;
      sendSSENavigationUpdate(action);
      res.status(200).json({ message: 'Action updated' });
      return;
    }
    else if (req.method === 'GET' && req.headers.accept === 'text/event-stream') {
        // SSE request, register client
        registerClient(req, res);
    } else {
        res.status(405).send('Method Not Allowed');
    }
}

// Function to send SSE updates
function sendSSENavigationUpdate(action) {
    // console.log('SSE update sent');
    const data = JSON.stringify({ action });
    clients.forEach(client => client.res.write(`data: ${data}\n\n`));
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