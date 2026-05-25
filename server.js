const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const root = __dirname;
const publicDir = path.join(root, "public");
const leadsFile = path.join(root, "data", "leads.json");

const settings = {
  brand: "Upscale",
  whatsappNumber: "919999999999",
  displayPhone: "+91 99999 99999",
  email: "hello@upscale.in",
  location: "Surat, Gujarat, India",
  offer: "Open your Amazon seller account free + 3 months free management"
};

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function getLeads() {
  try {
    return JSON.parse(fs.readFileSync(leadsFile, "utf8"));
  } catch {
    return [];
  }
}

function saveLeads(leads) {
  fs.mkdirSync(path.dirname(leadsFile), { recursive: true });
  fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
}

function cleanText(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function createLead(input) {
  const name = cleanText(input.name, 120);
  const phone = cleanText(input.phone, 40);
  const email = cleanText(input.email, 160);
  const product = cleanText(input.product, 180);
  const message = cleanText(input.message, 800);

  if (!name || !phone) {
    return { error: "Name and phone number are required." };
  }

  const lead = {
    id: crypto.randomUUID(),
    name,
    phone,
    email,
    product,
    message,
    source: "website",
    createdAt: new Date().toISOString()
  };

  const leads = getLeads();
  leads.unshift(lead);
  saveLeads(leads);
  return { lead };
}

function csvEscape(value) {
  return `"${String(value || "").replaceAll('"', '""')}"`;
}

function leadsCsv() {
  const rows = getLeads();
  const header = ["Created At", "Name", "Phone", "Email", "Product", "Message"];
  const lines = rows.map(lead => [
    lead.createdAt,
    lead.name,
    lead.phone,
    lead.email,
    lead.product,
    lead.message
  ].map(csvEscape).join(","));
  return [header.map(csvEscape).join(","), ...lines].join("\n");
}

function serveFile(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  if (pathname === "/admin") pathname = "/admin.html";

  const requestedPath = path.normalize(path.join(publicDir, pathname));
  if (!requestedPath.startsWith(publicDir)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.readFile(requestedPath, (err, data) => {
    if (err) {
      send(res, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }
    const type = mime[path.extname(requestedPath)] || "application/octet-stream";
    send(res, 200, data, type);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && url.pathname === "/api/settings") {
      send(res, 200, JSON.stringify(settings));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/leads") {
      send(res, 200, JSON.stringify(getLeads()));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/leads.csv") {
      res.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=upscale-leads.csv"
      });
      res.end(leadsCsv());
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/leads") {
      const input = await readJsonBody(req);
      const result = createLead(input);
      if (result.error) {
        send(res, 400, JSON.stringify({ ok: false, error: result.error }));
        return;
      }
      send(res, 201, JSON.stringify({ ok: true, lead: result.lead, settings }));
      return;
    }

    if (req.method !== "GET") {
      send(res, 405, "Method not allowed", "text/plain; charset=utf-8");
      return;
    }

    serveFile(req, res);
  } catch (error) {
    send(res, 500, JSON.stringify({ ok: false, error: error.message }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Upscale website running at http://${HOST}:${PORT}`);
  console.log(`Admin dashboard running at http://${HOST}:${PORT}/admin`);
});
