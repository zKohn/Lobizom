import objtimes from '../local_database/times.json' assert {'type': 'json'}
import objModosDeJogo from '../local_database/modos.json' assert {'type': 'json'}
import { Personagem } from '../local_database/personagens.js'
import { FunctionReference } from './funcoes.js';

const body = document.querySelector('body');
const menu = document.querySelector('main#menu');
const classe = document.querySelector('main#classe');
const botaoIniciarTutorial = menu.querySelector('button.iniciar');
const botaoProximoPersonagem = classe.querySelector('button.proximo');
const botaoPersonagemAnterior = classe.querySelector('button.anterior');
const botaoVoltarAoMenuTutorial = classe.querySelector('button.voltar');

const times = objtimes;
const modosDeJogo = objModosDeJogo.modos;
const personagem = new Personagem();
let total=0, numero=0, indiceTime;
let modoAtual = modosDeJogo[0];

// Funções fundamentais
function mudaTela({de, para}){
    de.classList.remove('unlocked');
    para.classList.add('unlocked');
}
function carregaModos(){
    const sectionModos = menu.querySelector('section.opcoes');
    let nomesModos = [];
    modosDeJogo.forEach(modo => nomesModos.push(modo.nome))
    const matrizBotoes = FunctionReference.geraMatrizBotoes({ arrayReferidos: nomesModos, referencia: 'opcao', som: true});
    sectionModos.innerHTML = FunctionReference.botoesHTML(matrizBotoes, false);
}
function getModoClicado(){
    return FunctionReference.getClicado('opcao');
}
function atualizaIndiceTime(){
    switch(indiceTime){
        case -1:
            indiceTime=times[ modoAtual.objTimes ].length-1;
            break;
        case times[ modoAtual.objTimes ].length:
            indiceTime=0;
            break;
        default:
            break;
    }
    numero=1;
    total = times[ modoAtual.objTimes ][indiceTime].personagens.length;
}
function retornaModoClicado(){
    const nomeModoClicado = getModoClicado();
    return modosDeJogo.filter(modo => modo.nome==nomeModoClicado)[0];
}

// Funções intermediárias
const carregaModoAtual = () => {
    numero=1;
    indiceTime=0;
    modoAtual = retornaModoClicado();
    total = times[ modoAtual.objTimes ][0].personagens.length;
}
const carregaPersonagem = () => {
    const secoes = classe.querySelectorAll('span');
    let nomePers = times[ modoAtual.objTimes ][indiceTime].personagens[numero-1];
    let pers = personagem.gera( nomePers );
    secoes.forEach(span => {
        switch(span.className){
            case 'modo': 
                span.innerHTML = modoAtual.nome;
                break;
            case 'numero': 
                span.innerHTML = `Personagem ${times[ modoAtual.objTimes ][indiceTime].time} - (${numero}/${total})`;
                break;
            case 'personagem': 
                span.innerHTML = pers.nome;
                break;
            case 'descricao':
                span.innerHTML = pers.descricao;
                break;
        }
    });
}

// Funções de interação
botaoIniciarTutorial.addEventListener('click', () => {
    carregaModoAtual();
    carregaPersonagem();
    mudaTela({'de': menu, 'para': classe});
});
botaoProximoPersonagem.addEventListener('click', () => {
    switch(numero){
        case total:
            indiceTime++;
            atualizaIndiceTime();
            break;
        default:
            numero++;
    }
    carregaPersonagem();
});
botaoPersonagemAnterior.addEventListener('click', () => {
    switch(numero){
        case 1:
            indiceTime--;
            atualizaIndiceTime();
            break;
        default:
            numero--;
    }
    carregaPersonagem();
});
botaoVoltarAoMenuTutorial.addEventListener('click', () => {
    mudaTela({'de': classe, 'para': menu});
});

// Carregamento de página
body.addEventListener('load', carregaModos() );