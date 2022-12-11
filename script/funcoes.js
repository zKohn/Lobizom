export const FunctionReference = {
    'botoesHTML': (matrizBotoes, lado=true) => {
        let str = `
        <section class="${lado==true ? 'lado' : ''}">
            ${((matrizBotoes).toString()).replaceAll(',','')}
        </section>`;
        return str;
    },
    'geraBotaoReferencia': ({referencia, identificador, som}) => {
        return `
        <label class="${referencia} container">
            <div>${identificador || 'bolinaDeGorfeERROR'}</div>
            <input name="${referencia}" class="${identificador}" type="radio" onchange="${som==true?'playAudioTransicao()':''}">
        </label>`;
    },
    'geraMatrizBotoes': ({arrayReferidos, referencia, som=false}) => {
        let matrizBotoes = [];
        arrayReferidos.forEach(referido => {
            matrizBotoes.push(
                FunctionReference.geraBotaoReferencia({referencia, 'identificador': referido, som})
            );
        });
        return matrizBotoes;
    },
    'getClicado': (referencia) => {
        let checked = document.querySelector(`label.${referencia} input:checked`);
        if(!checked) return false;
        return checked.className;
    }
}

export const auxiliarPersonagem = {
    'personagem': (participantes, vez) => {
        return `${participantes.array[vez-1].nome} é <i>${participantes.array[vez-1].personagem.nome}</i>`;
    },
    'descricao': (participantes, vez) => {
        if(participantes.ok[vez-1])
            return participantes.array[vez-1].personagem.descricao  || '';
        if(participantes.array[vez-1].personagem.status.preso)
            return `Você está preso. Tente acertar a senha da cela para sair da prisão.`;
        return `Seu personagem foi assassinado. Tente acertar o código da vida para renascer.`;
    },
    'interacoes': (participantes, vez) => {
        if(participantes.ok[vez-1])
            return funcao[ participantes.array[vez-1].personagem.funcao ].interacoes(participantes) || '';
        return funcao['password'].interacoes(participantes);
    }
}

export const auxiliarVotar = {
    'interacoes': (participantes) => {
        let votaveis = participantes.ok.filter( part => part!==false);
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
        return voto;
    }
}

export const auxiliarVitoria = {
    'time': (participantes) => {
        const timeBemOk = participantes.array.filter((part,i) => part.personagem.time=='bem'&&participantes.ok[i]!==false);
        const timeMalOk = participantes.array.filter((part,i) => part.personagem.time=='mal'&&participantes.ok[i]!==false);
        if(timeMalOk.length==0&&timeBemOk.length>0)
            return participantes.array.filter(part => part.personagem.time=='bem');
        if(timeMalOk.length>0&&timeMalOk.length>timeBemOk.length)
            return participantes.array.filter(part => part.personagem.time=='mal');
        return false;
    },
    'preso': (participantes) => {
        const ganhadores = participantes.array.filter(part => part.personagem.vitoria=='preso'&&part.personagem.status.preso);
        if(ganhadores.length!=0)
            return ganhadores;
        return false;
    },
    'unico': (participantes) => {
        const ganhador = participantes.array.filter((part,i) => part.personagem.vitoria=='unico'||participantes.ok[i]!==false);
        if(ganhador.length!=1 || ganhador[0].personagem.vitoria!='unico')
            return false;
        return ganhador;
    },
    'testar': (participantes) => {
        return auxiliarVitoria.preso(participantes) ||
            auxiliarVitoria.unico(participantes) ||
            auxiliarVitoria.time(participantes) ||
            false;
    }

}

export const funcao = {
    'password': {
        'interacoes': () => {
            return `
            <div class="lado">
                <select class="password">
                    <option value=0 selected>0</option>
                    <option value=1>1</option>
                </select>
                <select class="password">
                    <option value=0 selected>0</option>
                    <option value=1>1</option>
                </select>
            </div>`;
        },
        'acao': (participantes, indicePart) => {
            let senha = [Math.floor(Math.random()*2), Math.floor(Math.random()*2)];
            console.log('senha sorteada: ');
            console.log(senha);
            const selectsHTML = document.querySelectorAll('select.password');
            let tentativa = [];
            for(let i=0; i<selectsHTML.length; i++){
                let s = selectsHTML[i];
                tentativa.push( s.options[s.selectedIndex].value );
                console.log('Vetor tentativa: ');
                console.log(tentativa);
                if(tentativa[i]!=senha[i])
                    return participantes;
            }
            if(participantes.array[indicePart].personagem.status.preso)
                participantes.array[indicePart].personagem.efeitos.push('fuga');
            else
                participantes.array[indicePart].personagem.efeitos.push('renasce');
            return participantes;
        },
        'finaliza_acao': (participantes, indicePart) => {
            return participantes;
        },
    },
    'assassino': {
        'interacoes': (participantes) => {
            let assassinaveis = [];
            participantes['array'].forEach(part => {
                if(part.personagem.status.assassinavel && participantes.ok.includes(part.nome))
                    assassinaveis.push(part.nome);
            });
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
                    break;
                }
            }
            participantes.array[indicePart].personagem.acao.alvo = false;
            if(indiceAlvo===false)
                return participantes;
            if( !(participantes.array[indiceAlvo].personagem.efeitos.includes('protecao')) ) 
                participantes.array[indiceAlvo].personagem.status.vida--;
            return participantes;
        }
    },
    'nada': {
        'interacoes': (participantes) => {
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
        'interacoes': (participantes) => {
            const chanceDeMensagem = participantes.array.length-2;
            if( Math.floor(Math.random()*chanceDeMensagem)!=0 || participantes.array.length<6 )
                return false;
            const indiceAssunto = Math.floor(Math.random()*participantes.array.length); 
            let mensagem = '<div><i>MENSAGEM</i>: ';
            switch(participantes.array[indiceAssunto].personagem.funcao){
                case "morador":
                    mensagem+=`<div class="lado">Os vizinhos mais antigos dizem que <i>${participantes.array[indiceAssunto].nome}</i> sempre foi bom morador.</div>`
                    break;
                default:
                    if(participantes.array[indiceAssunto].personagem.status.preso){
                        if(participantes.array[indiceAssunto].personagem.time=="bem")
                            mensagem+=`<div class="lado">Há boatos de que <i>${participantes.array[indiceAssunto].nome}</i> foi preso injustamente.</div>`;
                        else
                            mensagem+=`<div class="lado">Alguns vizinhos estavam incomodados com <i>${participantes.array[indiceAssunto].nome}</i>. Dizem que ele não era do bem.</div>`
                        break;
                    }
                    mensagem+=`<div class="lado">Você viu <i>${participantes.array[indiceAssunto].nome}</i> agindo estranho. Percebeu que ele não é um morador.</div>`;
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
        'interacoes': (participantes) => {
            // const protegiveis = participantes.array.filter(part => participantes.ok.includes(part.nome)&&part.personagem.funcao!='protetor');
            let protegiveis = [];
            participantes.array.forEach(part => {
                if(participantes.ok.includes(part.nome)&&part.personagem.funcao!='protetor')
                    protegiveis.push(part.nome);
            })
            let matrizBotoes = FunctionReference.geraMatrizBotoes({
                'arrayReferidos': protegiveis,
                'referencia': 'protecao'
            });
            return FunctionReference.botoesHTML(matrizBotoes);
        },
        'acao': (participantes, indicePart) => {
            let protegido = FunctionReference.getClicado('protecao');
            let indiceProtegido;
            if(protegido===false) 
                return participantes;
            for(let i=0; i<participantes.array.length; i++){
                if(participantes.array[i].nome==protegido){
                    indiceProtegido = i;
                    break;
                }
            }
            participantes.array[indiceProtegido].personagem.efeitos.push('protecao');
            return participantes;
        },
        'finaliza_acao': (participantes, indicePart) => {
            return participantes;
        }
    },
    'investigar': {
        'interacoes': () => {
            return `
            <div class="lado">
                <div>Descrição: </div>
                <select class="tarefa">
                    <option value=0 selected>0</option>
                    <option value=1>1</option>
                </select>
                <select class="tarefa">
                    <option value=0 selected>0</option>
                    <option value=1>1</option>
                </select>
                <select class="tarefa">
                    <option value=0 selected>0</option>
                    <option value=1>1</option>
                </select>
            </div>`;
        },
        'acao': (participantes, indicePart) => {
            const senha = [Math.floor(Math.random()*2), Math.floor(Math.random()*2), Math.floor(Math.random()*2)];
            const selectsHTML = document.querySelectorAll('select.tarefa');
            let tentativa = [];
            for(let i=0; i<selectsHTML.length; i++){
                tentativa.push( s.options[s.selectedIndex].value );
                if(tentativa[i]!=senha[i])
                    return participantes;
            }
            return participantes;
        },
        'finaliza_acao': (participantes, indicePart) => {
            return participantes;
        },
    },
}