export class Personagem{
    gera(personagemNome){
        switch(personagemNome){
            case 'Lobo': return this.lobo();
            case 'Morador': return this.morador();
            case 'Anjo da Guarda': return this.anjo();
            case 'Bobo': return this.bobo();
            case 'Inocente': return this.inocente();
            case 'Impostor': return this.impostor();
        }
    }
    lobo(){
        return {
            "nome": "Lobo",
            "descricao": "Você é o clássico vilão. Não deixem que te descubram. Clique em quem irá assassinar.",
            "time": "mal",
            "funcao": "assassino",
            "vitoria": "time",
            "status": {
                "vida": 1,
                "assassinavel": false,
                "preso": false
            },
            "acao": {
                "alvo": false
            },
            "efeitos": []
        }
    }
    morador(){
        return {
            "nome": "Morador",
            "descricao": "Você é do lado bom. Às vezes recebe mensagens dos vizinhos. Aguarde para votar e derrotar o mal.",
            "time": "bem",
            "funcao": "morador",
            "vitoria": "time",
            "status": {
                "vida": 1,
                "assassinavel": true,
                "preso": false
            },
            "acao": {},
            "efeitos": []
        }
    }
    anjo(){
        return {
            "nome": "Anjo da Guarda",
            "descricao": "Você é do lado bom. Clique para acompanhar uma pessoa e protegê-la de assassinos.",
            "time": "bem",
            "funcao": "protetor",
            "vitoria": "time",
            "status": {
                "vida": 1,
                "assassinavel": true,
                "preso": false
            },
            "acao": {},
            "efeitos": []
        }
    }
    bobo(){
        return {
            "nome": "Bobo",
            "descricao": "Você não pertence a um lado. Seu personagem é bobo e sua condição de vitória é ser preso.",
            "time": "solo",
            "funcao": "nada",
            "vitoria": "preso",
            "status": {
                "vida": 1,
                "assassinavel": true,
                "preso": false
            },
            "acao": {},
            "efeitos": []
        }
    }
    inocente(){
        return {
            "nome": "Inocente",
            "descricao": "Se proteja do Impostor.",
            "time": "bem",
            "funcao": "nada",
            "vitoria": "time",
            "status": {
                "vida": 1,
                "assassinavel": true,
                "preso": false
            },
            "acao": {
                "local": false,
                "dica": 0
            },
            "efeitos": []
        }
    }
    impostor(){
        return {
            "nome": "Impostor",
            "descricao": "Assassine os Inocentes e blefe nas votações.",
            "time": "mal",
            "funcao": "assassino",
            "vitoria": "unico",
            "status": {
                "vida": 1,
                "assassinavel": false,
                "preso": false
            },
            "acao": {
                "alvo": false,

            },
            "efeitos": []
        }
    }
}