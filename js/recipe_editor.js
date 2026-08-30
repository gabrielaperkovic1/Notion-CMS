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
    document.getElementById('publishedRecipes').innerHTML = '';
    document.getElementById('draftRecipes').innerHTML = '';

        let response = await fetch('/myRecipes', {
            headers: {
                'Authorization': idToken
            }
        });

        let data = await response.json();

        let myRecipesList = [];
        myRecipesList = data;

        let myPublishedRecipes = [];
        let myDraftRecipes = [];

for (let i = 0; i < myRecipesList.length; i++) {
        let recipe = myRecipesList[i];
        let published = recipe.properties['Published'].checkbox;

        if (published) {
            myPublishedRecipes.push(recipe);
        } else {
            myDraftRecipes.push(recipe);
        }
    }

    for (let i = 0; i < myPublishedRecipes.length; i++) {
        let recipe = myPublishedRecipes[i].properties;
        let name = recipe['Name of dish'].title[0].plain_text;
        let pageId = myPublishedRecipes[i].id;

        document.getElementById('publishedRecipes').innerHTML += `
            <div>
                <a href="/recipe_settings.html?id=${pageId}">
                    <h3>${name}</h3>
                </a>
            </div>
        `;
    }

    for (let i = 0; i < myDraftRecipes.length; i++) {
        let recipe = myDraftRecipes[i].properties;
        let name = recipe['Name of dish'].title[0].plain_text;
        let pageId = myDraftRecipes[i].id;

        document.getElementById('draftRecipes').innerHTML += `
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
            let published = recipe['Published'].checkbox;

            recipeElement.innerHTML = `<li>
                <h2>${name}</h2>
                <div class="editbuttons">
                <button id="editRecipe">Edit Recipe</button>
                <button id="deleteRecipe">Delete Recipe</button>
                </div>
                <img src="${photo}" alt="${name}">
                <h4 contenteditable="true">Category:</h4> ${category}
                <h4>Author:</h4> ${author}
                <h4>Prep time:</h4>${prepTime}
                <h4>Difficulty:</h4> ${difficulty}/5
                <h4>Ingredients:</h4> <pre>${ingredients}</pre>
                <h4>Instructions:</h4> <p>${instructions}</p>
                `;

            document.getElementById('deleteRecipe').addEventListener('click', function() {
            deleteRecipe();
            });

            document.getElementById('editRecipe').addEventListener('click', function() {
                document.getElementById('editRecipeForm').hidden = false;

                document.getElementById('editRecipeName').value = name;
                document.getElementById('editRecipePhoto').value = photo;
                document.getElementById('editRecipeIngredients').value = ingredients;
                document.getElementById('editRecipeInstructions').value = instructions;
                document.getElementById('editRecipeCategory').value = category;
                document.getElementById('editRecipeDifficulty').value = difficulty;
                document.getElementById('editRecipeStatus').checked = published;

                let prepTimeParts = prepTime.split(' ');
                let prepHours = prepTimeParts[0];
                let prepMinutes = prepTimeParts[2];
                document.getElementById('editRecipePrepH').value = prepHours;
                document.getElementById('editRecipePrepMin').value = prepMinutes;
});

            
            return;
        }
    }
    
    recipeElement.innerHTML = '<p>Recipe not found.</p>';
}

async function createRecipe() {

    let idToken = await auth.currentUser.getIdToken();

    let published = document.getElementById('newRecipeStatus').checked;

    let body = {
        name: document.getElementById('newRecipeName').value,
        photo: document.getElementById('newRecipePhoto').value,
        ingredients: document.getElementById('newRecipeIngredients').value,
        instructions: document.getElementById('newRecipeInstructions').value,
        prepHours: Number(document.getElementById('newRecipePrepH').value),
        prepMinutes: Number(document.getElementById('newRecipePrepMin').value),
        category: document.getElementById('newRecipeCategory').value,
        difficulty: Number(document.getElementById('newRecipeDifficulty').value),
        published: published
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
        if (published) {
            alert('Your recipe has been published.');
        } else {
            alert('Your recipe has been saved as draft.');
        }
        location.reload();
    } else {
        document.getElementById('createStatus').innerHTML = 'Something went wrong.';
    }
}


const newRecipeForm = document.getElementById('newRecipeForm');

if (newRecipeForm) {
    newRecipeForm.addEventListener('submit', function(event) {
        event.preventDefault();
        createRecipe();
    });
}

async function deleteRecipe() {
    let idToken = await auth.currentUser.getIdToken();

    let params = new URLSearchParams(window.location.search);
    let pageId = params.get('id');

    let response = await fetch('/deleteRecipe', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': idToken
        },
        body: JSON.stringify({
            pageId: pageId
        })
    });

    if (response.ok) {
        location.href = '/admin';
    } else {
        alert('Something went wrong.');
    }
}

async function updateRecipe() {
    let idToken = await auth.currentUser.getIdToken();

    let params = new URLSearchParams(window.location.search);
    let pageId = params.get('id');

    let body = {
        pageId: pageId,
        name: document.getElementById('editRecipeName').value,
        photo: document.getElementById('editRecipePhoto').value,
        ingredients: document.getElementById('editRecipeIngredients').value,
        instructions: document.getElementById('editRecipeInstructions').value,
        prepHours: Number(document.getElementById('editRecipePrepH').value),
        prepMinutes: Number(document.getElementById('editRecipePrepMin').value),
        category: document.getElementById('editRecipeCategory').value,
        difficulty: Number(document.getElementById('editRecipeDifficulty').value),
        published: document.getElementById('editRecipeStatus').checked
    };

    let response = await fetch('/updateRecipe', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': idToken
        },
        body: JSON.stringify(body)
    });

    if (response.ok) {
        alert('Your recipe has been updated.');
        location.reload();
    } else {
        alert('Something went wrong while updating recipe.');
    }
}

const saveRecipeEdit = document.getElementById('saveRecipeEdit');

if (saveRecipeEdit) {
    saveRecipeEdit.addEventListener('click', function () {
        updateRecipe();
    });
}