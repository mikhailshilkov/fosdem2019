import * as cloud from "@pulumi/cloud";

// Create a web server.
let endpoint = new cloud.API("urlshortener");

// Create a table `urls`, with `name` as primary key.
let urlTable = new cloud.Table("urls", "name");

// Serve all files in the www directory to the root.
endpoint.static("/", "www");

// GET /url lists all URLs currently registered.
endpoint.get("/url", async (_, res) => {
    let items = await urlTable.scan();
    res.status(200).json(items);        
});

// GET /url/{name} redirects to the target URL based on a short-name.
endpoint.get("/url/{name}", async (req, res) => {
    let name = req.params["name"];
    
    let value = await urlTable.get({name});
    let url = value && value.url;

    // If we found an entry, 301 redirect to it; else, 404.
    if (url) {
        res.setHeader("Location", url);
        res.status(301);
        res.end("");
    }
    else {
        res.status(404);
        res.end("");
    }
});

// POST /url registers a new URL with a given short-name.
endpoint.post("/url", async (req, res) => {
    let url = req.query["url"];
    let name = req.query["name"];
    await urlTable.insert({ name, url });
    res.json({ shortenedURLName: name });        
});

export let endpointUrl = endpoint.publish().url;
