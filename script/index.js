import { Participante } from './classes.js'
import objPersonagens from '../personagens/personagens.json' assert {'type': 'json'}
import { funcao } from './funcoes.js';

// Seletores para interação com HTML
const home = document.querySelector('main#home');
const inicial = document.querySelector('main#inicial');
const classe = document.querySelector('main#classe');
const resumo =  document.querySelector('main#resumo');
const votacao =  document.querySelector('main#votacao');
const botaoAddParticipantes = home.querySelector('button.add');
const botaoJogar = home.querySelector('button.jogar');
const botaoAbrirFuncao = inicial.querySelector('button.abrir');
const botaoProximoJogador = classe.querySelector('button.proximo');
const botaoVotacao = resumo.querySelector('button.votacao');
const botaoVotar = votacao.querySelector('button.votar');

// Ambiente de jogo
const personagem = objPersonagens.personagens;
let vez = 0;
let numero = 3;
let funcoes = [];
let participantes = {
    numero: 0,
    array: [],
};

// Funções fundamentais
function mudaTela({de, para}){
    de.classList.remove('unlocked');
    para.classList.add('unlocked');
}
const resetarJogo = () => {
    vez = 1;
    funcoes = [];
    participantes.array = [];
    participantes.numero = 0;
}
const calculaProximaVez = () => {
    do{
        vez++;
    }while(!participantes.array[vez-1]||vez > participantes.numero)
    if(vez > participantes.numero){
        vez = 1;
        resumoDia();
        return 'nova rodada';
    }
    return true;
}
const textoProximoJogadorHTML = () => {
    let vezHTML = inicial.querySelector('section.vez');
    vezHTML.innerHTML = `Passe para ${ participantes['array'][vez-1]['nome'] }`;
}
const acaoJogadorPassado = () => {
    funcao[participantes.array[vez-1].personagem.funcao]['acao'](
        participantes,
        participantes.array[vez-1].personagem
    );
}

// Funções intermediárias
const geraPersonagens = () => {
    let todosNomes = true;
    const participantesHTML = home.querySelectorAll('input.nome');
    for(let i=0; i<participantesHTML.length; i++){
        const nome = participantesHTML[i].value;
        if(!nome || !todosNomes){
            resetarJogo();
            todosNomes = false;
            break;
        }
        participantes.array.push(new Participante({
            'nome': nome,
            'personagem': personagem[Math.floor(Math.random()*personagem.length)]
        }));
        funcoes[i] = participantes['array'][i].personagem.funcao;
    }
    return todosNomes;
}
const carregaPersonagem = () => {
    const secoes = classe.querySelectorAll('section');
    let pers = participantes.array[vez-1].personagem;
    secoes.forEach(secao => {
        switch(secao.className){
            case 'personagem':
                secao.innerHTML = `${participantes.array[vez-1]['nome']} é <strong>${pers.nome}</strong>`;
                break;
            case 'descricao':
                secao.innerHTML = `${pers.descricao}`;
                break;
            case 'botoes':
                secao.innerHTML = funcao[pers.funcao]['botoes'](
                    participantes,
                    pers
                );
                break;
        }
    })
    return pers;
}
const calculaMortos = () => {
    let mortos = [];
    for(let i=1; i<=participantes.numero; i++){
        if(participantes.array[i-1].personagem.status.vida <= 0){
            mortos.push({
                'nome': participantes.array[i-1].nome,
                'personagemNome': participantes.array[i-1].personagem.nome
            })
            participantes.array[i-1] = false;
            participantes.numero--;
        }
    }
    return mortos;
}
const mostrarMortos = () => {
    let mortos = calculaMortos();
    const secaoMortos = resumo.querySelector('section.mortos');
    if(!mortos){
        secaoMortos.innerHTML = `Nenhum assassinato!`;
        return;
    }
    secaoMortos.innerHTML = '';
    mortos.forEach(m => {
        secaoMortos.innerHTML = `${m.nome} - <strong>${m.personagemNome}</strong>`;
    })
    console.log(participantes);
    mudaTela({'de': classe, 'para': resumo})
}

// Funções de interligação
botaoAddParticipantes.addEventListener('click', () => {
    const secaoParticipantes = home.querySelector('section.participantes');
    const numeroHTML = home.querySelector('section.escolha select');
    numero = numeroHTML.options[numeroHTML.selectedIndex].value;
    secaoParticipantes.innerHTML = '';
    for(let i=1; i<=numero; i++)
        secaoParticipantes.innerHTML += '<input class="nome">'
});
botaoJogar.addEventListener('click', () => {
    resetarJogo();
    participantes.numero = numero;
    let todosNomes = geraPersonagens();
    if(!todosNomes){
        window.alert('Digite todos os nomes!');
        return;
    }
    textoProximoJogadorHTML();
    mudaTela({'de': home, 'para': inicial});
});
botaoProximoJogador.addEventListener('click', () => {
    acaoJogadorPassado();
    if(calculaProximaVez()=='nova rodada') return;
    textoProximoJogadorHTML();
    mudaTela({'de': classe, 'para': inicial});
});
botaoAbrirFuncao.addEventListener('click', () => {
    carregaPersonagem();
    mudaTela({'de': inicial, 'para': classe});
});

// Funções avançadas
const resumoDia = () => {
    mostrarMortos();
    mudaTela({'de': resumo, 'para': votacao})
}
