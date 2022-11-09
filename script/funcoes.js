let FunctionReference = {
    'botoesHTML': (matrizBotoes) => {
        let str = `<section class="lado">
                    ${((matrizBotoes).toString()).replaceAll(',','')}
                </section>`;
        return str;
    },
    'geraBotaoReferencia': ({referencia, identificador}) => {
        return `<label class="${referencia} container">
            <div>${identificador || 'bolinaDeGorfeERROR'}</div>
            <input name="${referencia}" class="${identificador}" type="radio">
        </label>`;
    },
    'geraMatrizBotoes': ({arrayReferidos, referencia}) => {
        let matrizBotoes = [];
        arrayReferidos.forEach(referido => {
            matrizBotoes.push(
                FunctionReference.geraBotaoReferencia({referencia, 'identificador': referido.nome})
            );
        });
        return matrizBotoes;
    },
    'getClicado': (referencia) => {
        let checked = document.querySelector(`label.${referencia} input:checked`);
        console.log(checked);
        if(!checked) return false;
        return checked.className;
    }
}

export const auxiliarVotar = {
    'botoes': (votaveis) => {
        let matrizBotoes = FunctionReference.geraMatrizBotoes({
            'arrayReferidos': votaveis,
            'referencia': 'voto'
        });
        return FunctionReference.botoesHTML(matrizBotoes);
    },
    'votado': (participantes) => {
        let nomeVotado = FunctionReference.getClicado('voto');
        let voto = false;
        for(let i=0; i<participantes.array.length; i++){
            if(participantes.array[i].nome==nomeVotado){
                voto=i;
                break;
            }
        }
        console.log('votado, em funçoes. Olhar o nome:');
        console.log(voto);
        return voto;
    }
}

export const funcao = {
    'assassino': {
        'botoes': (participantes) => {
            let assassinaveis = participantes['array'].filter(
                part => part.personagem.status.assassinavel && 
                participantes.ok.includes( part.nome )
            );
            let matrizBotoes = FunctionReference.geraMatrizBotoes({
                'arrayReferidos': assassinaveis,
                'referencia': 'alvo'
            });
            return FunctionReference.botoesHTML(matrizBotoes);
        },
        'acao': (participantes, indicePart) => {
            participantes.array[indicePart].personagem.acao.alvo = FunctionReference.getClicado('alvo');
            return participantes;
        },
        'finaliza_acao': (participantes, indicePart) => {
            let indiceAlvo=false;
            for(let i=0; i<participantes.array.length; i++){
                if(participantes.array[i].nome==participantes.array[indicePart].personagem.acao.alvo){
                    indiceAlvo = i;
                    console.log('Alvo = '+indiceAlvo)
                    break;
                }
            }
            if(indiceAlvo===false)
                return participantes;
            if( !(participantes.array[indiceAlvo].personagem.efeitos.includes('protecao')) ) 
                participantes.array[indiceAlvo].personagem.status.vida--;
            return participantes;
        }
    },
    'nada': {
        'botoes': (participantes) => {
            return false;
        },
        'acao': (participantes, indicePart) => {
            return participantes;
        },
        'finaliza_acao': (participantes, indicePart) => {
            return participantes;
        },
    },
    'morador': {
        'botoes': (participantes) => {
            const chanceDeMensagem = 3;
            if( Math.floor(Math.random()*chanceDeMensagem) != 0 || participantes.array.length<6)
                return false;
            const indiceAssunto = Math.floor(Math.random()*participantes.array.length); 
            let mensagem = '<div><strong>MENSAGEM</strong>: ';
            switch(participantes.array[indiceAssunto].personagem.funcao){
                case "morador":
                    mensagem+=`Os vizinhos mais antigos dizem que <strong>${participantes.array[indiceAssunto].nome}</strong> sempre foi bom morador`
                    break;
                default:
                    if(participantes.array[indiceAssunto].personagem.status.preso){
                        if(participantes.array[indiceAssunto].personagem.time=="bem")
                            mensagem+=`Há boatos de que <strong>${participantes.array[indiceAssunto].nome}</strong> foi preso injustamente`;
                        else
                            mensagem+=`Alguns vizinhos estavam incomodados com <strong>${participantes.array[indiceAssunto].nome}</strong>. Dizem que ele não era do bem.`
                        break;
                    }
                    mensagem+=`Você viu <strong>${participantes.array[indiceAssunto].nome}</strong> agindo de maneira suspeita. Ele pode ser bom, mas não é um morador.`;

            }
            return mensagem;
        },
        'acao': (participantes, indicePart) => {
            return participantes;
        },
        'finaliza_acao': (participantes, indicePart) => {
            return participantes;
        },
    },
    'protetor': {
        'botoes': (participantes) => {
            let matrizBotoes = FunctionReference.geraMatrizBotoes({
                'arrayReferidos': participantes.array,
                'referencia': 'protecao'
            });
            return FunctionReference.botoesHTML(matrizBotoes);
        },
        'acao': (participantes, indicePart) => {
            let protegido = FunctionReference.getClicado('protecao');
            let indiceProtegido;
            console.log('Acao dos protetores:'+protegido);
            if(protegido===false) 
                return participantes;
            for(let i=0; i<participantes.array.length; i++){
                if(participantes.array[i].nome==protegido){
                    indiceProtegido = i;
                    console.log(indiceProtegido);
                    break;
                }
            }
            console.log('Protegido por ' + participantes.array[indicePart].nome);
            console.log(participantes.array[indiceProtegido].nome);
            participantes.array[indiceProtegido].personagem.efeitos.push('protecao');
            return participantes;
        },
        'finaliza_acao': (participantes, indicePart) => {
            return participantes;
        }
    },
}