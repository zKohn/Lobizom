let FunctionReference = {
    'filtrarPorStatus': ({participantes, status}) => {
        let filtrados = participantes['array'].filter(
            p => p.personagem['status'][status]
        );
        return filtrados;
    },
    'filtrarPorTime': ({participantes, time}) => {
        let filtrados = participantes['array'].filter(
            p => p.personagem[time]
        );
        return filtrados;
    },
    'botoesHTML': (matrizBotoes) => {  // Mudei pra teste
        let str = `<section class="lado">
                    ${((matrizBotoes.botoes).toString()).replaceAll(',','')}
                </section>`;
                console.log(str);
        return str;
    },
    'geraBotaoReferencia': ({referencia, texto}) => { //COPIAR
        return `<label class="${referencia} container">
            <div>${texto || 'bolinaDeGorfeERROR'}</div>
            <input name="${referencia}" class="${texto}" type="radio">
        </label>`;
    },
    'geraMatrizBotoes': ({arrayReferidos, referencia}) => { //OK, MUDEI PRA TESTE
        let matrizBotoes = {
            'botoes': [],
            'filtro': `label.${referencia} input:checked`
        };
        arrayReferidos.forEach(referido => {
            matrizBotoes.botoes.push(
                FunctionReference.geraBotaoReferencia({referencia, 'texto': referido.nome})
            );
        });
        return matrizBotoes;
    },
    'geraReferenciaDeAcao': ({array, acao}) => {
        return FunctionReference.geraMatrizBotoes({
            'arrayReferidos': array, 
            'referencia': acao
        });
    },
    'getReferenciaHTML': (matrizBotoes) => {
        let checked = document.querySelector(matrizBotoes.filtro) || false
        return checked;
    }
}

function t1(){
    let matrizBotoes = FunctionReference.geraMatrizBotoes({
        'arrayReferidos': ['um','dois','tres','quatro','cinco'], 
        'referencia': 'alvo'
    });
    let secao = document.querySelector('section');
    secao.innerHTML = FunctionReference.botoesHTML(matrizBotoes);
    console.log(matrizBotoes);
    return matrizBotoes;
}

t1();
