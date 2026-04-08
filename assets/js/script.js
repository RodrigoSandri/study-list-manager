/*
Starter da Aula 4
Construa a logica do zero, seguindo o EXERCICIO.md.

Ordem sugerida:
1. Selecionar os elementos do DOM.
2. Criar a funcao validateTitle(title).
3. Criar o array items e o contador nextId.
4. Criar a funcao createStudyItem(item).
5. Tratar o submit do formulario.
6. Tratar o click da lista para remover itens com delegacao.

Meta da aula:
- formulario
- lista dinamica
- validacao simples
- uso de dataset
- delegacao de eventos
*/

//array para itens
//contador simples para gerenciar ids únicos

const API_URL = "https://jsonplaceholder.typicode.com/todos";


const items = [];
let nextId = 1;
let lastUserId = "";


//Utilizamos selector do DOM para localicar os elementos principais da pagina

const form = document.getElementById("study-form");
const input = document.getElementById("study-input");
const feedback = document.getElementById("feedback");

const apiForm = document.getElementById("api-form");
const apiUserIdInput = document.getElementById("api-user-id");
const apiFeedback = document.getElementById("api-feedback");
const statusMessage = document.getElementById("status-message");
const reloadButton = document.getElementById("reload-button");
const apiSubmitButton = apiForm.querySelector('button[type="submit"]');

const list = document.getElementById("study-list");
const emptyState = document.getElementById("empty-state");



//funcoes utilitarias, para separar pequenas responsabilidades

//mostra a mensagem para o usuário, aplicado variação visual de sucesso ou erro quando necessário.
function setFeedback(message, type = ""){
    feedback.textContent = message;
    feedback.classList = "feedback";
    if(type){
        feedback.classList.add(`feedback--${type}`);
    }
}

function setApiFeedback(message, type=""){
    apiFeedback.textContent = message;
    apiFeedback.className = "feedback"
    if(type){
        apiFeedback.classList.add(`feedback--${type}`);
    }
}

//retorna mensagem de erro se o titulo for invalido
//ou retorna string vazia quando estiver tudo certo
function validateTitle(title){
    if(title.length === 0){
        return "Digite uma atividade";
    }
    if(title.length < 3){
        return "Use pelo menos 3 caracteres";
    }
    return "";
}

function setApiLoading(isLoading){
    apiSubmitButton.disabled = isLoading;
    reloadButton.disabled = isLoading;
    apiUserIdInput.disabled = isLoading;

    apiSubmitButton.textContent = isLoading ? "Buscando..." : "Buscar Sugestões";
    reloadButton.textContent = isLoading ? "Atualizando..." : "Recarregar última busca";
}

/*
createStudyItem
-tranforma um item do array em um elemento de <li>
-salva o id em dataset para descobirmos depois qual o item a se remover
*/
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
    badge.className = item.source === "api" ? "badge badge--api" : "badge badge--manual"
    badge.textContent = item.source === "api" ? "API" : "Manual";

    const meta = document.createElement("p");
    meta.className = "study-item__meta";

    if(item.source === "api"){
        const statusLabel = item.completed ? "concluida" : "pendente";
        meta.textContent = `Sugestão remota | userId: ${item.userId} | ${statusLabel}`
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

//renderização, atualiza a tela com base no array items.
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

//trabalhar o eventos
//reagir ao formulario e aos cliques

/*
handleFormSubmit
impede o recarregamento
le o texto do input
valida
adicionar novo item no array
limapar e redesenhar a lista
*/

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

/*
handleListClick
--usa delegacao para ouvir todos os botoes de remover com um unico listener
--descobre o item clicado pela data-id salvo no <li>
*/

function handleListClick(event){
    const button = event.target.closest("button[data-action]");

    if(!button){
        return;
    }

    const itemElement = button.closest(".study-item");

    if(!itemElement){
        return;
    }

    const id = Number(itemElement.dataset.id);
    const index = items.findIndex((item) => item.id === id);

    if(index === -1){
        return;
    }

    const removeTitle = items[index].title;
    items.splice(index, 1);
    setFeedback(`Item removido: ${removeTitle} .`, "success");
    renderList();
}

async function fetchSuggestions(userID = "") {
    const params = new URLSearchParams();

    params.set("_limit", "5");

    if(userID){
        params.set("userId", userID);
    }
    const url = `${API_URL}?${params.toString()}`;

    const response = await fetch(url);

    const data = await response.json();
    if(!Array.isArray(data)){
        throw new Error("Resposta Inválida");   
    }

    data.forEach((todo) =>{
        items.push({
          id: nextId,
          title: todo.title,
          completed: todo.completed,
          source: "api",
          userId: todo.userId,
        });

        nextId++;
       })

    renderList();
    
}

function handleApiSubmit(event){
    event.preventDefault();
    lastUserId = apiUserIdInput.value.trim();
    fetchSuggestions(lastUserId);
}


//ligar os eventos e primeira renderização
apiForm.addEventListener("submit", handleFormSubmit);
form.addEventListener("submit", handleFormSubmit);
form.addEventListener("submit", handleFormSubmit);
list.addEventListener("click", handleListClick);
input.addEventListener("input", () =>{
    if(feedback.classList.contains("feedback--error")){
        setFeedback("");
    }
})

renderList();
fetchSuggestions();

