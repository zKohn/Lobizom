const body = document.querySelector('body');
const header = document.querySelector('header');
const botaoBlackMode = header.querySelector('button.blackMode');

botaoBlackMode.addEventListener('click', () => {
    body.classList.toggle('blackMode');
})