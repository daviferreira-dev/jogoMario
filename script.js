// ─── DIFICULDADE ───
const dificuldades = {
  facil:   { pipeDuration: '2.8s' },
  medio:   { pipeDuration: '1.5s' },
  dificil: { pipeDuration: '0.85s' },
};

let dificuldadeSelecionada = null;
let gameLoop = null;
let gameStarted = false;
let menuStage = 'press'; // 'press' | 'select'

// ─── FRASES ESTILO DARK SOULS ───
const frasesDarkSouls = [
  "A chama se apaga, mas a jornada não termina.",
  "Todo herói cai. Apenas os persistentes se levantam.",
  "A derrota é apenas o início de uma nova tentativa.",
  "Até os maiores guerreiros conhecem o sabor da terra.",
  "O cano não tem piedade. O cano nunca terá.",
  "Você foi consumido pela escuridão... por um cano.",
  "A morte não é o fim. É apenas um professor severo.",
  "Poucos sobrevivem à primeira vez. Nenhum desiste.",
  "O mundo é implacável. Você também pode ser.",
  "A glória aguarda aqueles que ousam tentar novamente.",
  "Cada queda forja um guerreiro mais forte.",
  "O esquecimento te aguarda... ou a vitória.",
];

// ─── TRILHA SONORA YOU DIED (MP3 REAL) ───
const youDiedAudio = new Audio('YOU_DIED__HD_.mp3');
youDiedAudio.volume = 1.0;

function tocarSomYouDied() {
  youDiedAudio.currentTime = 0;
  youDiedAudio.play().catch(() => {
    // Autoplay bloqueado pelo navegador — toca na próxima interação
    document.addEventListener('click', () => {
      youDiedAudio.currentTime = 0;
      youDiedAudio.play();
    }, { once: true });
  });
}

// ─── PARTÍCULAS DE CINZA FLUTUANTES ───
(function initParticles() {
  const canvas = document.getElementById('menuParticles');
  if (!canvas) return;
  const ctx2d = canvas.getContext('2d');
  let W, H, particles = [];

  const resize = () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x     = Math.random() * W;
      this.y     = init ? Math.random() * H : H + 10;
      this.size  = Math.random() * 1.8 + 0.3;
      this.speedY= -(Math.random() * 0.4 + 0.15);
      this.speedX= (Math.random() - 0.5) * 0.2;
      this.alpha = Math.random() * 0.5 + 0.05;
      const r = 180 + (Math.random() * 60 | 0);
      const g = 150 + (Math.random() * 50 | 0);
      const b = 80  + (Math.random() * 40 | 0);
      this.color = `rgba(${r},${g},${b},`;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx2d.beginPath();
      ctx2d.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx2d.fillStyle = this.color + this.alpha + ')';
      ctx2d.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  (function loop() {
    ctx2d.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
})();

// ─── ELEMENTOS ───
const menuScreen     = document.getElementById('menuScreen');
const menuPressStart = document.getElementById('menuPressStart');
const menuSelectWrap = document.getElementById('menuSelectWrap');
const gameBoard      = document.getElementById('gameBoard');
const youDied        = document.getElementById('youDiedScreen');
const soulsPhrase    = document.getElementById('soulsPhrase');
const startBtn       = document.getElementById('startBtn');
const restartBtn     = document.getElementById('restartBtn');
const menuBtn        = document.getElementById('menuBtn');
const diffBtns       = document.querySelectorAll('.diff-btn');
const mario          = document.getElementById('mario');
const pipe           = document.getElementById('pipe');

// ─── "PRESSIONE QUALQUER TECLA" → MOSTRA SELEÇÃO ───
function avancarMenuParaSelecao() {
  if (menuStage !== 'press') return;
  menuStage = 'select';
  menuPressStart.style.transition = 'opacity 0.4s';
  menuPressStart.style.opacity = '0';
  setTimeout(() => {
    menuPressStart.style.display = 'none';
    menuSelectWrap.style.display = 'flex';
  }, 400);
}

menuPressStart.addEventListener('click', avancarMenuParaSelecao);

// ─── SELEÇÃO DE DIFICULDADE ───
diffBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    diffBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    dificuldadeSelecionada = btn.dataset.difficulty;
    startBtn.disabled = false;
  });
});

// ─── INICIAR JOGO ───
startBtn.addEventListener('click', () => {
  if (!dificuldadeSelecionada) return;
  menuScreen.style.display = 'none';
  gameBoard.style.display = 'block';
  iniciarJogo();
});

function iniciarJogo() {
  const config = dificuldades[dificuldadeSelecionada];
  mario.src = './assets/imgs/mario.gif';
  mario.style.width = '150px';
  mario.style.marginLeft = '';
  mario.style.animation = '';
  mario.style.left = '';
  mario.style.bottom = '';
  pipe.style.animation = `pipe-animation ${config.pipeDuration} infinite linear`;
  pipe.style.left = '';
  document.querySelector('.nuvems').style.animation = 'nuvems-animation 20s infinite linear';
  gameStarted = true;
  gameLoop = setInterval(verificarColisao, 10);
}

// ─── PULO ───
const pulo = () => {
  if (!gameStarted) return;
  mario.classList.add('pulo');
  setTimeout(() => mario.classList.remove('pulo'), 500);
};

document.addEventListener('keydown', (e) => {
  if (menuStage === 'press' && menuScreen.style.display !== 'none') {
    avancarMenuParaSelecao();
    return;
  }
  if (e.code === 'Space' || e.code === 'ArrowUp') pulo();
});

document.addEventListener('touchstart', () => {
  if (menuStage === 'press' && menuScreen.style.display !== 'none') {
    avancarMenuParaSelecao();
    return;
  }
  pulo();
});

// ─── LOOP DE COLISÃO ───
function verificarColisao() {
  const pipePosition  = pipe.offsetLeft;
  const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
  if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
    pipe.style.animation = 'none';
    pipe.style.left = `${pipePosition}px`;
    mario.style.animation = 'none';
    mario.style.bottom = `${marioPosition}px`;
    mario.src = './assets/imgs/game-over.png';
    mario.style.width = '75px';
    mario.style.marginLeft = '50px';
    clearInterval(gameLoop);
    gameStarted = false;
    const frase = frasesDarkSouls[Math.floor(Math.random() * frasesDarkSouls.length)];
    soulsPhrase.textContent = `" ${frase} "`;
    setTimeout(() => {
      tocarSomYouDied();
      youDied.classList.add('visible');
    }, 400);
  }
}

// ─── REINICIAR ───
restartBtn.addEventListener('click', () => {
  youDied.classList.remove('visible');
  setTimeout(() => iniciarJogo(), 300);
});

// ─── VOLTAR AO MENU ───
menuBtn.addEventListener('click', () => {
  youDied.classList.remove('visible');
  gameBoard.style.display = 'none';
  diffBtns.forEach(b => b.classList.remove('selected'));
  dificuldadeSelecionada = null;
  startBtn.disabled = true;
  // Reseta menu para estado inicial
  menuStage = 'press';
  menuSelectWrap.style.display = 'none';
  menuPressStart.style.display = '';
  menuPressStart.style.opacity = '';
  setTimeout(() => {
    menuScreen.style.display = 'flex';
  }, 300);
});