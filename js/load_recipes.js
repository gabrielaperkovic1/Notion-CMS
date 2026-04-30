async function loadRecipes() {
    let response = await fetch('/data');
    let data = await response.json();

    let list = document.getElementById('recipes');

    for (let i = 0; i < data.length; i++) {
        let name = data[i].properties['Name of dish'].title[0].plain_text;
        list.innerHTML += '<li>' + name + '</li>';
    }
}

loadRecipes();