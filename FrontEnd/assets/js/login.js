apiUrl = 'http://localhost:5678/api'

const form = document.getElementById('form');
form.addEventListener("submit", submitForm);

async function submitForm(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const formDataAsObject = Object.fromEntries(formData.entries());
    const formDataAsJSON = JSON.stringify(formDataAsObject);

    try {
        const response = await fetch(`${apiUrl}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: formDataAsJSON
        })

        switch (true) {
            case response.ok:
                const responseBody = await response.json();
                localStorage.setItem('token', responseBody.token);
                console.log("Connexion réussie");
                redirectToIndex();
                break;
            case response.status == 401:
                errorMessage("password");
                break;
            case response.status == 404:
                errorMessage("email");
                break;
            default:
                throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return
    }
    catch (error) {
        console.error(`Impossible de se connecter: ${error}`);
    }
};


function errorMessage(type) {
    let inputElement
    let errorText
    switch (type) {
        case "email":
            inputElement = document.querySelector(".form_item--email");
            errorText = "Utilisateur inconnu, vérifiez l'adresse email saisie"
            break;
        case "password":
            inputElement = document.querySelector(".form_item--password");
            errorText = "Mot de passe incorrect"
            break;
    }

    // retire l'erreur precedente si besoin
    const previousMsg = document.querySelector(".error-msg")
    if (previousMsg) { previousMsg.remove() }

    // composer les noeuds DOM
    let errorMsg = document.createElement("p");
    errorMsg.setAttribute("class", "error-msg");
    errorMsg.textContent = errorText

    inputElement.appendChild(errorMsg);
};


function redirectToIndex() {
    window.location.href = "/FrontEnd/";
};