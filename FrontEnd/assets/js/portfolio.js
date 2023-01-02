// execution
events();

// faites l’appel à l’API avec fetch afin de récupérer dynamiquement les projets. 
async function fetchProjets() {
    try {
        const response = await fetch("http://localhost:5678/api/works");

        // si code = 200
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }

    catch (error) {
        console.error(`Impossible d'obtenir les projets: ${error}`);
    }
}

// créer la galerie du portfolio
async function createGallery() {
    const projets = await fetchProjets();

    // composer les noeuds DOM
    let container = document.createElement("div");
    container.setAttribute("class", "gallery");

    let fragment = document.createDocumentFragment();
    fragment.appendChild(container)

    for (let element of projets) {
        let figure = document.createElement("figure");
        figure.setAttribute("class", "gallery-item");
        figure.setAttribute("data-category", element.category.name);

        let img = document.createElement("img")
        img.setAttribute("crossorigin", "anonymous"); // permet de passer outre l'erreur 'cross-origin-resource-policy: same-origin'
        img.setAttribute("src", element.imageUrl);
        img.getAttribute("alt", element.title);

        let figcaption = document.createElement("figcaption");
        figcaption.textContent = element.title;

        // ajout au container
        figure.appendChild(img)
        figure.appendChild(figcaption)
        container.appendChild(figure)
    }
    return fragment
}

// créer les boutons/filtres du portfolio
async function createFilters() {
    const projets = await fetchProjets();

    // récupere les catégories dans un Set
    const categories = new Set();
    categories.add("Tous");

    for (let element of projets) {
        categories.add(element.category.name);
    }

    // composer les noeuds DOM
    let container = document.createElement("div");
    container.setAttribute("class", "filters");

    let fragment = document.createDocumentFragment();
    fragment.appendChild(container)

    for (let element of categories) {
        let button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("class", "filters-item");
        button.setAttribute("data-category", element);

        button.textContent = element;

        // ajout au container
        container.appendChild(button)
    }
    return fragment
}

// Ajouts des fragments au DOM
async function composeDom() {
    const containerPortfolio = document.getElementById("portfolio");

    let fragment = document.createDocumentFragment();
    fragment.appendChild(await createFilters())
    fragment.appendChild(await createGallery())

    // ajout du fragment au DOM
    containerPortfolio.appendChild(fragment);
}

// Ajout des event listeners sur les filtres
async function events() {
    await composeDom();

    const galleryFilters = document.querySelector(".filters");
    const galleryItems = document.getElementsByClassName("gallery-item");

    // ajoute la classe active au premier filtre 'Tous'
    galleryFilters.querySelector(".filters-item").classList.add("active");

    galleryFilters.addEventListener("click", function (selectedItem) {
        // vérifie qu'un bouton valide a été clické
        if (!selectedItem.target.classList.contains("filters-item")) {
            return
        }

        // déplace la classe .active sur l'élémént clické
        galleryFilters.querySelector(".active").classList.remove("active");
        selectedItem.target.classList.add("active");

        // filtre l'affichage en fonction des catégories assignées
        let category = selectedItem.target.getAttribute("data-category");
        for (let figure of galleryItems) {
            let filter = figure.getAttribute("data-category");
            switch (true) {
                case category == "Tous":
                    figure.style.display = "block";
                    break;
                case filter == category:
                    figure.style.display = "block";
                    break;
                default:
                    figure.style.display = "none";
            }
        }
    });
}