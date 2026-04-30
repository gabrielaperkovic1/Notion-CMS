import 'dotenv/config';
import { Client } from '@notionhq/client';
import express from 'express';

const server = express();
const port = 6400;
const hostname = 'localhost';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

server.use(express.static('html'));
server.use('/js', express.static('js'));

server.get('/data', async (req, res) => {
    try {
        const notionResponse = await notion.dataSources.query({
            data_source_id: process.env.NOTION_DATABASE_ID,
            filter: {
                property: "Published",
                checkbox: { equals: true }
            }
        });
        res.json(notionResponse.results);
    } catch (e) {
        console.log("Error: " + e.name + "\n" + e.message);
        res.status(500).send("Server error: " + e.name + "\n" + e.message);
    }
});

server.listen(port, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
});