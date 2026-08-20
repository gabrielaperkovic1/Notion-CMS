import './firebase_settings.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';

let auth = getAuth();

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        console.log('No user is logged in.');
        return;
    }

    console.log('User is logged in:', user.email);
    let idToken = await user.getIdToken();

    let myRecipes = document.getElementById('myRecipes');

    if (myRecipes) {
        myRecipes.innerHTML = '';

        let response = await fetch('/myRecipes', {
            headers: {
                'Authorization': idToken
            }
        });

        let data = await response.json();

        for (let i = 0; i < data.length; i++) {
            let recipe = data[i].properties;
            let name = recipe['Name of dish'].title[0].plain_text;
            let pageId = data[i].id;

            myRecipes.innerHTML += `
                <div>
                    <a href="/recipe_settings.html?id=${pageId}">
                        <h3>${name}</h3>
                    </a>
                </div>
            `;
        }
    }

    if (document.getElementById('recipe')) {
        recipeSettings();
    }
});


async function recipeSettings() {
    let params = new URLSearchParams(window.location.search);
    let pageId = params.get('id');
    let recipeElement = document.getElementById('recipe');

    if (!pageId) {
        recipeElement.innerHTML = '<p>No recipe selected.</p>';
        return;
    }

    console.log('Recipe page ID:', pageId);
    let idToken = await auth.currentUser.getIdToken();

    let response = await fetch('/myRecipes', {
        headers: {
            'Authorization': idToken
        }
    });

    let data = await response.json();
    for (let i = 0; i < data.length; i++) {
        if (data[i].id === pageId) {
            let recipe = data[i].properties;
            let name = recipe['Name of dish'].title[0].plain_text;
            let photo = recipe['Photo'].files[0].external.url;
            let ingredients = recipe['Ingredients'].rich_text[0].plain_text;
            let instructions = recipe['Instructions'].rich_text[0].plain_text;
            let author = recipe['Author'].rich_text[0].plain_text;
            let prepTime = recipe['Prep time'].rich_text[0].plain_text;
            let category = recipe['Category'].rich_text[0].plain_text;
            let difficulty = recipe['Difficulty'].number;

            recipeElement.innerHTML = `<li>
                <h2>${name}</h2>
                <img src="${photo}" alt="${name}">
                <h4>Category:</h4> ${category}
                <h4>Author:</h4> ${author}
                <h4>Prep time:</h4>${prepTime}
                <h4>Difficulty:</h4> ${difficulty}/5
                <h4>Ingredients:</h4> <pre>${ingredients}</pre>
                <h4>Instructions:</h4> <p>${instructions}</p>
                <button>Edit Recipe</button>
                `;

            return;
        }
    }

    recipeElement.innerHTML = '<p>Recipe not found.</p>';
}

async function createRecipe() {

    let idToken = await auth.currentUser.getIdToken();

    let body = {
        name: document.getElementById('newRecipeName').value,
        photo: document.getElementById('newRecipePhoto').value,
        ingredients: document.getElementById('newRecipeIngredients').value,
        instructions: document.getElementById('newRecipeInstructions').value,
        prepHours: Number(document.getElementById('newRecipePrepH').value),
        prepMinutes: Number(document.getElementById('newRecipePrepMin').value),
        category: document.getElementById('newRecipeCategory').value,
        difficulty: Number(document.getElementById('newRecipeDifficulty').value)
    };

    let response = await fetch('/addRecipe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': idToken
        },
        body: JSON.stringify(body)
    });

 if (response.ok) {
       location.reload();
    } else {
        document.getElementById('createStatus').innerHTML = 'Something went wrong.';
    }
}


window.createRecipe = createRecipe;