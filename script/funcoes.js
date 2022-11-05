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
    'botoesHTML': (matrizBotoes) => {
        let str = `<section class="lado">
                    ${((matrizBotoes.botoes).toString()).replaceAll(',','')}
                </section>`;
                console.log(str);
        return str;
    },
    'geraBotaoReferencia': ({referencia, texto}) => {
        return `<label class="${referencia} container">
            <div>${texto || 'bolinaDeGorfeERROR'}</div>
            <input name="${referencia}" class="${texto}" type="radio">
        </label>`;
    },
    'geraMatrizBotoes': ({arrayReferidos, referencia}) => {
        let matrizBotoes = {
            'botoes': [],
            'seletor': `label.${referencia} input:checked`
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
        let checked = document.querySelector(matrizBotoes.seletor);
        console.log(checked);

        return checked.className || false;
    }
}

export const funcao = {
    'assassino': {
        'matrizBotoes': false,
        'botoes': (participantes, pers) => {
            let assassinaveis = FunctionReference.filtrarPorStatus({participantes, 'status': 'assassinavel'});
            funcao.assassino.matrizBotoes = FunctionReference.geraReferenciaDeAcao({
                'array': assassinaveis, 
                'acao': 'alvo'
            });
            return FunctionReference.botoesHTML(funcao.assassino.matrizBotoes);
        },
        // 'botoes': (participantes, pers) => {
        //     let assassinaveis = participantes['array'].filter(
        //         p => p.personagem.status.assassinavel
        //     );
        //     let aliados = participantes['array'].filter(
        //         p => pers.time=='mal'&&p.personagem.time=='mal'
        //     );
        //     let str = '<section class="lado">';
        //     assassinaveis.forEach(p => {
        //         if(aliados.indexOf(p)==-1){
        //             str += `<label class="alvo container">
        //                 <div class="nome">${p.nome}</div>
        //                 <input type="checkbox">
        //             </label>`;
        //         }else{
        //             str += `<label class="aliado container">
        //             <div class="nome">*${p.nome}</div>
        //             <input type="checkbox">
        //         </label>`;
        //         }
        //     });
        //     return str+'</section>';
        // },
        'acao': (participantes, pers) => {
            pers.acao.alvo = FunctionReference.getReferenciaHTML(funcao.assassino.matrizBotoes);
            return pers;
            participantes.array.filter(p => p.nome==pers.acao.alvo)
            participantes.array[alvo].personagem.status.vida--;
        }
    },
    'nada': {
        'matrizBotoes': false,
        'botoes': (participantes, pers) => {
            return false;
        },
        'acao': (participantes, pers) => {
            return pers;
        },
    }
}