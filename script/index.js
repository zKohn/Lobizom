import { Participante } from './classes.js'
import objtimes from '../database/times.json' assert {'type': 'json'}
import objPersonagens from '../database/personagens.json' assert {'type': 'json'}
import { funcao } from './funcoes.js';

// Seletores para interação com HTML
const inicial = document.querySelector('main#inicial');
const espera = document.querySelector('main#espera');
const classe = document.querySelector('main#classe');
const resumo =  document.querySelector('main#resumo');
const votacao =  document.querySelector('main#votacao');
const botaoAddParticipantes = inicial.querySelector('button.add');
const botaoJogar = inicial.querySelector('button.jogar');
const botaoAbrirFuncao = espera.querySelector('button.abrir');
const botaoProximoJogador = classe.querySelector('button.proximo');
const botaoVotacao = resumo.querySelector('button.votacao');
const botaoVotar = votacao.querySelector('button.votar');

// Ambiente de jogo
const personagem = objPersonagens.personagens;
const times = objtimes.times;
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
const embaralha = (array) => {
    let aux, a, b, repeticoes=Math.floor(Math.random()*350);
    for(let i=0; i<=repeticoes; i++){
        a = Math.floor(Math.random()*array.length);
        b = Math.floor(Math.random()*array.length);
        aux = array[a];
        array[a] = array[b];
        array[b] = aux;
    }
    return array;
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
    let vezHTML = espera.querySelector('section.vez');
    vezHTML.innerHTML = `Passe para ${ participantes['array'][vez-1]['nome'] }`;
}
const acaoJogadorPassado = () => {
    participantes.array[vez-1].personagem = funcao[ participantes.array[vez-1].personagem.funcao ]['acao'](
        participantes,
        participantes.array[vez-1].personagem
    );
}

// Funções intermediárias
const personagensPorTimes = () => {
    let qtdPorTime = 0, listaPersonagens = [], qtdTotal = 0;
    for(let i=0; i<times.length; i++){
        qtdPorTime = times[i]['min'] + Math.floor( times[i]['ideal']*participantes['numero'] );
        qtdTotal+=qtdPorTime;
        if(qtdTotal > participantes.numero)
            qtdPorTime -= (qtdTotal - participantes.numero);
        for(let j=1; j<=qtdPorTime; j++){
            listaPersonagens.push( times[i].personagens[ Math.floor( Math.random()*(times[i].personagens).length ) ] );
        }
        if(qtdTotal>=participantes.numero) break;
    }
    console.log(listaPersonagens);
    console.log(qtdTotal);
    return embaralha(listaPersonagens);
}
const geraPersonagens = () => {
    let todosNomes = true;
    const participantesHTML = inicial.querySelectorAll('input.nome');
    let listaPersonagens = personagensPorTimes();
    for(let i=0; i<participantesHTML.length; i++){
        const nome = participantesHTML[i].value;
        if(!nome || !todosNomes){
            resetarJogo();
            todosNomes = false;
            break;
        }
        participantes.array.push(new Participante({
            'nome': nome,
            'personagem': (personagem.filter(p => p.nome==listaPersonagens[i]))[0]
            // 'personagem': personagem[Math.floor(Math.random()*personagem.length)]
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
                ) || '';
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
    const secaoParticipantes = inicial.querySelector('section.participantes');
    const numeroHTML = inicial.querySelector('section.escolha select');
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
    mudaTela({'de': inicial, 'para': espera});
});
botaoProximoJogador.addEventListener('click', () => {
    acaoJogadorPassado();
    if(calculaProximaVez()=='nova rodada') return;
    textoProximoJogadorHTML();
    mudaTela({'de': classe, 'para': espera});
});
botaoAbrirFuncao.addEventListener('click', () => {
    carregaPersonagem();
    mudaTela({'de': espera, 'para': classe});
});

// Funções avançadas
const resumoDia = () => {
    mostrarMortos();
    mudaTela({'de': resumo, 'para': votacao})
}