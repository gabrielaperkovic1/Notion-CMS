async function loadRecipeDetails() {
    const parametri = new URLSearchParams(window.location.search);
    const id = parametri.get("id");

    let response = await fetch('/data');

    let data = await response.json();

    let recipeInfo = document.getElementById('recipeDetails');
        
    for (let i = 0; i < data.length; i++) {
        let recipe = data[i].properties;
        let recipeID = recipe['ID'].unique_id.number;

        if (recipeID == id){
            let name = recipe['Name of dish'].title[0].plain_text;
            let photo = recipe['Photo'].files[0].external.url;
            let ingredients = recipe['Ingredients'].rich_text[0].plain_text;
            let instructions = recipe['Instructions'].rich_text[0].plain_text;
            let author = recipe['Author'].rich_text[0].plain_text;
            let prepTime =  recipe['Prep time'].rich_text[0].plain_text;
            let category = recipe['Category'].rich_text[0].plain_text;
            let difficulty = recipe['Difficulty'].number;  


            recipeInfo.innerHTML += `<li>
                <h2>${name}</h2>
                <img src="${photo}" alt="${name}">
                <div id=infoText>
                <div class="leftSmallText">
                    <h4>Category:</h4> ${category}
                    <br>
                    <h4>Author:</h4> ${author}
                </div>
                <div class="rightSmallText">
                    <h4>Prep time:</h4> ${prepTime}
                    <br>
                    <h4>Difficulty:</h4> ${difficulty}/5
                </div>
                </div>
                <h4>Ingredients:</h4> <pre>${ingredients}</pre>
                <h4>Instructions:</h4> <p>${instructions}</p>
                `;

            return;
        }
        

    }
}

loadRecipeDetails();