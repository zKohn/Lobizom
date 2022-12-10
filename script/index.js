import objtimes from '../database/times.json' assert {'type': 'json'}
import objModosDeJogo from '../database/modos.json' assert {'type': 'json'}
import { Personagem } from '../database/personagens.js'
import { FunctionReference, funcao, auxiliarPersonagem, auxiliarVotar, auxiliarVitoria } from './funcoes.js';


// Seletores para interação com HTML
const body = document.querySelector('body');
const menu = document.querySelector('main#menu');
const configuracoes = document.querySelector('main#configuracoes');
const espera = document.querySelector('main#espera');
const classe = document.querySelector('main#classe');
const resumo = document.querySelector('main#resumo');
const surpresas = document.querySelector('main#surpresas');
const votacao = document.querySelector('main#votacao');
const prisao = document.querySelector('main#prisao');
const fim = document.querySelector('main#fim');
const botaoAbrirConfigs = menu.querySelector('button.configurar');
const botaoAddParticipantes = configuracoes.querySelector('button.add');
const botaoJogar = configuracoes.querySelector('button.jogar');
const botaoAbrirFuncao = espera.querySelector('button.abrir');
const botaoProximoJogador = classe.querySelector('button.proximo');
const botaoAbrirVotacao = resumo.querySelector('button.votacao');
const botaoAbrirVotacao2 = surpresas.querySelector('button.votacao');
const botaoVotar = votacao.querySelector('button.votar');
const botaoNovaRodada = prisao.querySelector('button.novaRodada');
const botaoVoltarMenu = fim.querySelector('button.menu');
const botaoRestart = fim.querySelector('button.restart');

// Ambiente de jogo
const personagem = new Personagem();
const times = objtimes;
const modosDeJogo = objModosDeJogo.modos;
let modoRef = modosDeJogo[0];
let modoJogo;
let numero = configuracoes.querySelectorAll('section.participantes input').length;
let vez = 0;
let participantes = {
    array: [],
    ok: []
};
let arrayVotos = [];

// Funções fundamentais
function carregaModos(){
    const sectionModos = menu.querySelector('section.modos');
    let nomesModos = [];
    modosDeJogo.forEach(modo => nomesModos.push(modo.nome))
    const matrizBotoes = FunctionReference.geraMatrizBotoes({ arrayReferidos: nomesModos, referencia: 'modo', som: true});
    sectionModos.innerHTML = FunctionReference.botoesHTML(matrizBotoes, false);
}
function mudaTela({de, para}){
    de.classList.remove('unlocked');
    para.classList.add('unlocked');
}
const resetarJogo = () => {
    vez = 1;
    participantes.array = [];
    participantes.ok = [];
    modoRef = modosDeJogo.filter(modo => modo.nome == modoJogo)[0];
}
const verificaNomes = (lista, temTodosNomes) => {
    if(!temTodosNomes)
        return false;
    for(let i=0; i<lista.length-1; i++)
        for(let j=i+1; j<lista.length; j++)
            if(lista[i]==lista[j])
                return false;
    return true;
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
const EsseNaoOkJoga = () => {
    return participantes.array[vez-1].personagem.status.vida<=0&&modoRef['assassinado_joga'] ||
        participantes.array[vez-1].personagem.status.preso==true&&modoRef['preso_joga'];
}
const calculaProximaVez = (votacao=false) => {
    do{
        vez++;
        if(vez > participantes.array.length){
            vez = 0;
            return false;
        }
    }while(
        participantes.ok[vez-1]===false && ( votacao || !EsseNaoOkJoga() )
    );
    return true;
}
const textoProximoJogadorHTML = () => {
    let vezHTML = espera.querySelector('section.vez');
    vezHTML.innerHTML = `Passe para ${ participantes.array[vez-1]['nome'] }`;
}
const acaoJogadorPassado = () => {
    let persPreso = EsseNaoOkJoga();
    participantes = funcao[ persPreso===true?'password':participantes.array[vez-1].personagem.funcao ]['acao'](
        participantes,
        vez-1,
    );
}
const finalizaAcoes = () => {
    let novosParticipantes = participantes;
    for(let i=0; i<participantes.array.length; i++){
        novosParticipantes = funcao[ 
            novosParticipantes.array[i].personagem.funcao 
    ]['finaliza_acao'](
            novosParticipantes,
            i,
        );
    }
    participantes = novosParticipantes;
}
const resetarEfeitos = () => {
    participantes.array.forEach(part => {
        part.personagem.efeitos = [];
    });
}

// Funções de utilidade intermediária
const geraPersonagensPorTimes = () => {
    let qtdPorTime = 0, listaNomesPersonagens = [], qtdTotal = 0;
    let timesDoModo = times[ modoRef['objTimes'] ];
    let indiceProporcao, indice, i, j;
    for(i=0; i<timesDoModo.length; i++){
        qtdPorTime = timesDoModo[i]['min'] + Math.floor( timesDoModo[i]['ideal']*numero );
        qtdTotal+=qtdPorTime;
        if(qtdTotal > numero)
            qtdPorTime -= (qtdTotal - numero);
        for(j=1; j<=qtdPorTime; j++){
            indiceProporcao = Math.floor( Math.random()*timesDoModo[i].proporcao.length )
            indice = timesDoModo[i].proporcao[indiceProporcao];
            listaNomesPersonagens.push( timesDoModo[i].personagens[indice] );
        }
        if(qtdTotal>=numero) break;
    }
    if(qtdTotal==numero)
        return embaralha(listaNomesPersonagens);
    let timeBem = timesDoModo.filter(t => t['time']=='bem')[0];
    while(qtdTotal<numero)
        listaNomesPersonagens.push( timeBem.personagens[0] );
    return embaralha(listaNomesPersonagens);
}
const geraPersonagens = () => {
    let temTodosNomes = true;
    const participantesHTML = configuracoes.querySelectorAll('input.nome');
    let listaNomesPersonagens = geraPersonagensPorTimes();
    for(let i=0; i<participantesHTML.length; i++){
        const nome = participantesHTML[i].value;
        if( nome==='' || !temTodosNomes){
            resetarJogo();
            temTodosNomes = false;
            break;
        }
        participantes.array.push({
            'nome': nome,
            'personagem': personagem.gera(listaNomesPersonagens[i])
        });
        participantes.ok.push( nome );
    }
    return verificaNomes(participantes.ok, temTodosNomes);
}
const carregaPersonagem = () => {
    const secoes = classe.querySelectorAll('section');
    secoes.forEach(secao => {
        if(auxiliarPersonagem[secao.className])
            secao.innerHTML = auxiliarPersonagem[secao.className](participantes, vez);
    });
}
const calculaAssassinados = () => {
    let novosAssassinados = [];
    for(let i=0; i<participantes.array.length; i++){
        if(participantes.array[i].personagem.status.vida <= 0 && !(participantes.ok[i]===false)){
            novosAssassinados.push({
                'nome': participantes.array[i].nome,
                'personagemNome': participantes.array[i].personagem.nome
            })
            participantes.ok[i] = false;
        }
    }
    return novosAssassinados;
}
const mostraAssassinados = () => {
    const novosAssassinados = calculaAssassinados();
    const secaoAssassinados = resumo.querySelector('section.assassinados');
    if(!novosAssassinados.length){
        secaoAssassinados.innerHTML = `Ninguém nessa rodada. Os assassinos estão dormindo?`;
        return;
    }
    secaoAssassinados.innerHTML = '';
    novosAssassinados.forEach(a => {
        secaoAssassinados.innerHTML += `<div class="lado">${a.nome} - <i>${a.personagemNome}</i></div>`;
    });
}
const carregaVotacao = () => {
    const secaoParticipantes = votacao.querySelector('section.participantes');
    const secaoVez = votacao.querySelector('section.vez');
    secaoParticipantes.innerHTML = auxiliarVotar.interacoes(participantes);
    secaoVez.innerHTML = `Vez de <i>${participantes.array[vez-1].nome}</i> votar`;
}
const votoAnterior = () => {
    return auxiliarVotar.votado(participantes);
}
const calculaPreso = () => {
    let contagem = [], votosPreso=0, resultado, i;
    for(i=0; i<participantes.array.length; i++)
        contagem[i]=0;
    for(i=0; i<arrayVotos.length; i++){
        if( !(arrayVotos[i]===false) )
            contagem[arrayVotos[i]]++;
    }
    for(i=0; i<contagem.length; i++){
        if(contagem[i] > votosPreso){
            votosPreso = contagem[i];
            resultado = i;
        }else if(contagem[i] == votosPreso){
            resultado = 'empate';
        }
    }
    prendePersonagem(resultado);
    return resultado;
}
const prendePersonagem = (indicePreso) => {
    if( isNaN(indicePreso) ) return;
    participantes.ok[indicePreso] = false;
    participantes.array[indicePreso].personagem.status.preso = true;
}
const carregaPrisao = () => {
    const secaoPreso = prisao.querySelector('section.preso');
    let indicePreso = calculaPreso();
    if(indicePreso=='empate'){
        secaoPreso.innerHTML = 'Ninguém porque o resultado foi um empate!';
        return;
    }
    secaoPreso.innerHTML = participantes.array[indicePreso].nome;
}
const calculaSurpresas = () => {
    let novosFugitivos = [], novosRenascidos = [];
    for(let i=0; i<participantes.array.length; i++){
        if(participantes.ok[i]===false){
            console.log('Verifica-se '+participantes.array[i].nome+' nao ok');
            if(participantes.array[i].personagem.efeitos.includes('fuga')){
                console.log('Preso '+participantes.array[i].nome+' fugiu!');
                participantes.ok[i]=participantes.array[i].nome;
                participantes.array[i].personagem.status.preso = false;
                novosFugitivos.push( participantes.array[i].nome );
            }
            if(participantes.array[i].personagem.efeitos.includes('renasce')){
                console.log(participantes.array[i].nome+' renasceu!');
                participantes.ok[i]=participantes.array[i].nome;
                novosRenascidos.push( participantes.array[i].nome );
                participantes.array[i].personagem.status.vida=1;
            }
        }
    }
    return [novosFugitivos, novosRenascidos];
}
const mostraSurpresas = () => {
    const [novosFugitivos, novosRenascidos] = calculaSurpresas();
    if(novosFugitivos.length==0 && novosRenascidos.length==0)
        return false;
    if(novosFugitivos.length!=0){
        const secaoLibertos = surpresas.querySelector('section.fugitivos');
        secaoLibertos.innerHTML='';
        novosFugitivos.forEach(l => {
            secaoLibertos.innerHTML+= `${l} conseguiu fugir da cadeia!`;
        });
    }
    if(novosRenascidos.length!=0){
        const secaoRenascidos = surpresas.querySelector('section.renascidos');
        secaoRenascidos.innerHTML='';
        novosRenascidos.forEach(r => {
            secaoRenascidos.innerHTML+= `${r} conseguiu renascer!`;
        });
    }
    mudaTela({'de': resumo, 'para': surpresas});
    return true;
}

// Funções avançadas
const resumoDia = () => {
    finalizaAcoes();
    mostraAssassinados();
    mudaTela({'de': classe, 'para': resumo});
}
const resultadoVotacao = () => {
    carregaPrisao();
    mudaTela({'de': votacao, 'para': prisao});
}
const restartJogo = () => {
    vez = 1;
    let listaNomesPersonagens = geraPersonagensPorTimes();
    for(let i=0; i<participantes.array.length; i++){
        participantes.array[i].personagem = personagem.gera(listaNomesPersonagens[i]);
        participantes.ok[i] = participantes.array[i].nome;
    }
}
const calculaVencedores = (telaAnterior) => {
    let ganhadores = auxiliarVitoria.testar(participantes);
    if(ganhadores===false)
        return false;
    resultadoJogo(ganhadores, telaAnterior);
    return true;
}
const resultadoJogo = (ganhadores, telaAnterior) => {
    let secaoVencedores = fim.querySelector('section.vencedores');
    secaoVencedores.innerHTML = "Os VENCEDORES são:";
    ganhadores.forEach(g => {
        secaoVencedores.innerHTML += `<div class="lado">${g.nome} - <i>${g.personagem.nome}</i></div>`;
    });
    mudaTela({ 'de': telaAnterior, 'para': fim});
}

// Funções de interligação
botaoAbrirConfigs.addEventListener('click', () => {
    const modoHTML = menu.querySelector('label.modo input:checked');
    const secaoModo = configuracoes.querySelector('section.modo');
    modoJogo = modoHTML.className;
    secaoModo.innerHTML = `Modo <i>${modoJogo||BolinaDeGorfeError}</i>`;
    mudaTela({'de': menu, 'para': configuracoes});
});
botaoAddParticipantes.addEventListener('click', () => {
    const secaoParticipantes = configuracoes.querySelector('section.participantes');
    const numeroHTML = configuracoes.querySelector('section.escolha select');
    numero = numeroHTML.options[numeroHTML.selectedIndex].value;
    secaoParticipantes.innerHTML = '';
    for(let i=1; i<=numero; i++)
        secaoParticipantes.innerHTML += '<input class="nome">';
});
botaoJogar.addEventListener('click', () => {
    resetarJogo();
    if( !geraPersonagens() ){
        window.alert('Digite nomes diferentes e não vazios!');
        return;
    }
    textoProximoJogadorHTML();
    mudaTela({'de': configuracoes, 'para': espera});
});
botaoProximoJogador.addEventListener('click', () => {
    acaoJogadorPassado();
    if(!calculaProximaVez()){
        resumoDia();
        return;
    }
    textoProximoJogadorHTML();
    mudaTela({'de': classe, 'para': espera});
});
botaoAbrirFuncao.addEventListener('click', () => {
    carregaPersonagem();
    mudaTela({'de': espera, 'para': classe});
});
botaoAbrirVotacao.addEventListener('click', () => {
    if(mostraSurpresas())
        return;
    if(calculaVencedores(resumo))
        return;
    arrayVotos = [];
    calculaProximaVez(true);
    carregaVotacao();
    mudaTela({'de': resumo, 'para': votacao});
});
botaoAbrirVotacao2.addEventListener('click', () => {
    mudaTela({'de': surpresas, 'para': votacao});
});
botaoVotar.addEventListener('click', () => {
    arrayVotos.push( votoAnterior() );
    if(!calculaProximaVez(true)){
        resultadoVotacao();
        return;
    }
    carregaVotacao();
    mudaTela({'de': votacao, 'para': votacao});
});
botaoNovaRodada.addEventListener('click', () => {
    if(calculaVencedores(prisao))
        return;
    resetarEfeitos();
    calculaProximaVez();
    textoProximoJogadorHTML();
    mudaTela({'de': prisao, 'para': espera});
});
botaoRestart.addEventListener('click', () => {
    restartJogo();
    // textoProximoJogadorHTML();
    mudaTela({'de': fim, 'para': configuracoes});
});
botaoVoltarMenu.addEventListener('click', () => {
    mudaTela({'de': fim, 'para': configuracoes});
});

// Carregamento de página
body.addEventListener('load', carregaModos() );