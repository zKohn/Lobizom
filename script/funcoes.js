export const funcao = {
    'assassino': {
        'botoes': (participantes, pers) => {
            let assassinaveis = participantes['array'].filter(
                p => p.personagem.status.assassinavel
            );
            let aliados = participantes['array'].filter(
                p => pers.time=='mal'&&p.personagem.time=='mal'
            );
            let str = '<section class="lado">';
            assassinaveis.forEach(p => {
                if(aliados.indexOf(p)==-1){
                    str += `<label class="alvo container">
                        <div class="nome">${p.nome}</div>
                        <input type="checkbox">
                    </label>`;
                }else{
                    str += `<label class="aliado container">
                    <div class="nome">*${p.nome}</div>
                    <input type="checkbox">
                </label>`;
                }
            });
            return str+'</section>';
        },
        'acao': (participantes, pers) => {
            participantes.array.filter(p => p.nome==pers.acao.alvo)
            participantes.array[alvo].personagem.status.vida--;
        }
    },
    'nada': {
        'classBotoes': '',
        'botoes': (participantes, pers) => {
            return '';
        },
        'acao': false
    }
}