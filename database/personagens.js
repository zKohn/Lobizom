export class Personagem{
    constructor(){
    }
    gera(personagemNome){
        switch(personagemNome){
            case 'Lobo': return {
                "nome": "Lobo",
                "descricao": "Você é o clássico vilão. Não deixem que te descubram. Clique em quem irá assassinar.",
                "time": "mal",
                "funcao": "assassino",
                "vitoria": "time",
                "status": {
                    "vida": 1,
                    "assassinavel": false,
                    "valor_votos": 1,
                    "preso": false
                },
                "acao": {
                    "alvo": false
                },
                "efeitos": []
            }
            case 'Morador': return {
                "nome": "Morador",
                "descricao": "Você é do lado bom. Às vezes recebe mensagens dos vizinhos. Aguarde para votar e derrotar o mal.",
                "time": "bem",
                "funcao": "morador",
                "vitoria": "time",
                "status": {
                    "vida": 1,
                    "assassinavel": true,
                    "valor_votos": 1,
                    "preso": false
                },
                "acao": {},
                "efeitos": []
            }
            case 'Anjo da Guarda': return {
                "nome": "Anjo da Guarda",
                "descricao": "Você é do lado bom. Clique para acompanhar uma pessoa e protegê-la de assassinos.",
                "time": "bem",
                "funcao": "protetor",
                "vitoria": "time",
                "status": {
                    "vida": 1,
                    "assassinavel": true,
                    "valor_votos": 1,
                    "preso": false
                },
                "acao": {},
                "efeitos": []
            }
            case 'Bobo': return {
                "nome": "Bobo",
                "descricao": "Você não pertence a um lado. Seu personagem é bobo e sua condição de vitória é ser preso.",
                "time": "solo",
                "funcao": "nada",
                "vitoria": "preso",
                "status": {
                    "vida": 1,
                    "assassinavel": true,
                    "valor_votos": 1,
                    "preso": false
                },
                "acao": {},
                "efeitos": []
            }
        }
    }
}