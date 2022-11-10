import objtimes from '../database/times.json' assert {'type': 'json'}
import { Personagem } from '../database/personagens.js'
import { funcao, modosDeJogo, auxiliarVotar, auxiliarVitoria } from './funcoes.js';

// Seletores para interação com HTML
const inicial = document.querySelector('main#inicial');
const espera = document.querySelector('main#espera');
const classe = document.querySelector('main#classe');
const resumo =  document.querySelector('main#resumo');
const votacao =  document.querySelector('main#votacao');
const prisao =  document.querySelector('main#prisao');
const fim =  document.querySelector('main#fim');
const botaoAddParticipantes = inicial.querySelector('button.add');
const botaoJogar = inicial.querySelector('button.jogar');
const botaoAbrirFuncao = espera.querySelector('button.abrir');
const botaoProximoJogador = classe.querySelector('button.proximo');
const botaoAbrirVotacao = resumo.querySelector('button.votacao');
const botaoVotar = votacao.querySelector('button.votar');
const botaoNovaRodada = prisao.querySelector('button.novaRodada');
const botaoVoltarMenu = fim.querySelector('button.menu');
const botaoRestart = fim.querySelector('button.restart');

// Ambiente de jogo
const personagem = new Personagem();
const times = objtimes.times;
const modo = modosDeJogo;
let modoJogo = "Normal";
let numero = 3;
let vez = 0;
let participantes = {
    array: [],
    ok: []
};
let arrayVotos = [];

// Funções fundamentais
function mudaTela({de, para}){
    de.classList.remove('unlocked');
    para.classList.add('unlocked');
}
const resetarJogo = () => {
    vez = 1;
    participantes.array = [];
    participantes.ok = [];
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
        if(vez > participantes.array.length){
            vez = 0;
            return false;
        }
    }while( participantes.ok[vez-1]===false );
    return true;
}
const textoProximoJogadorHTML = () => {
    let vezHTML = espera.querySelector('section.vez');
    vezHTML.innerHTML = `Passe para ${ participantes.array[vez-1]['nome'] }`;
}
const acaoJogadorPassado = () => {
    participantes = funcao[ participantes.array[vez-1].personagem.funcao ]['acao'](
        participantes,
        vez-1,
    );
}
const finalizaAcoes = () => {
    let novosParticipantes = participantes;
    for(let i=0; i<participantes.array.length; i++){
        novosParticipantes = funcao[ novosParticipantes.array[i].personagem.funcao ]['finaliza_acao'](
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
    for(let i=0; i<times.length; i++){
        qtdPorTime = times[i]['min'] + Math.floor( times[i]['ideal']*numero );
        qtdTotal+=qtdPorTime;
        if(qtdTotal > numero)
            qtdPorTime -= (qtdTotal - numero);
        for(let j=1; j<=qtdPorTime; j++){
            listaNomesPersonagens.push( times[i].personagens[ Math.floor( Math.random()*times[i].personagens.length ) ] );
        }
        if(qtdTotal>=numero) break;
    }
    while(qtdTotal<numero){
        listaNomesPersonagens.push("Morador");
    }
    return embaralha(listaNomesPersonagens);
}
const geraPersonagens = () => {
    let temTodosNomes = true;
    const participantesHTML = inicial.querySelectorAll('input.nome');
    let listaNomesPersonagens = geraPersonagensPorTimes();
    for(let i=0; i<participantesHTML.length; i++){
        const nome = participantesHTML[i].value;
        if(!nome || !temTodosNomes){
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
    return temTodosNomes;
}
const carregaPersonagem = () => {
    const secoes = classe.querySelectorAll('section');
    let pers = participantes.array[vez-1].personagem;
    secoes.forEach(secao => {
        switch(secao.className){
            case 'personagem':
                secao.innerHTML = `${participantes.array[vez-1].nome} é <strong>${pers.nome}</strong>`;
                break;
            case 'descricao':
                secao.innerHTML = !pers.status.preso ? pers.descricao : `Você está preso. Tente acertar a senha de 3 dígitos para sair da prisão.`;
                break;
            case 'botoes':
                secao.innerHTML = funcao[!pers.status.preso ? pers.funcao : 'personagem_preso']['botoes'](participantes) || '';
                break;
        }
    })
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
        secaoAssassinados.innerHTML += `<div class="lado">${a.nome} - <strong>${a.personagemNome}</strong></div>`;
    });
}
const carregaVotacao = () => {
    const secaoParticipantes = votacao.querySelector('section.participantes');
    const secaoVez = votacao.querySelector('section.vez');
    let votaveis = participantes.array.filter( part => participantes.ok.includes(part.nome) );
    secaoParticipantes.innerHTML = auxiliarVotar.botoes(votaveis);
    secaoVez.innerHTML = `Vez de <strong>${participantes.array[vez-1].nome}</strong> votar`;
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
        secaoPreso.innerHTML = 'Ninguém, o resultado foi um empate!';
        return;
    }
    secaoPreso.innerHTML = participantes.array[indicePreso].nome;
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
    let temTodosNomes = geraPersonagens();
    if(!temTodosNomes){
        window.alert('Digite todos os nomes!');
        return;
    }
    textoProximoJogadorHTML();
    mudaTela({'de': inicial, 'para': espera});
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
    if(calculaVencedores(resumo))
        return;
    arrayVotos = [];
    calculaProximaVez();
    carregaVotacao();
    mudaTela({'de': resumo, 'para': votacao});
});
botaoVotar.addEventListener('click', () => {
    arrayVotos.push( votoAnterior() );
    if(!calculaProximaVez()){
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
    textoProximoJogadorHTML();
    mudaTela({'de': fim, 'para': espera});
});
botaoVoltarMenu.addEventListener('click', () => {
    mudaTela({'de': fim, 'para': inicial});
});

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
    secaoVencedores.innerHTML = "VENCEDORES:";
    ganhadores.forEach(g => {
        secaoVencedores.innerHTML += `<div class="lado">${g.nome} - <strong>${g.personagem.nome}</strong></div>`;
    });
    mudaTela({ 'de': telaAnterior, 'para': fim});
}