let modal = null

const token = localStorage.getItem("token")
if (token != null) adminInterface()

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

async function fetchCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error(`Impossible d'obtenir les catégories: ${error}`);
    }
}

async function deleteWorks(id) {
    try {
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`
            }
        })
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        console.log(`Le projet /works/{id}=${id} a été supprimé de la base de donnée avec succès`)
        document.querySelectorAll(`[data-id="${id}"]`).forEach(element => element.remove())
    }
    catch (error) {
        console.error(`Impossible de supprimer le projet /works/{id}=${id}: ${error}`);
    }
};

async function sendWorks(formData) {
    try {
        const response = await fetch(`http://localhost:5678/api/works`, {
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
    }
    catch (error) {
        console.error(`Impossible d'ajouter le projet: ${error}`);
    }
};

// différents contenus possibles de la fenetre modale
const contentPortfolioA = async () => {
    const fragment = document.createDocumentFragment();
    const projets = await fetchProjets();

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
            deleteWorks(id);
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
    const projets = await fetchProjets();

    const h3 = document.createElement("h3");
    h3.textContent = "Ajout photo";
    fragment.appendChild(h3)

    const uploadContainer = document.createElement('div')
    uploadContainer.setAttribute("class", "upload-container");
    fragment.appendChild(uploadContainer)

    const uploadIcon = document.createElement('img')
    uploadIcon.setAttribute("class", "icon")
    uploadIcon.setAttribute("src", "./assets/icons/img.svg")
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

    for (let categorie of await fetchCategories()) {
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
    submitBtn.onclick = () => {
        const formData = new FormData(document.querySelector("#modal__form"));
        sendWorks(formData)
    }

    fragment.appendChild(submitBtn)

    return fragment
}