const body = document.querySelector('body');
const header = document.querySelector('header');
const botaoBlackMode = header.querySelector('button.fundo');
const totalFundos = 8;
let indice = 1;

function selecionaFundo(){
    switch(indice){
        case 1: 
            body.classList.add('blackMode');
            break;
        case 2:
            body.classList.remove('blackMode');
            body.classList.add('imagem', 'imagem1');
            break;
        default:
            if(indice<=totalFundos){
                body.classList.remove(`imagem${indice-2}`);
                body.classList.add(`imagem${indice-1}`);
                break;
            }
            body.classList.remove(`imagem${indice-2}`, 'imagem');
            indice = 0;
        }
}

botaoBlackMode.addEventListener('click', () => {
    indice++;
    selecionaFundo();
});

body.addEventListener('load', selecionaFundo() );