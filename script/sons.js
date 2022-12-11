const audioPrincipalHTML = document.querySelector('audio.principal');
const botaoPauseHTML = document.querySelector('button.pause');

const playAudioTransicao = () => {
    const audio = new Audio('../media/Mecanico.3gpp');
    audio.load();
    audio.volume *= 0.3;
    audio.currentTime = 0.28;
    audio.play();
}

const playAudioBolha = () => {
    const audio = new Audio('../media/bolha.mp3');
    audio.load();
    audio.currentTime = 0.18;
    audio.play();
}

botaoPauseHTML.addEventListener('click', () => {
    if(!audioPrincipalHTML.paused){
        audioPrincipalHTML.pause();
        botaoPauseHTML.innerHTML = '🔇';
        return;
    }
    botaoPauseHTML.innerHTML = '🔊';
    audioPrincipalHTML.currentTime = 0;
    audioPrincipalHTML.play();
});