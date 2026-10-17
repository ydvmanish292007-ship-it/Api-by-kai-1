const http = require('http');
const url = require('url');

// Aapke paid buyers aur unki keys ka database
const activeBuyers = {
    "PAID_KEY_XYZ999": { name: "Customer 1", requestsLeft: 100, active: true },
    "PAID_KEY_ABC888": { name: "Customer 2", requestsLeft: 50, active: true },
    "manish_vip_key": { name: "Manish", requestsLeft: 500, active: true }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // 1. Purana Data Route
    if (pathname === '/api/get-data') {
        const apiKey = query.key;

        if (!apiKey || !activeBuyers[apiKey] || !activeBuyers[apiKey].active) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: "error", message: "Access Denied: Invalid or Missing API Key!" }));
        }

        if (activeBuyers[apiKey].requestsLeft <= 0) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: "error", message: "Quota Finished: Please renew your plan!" }));
        }

        activeBuyers[apiKey].requestsLeft -= 1;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            status: "success",
            message: "Yeh raha aapka paid data!",
            requests_remaining: activeBuyers[apiKey].requestsLeft
        }));
    }

    // 2. Naya OSINT Bot Route
    else if (pathname === '/api/osint') {
        const apiKey = query.key;
        const target = query.target; // Jiska data search karna hai (jaise username ya number)

        // API Key Check
        if (!apiKey || !activeBuyers[apiKey] || !activeBuyers[apiKey].active) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: "error", message: "Invalid or Missing API Key!" }));
        }

        // Quota Check
        if (activeBuyers[apiKey].requestsLeft <= 0) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: "error", message: "Quota Finished!" }));
        }

        // Target check
        if (!target) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: "error", message: "Target is missing! Use ?target=value" }));
        }

        // Request minus karein
        activeBuyers[apiKey].requestsLeft -= 1;

        // Mock OSINT Result (Yahan aap apna real OSINT logic ya API jodh sakte hain)
        const mockOsintData = {
            target: target,
            platform_check: {
                instagram: "Found (Public Account)",
                telegram: "Not Found",
                twitter: "Found"
            },
            risk_score: "Low",
            scanned_at: new Date()
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            status: "success",
            osint_result: mockOsintData,
            requests_remaining: activeBuyers[apiKey].requestsLeft
        }));
    } 
    
    // Agar galat URL ho
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "error", message: "Endpoint not found!" }));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`OSINT Server is running on port ${PORT}`);
});
