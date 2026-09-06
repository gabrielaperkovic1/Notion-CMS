import 'dotenv/config';
import { Client } from '@notionhq/client';
import express from 'express';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const server = express();
const port = 6400;
const hostname = 'localhost';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

initializeApp({
    credential: applicationDefault(),
});

const db = getFirestore();

function checkAuth(idToken) {
    return getAuth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            console.log('Token is valid.');
            return uid;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
            return null;
        });
}

server.use(express.static('html'));
server.use('/js', express.static('js'));
server.use('/css', express.static('css'));
server.use('/logo', express.static('logo'));

server.get('/author', (request, response) => {
    response.sendFile('author.html', { root: 'html' });
});

server.use(express.json());

server.get('/data', async (request, response) => {
    try {
        const notionResponse = await notion.dataSources.query({
            data_source_id: process.env.NOTION_DATABASE_ID,
            filter: {
                property: "Published",
                checkbox: { equals: true }
            }
        });
        response.json(notionResponse.results);
    } catch (e) {
        console.log("Error: " + e.name + "\n" + e.message);
        response.status(500).send("Server error: " + e.name + "\n" + e.message);
    }
});

server.get('/myRecipes', async (request, response) => {
    const idToken = request.headers.authorization;
    const uid = await checkAuth(idToken);

    if (!uid) {
        return response.status(401).send("Not logged in");
    }

    try {

        const userDoc = await db.collection('users').doc(uid).get();
        const firstName = userDoc.data().firstName;
        const lastName = userDoc.data().lastName;

        const notionResponse = await notion.dataSources.query({
            data_source_id: process.env.NOTION_DATABASE_ID,
            filter: {
                property: "Owner UID",
                rich_text: { equals: uid }
            }
        });

        response.json({
            firstName: firstName,
            lastName: lastName,
            recipes: notionResponse.results
        });

    } catch (e) {
        console.log("Error: " + e.name + "\n" + e.message);
        response.status(500).send("Server error: " + e.name + "\n" + e.message);
    }
});

server.post('/addRecipe', async (request, response) => {
    const idToken = request.headers.authorization;
    const uid = await checkAuth(idToken);

    if (!uid) {
        return response.status(401).send("Not logged in");
    }

    const name = request.body.name;
    const photo = request.body.photo;
    const ingredients = request.body.ingredients;
    const instructions = request.body.instructions;
    const prepHours = request.body.prepHours;
    const prepMinutes = request.body.prepMinutes;
    const category = request.body.category;
    const difficulty = request.body.difficulty;
    const prepTime = `${prepHours} h ${prepMinutes} min`;
    const published = request.body.published;

    try {
        const userDoc = await db.collection('users').doc(uid).get();
        const nickname = userDoc.data().nickname;

        const newPage = await notion.pages.create({
            parent: { data_source_id: process.env.NOTION_DATABASE_ID },
            properties: {
                "Name of dish": { title: [{ text: { content: name } }] },
                "Photo": { files: [{ name: 'photo', external: { url: photo } }] },
                "Ingredients": { rich_text: [{ text: { content: ingredients } }] },
                "Instructions": { rich_text: [{ text: { content: instructions } }] },
                "Author": { rich_text: [{ text: { content: nickname } }] },
                "Owner UID": { rich_text: [{ text: { content: uid } }] },
                "Prep time": { rich_text: [{ text: { content: prepTime } }] },
                "Category" : { rich_text: [{ text: { content: category } }] },
                "Difficulty": { number: difficulty },
                "Published": { checkbox: published }
            }
        });

        response.json(newPage);
    } catch (e) {
        console.log("Error: " + e.name + "\n" + e.message);
        response.status(500).send("Server error: " + e.name + "\n" + e.message);
    }
});

server.delete('/deleteRecipe', async (request, response) => {
    const idToken = request.headers.authorization;
    const uid = await checkAuth(idToken);

    if (!uid) {
        return response.status(401).send("Not logged in");
    }

    const pageId = request.body.pageId;

    try {
        const deletePage = await notion.pages.update({
            page_id: pageId,
            in_trash: true
        });

        response.json(deletePage);

    } catch (e) {
        console.log("Error: " + e.name + "\n" + e.message);
        response.status(500).send("Server error: " + e.name + "\n" + e.message);
    }
});

server.patch('/updateRecipe', async (request, response) => {
    const idToken = request.headers.authorization;
    const uid = await checkAuth(idToken);

    if (!uid) {
        return response.status(401).send("Not logged in");
    }

    const pageId = request.body.pageId;
    const name = request.body.name;
    const photo = request.body.photo;
    const ingredients = request.body.ingredients;
    const instructions = request.body.instructions;
    const prepHours = request.body.prepHours;
    const prepMinutes = request.body.prepMinutes;
    const category = request.body.category;
    const difficulty = request.body.difficulty;
    const prepTime = `${prepHours} h ${prepMinutes} min`;
    const published = request.body.published;

    try {
        const updatePage = await notion.pages.update({
            page_id: pageId,
            properties: {
                "Name of dish": { title: [{ text: { content: name } }] },
                "Photo": { files: [{ name: 'photo', external: { url: photo } }] },
                "Ingredients": { rich_text: [{ text: { content: ingredients } }] },
                "Instructions": { rich_text: [{ text: { content: instructions } }] },
                "Prep time": { rich_text: [{ text: { content: prepTime } }] },
                "Category": { rich_text: [{ text: { content: category } }] },
                "Difficulty": { number: difficulty },
                "Published": { checkbox: published }
            }
        });

        response.json(updatePage);

    } catch (e) {
        console.log("Error: " + e.name + "\n" + e.message);
        response.status(500).send("Server error: " + e.name + "\n" + e.message);
    }
});

server.listen(port, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
});

