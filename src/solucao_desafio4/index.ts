const loginButton = document.getElementById('login-button') as HTMLButtonElement;
const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;

const searchInput = document.getElementById('search') as HTMLInputElement;
const botaoVoltar = document.getElementById('botao-voltar') as HTMLButtonElement;

const criarListaButton = document.getElementById('criar-listas-btn') as HTMLButtonElement;
const criarListasForm = document.getElementById('criar-lista-form') as HTMLFormElement;

const overlay = document.getElementById('overlay') as HTMLDivElement;
const modalAdicionar = document.getElementById('modal-adicionar') as HTMLDivElement;

let USERNAME: string;
let PASSWORD: string;
let API_KEY: string = '3f301be7381a03ad8d352314dcc3ec1d';
let REQUEST_TOKEN: string;
let SESSION_ID: string;
let ACCOUNT_ID: number;

let LOGED: Boolean = false;

let LIST_ID: number = 0;
let MOVIE_LISTS: ILista[] = [];
let FILMES_POPULARES: IMovie[] = [];

let PESQUISA: boolean = false;

interface ILista {
  description: string
  id: number
  name: string
}

interface IRequest<G> {
  url: string
  method: string
  body?: G 
}

interface IMovie {
  id: number
  original_title: string
  poster_path: string
  title: string
}

type parametro = number | string;

class HttpClient {
  static async get<T,G = null>({url, method, body}: IRequest<G>): Promise<T> {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      
      request.open(method, url, true);
      
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
            resolve(JSON.parse(request.responseText));
          } else {
          reject(JSON.parse(request.response))
        }
      }

      request.onerror = () => {
        reject(JSON.parse(request.response))
      }

      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send(JSON.stringify(body));
      } else {
        request.send(null);
      }
    })
  }
}

async function buscarRequestToken(): Promise<void> {
  interface IToken {
    success: boolean
    request_token: string
  }

  try {
    let result = await HttpClient.get<IToken>({
      url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${API_KEY}`,
      method: "GET"
    });
    
    REQUEST_TOKEN = result.request_token;
  } catch (error) {
    alert("Chave da API Invalida")
  }
}

async function logar(): Promise<void> {

  interface ILoginReq {
    username: string
    password: string
    request_token: string
  }

  await HttpClient.get<{ success: boolean },ILoginReq>({
      url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${API_KEY}`,
      method: "POST",
      body: {
          username: USERNAME,
          password: PASSWORD,
          request_token: REQUEST_TOKEN
      }
    });
}

async function deslogar(): Promise<void> {
  await HttpClient.get<{ success: boolean },{ session_id: string }>({
    url: `https://api.themoviedb.org/3/authentication/session?api_key=${API_KEY}`,
    method: "DELETE",
    body: {
      session_id: `${SESSION_ID}`
    }
  });
  
  LOGED = false;
}

async function criarSessao(): Promise<void> {
    let result = await HttpClient.get<{ session_id: string }>({
      url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${API_KEY}&request_token=${REQUEST_TOKEN}`,
      method: "GET"
    });
    
    SESSION_ID = result.session_id;
}

async function buscarIdConta(): Promise<void> {
  interface IConta {
    id: number
    username: string
  }

  let result = await HttpClient.get<IConta>({
    url: `https://api.themoviedb.org/3/account?api_key=${API_KEY}&session_id=${SESSION_ID}`,
    method: "GET"
  });
  
  ACCOUNT_ID = result.id
  LOGED = true;
}

async function buscaListasDeFilmes(): Promise<void> {
  try {    
    let result = await HttpClient.get<{ results: ILista[] }>({
      url: `https://api.themoviedb.org/3/account/${ACCOUNT_ID}/lists?api_key=${API_KEY}&language=pt-BR&session_id=${SESSION_ID}`,
      method: "GET"
    });
    
    MOVIE_LISTS = result.results.map<ILista>(lista => ({ name: lista.name, description: lista.description, id: lista.id }));
  } catch (error) {
    alert("Houve um erro ao tentar buscar as lista no servidor,  qwerqewrqwerqwer por favor tente novamente");
  }
}

async function criarListaDeFilmes(nomeDaLista: string, descricao: string): Promise<void> {

  interface IListaReq {
    name: string
    description: string
    language: string
  }

  try {  
    await HttpClient.get<{ success: true }, IListaReq>({
      url: `https://api.themoviedb.org/3/list?api_key=${API_KEY}&session_id=${SESSION_ID}`,
      method: "POST",
      body: {
        name: nomeDaLista,
        description: descricao,
        language: "pt-BR"
      }
    });
  } catch (error) {
    alert("Houver um erro ao tentar criar uma nova lista, por favor tente novamente");
  }
}

async function apagarListaDeFilmes( listaId: parametro ): Promise<void> {

  // O Servidor do TMDB sempre devolve um erro na resposta mas mesmo assim ele sempre apaga a lista.
  // Eu utilizei a Fetch API para não travar a execução, seja como for ela está funcionando normalmente
  await fetch(`https://api.themoviedb.org/3/list/${listaId}?api_key=${API_KEY}&session_id=${SESSION_ID}`,{
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    method: 'DELETE'
  })

  await buscaListasDeFilmes();
  renderizaListasDeFilmesView();
}

async function adicionarFilmeNaLista(filmeId: number, listaId: parametro): Promise<void> {
  try {  
    await HttpClient.get<{ success: true },{ media_id: number }>({
      url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${API_KEY}&session_id=${SESSION_ID}`,
      method: "POST",
      body: {
        media_id: filmeId
      }
    });
  } catch (error) {
    alert("Houve um erro ao tentar salvar este filme nas listas, por favor tente novamente")
  }
}

async function removerFilmeNaLista(filmeId: parametro, listaId: parametro): Promise<void> {
  try {
    await HttpClient.get<{ success: true },{ media_id: parametro }>({
      url: `https://api.themoviedb.org/3/list/${listaId}/remove_item?api_key=${API_KEY}&session_id=${SESSION_ID}`,
      method: "POST",
      body: {
        media_id: filmeId
      }
    });
  } catch (error) {
    alert("Houve um erro ao tentar remover o filme das listas, por favor tente novamente");  
  }
}

async function filmeEstahPresenteNaLista(filmeId: parametro, listaId: parametro): Promise<boolean> {
  try {
    let result = await HttpClient.get<{ item_present: boolean }>({
      url: `https://api.themoviedb.org/3/list/${listaId}/item_status?api_key=${API_KEY}&movie_id=${filmeId}`,
      method: "GET"
    });

    return result.item_present;
  } catch (error) {
    alert("Houve um erro ao tentar verificar se o filme está na lista, por favor tente novamente");  
    return false;
  }
}

async function buscaFilmesDaLista(listId: parametro): Promise<IMovie[]>{
  try {
    let result = await HttpClient.get<{ items: IMovie[] }>({
      url: `https://api.themoviedb.org/3/list/${listId}?api_key=${API_KEY}&lenguage=pt-BR`,
      method: "GET"
    });
    
    return result.items
    .map<IMovie>(movie => 
      ({ id: movie.id, title: movie.title, original_title: movie.original_title, poster_path: movie.poster_path }));

  } catch (error) {
    alert("Houve um erro ao tentar buscar os filmes desta lista, por favor tente novamente")
    return FILMES_POPULARES;
  }
}

async function buscarFilmesPopulares(): Promise<void> {
  try {
    for (let i = 1; i <= 2; i++) {
      let result = await HttpClient.get<{ results: IMovie[] }>({
        url: `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=${i}`,
        method: "GET"
      });
      
      FILMES_POPULARES = [...FILMES_POPULARES, ...result.results]
    }
  } catch (error) {
    alert("Houve um erro ao tentar carregar os filmes populares, por favor, tente novamente");
  }
}

async function procurarFilme(query: string): Promise<IMovie[]> {
  try {
    query = encodeURI(query)  
    let result = await HttpClient.get<{ results: IMovie[] }>({
      url: `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&language=pt-BR`,
      method: "GET"
    })
    return result.results

  } catch (error) {
    alert("Houver um erro ao tentar procurar filme, por favor tente novamente.")
    return FILMES_POPULARES;
  }
}

let limitador = 0;
function limitaClick(fn: TimerHandler) {
  clearTimeout(limitador);
  limitador = setTimeout(fn,600);
}

function validateLoginButton(): void {
  if (PASSWORD && USERNAME) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

function preencherLogin(): void {
  USERNAME = (document.getElementById('login') as HTMLInputElement)?.value;
  validateLoginButton();
}

function preencherSenha(): void {
  PASSWORD = (document.getElementById('senha') as HTMLInputElement)?.value;
  validateLoginButton();
}

// function preencherChaveApi(): void {
//   API_KEY = (document.getElementById('api-key') as HTMLInputElement)?.value;
//   validateLoginButton();
// }

function mostraLogadoView(){
  // Form de login
  (document.getElementById('auth-login') as HTMLFormElement)?.classList.add('hidden');
  // Botão de logout
  (document.getElementById('auth-logout') as HTMLFormElement)?.classList.remove('hidden');
  // Listas de Filmes
  (document.getElementById('lista-filmes') as HTMLDivElement)?.classList.remove('hidden');
}

function mostraDeslogadoView(){
  // Form de login
  (document.getElementById('auth-login') as HTMLFormElement)?.classList.remove('hidden');
  // Botão de logout
  (document.getElementById('auth-logout') as HTMLFormElement)?.classList.add('hidden');
  // Listas de Filmes
  (document.getElementById('lista-filmes') as HTMLDivElement)?.classList.add('hidden');
}

async function salvarEstadoFilme(filmeId: number): Promise<void> {
  const inputs = document.getElementsByClassName('adicionar__lista') as HTMLCollectionOf<HTMLInputElement>;

  for (let input of inputs) {

    if (await filmeEstahPresenteNaLista(filmeId,input.value) != input.checked){
      
      if(input.checked)
        await adicionarFilmeNaLista(filmeId, input.value);
      
      if(!input.checked)
        await removerFilmeNaLista(filmeId, input.value);
    }
  }
}

function atualizaFilmesView(lista: IMovie[]): void {
  
  const filmes = document.getElementById('filmes') as HTMLElement;
  filmes.innerHTML = '';

  lista.forEach(filme => {
    
    const figure = document.createElement('figure');
    const div = document.createElement('div');
    const img = document.createElement('img');
    const figcaption = document.createElement('figcaption');
    const h5 = document.createElement('h5');
    const h4 = document.createElement('h4');
    
    figure.classList.add('filmes__filme');
    div.classList.add('filme__poster');
    img.classList.add('poster__img');
    figcaption.classList.add('filme__titles');
    h5.classList.add('title__en');
    h4.classList.add('title__pt');

    img.setAttribute('src',`https://image.tmdb.org/t/p/w500${filme.poster_path}`);

    h5.innerText = filme.original_title;
    h4.innerText = filme.title;

    figure.onclick = () => { limitaClick(() => { mostraOpcoesDeListas(filme.id) })  }
  
    figcaption.appendChild(h5);
    figcaption.appendChild(h4);

    div.appendChild(img);

    figure.appendChild(div);
    figure.appendChild(figcaption);

    filmes.appendChild(figure);
  });
}

async function mostraFilmesDaLista(element: HTMLElement, lista: ILista): Promise<void> {
  
  (document.querySelector(".list__btn[active]") as HTMLElement)?.removeAttribute('active');
   element.setAttribute('active','');

  (document.getElementById('info-title') as HTMLHeadingElement).innerText = lista.name;
  (document.getElementById('info-desc') as HTMLParagraphElement).innerText = lista.description;

  atualizaFilmesView(await buscaFilmesDaLista(lista.id));

  botaoVoltar.classList.remove('hidden');
}

function renderizaListasDeFilmesView(): void {

  const listasDeFilmes = document.getElementById('movie-list') as HTMLUListElement;
  listasDeFilmes.innerHTML = '';

  MOVIE_LISTS.forEach(lista => {

    const li = document.createElement('li');
    const buttonName = document.createElement('button');
    const buttonDel = document.createElement('button');

    buttonName.innerText = lista.name;
    buttonDel.innerText = 'X';

    li.classList.add('list__item');
    buttonName.classList.add('list__btn');
    buttonDel.classList.add('list__delete');

    buttonName.onclick = () => { limitaClick(() => { 
      LIST_ID = lista.id;
      mostraFilmesDaLista(buttonName,lista) 
    })}

    buttonDel.onclick =  () => { limitaClick( async () => {
      if (LIST_ID == lista.id) voltarTelaInicial();

      await apagarListaDeFilmes(lista.id);
    })}

    li.appendChild(buttonName);
    li.appendChild(buttonDel);

    listasDeFilmes.prepend(li);
  });
}

function mostraOverlayView(): void {
  overlay?.classList.remove('hidden');
}

function ocultarOverlayView(): void {
  overlay?.classList.add('hidden');
}

function mostrarModalBloqueio(): void {
  mostraOverlayView();
  
  const modal = document.getElementById('modal-block') as HTMLDivElement;
  modal.classList.remove('hidden');
  
  (document.getElementById('modal-block-sair') as HTMLButtonElement).onclick = () => {
    modal.classList.add('hidden');
    ocultarOverlayView();
  };
}

function ocultaModalAdicionar(): void {
  modalAdicionar?.classList.add('hidden');
  ocultarOverlayView();
}

function mostraModalAdicionar(filmeId: number): void {
  renderizaModalAdicionar(filmeId);
  mostraOverlayView();
  modalAdicionar?.classList.remove('hidden');
}

function renderizaModalAdicionar(filmeId: number): void {  
  
  const adicionarForm = document.getElementById('overlay-form')! as HTMLFormElement;
  adicionarForm.innerHTML = "";
  
  MOVIE_LISTS.forEach(async lista => {
  
    const input = document.createElement('input') as HTMLInputElement;

    input.classList.add('adicionar__lista');
    input.setAttribute('type','checkbox');
    input.setAttribute('value',lista.id.toString());
    input.setAttribute('name',lista.name.toString());
    input.checked = await filmeEstahPresenteNaLista(filmeId,lista.id);

    adicionarForm.prepend(input);
  });

  const adicionarBotoes = document.getElementById('modal-adicionar-botoes') as HTMLDivElement;
  const botaoCancelar = document.createElement('button') as HTMLButtonElement;
  const botaoSalvar = document.createElement('button') as HTMLButtonElement;

  botaoCancelar.classList.add('adicionar__btn');
  botaoSalvar.classList.add('adicionar__btn');

  botaoCancelar.innerText = "Cancelar";
  botaoSalvar.innerText = "Salvar";

  adicionarBotoes?.appendChild(botaoCancelar);
  adicionarBotoes?.appendChild(botaoSalvar);

  botaoCancelar.onclick = () => {
      ocultaModalAdicionar();
      adicionarBotoes.innerHTML = "";
  }
  botaoSalvar.onclick = () => {
    limitaClick( async () => {
      ocultaModalAdicionar();
      await salvarEstadoFilme(filmeId);
      adicionarBotoes.innerHTML = "";
    })
  }
}

function mostraOpcoesDeListas(filmeId: number): void {
  if (!LOGED)
    mostrarModalBloqueio();  
  else 
    mostraModalAdicionar(filmeId);
}

criarListaButton.onclick = function (){
  criarListaButton.classList.add('hidden');
  renderizaFormCriarListas();
  criarListasForm.classList.remove('hidden');
};

function renderizaFormCriarListas(){
  criarListasForm.innerHTML = "";

  const input = document.createElement('input');
  const textarea = document.createElement('textarea');
  const buttonCancelar = document.createElement('button');
  const spanCancelar = document.createElement('span');
  const buttonCriar = document.createElement('button');
  const spanCriar = document.createElement('span');

  input.classList.add('form__nome');
  textarea.classList.add('form__description');
  buttonCancelar.classList.add('form__btn');
  spanCancelar.classList.add('form__span');
  buttonCriar.classList.add('form__btn');
  spanCriar.classList.add('form__span');

  input.placeholder = "Nome da lista...";
  textarea.placeholder = "Descrição da lista";

  input.setAttribute('type','text');
  textarea.setAttribute('cols','30');
  textarea.setAttribute('rows','10');

  spanCancelar.innerText = "Cancelar";
  spanCriar.innerText = "Criar";

  buttonCancelar.onclick = () => {
    criarListaButton.classList.remove('hidden');
    criarListasForm.classList.add('hidden');
    criarListasForm.innerHTML = "";
  }

  buttonCriar.onclick = event => {
    event.preventDefault();

    limitaClick( async () => {     
      if (input.value.length > 0){
        await salvarNovaLista(input.value,textarea.value);
        
        criarListaButton.classList.remove('hidden');
        criarListasForm.classList.add('hidden');
        criarListasForm.innerHTML = "";
      }
    })
  }

  buttonCancelar.appendChild(spanCancelar);
  buttonCriar.appendChild(spanCriar);

  criarListasForm.appendChild(input);
  criarListasForm.appendChild(textarea);
  criarListasForm.appendChild(buttonCancelar);
  criarListasForm.appendChild(buttonCriar);
}

async function salvarNovaLista(nome: string, desc: string): Promise<void> {
  await criarListaDeFilmes(nome,desc);
  await buscaListasDeFilmes();
  renderizaListasDeFilmesView();
}

function validaPesquisa() {
  if (searchInput?.value.length > 0) {
    PESQUISA = true;
  } else {
    PESQUISA = false;
    atualizaFilmesView(FILMES_POPULARES);
  }
}

async function pesquisar(): Promise<void> {
  if (PESQUISA)
    atualizaFilmesView(await procurarFilme(searchInput?.value));   
}

function voltarTelaInicial() {
  (document.getElementById('info-title') as HTMLHeadingElement).innerText = "Populares";
  (document.getElementById('info-desc') as HTMLParagraphElement).innerText = "Os filmes mais populares do momento.";
  atualizaFilmesView(FILMES_POPULARES);
  (document.querySelector(".list__btn[active]") as HTMLButtonElement)?.removeAttribute('active');
  LIST_ID = 0;
  botaoVoltar.classList.add('hidden');
}

window.onload = async () => {
  await buscarFilmesPopulares();
  atualizaFilmesView(FILMES_POPULARES);
}

loginButton.onclick = () => {
  preencherLogin();
  preencherSenha();
  // preencherChaveApi();

  limitaClick(async () => {
  
    if (!LOGED) {
      await buscarRequestToken();
      
      try {
        await logar();
        await criarSessao();
        await buscarIdConta();
        
      } catch (error) {
        alert("nome de usuário ou senha invalida");
      }

      if(LOGED){
        await buscaListasDeFilmes();
        renderizaListasDeFilmesView();
        mostraLogadoView();
      }
    }
  });
}

logoutButton.onclick =  () => {
  limitaClick(async () => {  
    if (LOGED) {
      try {
        await deslogar();
        voltarTelaInicial();
        mostraDeslogadoView();  
      } catch (error) {
        alert("Não foi possivel fazer logout, por favor tente novamente")
      }
    }
  });
}

botaoVoltar.onclick = () => voltarTelaInicial();