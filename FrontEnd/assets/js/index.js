/**
 * 
 * Fonctions servant à communiquer avec l'API du backend.
 * Utilisation de la méthode 'fetch()', de 'async/await' (promises) et de 'try/catch' pour gérer les erreurs.
 * 
 */

apiUrl = "http://localhost:5678/api"

async function apiGetWorks() {
    try {
        const response = await fetch(`${apiUrl}/works`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error(`Impossible d'obtenir les projets: ${error}`);
    }
}

async function apiGetCategories() {
    try {
        const response = await fetch(`${apiUrl}/categories`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error(`Impossible d'obtenir les catégories: ${error}`);
    }
}

async function apiDeleteWorks(id) {
    try {
        const response = await fetch(`${apiUrl}/works/${id}`, {
            method: "DELETE",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`
            }
        })
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        console.log(`Le projet ${id} a été supprimé de la base de donnée avec succès`)
        document.querySelectorAll(`[data-id="${id}"]`).forEach(element => element.remove())
    }
    catch (error) {
        console.error(`Impossible de supprimer le projet /works/{id}=${id}: ${error}`);
    }
};

async function apiPostWorks(formData) {
    try {
        const response = await fetch(`${apiUrl}/works`, {
            method: "POST",
            headers: {
                "accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: formData
        })
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        console.log(`Le projet a été ajouté à la base de donnée avec succès`)
        return true
    }
    catch (error) {
        console.error(`Impossible d'ajouter le projet: ${error}`);
    }
};

/**
 * 
 * Code du Portfolio.
 * 1.1 Récupération des travaux depuis le back-end
 * 1.2 Réalisation du filtre des travaux
 *
 */

composeDom()

// créer la galerie du portfolio
async function createGallery(projets) {
    // composer les noeuds DOM
    let container = document.createElement("div");
    container.setAttribute("class", "gallery");

    let fragment = document.createDocumentFragment();
    fragment.appendChild(container)

    for (let element of projets) {
        let figure = document.createElement("figure");
        figure.setAttribute("class", "gallery-item");
        figure.setAttribute("data-category", element.category.name);
        figure.setAttribute("data-id", element.id);

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
async function createFilters(projets) {
    // récupere les catégories dans un Set, depuis GET/works pour éviter les catégories vides
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
    const projets = await apiGetWorks();

    let fragment = document.createDocumentFragment();
    fragment.appendChild(await createFilters(projets))
    fragment.appendChild(await createGallery(projets))

    // ajout du fragment au DOM
    containerPortfolio.appendChild(fragment);

    // EventListeners
    events()
}

// Ajout des event listeners sur les filtres
async function events() {
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

/**
 * 
 * Code de la fenêtre modale.
 * 3.1 Ajout de la fenêtre modale
 * 3.2 Suppression de travaux existants
 * 3.3 Envoi d’un nouveau projet au back-end via le formulaire de la modale
 * 3.4 Traitement de la réponse de l’API pour afficher dynamiquement la nouvelle image de la modale.
 * 
 */

let modal = null

// vérifie la présence d'un token
// (valider le token en envoyant un projet vide et en récupérant le code erreur? mauvaise pratique?)
const token = localStorage.getItem("token")
if (token != null) IsLoggedIn()

function IsLoggedIn() {
    adminInterface()

    // logout bouton dans le header / nav
    const navLogin = document.querySelector('.nav-login')
    navLogin.textContent = 'Logout'
    navLogin.addEventListener('click', (e) => {
        e.preventDefault()
        localStorage.removeItem("token")
        window.location.reload()
    })
};

function adminInterface() {
    const elements = Array.from(document.getElementsByClassName("admin-ui")); // array.from pour la boucle foreach
    elements.forEach(element => element.classList.remove("hidden"));
    listenModal()
};

function listenModal() {
    document.querySelectorAll(".js-modal").forEach(a => {
        a.addEventListener("click", (e) => {
            targetModal(e.target.closest("a").dataset.modal)
            openModal(e)
        })
    })
};

function openModal(e) {
    e.preventDefault()
    modal = document.querySelector(e.target.closest("a").getAttribute("href"))
    modal.style.display = null
    modal.removeAttribute("aria-hidden")
    modal.setAttribute("aria-modal", "true")
    modal.querySelector(".js-modal-btn--close").addEventListener("click", closeModal)
    window.addEventListener("click", (e) => {
        if (e.target == modal) closeModal(e)
    })
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.key === "esc") closeModal(e)
    })
};

function closeModal(e) {
    e.preventDefault()
    if (modal == null) return
    modal.style.display = "none"
    modal.setAttribute("aria-hidden", "true")
    modal.removeAttribute("aria-modal")
    modal.querySelector(".js-modal-btn--close").removeEventListener("click", closeModal)
    window.removeEventListener("click", (e) => {
        if (e.target == modal) closeModal(e)
    })
    window.removeEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.key === "esc") closeModal(e)
    })
    modal = null
};

function targetModal(target) {
    switch (target) {
        case "portfolio":
            createModal(contentPortfolioA())
            break;
        case "portfolio-add":
            createModal(contentPortfolioB())
            break;
    }
}

async function createModal(content) {
    const fragment = document.createDocumentFragment();
    const modalElement = document.getElementById("modal__form");

    // Construction
    const modalContent = document.createElement("form");
    modalContent.setAttribute("id", modalElement.getAttribute("id"));
    modalContent.onsubmit = () => { return false } // désactive le comportement 'submit' par défaut
    fragment.appendChild(modalContent)
    modalContent.appendChild(await content)

    // insert Node
    modalElement.replaceWith(fragment)
};

// différents contenus possibles de la fenetre modale
const contentPortfolioA = async () => {
    const fragment = document.createDocumentFragment();
    const projets = await apiGetWorks();

    const backBtn = document.querySelector('.js-modal-btn--back')
    backBtn.style.display = 'none'

    const h3 = document.createElement("h3");
    h3.textContent = "Galerie Photo";
    fragment.appendChild(h3)

    const gallery = document.createElement("div");
    gallery.setAttribute("class", "modal-content modal-gallery");
    fragment.appendChild(gallery)

    for (let element of projets) {
        const figure = document.createElement("figure");
        figure.setAttribute("data-id", element.id);
        gallery.appendChild(figure)

        const img = document.createElement("img")
        img.setAttribute("crossorigin", "anonymous"); // permet de passer outre l'erreur 'cross-origin-resource-policy: same-origin'
        img.setAttribute("src", element.imageUrl);
        img.setAttribute("alt", element.title);
        figure.appendChild(img)

        const buttonsContainer = document.createElement("div")
        buttonsContainer.setAttribute("class", "btn-container")
        figure.appendChild(buttonsContainer)

        const buttonMove = document.createElement("button")
        buttonMove.setAttribute("class", "btn-move")
        buttonMove.setAttribute("type", "submit");

        const iconMove = document.createElement("i")
        iconMove.setAttribute("class", "fa-solid fa-arrows-up-down-left-right")
        buttonsContainer.appendChild(buttonMove)
        buttonMove.appendChild(iconMove)

        const buttonTrash = document.createElement("button");
        buttonTrash.setAttribute("class", "btn-delete")
        buttonTrash.setAttribute("type", "submit");
        buttonTrash.addEventListener("click", (e) => {
            const id = e.target.closest('figure').dataset.id;
            apiDeleteWorks(id);
        });

        const iconTrash = document.createElement("i");
        iconTrash.setAttribute("class", "fa-solid fa-trash-can")
        buttonsContainer.appendChild(buttonTrash)
        buttonTrash.appendChild(iconTrash)

        const figcaption = document.createElement("figcaption");
        figcaption.textContent = "éditer"
        figure.appendChild(figcaption)
    }

    const separator = document.createElement("hr");
    fragment.appendChild(separator)

    const submitBtn = document.createElement("input");
    submitBtn.setAttribute("class", "btn-submit");
    submitBtn.setAttribute("data-modal", "portfolio-add"); // target modale
    submitBtn.setAttribute("type", "button");
    submitBtn.setAttribute("value", "Ajouter une photo");
    submitBtn.addEventListener("click", (e) => {
        targetModal(e.target.dataset.modal)
    });
    fragment.appendChild(submitBtn)

    const deleteAll = document.createElement("a");
    deleteAll.setAttribute("href", "#");
    deleteAll.textContent = "Supprimer la galerie";
    deleteAll.style.color = "red";
    fragment.appendChild(deleteAll)

    return fragment
}

const contentPortfolioB = async () => {
    const fragment = document.createDocumentFragment();

    const backBtn = document.querySelector('.js-modal-btn--back')
    backBtn.style.display = null
    backBtn.addEventListener("click", (e) => {
        targetModal('portfolio')
    });

    const h3 = document.createElement("h3");
    h3.textContent = "Ajout photo";
    fragment.appendChild(h3)

    const uploadContainer = document.createElement('div')
    uploadContainer.setAttribute("class", "upload-container");
    fragment.appendChild(uploadContainer)

    const uploadIcon = document.createElement('img')
    uploadIcon.setAttribute("class", "icon")
    uploadIcon.setAttribute("src", "./assets/icons/ico-img.svg")
    uploadContainer.appendChild(uploadIcon)

    const uploadBtn = document.createElement('div')
    uploadContainer.appendChild(uploadBtn)

    const uploadLabel = document.createElement('label')
    uploadLabel.setAttribute("for", "image")
    uploadLabel.setAttribute("class", "btn")
    uploadLabel.textContent = "+ Ajouter photo"
    uploadBtn.appendChild(uploadLabel)

    const uploadInput = document.createElement('input')
    uploadInput.setAttribute("id", "image")
    uploadInput.setAttribute('name', 'image')
    uploadInput.setAttribute("type", "file")
    uploadInput.setAttribute("accept", "image/png, image/jpeg, image/webp")
    uploadInput.style.display = 'none'
    uploadBtn.appendChild(uploadInput)

    const uploadInfo = document.createElement('p')
    uploadInfo.textContent = "jpg, png : 4mo max"
    uploadContainer.appendChild(uploadInfo)

    const uploadImg = document.createElement('img')
    uploadImg.setAttribute("class", "img-preview")
    uploadImg.setAttribute("src", "")
    uploadContainer.appendChild(uploadImg)

    uploadInput.onchange = () => {
        const [file] = uploadInput.files
        if (file) {
            uploadImg.src = URL.createObjectURL(file)
            uploadIcon.style.opacity = 0
            uploadBtn.style.opacity = 0
            uploadInfo.style.opacity = 0
        }
    }

    const inputContainer = document.createElement('div')
    inputContainer.setAttribute("class", "input-container")
    fragment.appendChild(inputContainer)

    const titleContainer = document.createElement('div')
    inputContainer.appendChild(titleContainer)

    const labelTitle = document.createElement('label')
    labelTitle.setAttribute('for', 'title')
    labelTitle.textContent = "Titre"
    titleContainer.appendChild(labelTitle)

    const inputTitle = document.createElement('input')
    inputTitle.setAttribute('type', 'text')
    inputTitle.setAttribute('name', 'title')
    inputTitle.setAttribute('required', '')
    titleContainer.appendChild(inputTitle)

    const categoryContainer = document.createElement('div')
    inputContainer.appendChild(categoryContainer)

    const labelCategory = document.createElement('label')
    labelCategory.setAttribute('for', 'titre')
    labelCategory.textContent = "Catégorie"
    categoryContainer.appendChild(labelCategory)

    const selectCategory = document.createElement('select')
    selectCategory.setAttribute('name', 'category')
    selectCategory.setAttribute('required', '')
    categoryContainer.appendChild(selectCategory)

    for (let categorie of await apiGetCategories()) {
        const optionCategory = document.createElement('option')
        optionCategory.setAttribute('value', categorie.id)
        optionCategory.textContent = categorie.name
        selectCategory.appendChild(optionCategory)
    }

    const separator = document.createElement("hr");
    fragment.appendChild(separator)

    const submitBtn = document.createElement("input");
    submitBtn.setAttribute("class", "btn-submit");
    submitBtn.setAttribute("type", "submit");
    submitBtn.setAttribute("value", "Valider");
    submitBtn.onclick = async () => {
        const formData = new FormData(document.querySelector("#modal__form"));
        if (!await apiPostWorks(formData)) {
            return
        }
        targetModal('portfolio')

        // refresh de la galerie      
        const projets = await apiGetWorks();
        let fragment = document.createDocumentFragment();
        fragment.appendChild(await createGallery(projets))

        const gallery = document.querySelector('.gallery')
        gallery.replaceWith(fragment);

        // retourne sur le filtre 'Tous' pour éviter toute confusion lors du refresh de la galerie
        const galleryFilters = document.querySelector(".filters");
        galleryFilters.querySelector(".active").classList.remove("active");
        galleryFilters.querySelector('[data-category="Tous"]').classList.add("active");
    }
    fragment.appendChild(submitBtn)

    return fragment
}