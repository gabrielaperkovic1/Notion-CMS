import 'dotenv/config';
import { Client } from '@notionhq/client';
import express from 'express';

const server = express();
const port = 6400;
const hostname = 'localhost';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

server.use(express.static('html'));

server.get('/data', async (request, response) => {
    try {
        const response = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID,
            filter: {
                property: "Published",
                checkbox: { equals: true }
            }
        });
        response.json(response.results);
    } catch (e) {
        console.log("Error: " + e.name + "\n" + e.message);
        response.status(500).send("Server error: " + e.name + "\n" + e.message);
    }
});

server.listen(port, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
});