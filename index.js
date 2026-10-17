const http = require('http');
const url = require('url');

// Yeh aapke paid buyers ka database hai
const activeBuyers = {
    "PAID_KEY_XYZ999": { name: "Customer 1", requestsLeft: 100, active: true },
    "PAID_KEY_ABC888": { name: "Customer 2", requestsLeft: 50, active: true }
};

const server = http.createServer((req, res) => {
    // URL ko parse karein
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Check karein ki route /api/get-data hai ya nahi
    if (pathname === '/api/get-data') {
        const apiKey = query.key;

        // 1. API Key check karein
        if (!apiKey) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: "error", message: "Access Denied: API Key is missing!" }));
        }

        // 2. Database me key check karein
        const buyer = activeBuyers[apiKey];
        if (!buyer || !buyer.active) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: "error", message: "Access Denied: Invalid or Expired API Key!" }));
        }

        // 3. Quota check karein
        if (buyer.requestsLeft <= 0) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: "error", message: "Quota Finished: Please renew your plan!" }));
        }

        // 4. Request count minus karein
        buyer.requestsLeft -= 1;

        // 5. Success Response Bhejein
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            status: "success",
            message: "Yeh raha aapka paid data!",
            data: {
                info: "Aapka confidential output yahan aayega",
                timestamp: new Date()
            },
            requests_remaining: buyer.requestsLeft
        }));
    } else {
        // Agar galat URL ho
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "error", message: "Endpoint not found!" }));
    }
});

// Port set karein
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
