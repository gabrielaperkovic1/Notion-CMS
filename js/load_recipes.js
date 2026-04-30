async function loadRecipes() {
    let response = await fetch('/data');

    let data = await response.json();

    let recipesList = document.getElementById('recipes');

    for (let i = 0; i < data.length; i++) {
        let recipe = data[i].properties;

        let name = recipe['Name of dish'].title[0].plain_text;
        let ingredients = recipe['Ingredients'].rich_text[0].plain_text;
        let instructions = recipe['Instructions'].rich_text[0].plain_text;
        let author = recipe['Author'].rich_text[0].plain_text;
        let prepTime =  recipe['Prep time'].rich_text[0].plain_text;
        let category = recipe['Category'].rich_text[0].plain_text;
        let difficulty = recipe['Difficulty'].number;  

        recipesList.innerHTML += `<li>
                <h2>${name}</h2>
                <h4>Category:</h4> ${category}
                <h4>Author:</h4> ${author}
                <h4>Prep time:</h4>${prepTime}
                <h4>Difficulty:</h4> ${difficulty}/5
                <h4>Ingredients:</h4> <pre>${ingredients}</pre>
                <h4>Instructions:</h4> <p>${instructions}</p>
                </li>____________________________________<br>`;
        
    }
}

loadRecipes();