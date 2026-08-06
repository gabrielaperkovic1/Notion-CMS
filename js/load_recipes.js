let recipesList = []

async function loadRecipes() {
    let response = await fetch('/data');

    let data = await response.json();
    recipesList = data;

    for (let i = 0; i < data.length; i++) {
        let recipe = data[i].properties;

        let recipeID = recipe['ID'].number;
        let name = recipe['Name of dish'].title[0].plain_text;
        let photo = recipe['Photo'].files[0].external.url;
        let ingredients = recipe['Ingredients'].rich_text[0].plain_text;
        let instructions = recipe['Instructions'].rich_text[0].plain_text;
        let author = recipe['Author'].rich_text[0].plain_text;
        let prepTime =  recipe['Prep time'].rich_text[0].plain_text;
        let category = recipe['Category'].rich_text[0].plain_text;
        let difficulty = recipe['Difficulty'].number;  

        document.getElementById('recipes').innerHTML += `<li>
                <a href="./recipe.html?id=${recipeID}"><h2>${name}</h2></a>
                <div class="recipeInfo">
                    <h4>Category:</h4> ${category}  |
                    <h4>Author:</h4> ${author}  |
                    <h4>Prep time:</h4>${prepTime}  |
                    <h4>Difficulty:</h4> ${difficulty}/5 
                </div>
                <img src="${photo}" alt="${name}">
                </li><br>`;
        
    }
}


function filterRecipes(category) {
    document.getElementById('recipes').innerHTML = ''

    for (let i = 0; i < recipesList.length; i++) {
        let recipe = recipesList[i].properties;

        let recipeCategory = recipe['Category'].rich_text[0].plain_text;
   
        if (category === 'All' || recipeCategory === category) {
            let recipeID = recipe['ID'].number;
            let name = recipe['Name of dish'].title[0].plain_text;
            let photo = recipe['Photo'].files[0].external.url;
            let ingredients = recipe['Ingredients'].rich_text[0].plain_text;
            let instructions = recipe['Instructions'].rich_text[0].plain_text;
            let author = recipe['Author'].rich_text[0].plain_text;
            let prepTime =  recipe['Prep time'].rich_text[0].plain_text;
            let category = recipe['Category'].rich_text[0].plain_text;
            let difficulty = recipe['Difficulty'].number;  

        document.getElementById('recipes').innerHTML += `<li>
                <a href="./recipe.html?id=${recipeID}"><h2>${name}</h2></a>
                <div class="recipeInfo">
                    <h4>Category:</h4> ${category} |
                    <h4>Author:</h4> ${author}  |
                    <h4>Prep time:</h4>${prepTime}  |
                    <h4>Difficulty:</h4> ${difficulty}/5 
                </div>
                <img src="${photo}" alt="${name}">
                </li><br>`;
        }
    }

}


function searchRecipes(search) {
    search = search.toLowerCase();
    document.getElementById('recipes').innerHTML = '';

    for (let i = 0; i < recipesList.length; i++) {
        let recipe = recipesList[i].properties;
        let name = recipe['Name of dish'].title[0].plain_text;
        let nameLower = name.toLowerCase();

        if (nameLower.includes(search)) {
            let recipeID = recipe['ID'].number;
            let photo = recipe['Photo'].files[0].external.url;
            let author = recipe['Author'].rich_text[0].plain_text;
            let prepTime = recipe['Prep time'].rich_text[0].plain_text;
            let category = recipe['Category'].rich_text[0].plain_text;
            let difficulty = recipe['Difficulty'].number;

            document.getElementById('recipes').innerHTML += `<li>
                <a href="./recipe.html?id=${recipeID}"><h2>${name}</h2></a>
                <div class="recipeInfo">
                    <h4>Category:</h4> ${category} |
                    <h4>Author:</h4> ${author}  |
                    <h4>Prep time:</h4>${prepTime}  |
                    <h4>Difficulty:</h4> ${difficulty}/5 
                </div>
                <img src="${photo}" alt="${name}">
                </li><br>`;
        }
    }
}

loadRecipes();

