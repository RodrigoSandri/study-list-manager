/*
Starter da Aula 4
Projeto final corrigido
*/

const API_URL = "https://jsonplaceholder.typicode.com/todos";

const items = [];
let nextId = 1;
let lastUserId = "";

// DOM
const form = document.getElementById("study-form");
const input = document.getElementById("study-input");
const feedback = document.getElementById("feedback");

const apiForm = document.getElementById("api-form");
const apiUserIdInput = document.getElementById("api-user-id");
const apiFeedback = document.getElementById("api-feedback");
const reloadButton = document.getElementById("reload-button");
const apiSubmitButton = apiForm.querySelector('button[type="submit"]');

const list = document.getElementById("study-list");
const emptyState = document.getElementById("empty-state");

// Feedback
function setFeedback(message, type = ""){
    feedback.textContent = message;
    feedback.className = "feedback";
    if(type){
        feedback.classList.add(`feedback--${type}`);
    }
}

function setApiFeedback(message, type=""){
    apiFeedback.textContent = message;
    apiFeedback.className = "feedback";
    if(type){
        apiFeedback.classList.add(`feedback--${type}`);
    }
}

// Validação
function validateTitle(title){
    if(title.length === 0){
        return "Digite uma atividade";
    }
    if(title.length < 3){
        return "Use pelo menos 3 caracteres";
    }
    return "";
}

// Loading API
function setApiLoading(isLoading){
    apiSubmitButton.disabled = isLoading;
    reloadButton.disabled = isLoading;
    apiUserIdInput.disabled = isLoading;

    apiSubmitButton.textContent = isLoading ? "Buscando..." : "Buscar Sugestões";
    reloadButton.textContent = isLoading ? "Atualizando..." : "Recarregar última busca";
}

// Criar item
function createStudyItem(item){
    const li = document.createElement("li");
    li.className = "study-item";
    li.dataset.id = String(item.id);

    const title = document.createElement("p");
    title.className = "study-item__title";
    title.textContent = item.title;

    const content = document.createElement("div");
    content.className = "study-item__content";

    const top = document.createElement("div");
    top.className = "study-item__top";

    const badge = document.createElement("span");
    badge.className = item.source === "api" ? "badge badge--api" : "badge badge--manual";
    badge.textContent = item.source === "api" ? "API" : "Manual";

    const meta = document.createElement("p");
    meta.className = "study-item__meta";

    if(item.source === "api"){
        const statusLabel = item.completed ? "concluida" : "pendente";
        meta.textContent = `Sugestão remota | userId: ${item.userId} | ${statusLabel}`;
    }else{
        meta.textContent = "Item criado manualmente";
    }

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn--danger";
    removeButton.textContent = "Remover";
    removeButton.dataset.action = "remove";

    top.append(title, badge);
    content.append(top, meta);
    li.append(content, removeButton);

    return li;
}

// Render
function renderList(){
    list.replaceChildren();

    if(items.length === 0){
        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;

    items.forEach((item) =>{
        list.appendChild(createStudyItem(item));
    });
}

// FORM MANUAL
function handleFormSubmit(event){
    event.preventDefault();

    const title = input.value.trim();
    const errorMessage = validateTitle(title);

    if(errorMessage){
        setFeedback(errorMessage, "error");
        return;
    }

    items.unshift({
        id: nextId++,
        title,
        source: "manual"
    });

    form.reset();
    input.focus();
    setFeedback("Item adicionado com sucesso", "success");
    renderList();
}

// REMOVER (delegação)
function handleListClick(event){
    const button = event.target.closest("button[data-action]");

    if(!button) 
        return;

    const itemElement = button.closest(".study-item");
    if(!itemElement) return;

    const id = Number(itemElement.dataset.id);
    const index = items.findIndex(item => item.id === id);

    if(index === -1) return;

    const removed = items[index].title;
    items.splice(index, 1);

    setFeedback(`Item removido: ${removed}`, "success");
    renderList();
}

// API
async function fetchSuggestions(userID = ""){
    const params = new URLSearchParams();
    params.set("_limit", "5");

    if(userID){
        params.set("userId", userID);
    }

    const url = `${API_URL}?${params.toString()}`;

    const response = await fetch(url);

    if(!response.ok){
        throw new Error("Erro na requisição");
    }

    const data = await response.json();

    if(!Array.isArray(data)){
        throw new Error("Resposta inválida");
    }

    data.forEach(todo =>{
        items.push({
            id: nextId++,
            title: todo.title,
            completed: todo.completed,
            source: "api",
            userId: todo.userId,
        });
    });

    renderList();
}

// FORM API
async function handleApiSubmit(event){
    event.preventDefault();

    lastUserId = apiUserIdInput.value.trim();

    try{
        setApiLoading(true);
        setApiFeedback("");     

        await fetchSuggestions(lastUserId);

        setApiFeedback("Sugestões carregadas com sucesso", "success");
    }catch{
        setApiFeedback("Erro ao buscar sugestões", "error");
    }finally{
        setApiLoading(false);
    }
}

// RELOAD
reloadButton.addEventListener("click", async () =>{
    try{
        setApiLoading(true);
        setApiFeedback("");

        await fetchSuggestions(lastUserId);

        setApiFeedback("Lista recarregada", "success");
    }catch{
        setApiFeedback("Erro ao recarregar", "error");
    }finally{
        setApiLoading(false);
    }
});

// EVENTOS
form.addEventListener("submit", handleFormSubmit);
apiForm.addEventListener("submit", handleApiSubmit);
list.addEventListener("click", handleListClick);

input.addEventListener("input", () =>{
    if(feedback.classList.contains("feedback--error")){
        setFeedback("");
    }
});

renderList();

// INIT
renderList();
// fetchSuggestions();