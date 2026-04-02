// ════════════════════════════════════════════
//  SUPER MARIO SOULS — BOWSER'S CASTLE EDITION
//  Módulos: Menu · Dificuldade · Personagem
//           Jogo · Obstáculos · Power-ups
//           Vidas · Pontuação · Audio · VFX
// ════════════════════════════════════════════

// ─── ESTADO GLOBAL ───────────────────────────
const estado = {
  tela:                'menu',   // menu | dificuldade | personagem | jogo | morto
  dificuldade:         null,
  personagem:          null,
  jogando:             false,
  vidas:               3,
  pontos:              0,
  invencivel:          false,
  invencivelTimer:     null,
  puloAltoAtivo:       false,
  puloAltoTimer:       null,
  slowMotionAtivo:     false,
  slowMotionTimer:     null,
  gameLoopInterval:    null,
  scoreInterval:       null,
  obsInterval:         null,
  powerupInterval:     null,
  obstaculoAtual:      0,
};

// ─── CONFIGS POR DIFICULDADE ─────────────────
const DIFICULDADES = {
  facil:   { obsMin: 2800, obsMax: 4200, obsSpeeds: ['3.5s','3s','2.8s'],   pontosMult: 1   },
  medio:   { obsMin: 1800, obsMax: 2800, obsSpeeds: ['2.0s','1.8s','1.6s'], pontosMult: 1.5 },
  dificil: { obsMin: 900,  obsMax: 1600, obsSpeeds: ['1.1s','0.95s','0.8s'],pontosMult: 2   },
};

// ─── CONFIGS POR PERSONAGEM ──────────────────
const PERSONAGENS = {
  mario: {
    sprite:      './assets/imgs/mario.gif',
    spriteOver:  './assets/imgs/game-over.png',
    jumpHeight:  '250px',
    jumpDuration:'500ms',
    frases: [
      "Até o Mario conhece a derrota.",
      "O chapéu vermelho caiu... mas a chama persiste.",
      "Bowser venceu desta vez. Só desta vez.",
      "O encanador jaz vencido, mas não esquecido.",
      "Mamma mia... a morte veio rápido.",
    ],
  },
  luigi: {
    sprite:      './assets/imgs/luigi.gif',
    spriteOver:  './assets/imgs/game-over-luigi.png',
    jumpHeight:  '300px',
    jumpDuration:'600ms',
    frases: [
      "Luigi caiu, mas seu medo era justificado.",
      "O irmão verde não resistiu às chamas.",
      "Nem o pulo mais alto escapa do destino.",
      "Luigi sempre soube que este castelo era armadilha.",
      "O verde murchou no calor de Bowser.",
    ],
  },
};

// ─── FRASES GENÉRICAS DARK SOULS ─────────────
const FRASES_GERAIS = [
  "A chama se apaga, mas a jornada não termina.",
  "Todo herói cai. Apenas os persistentes se levantam.",
  "O fogo não tem piedade. O fogo nunca terá.",
  "Você foi consumido pela escuridão... por um cano de lava.",
  "A morte não é o fim. É apenas um professor severo.",
  "Poucos sobrevivem à primeira vez. Nenhum desiste.",
  "O castelo de Bowser é implacável. Você também pode ser.",
  "A glória aguarda aqueles que ousam tentar novamente.",
  "Cada queda forja um guerreiro mais forte.",
  "O esquecimento te aguarda... ou a vitória.",
];

// ─── TIPOS DE OBSTÁCULO (em sequência) ───────
const TIPOS_OBS = ['pipe', 'fireball', 'spike', 'fireball', 'pipe', 'spike'];

// ─── ELEMENTOS DO DOM ────────────────────────
const DOM = {
  screenMenu:       () => document.getElementById('screenMenu'),
  screenDifficulty: () => document.getElementById('screenDifficulty'),
  screenCharacter:  () => document.getElementById('screenCharacter'),
  gameBoard:        () => document.getElementById('gameBoard'),
  youDiedScreen:    () => document.getElementById('youDiedScreen'),

  menuPressStart:   () => document.getElementById('menuPressStart'),
  diffNextBtn:      () => document.getElementById('diffNextBtn'),
  diffBtns:         () => document.querySelectorAll('.diff-btn'),
  charBtns:         () => document.querySelectorAll('.char-btn'),
  charStartBtn:     () => document.getElementById('charStartBtn'),

  player:           () => document.getElementById('player'),
  obstaclesContainer:()=> document.getElementById('obstaclesContainer'),
  powerupsContainer: ()=> document.getElementById('powerupsContainer'),
  damageFlash:      () => document.getElementById('damageFlash'),

  scoreDisplay:     () => document.getElementById('scoreDisplay'),
  heartsDisplay:    () => document.getElementById('heartsDisplay'),
  powerupDisplay:   () => document.getElementById('powerupDisplay'),
  powerupName:      () => document.getElementById('powerupName'),

  youDiedText:      () => document.getElementById('youDiedText'),
  soulsPhrase:      () => document.getElementById('soulsPhrase'),
  diedScoreValue:   () => document.getElementById('diedScoreValue'),
  restartBtn:       () => document.getElementById('restartBtn'),
  menuBtn:          () => document.getElementById('menuBtn'),

  audioMenu:        () => document.getElementById('audioMenu'),
  audioGame:        () => document.getElementById('audioGame'),
  audioDeath:       () => document.getElementById('audioDeath'),
  audioJump:        () => document.getElementById('audioJump'),
  audioDamage:      () => document.getElementById('audioDamage'),
  audioPowerup:     () => document.getElementById('audioPowerup'),
};

// ════════════════════════════════════════════
//  MÓDULO: PARTÍCULAS
// ════════════════════════════════════════════
function initParticulas(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const {
    count   = 80,
    colorFn = () => { const r=180+(Math.random()*60|0),g=150+(Math.random()*50|0),b=80+(Math.random()*40|0); return `rgba(${r},${g},${b},`; },
    speedY  = () => -(Math.random()*0.4+0.15),
    size    = () => Math.random()*1.8+0.3,
  } = options;

  let W, H;
  const resize = () => { W = canvas.width = canvas.offsetWidth || window.innerWidth; H = canvas.height = canvas.offsetHeight || window.innerHeight; };
  window.addEventListener('resize', resize);
  resize();

  class P {
    constructor() { this.reset(true); }
    reset(init=false) {
      this.x = Math.random()*W; this.y = init ? Math.random()*H : H+10;
      this.sz = size(); this.vy = speedY(); this.vx = (Math.random()-0.5)*0.2;
      this.a = Math.random()*0.5+0.05; this.c = colorFn();
    }
    update() { this.y+=this.vy; this.x+=this.vx; if(this.y<-10) this.reset(); }
    draw()   { ctx.beginPath(); ctx.arc(this.x,this.y,this.sz,0,Math.PI*2); ctx.fillStyle=this.c+this.a+')'; ctx.fill(); }
  }

  const ps = Array.from({length:count}, ()=>new P());
  let running = true;
  (function loop() { if(!running) return; ctx.clearRect(0,0,W,H); ps.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(loop); })();
  return () => { running = false; };
}

// Partículas de fogo para o castelo
function initFogoParticulas() {
  const canvas = document.getElementById('castleParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  window.addEventListener('resize', resize);
  resize();

  class Ember {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random()*W;
      this.y  = H - 50 + Math.random()*20;
      this.vy = -(Math.random()*1.5+0.5);
      this.vx = (Math.random()-0.5)*0.8;
      this.life = Math.random()*0.8+0.2;
      this.decay= Math.random()*0.008+0.003;
      this.sz = Math.random()*3+1;
      const warm = Math.random();
      this.r = 255; this.g = warm>0.5? (Math.random()*120+80|0) : (Math.random()*60+20|0); this.b = 0;
    }
    update() {
      this.y+=this.vy; this.x+=this.vx; this.life-=this.decay;
      this.vy-=0.02; this.sz*=0.99;
      if(this.life<=0) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.sz,0,Math.PI*2);
      ctx.fillStyle=`rgba(${this.r},${this.g},${this.b},${this.life})`;
      ctx.fill();
    }
  }

  const embers = Array.from({length:60}, ()=>new Ember());
  (function loop() {
    ctx.clearRect(0,0,W,H);
    embers.forEach(e=>{e.update();e.draw();});
    requestAnimationFrame(loop);
  })();
}

// ════════════════════════════════════════════
//  MÓDULO: NAVEGAÇÃO ENTRE TELAS
// ════════════════════════════════════════════
function mostrarTela(id) {
  ['screenMenu','screenDifficulty','screenCharacter','gameBoard','youDiedScreen'].forEach(s => {
    const el = document.getElementById(s);
    if (el) { el.style.display = s === id ? (s === 'gameBoard' ? 'block' : 'flex') : 'none'; }
  });
  estado.tela = id;
}

// ════════════════════════════════════════════
//  MÓDULO: AUDIO
// ════════════════════════════════════════════
function tocarAudio(elId, src, volume=0.3, loop=false) {
  const el = DOM[elId] ? DOM[elId]() : document.getElementById(elId);
  if (!el) return;
  el.src = src; el.volume = volume; el.loop = loop;
  el.play().catch(()=>{});
}
function pararAudio(elId) {
  const el = DOM[elId] ? DOM[elId]() : document.getElementById(elId);
  if (!el) return;
  el.pause(); el.src = '';
}

function tocarSomYouDied() {
  // Som real se disponível, fallback sintético
  const el = DOM.audioDeath();
  el.src = './assets/audios/YOU DIED (HD).mp3';
  el.volume = 0.9;
  el.play().catch(() => {
    // fallback sintético
    try {
      const actx = new (window.AudioContext||window.webkitAudioContext)();
      [[55,0,4.5,0.25],[82,0,4.2,0.15],[110,.2,3.8,.1],[46,.5,5,.2],[36,1,5.5,.18]].forEach(([f,s,d,v])=>{
        const o=actx.createOscillator(),g=actx.createGain();
        o.connect(g);g.connect(actx.destination);
        o.frequency.value=f;g.gain.setValueAtTime(0,actx.currentTime+s);
        g.gain.linearRampToValueAtTime(v,actx.currentTime+s+.05);
        g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+s+d);
        o.start(actx.currentTime+s);o.stop(actx.currentTime+s+d+.1);
      });
    } catch(e){}
  });
}

// ════════════════════════════════════════════
//  MÓDULO: MENU INICIAL
// ════════════════════════════════════════════
function initMenu() {
  initParticulas('menuParticles');
  tocarAudio('audioMenu', './assets/audios/Firelink Shrine - LOADING.mp3', 0.25, true);

  const pressStart = DOM.menuPressStart();
  const avançar = () => {
    pressStart.removeEventListener('click', avançar);
    document.removeEventListener('keydown', onKeyMenu);
    document.removeEventListener('touchstart', onTouchMenu);
    pararAudio('audioMenu');
    irParaDificuldade();
  };
  const onKeyMenu = () => avançar();
  const onTouchMenu = () => avançar();

  pressStart.addEventListener('click', avançar);
  document.addEventListener('keydown', onKeyMenu, {once:true});
  document.addEventListener('touchstart', onTouchMenu, {once:true});
}

// ════════════════════════════════════════════
//  MÓDULO: DIFICULDADE
// ════════════════════════════════════════════
function irParaDificuldade() {
  mostrarTela('screenDifficulty');
  initParticulas('diffParticles');

  const diffBtns = DOM.diffBtns();
  const nextBtn  = DOM.diffNextBtn();

  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diffBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      estado.dificuldade = btn.dataset.difficulty;
      nextBtn.disabled = false;
    });
  });

  nextBtn.addEventListener('click', () => {
    if (!estado.dificuldade) return;
    irParaPersonagem();
  });
}

// ════════════════════════════════════════════
//  MÓDULO: PERSONAGEM
// ════════════════════════════════════════════
function irParaPersonagem() {
  mostrarTela('screenCharacter');
  initParticulas('charParticles');

  const charBtns  = DOM.charBtns();
  const startBtn  = DOM.charStartBtn();

  charBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      charBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      estado.personagem = btn.dataset.character;
      startBtn.disabled = false;
    });
  });

  startBtn.addEventListener('click', () => {
    if (!estado.personagem) return;
    iniciarJogo();
  });
}

// ════════════════════════════════════════════
//  MÓDULO: JOGO
// ════════════════════════════════════════════
function carregarPersonagem() {
  const cfg    = PERSONAGENS[estado.personagem];
  const player = DOM.player();
  player.src   = cfg.sprite;
  player.style.setProperty('--jump-height',   cfg.jumpHeight);
  player.style.setProperty('--jump-duration', cfg.jumpDuration);
}

function iniciarJogo() {
  mostrarTela('gameBoard');
  initFogoParticulas();

  // Reset estado
  estado.jogando       = true;
  estado.vidas         = 3;
  estado.pontos        = 0;
  estado.invencivel    = false;
  estado.puloAltoAtivo = false;
  estado.slowMotionAtivo = false;
  estado.obstaculoAtual  = 0;

  carregarPersonagem();
  atualizarHUD();

  // Limpa obstáculos e power-ups anteriores
  DOM.obstaclesContainer().innerHTML = '';
  DOM.powerupsContainer().innerHTML  = '';

  tocarAudio('audioGame', './assets/audios/CastleTheme - Playing Extended.mp3', 0.3, true);

  // Pontuação cresce com o tempo
  estado.scoreInterval = setInterval(() => {
    if (!estado.jogando) return;
    const mult = DIFICULDADES[estado.dificuldade].pontosMult;
    estado.pontos += Math.round(1 * mult * (estado.slowMotionAtivo ? 0.5 : 1));
    DOM.scoreDisplay().textContent = estado.pontos;
  }, 100);

  // Spawn obstáculos
  agendarObstaculo();

  // Spawn power-ups
  agendarPowerup();

  // Loop de colisão
  estado.gameLoopInterval = setInterval(verificarColisoes, 16);
}

// ════════════════════════════════════════════
//  MÓDULO: OBSTÁCULOS
// ════════════════════════════════════════════
function agendarObstaculo() {
  if (!estado.jogando) return;
  const cfg  = DIFICULDADES[estado.dificuldade];
  const tipo = TIPOS_OBS[estado.obstaculoAtual % TIPOS_OBS.length];
  estado.obstaculoAtual++;

  const delay = cfg.obsMin + Math.random() * (cfg.obsMax - cfg.obsMin);
  const speedIdx = Math.min(estado.obstaculoAtual - 1, cfg.obsSpeeds.length - 1);
  const speed = estado.slowMotionAtivo
    ? (parseFloat(cfg.obsSpeeds[speedIdx]) * 2) + 's'
    : cfg.obsSpeeds[speedIdx];

  setTimeout(() => {
    if (!estado.jogando) return;
    criarObstaculo(tipo, speed);
    agendarObstaculo();
  }, delay);
}

function criarObstaculo(tipo, speed) {
  const container = DOM.obstaclesContainer();
  const el = document.createElement('div');
  el.classList.add('obstacle', `obstacle-${tipo}`);
  el.style.setProperty('--obs-duration', speed);
  el.dataset.tipo = tipo;

  if (tipo === 'pipe') {
    const img = document.createElement('img');
    img.src = './assets/imgs/pipe.png';
    img.className = 'obstacle-pipe';
    el.appendChild(img);
    el.style.bottom = '50px';
  }

  container.appendChild(el);

  // Remove após animação
  el.addEventListener('animationend', () => el.remove());
}

// ════════════════════════════════════════════
//  MÓDULO: POWER-UPS
// ════════════════════════════════════════════
const POWERUPS = [
  { tipo: 'star',    emoji: '⭐', classe: 'powerup-star',    nome: 'INVENCÍVEL',  duracao: 5000 },
  { tipo: 'feather', emoji: '🪶', classe: 'powerup-feather', nome: 'SUPER PULO',  duracao: 6000 },
  { tipo: 'clock',   emoji: '⏳', classe: 'powerup-clock',   nome: 'SLOW MOTION', duracao: 5000 },
];

function agendarPowerup() {
  if (!estado.jogando) return;
  const delay = 7000 + Math.random() * 10000;
  setTimeout(() => {
    if (!estado.jogando) return;
    criarPowerup();
    agendarPowerup();
  }, delay);
}

function criarPowerup() {
  const cfg = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
  const container = DOM.powerupsContainer();
  const el = document.createElement('div');
  el.classList.add('powerup-item', cfg.classe);
  el.innerHTML = cfg.emoji;
  el.dataset.tipo = cfg.tipo;
  el.style.setProperty('--obs-duration', '4s');
  el.style.bottom = (100 + Math.random() * 120) + 'px';
  container.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function aplicarPowerup(tipo) {
  const cfg = POWERUPS.find(p => p.tipo === tipo);
  if (!cfg) return;

  tocarAudio('audioPowerup', '', 0.4);

  const hudDisplay = DOM.powerupDisplay();
  const hudName    = DOM.powerupName();
  hudDisplay.style.display = 'flex';
  hudName.textContent = cfg.nome;

  if (tipo === 'star') {
    estado.invencivel = true;
    DOM.player().classList.add('invencivel');
    clearTimeout(estado.invencivelTimer);
    estado.invencivelTimer = setTimeout(() => {
      estado.invencivel = false;
      DOM.player().classList.remove('invencivel');
      hudDisplay.style.display = 'none';
    }, cfg.duracao);

  } else if (tipo === 'feather') {
    estado.puloAltoAtivo = true;
    DOM.player().style.setProperty('--jump-height', '350px');
    clearTimeout(estado.puloAltoTimer);
    estado.puloAltoTimer = setTimeout(() => {
      estado.puloAltoAtivo = false;
      DOM.player().style.setProperty('--jump-height', PERSONAGENS[estado.personagem].jumpHeight);
      hudDisplay.style.display = 'none';
    }, cfg.duracao);

  } else if (tipo === 'clock') {
    estado.slowMotionAtivo = true;
    clearTimeout(estado.slowMotionTimer);
    estado.slowMotionTimer = setTimeout(() => {
      estado.slowMotionAtivo = false;
      hudDisplay.style.display = 'none';
    }, cfg.duracao);
  }
}

// ════════════════════════════════════════════
//  MÓDULO: COLISÃO
// ════════════════════════════════════════════
function verificarColisoes() {
  if (!estado.jogando) return;

  const player     = DOM.player();
  const playerRect = player.getBoundingClientRect();
  const margem     = 18;

  // Obstáculos
  DOM.obstaclesContainer().querySelectorAll('.obstacle').forEach(obs => {
    const r = obs.getBoundingClientRect();
    if (
      playerRect.right  - margem > r.left  + margem &&
      playerRect.left   + margem < r.right - margem &&
      playerRect.bottom - margem > r.top   + margem &&
      playerRect.top    + margem < r.bottom- margem
    ) {
      tomarDano();
    }
  });

  // Power-ups
  DOM.powerupsContainer().querySelectorAll('.powerup-item').forEach(pu => {
    const r = pu.getBoundingClientRect();
    if (
      playerRect.right  > r.left &&
      playerRect.left   < r.right &&
      playerRect.bottom > r.top &&
      playerRect.top    < r.bottom
    ) {
      const tipo = pu.dataset.tipo;
      pu.remove();
      aplicarPowerup(tipo);
    }
  });
}

// ════════════════════════════════════════════
//  MÓDULO: VIDAS & DANO
// ════════════════════════════════════════════
function tomarDano() {
  if (estado.invencivel) return;

  estado.invencivel = true;
  clearTimeout(estado.invencivelTimer);

  estado.vidas--;
  atualizarHUD();

  // Flash vermelho
  const flash = DOM.damageFlash();
  flash.classList.remove('active');
  void flash.offsetWidth;
  flash.classList.add('active');

  // Tela tremendo
  DOM.gameBoard().style.animation = 'screenShake 0.4s ease';
  setTimeout(() => { DOM.gameBoard().style.animation = ''; }, 400);

  if (estado.vidas <= 0) {
    gameOver();
    return;
  }

  // Invencibilidade de recuperação (1.5s)
  estado.invencivelTimer = setTimeout(() => {
    estado.invencivel = false;
  }, 1500);
}

function atualizarHUD() {
  DOM.scoreDisplay().textContent = estado.pontos;
  const coracoes = ['','❤️','❤️❤️','❤️❤️❤️'];
  DOM.heartsDisplay().textContent = coracoes[Math.max(0, estado.vidas)] || '';
}

// ════════════════════════════════════════════
//  MÓDULO: PULO
// ════════════════════════════════════════════
let pulandoAgora = false;

function pular() {
  if (!estado.jogando || pulandoAgora) return;
  pulandoAgora = true;

  const player = DOM.player();
  const durMs  = parseInt(PERSONAGENS[estado.personagem]?.jumpDuration || '500');
  const durReal = estado.puloAltoAtivo ? durMs * 1.2 : durMs;

  player.style.setProperty('--jump-duration', durReal + 'ms');
  player.classList.add('pulo');

  setTimeout(() => {
    player.classList.remove('pulo');
    pulandoAgora = false;
  }, durReal);
}

// ════════════════════════════════════════════
//  MÓDULO: GAME OVER
// ════════════════════════════════════════════
function gameOver() {
  estado.jogando = false;
  clearInterval(estado.gameLoopInterval);
  clearInterval(estado.scoreInterval);

  pararAudio('audioGame');

  const cfg    = PERSONAGENS[estado.personagem];
  const todasFrases = [...cfg.frases, ...FRASES_GERAIS];
  const frase  = todasFrases[Math.floor(Math.random() * todasFrases.length)];

  DOM.youDiedText().textContent = estado.personagem === 'luigi' ? 'LUIGI MORREU' : 'VOCÊ MORREU';
  DOM.soulsPhrase().textContent = `" ${frase} "`;
  DOM.diedScoreValue().textContent = estado.pontos;

  setTimeout(() => {
    tocarSomYouDied();
    document.getElementById('youDiedScreen').style.display = 'flex';
    document.getElementById('youDiedScreen').classList.add('visible');
  }, 400);
}

// ════════════════════════════════════════════
//  MÓDULO: REINICIAR / MENU
// ════════════════════════════════════════════
function reiniciarJogo() {
  const youDied = document.getElementById('youDiedScreen');
  youDied.classList.remove('visible');
  youDied.style.display = 'none';
  pararAudio('audioDeath');

  // Limpa timers
  clearTimeout(estado.invencivelTimer);
  clearTimeout(estado.puloAltoTimer);
  clearTimeout(estado.slowMotionTimer);

  setTimeout(() => iniciarJogo(), 300);
}

function voltarAoMenu() {
  const youDied = document.getElementById('youDiedScreen');
  youDied.classList.remove('visible');
  youDied.style.display = 'none';

  clearInterval(estado.gameLoopInterval);
  clearInterval(estado.scoreInterval);
  clearTimeout(estado.invencivelTimer);
  clearTimeout(estado.puloAltoTimer);
  clearTimeout(estado.slowMotionTimer);
  pararAudio('audioDeath');
  pararAudio('audioGame');

  estado.dificuldade = null;
  estado.personagem  = null;
  estado.tela        = 'menu';

  setTimeout(() => {
    mostrarTela('screenMenu');
    initMenu();
  }, 300);
}

// ════════════════════════════════════════════
//  EVENTOS GLOBAIS
// ════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    pular();
  }
});
document.addEventListener('touchstart', (e) => {
  pular();
}, { passive: true });

DOM.restartBtn()?.addEventListener('click', reiniciarJogo);
DOM.menuBtn()?.addEventListener('click', voltarAoMenu);

// ════════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  mostrarTela('screenMenu');
  initMenu();
});