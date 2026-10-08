/* ==========================================================
   Workshop de Automação com Python · site de apresentação
   ========================================================== */

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const aleatorio = (min, max) => Math.random() * (max - min) + min;
const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];
const MOVIMENTO_REDUZIDO = matchMedia("(prefers-reduced-motion: reduce)").matches;
const TOQUE = matchMedia("(hover: none)").matches;

/* ==========================================================
   1. NAVEGAÇÃO ENTRE SLIDES
   ========================================================== */
const slides = $$(".slide");
const dotsNav = $(".dots");
const barra = $(".progresso-barra");
const atualEl = $("#slide-atual");
const ganchos = new Map(slides.map((s) => [s, []]));
let atual = 0;

$("#slide-total").textContent = slides.length;

slides.forEach((slide, i) => {
  const dot = document.createElement("button");
  dot.dataset.titulo = slide.dataset.titulo;
  dot.setAttribute("aria-label", `Ir para: ${slide.dataset.titulo}`);
  dot.addEventListener("click", () => irPara(i));
  dotsNav.appendChild(dot);
});

function aoEntrar(elemento, fn) {
  ganchos.get(elemento.closest(".slide")).push(fn);
}

function irPara(i) {
  i = Math.max(0, Math.min(slides.length - 1, i));
  slides[i].scrollIntoView({ behavior: MOVIMENTO_REDUZIDO ? "auto" : "smooth" });
}

function marcarAtual(i) {
  atual = i;
  atualEl.textContent = i + 1;
  barra.style.width = `${((i + 1) / slides.length) * 100}%`;
  $$("button", dotsNav).forEach((d, j) => d.classList.toggle("ativo", j === i));
}

const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      const slide = e.target;
      slide.classList.add("visivel");
      if (e.intersectionRatio >= 0.5 || window.innerHeight < 600) {
        marcarAtual(slides.indexOf(slide));
        ganchos.get(slide).forEach((fn) => fn());
      }
    });
  },
  { threshold: [0.2, 0.5] }
);
slides.forEach((s) => observador.observe(s));

let jaNavegou = false;
document.addEventListener("keydown", (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if ($("#lightbox").classList.contains("aberto")) {
    if (e.key === "Escape") fecharLightbox();
    return;
  }
  const alvo = e.target.closest("button, a, summary, input, textarea, [tabindex]");
  const proximo = ["ArrowDown", "ArrowRight", "PageDown"];
  const anterior = ["ArrowUp", "ArrowLeft", "PageUp"];

  if (proximo.includes(e.key) || (e.key === " " && !alvo && !e.shiftKey)) {
    e.preventDefault(); irPara(atual + 1);
  } else if (anterior.includes(e.key) || (e.key === " " && !alvo && e.shiftKey)) {
    e.preventDefault(); irPara(atual - 1);
  } else if (e.key === "Home") {
    e.preventDefault(); irPara(0);
  } else if (e.key === "End") {
    e.preventDefault(); irPara(slides.length - 1);
  } else if (e.key.toLowerCase() === "f") {
    alternarTelaCheia();
  } else return;

  if (!jaNavegou) {
    jaNavegou = true;
    setTimeout(() => ($(".dica-teclado").style.opacity = "0"), 4000);
  }
});

function alternarTelaCheia() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

$$("[data-ir]").forEach((b) => b.addEventListener("click", () => irPara(+b.dataset.ir)));

// selo da professora: memoji vira a estrela de tempos em tempos
const selo = $(".professora");
setInterval(() => {
  selo.classList.add("virado");
  setTimeout(() => selo.classList.remove("virado"), 2200);
}, 9000);

/* ==========================================================
   2. PARTÍCULAS DE FUNDO (rede de pontos + símbolos Python)
   ========================================================== */
(function particulas() {
  const canvas = $("#particulas");
  const ctx = canvas.getContext("2d");
  const SIMBOLOS = ["{ }", "( )", "def", "for", "if", "import", ":", "[ ]", "#", "py", "==", "in", "\u{1F40D}"];
  let pontos = [];
  let simbolos = [];
  let largura, altura, dpr;
  const mouse = { x: -9999, y: -9999 };

  function redimensionar() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    largura = canvas.width = innerWidth * dpr;
    altura = canvas.height = innerHeight * dpr;
    const qtd = Math.round(Math.min(90, (innerWidth * innerHeight) / 16000));
    pontos = Array.from({ length: qtd }, () => ({
      x: Math.random() * largura, y: Math.random() * altura,
      vx: aleatorio(-0.25, 0.25) * dpr, vy: aleatorio(-0.25, 0.25) * dpr,
      r: aleatorio(1, 2.4) * dpr,
    }));
    simbolos = Array.from({ length: Math.round(qtd / 4) }, () => novoSimbolo(true));
  }

  function novoSimbolo(inicial) {
    return {
      t: sortear(SIMBOLOS),
      x: Math.random() * largura,
      y: inicial ? Math.random() * altura : altura + 40 * dpr,
      v: aleatorio(0.15, 0.45) * dpr,
      tam: aleatorio(12, 22) * dpr,
      a: aleatorio(0.05, 0.16),
      giro: aleatorio(-0.3, 0.3),
    };
  }

  function desenhar() {
    ctx.clearRect(0, 0, largura, altura);
    const raio = 130 * dpr;

    for (const p of pontos) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > largura) p.vx *= -1;
      if (p.y < 0 || p.y > altura) p.vy *= -1;

      // o mouse empurra os pontos de leve
      const dxm = p.x - mouse.x, dym = p.y - mouse.y;
      const dm = Math.hypot(dxm, dym);
      if (dm < 120 * dpr) { p.x += (dxm / dm) * 1.2; p.y += (dym / dm) * 1.2; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(124, 192, 255, .55)";
      ctx.fill();
    }

    for (let i = 0; i < pontos.length; i++) {
      for (let j = i + 1; j < pontos.length; j++) {
        const a = pontos[i], b = pontos[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < raio) {
          ctx.strokeStyle = `rgba(75, 139, 190, ${0.22 * (1 - d / raio)})`;
          ctx.lineWidth = dpr;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // liga ao mouse com linhas amarelas
      const p = pontos[i];
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < raio * 1.4) {
        ctx.strokeStyle = `rgba(255, 212, 59, ${0.35 * (1 - dm / (raio * 1.4))})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }

    for (let i = 0; i < simbolos.length; i++) {
      const s = simbolos[i];
      s.y -= s.v;
      if (s.y < -40 * dpr) simbolos[i] = novoSimbolo(false);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.giro);
      ctx.font = `600 ${s.tam}px "JetBrains Mono", monospace`;
      ctx.fillStyle = `rgba(255, 212, 59, ${s.a})`;
      ctx.fillText(s.t, 0, 0);
      ctx.restore();
    }

    if (!document.hidden) requestAnimationFrame(desenhar);
  }

  addEventListener("resize", redimensionar);
  addEventListener("pointermove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  document.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) requestAnimationFrame(desenhar); });
  redimensionar();
  if (MOVIMENTO_REDUZIDO) { desenhar(); } else requestAnimationFrame(desenhar);
})();

/* ==========================================================
   3. BRILHO QUE SEGUE O MOUSE + BOTÕES MAGNÉTICOS + CARDS 3D
   ========================================================== */
(function efeitosDeMouse() {
  if (TOQUE) return;
  const brilho = $(".cursor-glow");
  let alvoX = innerWidth / 2, alvoY = innerHeight / 2, x = alvoX, y = alvoY;
  addEventListener("pointermove", (e) => {
    alvoX = e.clientX; alvoY = e.clientY;
    document.body.classList.add("mouse-ativo");
  });
  (function seguir() {
    x += (alvoX - x) * 0.12; y += (alvoY - y) * 0.12;
    brilho.style.transform = `translate(${x - 210}px, ${y - 210}px)`;
    requestAnimationFrame(seguir);
  })();

  $$(".magnetico").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
    });
    btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
  });

  $$(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transition = "transform .08s";
      card.style.transform = `perspective(800px) rotateY(${px * 14}deg) rotateX(${-py * 14}deg) translateZ(6px)`;
      card.style.background = `radial-gradient(circle at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(255,212,59,.13), rgba(22,32,62,.72) 55%)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transition = "transform .6s cubic-bezier(.2,.8,.2,1), opacity .8s";
      card.style.transform = "";
      card.style.background = "";
    });
  });
})();

/* ==========================================================
   4. CAPA: texto embaralhado + terminal digitando
   ========================================================== */
function embaralhar(el) {
  const final = el.dataset.text;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*{}[]<>/\\=+0123456789";
  let quadro = 0;
  const total = 28;
  clearInterval(el._timer);
  el._timer = setInterval(() => {
    el.textContent = final
      .split("")
      .map((c, i) => (i < (quadro / total) * final.length ? c : sortear(chars.split(""))))
      .join("");
    if (++quadro > total) { clearInterval(el._timer); el.textContent = final; }
  }, 40);
}
$$(".scramble").forEach((el) => {
  setTimeout(() => embaralhar(el), 500);
  el.addEventListener("mouseenter", () => embaralhar(el));
});

const ROTEIRO_TERMINAL = [
  { cmd: "py automatizar.py" },
  { saida: "<span class='cz'>Lendo a pasta Downloads...</span>", pausa: 500 },
  { saida: "<span class='ok'>✔</span> 40 arquivos organizados", pausa: 380 },
  { saida: "<span class='cz'>Lendo inscritos.xlsx...</span>", pausa: 500 },
  { saida: "<span class='ok'>✔</span> 27 certificados gerados", pausa: 380 },
  { saida: "<span class='ok'>✔</span> 1 relatório com gráfico", pausa: 380 },
  { saida: "", pausa: 200 },
  { saida: "<span class='am'>⚡ Tempo total: 2,3 segundos</span>", pausa: 300 },
  { saida: "<span class='az'>☕ Pode ir tomar um café.</span>", pausa: 600 },
];

async function digitarTerminal(el, roteiro, prompt = "C:\\Jornada&gt; ") {
  if (el._rodando) return;
  el._rodando = true;
  el.innerHTML = "";
  let html = "";
  const cursor = "<span class='cursor'>▌</span>";
  for (const passo of roteiro) {
    if (passo.cmd) {
      html += `<span class='az'>${prompt}</span>`;
      for (const c of passo.cmd) {
        html += c;
        el.innerHTML = html + cursor;
        await esperar(aleatorio(45, 110));
      }
      html += "\n";
      await esperar(350);
    } else {
      await esperar(passo.pausa);
      html += passo.saida + "\n";
      el.innerHTML = html + cursor;
    }
  }
  html += `<span class='az'>${prompt}</span>`;
  el.innerHTML = html + cursor;
  el._rodando = false;
}
setTimeout(() => digitarTerminal($("#terminal-capa"), ROTEIRO_TERMINAL), 900);

/* ==========================================================
   5. GANCHO: contador de mãos levantadas
   ========================================================== */
$$(".mao-card").forEach((card) => {
  let n = 0;
  const cont = $(".mao-cont", card);
  card.addEventListener("click", (e) => {
    n++;
    $("b", cont).textContent = n;
    cont.classList.remove("pulo"); void cont.offsetWidth; cont.classList.add("pulo");
    const mao = document.createElement("span");
    mao.className = "mao-voando";
    mao.textContent = sortear(["✋", "🙋", "🙋‍♀️", "🙋‍♂️", "✋🏽", "✋🏿", "🖐️"]);
    mao.style.left = `${e.clientX - 15}px`;
    mao.style.top = `${e.clientY - 15}px`;
    mao.style.setProperty("--x", `${aleatorio(-60, 60)}px`);
    mao.style.setProperty("--r", `${aleatorio(-40, 40)}deg`);
    document.body.appendChild(mao);
    setTimeout(() => mao.remove(), 1000);
  });
  card.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // botão direito zera
    n = 0; $("b", cont).textContent = 0;
  });
});

/* ==========================================================
   6. MANUAL vs PYTHON: barras de corrida
   ========================================================== */
function animarNumero(el, alvo, duracao, sufixo = "") {
  const inicio = performance.now();
  (function passo(agora) {
    const t = Math.min(1, (agora - inicio) / duracao);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(alvo * eased) + sufixo;
    if (t < 1) requestAnimationFrame(passo);
  })(inicio);
}

const corrida = $(".corrida");
aoEntrar(corrida, () => {
  $$(".barra", corrida).forEach((b) => { b.style.transition = "none"; b.style.width = "0"; });
  $$(".tempo", corrida).forEach((t) => (t.textContent = "0"));
  void corrida.offsetWidth;
  setTimeout(() => {
    $$(".barra", corrida).forEach((b) => { b.style.transition = ""; b.style.width = b.dataset.largura + "%"; });
    $$(".barra-linha", corrida).forEach((linha) => {
      const t = $(".tempo", linha);
      const rapido = $(".barra", linha).classList.contains("python");
      animarNumero(t, +t.dataset.alvo, rapido ? 400 : 2200, t.dataset.sufixo);
    });
  }, 500);
});

/* ==========================================================
   7. CÓDIGO PYTHON DIGITANDO + TRADUÇÃO
   ========================================================== */
const LINHAS_CODIGO = [
  [["for", "kw"], [" arquivo "], ["in", "kw"], [" pasta."], ["iterdir", "fn"], ["():"]],
  [["    "], ["if", "kw"], [" arquivo."], ["suffix", "at"], [" == "], ['".jpg"', "st"], [":"]],
  [["        "], ["mover", "fn"], ["(arquivo, "], ['"Imagens"', "st"], [")"]],
];
const codigoEl = $("#codigo-python");
let codigoRodando = false;

async function digitarCodigo() {
  if (codigoRodando) return;
  codigoRodando = true;
  const traducoes = $$("#traducao li");
  traducoes.forEach((li) => li.classList.remove("on"));
  codigoEl.innerHTML = "";
  let html = "";
  await esperar(600);
  for (let l = 0; l < LINHAS_CODIGO.length; l++) {
    traducoes[l].classList.add("on");
    for (const [texto, classe] of LINHAS_CODIGO[l]) {
      let parcial = "";
      for (const c of texto) {
        parcial += c;
        const span = classe ? `<span class="${classe}">${parcial}</span>` : parcial;
        codigoEl.innerHTML = html + span + "<span class='cursor'>▌</span>";
        await esperar(c === " " ? 15 : aleatorio(35, 75));
      }
      html += classe ? `<span class="${classe}">${texto}</span>` : texto;
    }
    html += "\n";
    await esperar(300);
  }
  codigoEl.innerHTML = html + "<span class='cursor'>▌</span>";
  codigoRodando = false;
}
aoEntrar(codigoEl, digitarCodigo);

/* ==========================================================
   8. ÁREAS: virar cartões com clique (para telas de toque)
   ========================================================== */
$$(".area-card").forEach((c) => {
  c.addEventListener("click", () => c.classList.toggle("virado"));
  c.addEventListener("keydown", (e) => {
    if (e.key === "Enter") c.classList.toggle("virado");
  });
});

/* ==========================================================
   9. DEMO: ORGANIZADOR DE PASTAS
   ========================================================== */
const CATEGORIAS = [
  { nome: "Imagens", icone: "🖼️", cor: "#e0559a", ext: ["jpg", "png", "gif"] },
  { nome: "Documentos", icone: "📄", cor: "#d9534f", ext: ["pdf", "docx", "txt"] },
  { nome: "Planilhas", icone: "📊", cor: "#1e9e5a", ext: ["xlsx", "csv"] },
  { nome: "Áudios", icone: "🎵", cor: "#8e5cff", ext: ["mp3", "wav"] },
  { nome: "Vídeos", icone: "🎬", cor: "#ff8c2b", ext: ["mp4"] },
  { nome: "Compactados", icone: "📦", cor: "#6c7a93", ext: ["zip", "rar"] },
];
const NOMES_ARQUIVOS = [
  "foto_praia", "selfie", "IMG_2024", "print_tela", "meme", "trabalho_final", "resumo_aula",
  "contrato", "curriculo", "notas", "orcamento", "lista_presenca", "gastos", "musica",
  "podcast", "gravacao", "video_viagem", "tutorial", "backup", "slides",
];
const QTD_ARQUIVOS = 32;

const mesa = $("#mesa");
const areaArquivos = $("#mesa-arquivos");
const pastasEl = $("#pastas");
const logEl = $("#log-organizador");
const btnOrganizar = $("#btn-organizar");
const btnBaguncar = $("#btn-baguncar");

CATEGORIAS.forEach((cat) => {
  const p = document.createElement("div");
  p.className = "pasta";
  p.dataset.nome = cat.nome;
  p.innerHTML = `<div class="pasta-icone">${cat.icone}<span class="pasta-cont">0</span></div><span class="pasta-nome">${cat.nome}</span>`;
  pastasEl.appendChild(p);
});

function baguncar() {
  areaArquivos.innerHTML = "";
  $$(".pasta-cont", pastasEl).forEach((c) => { c.textContent = "0"; c.classList.remove("on"); });
  logEl.innerHTML = "C:\\Pratica1&gt; <span class='cursor'>▌</span>";
  const w = areaArquivos.clientWidth - 54;
  const h = areaArquivos.clientHeight - 66;

  for (let i = 0; i < QTD_ARQUIVOS; i++) {
    const cat = CATEGORIAS[i % CATEGORIAS.length];
    const ext = sortear(cat.ext);
    const nome = `${sortear(NOMES_ARQUIVOS)}_${String(i + 1).padStart(2, "0")}.${ext}`;
    const el = document.createElement("div");
    el.className = "arquivo";
    el.dataset.categoria = cat.nome;
    el.dataset.nome = nome;
    el.title = nome;
    el.style.setProperty("--c", cat.cor);
    el.style.left = `${aleatorio(6, Math.max(10, w))}px`;
    el.style.top = `${aleatorio(6, Math.max(10, h))}px`;
    el.dataset.giro = aleatorio(-28, 28).toFixed(1);
    el.style.transform = `rotate(${el.dataset.giro}deg) scale(0)`;
    el.innerHTML = `<span class="ext">${ext.toUpperCase()}</span>`;
    tornarArrastavel(el);
    areaArquivos.appendChild(el);
    // entrada com "pulinho"
    setTimeout(() => (el.style.transform = `rotate(${el.dataset.giro}deg) scale(1)`), 30 + i * 25);
  }
  btnOrganizar.disabled = false;
}

function tornarArrastavel(el) {
  let ox, oy, arrastando = false;
  el.addEventListener("pointerdown", (e) => {
    if (el.classList.contains("voando")) return;
    arrastando = true;
    el.setPointerCapture(e.pointerId);
    ox = e.clientX - el.offsetLeft; oy = e.clientY - el.offsetTop;
    el.style.transition = "none"; el.style.zIndex = 10; el.style.cursor = "grabbing";
  });
  el.addEventListener("pointermove", (e) => {
    if (!arrastando) return;
    el.style.left = `${e.clientX - ox}px`;
    el.style.top = `${e.clientY - oy}px`;
  });
  el.addEventListener("pointerup", () => {
    arrastando = false;
    el.style.transition = ""; el.style.zIndex = ""; el.style.cursor = "";
  });
}

function logar(linha) {
  const semCursor = logEl.innerHTML.replace(/<span class="cursor">▌<\/span>$/, "");
  logEl.innerHTML = semCursor + linha + "\n<span class=\"cursor\">▌</span>";
  logEl.scrollTop = logEl.scrollHeight;
}

async function organizar() {
  btnOrganizar.disabled = true;
  btnBaguncar.disabled = true;
  logEl.innerHTML = "C:\\Pratica1&gt; <span class=\"cursor\">▌</span>";
  const comando = "py organizador.py";
  for (const c of comando) {
    logEl.innerHTML = logEl.innerHTML.replace(/<span class="cursor">▌<\/span>$/, "") + c + '<span class="cursor">▌</span>';
    await esperar(45);
  }
  logar("");
  await esperar(300);

  const arquivos = $$(".arquivo", areaArquivos);
  const base = mesa.getBoundingClientRect();
  const contagem = {};

  for (const [i, arq] of arquivos.entries()) {
    const pasta = $(`.pasta[data-nome="${arq.dataset.categoria}"]`, pastasEl);
    const icone = $(".pasta-icone", pasta).getBoundingClientRect();
    const r = arq.getBoundingClientRect();
    const dx = icone.left + icone.width / 2 - (r.left + r.width / 2);
    const dy = icone.top + icone.height / 2 - (r.top + r.height / 2);
    arq.classList.add("voando");
    arq.style.transform = `translate(${dx}px, ${dy}px) rotate(0deg) scale(.35)`;

    setTimeout(() => {
      arq.classList.add("sumiu");
      const cat = arq.dataset.categoria;
      contagem[cat] = (contagem[cat] || 0) + 1;
      const cont = $(".pasta-cont", pasta);
      cont.textContent = contagem[cat];
      cont.classList.add("on");
      pasta.classList.remove("bump"); void pasta.offsetWidth; pasta.classList.add("bump");
    }, 750);

    logar(`<span class="cz">${arq.dataset.nome.padEnd(22)}</span> → <span class="am">${arq.dataset.categoria}</span>`);
    await esperar(i < 4 ? 260 : 85);
  }
  await esperar(900);
  logar(`\n<span class="ok">Pronto! ${arquivos.length} arquivos organizados.</span>`);
  confete(60, base.left + base.width / 2, base.top + base.height - 60);
  btnBaguncar.disabled = false;
}

btnOrganizar.addEventListener("click", organizar);
btnBaguncar.addEventListener("click", baguncar);
aoEntrar(mesa, () => { if (!areaArquivos.children.length) baguncar(); });
let tempoResize;
addEventListener("resize", () => {
  clearTimeout(tempoResize);
  tempoResize = setTimeout(() => { if (!btnBaguncar.disabled) baguncar(); }, 300);
});

/* ==========================================================
   10. DEMO: CERTIFICADOS
   ========================================================== */
const INSCRITOS = [
  ["Ana Costa Rodrigues", "Inteligência Artificial e Machine Learning", "Sim"],
  ["Bruno Oliveira Rocha", "Gestão Comercial", "Sim"],
  ["Camila Santos Barbosa", "Análise e Desenvolvimento de Sistemas", "Sim"],
  ["Diego Carvalho Nascimento", "Segurança da Informação", "Sim"],
  ["Eduarda Rocha Carvalho", "Inteligência Artificial e Machine Learning", "Não"],
  ["Felipe Souza Pereira", "Ciência de Dados", "Sim"],
  ["Gabriela Santos Dias", "Gestão de Recursos Humanos", "Sim"],
  ["Henrique Pereira Santos", "Gestão da Tecnologia da Informação", "Não"],
  ["Isabela Gomes Carvalho", "Publicidade e Marketing", "Sim"],
  ["João Dias Gomes", "Segurança da Informação", "Não"],
];
// siglas para caber na tabela da demo (o nome completo aparece ao passar o mouse)
const SIGLAS = {
  "Análise e Desenvolvimento de Sistemas": "ADS",
  "Segurança da Informação": "Segurança da Info.",
  "Ciência de Dados": "Ciência de Dados",
  "Gestão da Tecnologia da Informação": "Gestão de TI",
  "Inteligência Artificial e Machine Learning": "IA e Machine Learning",
  "Publicidade e Marketing": "Publicidade e Mkt",
  "Gestão Comercial": "Gestão Comercial",
  "Gestão de Recursos Humanos": "Gestão de RH",
};
const TOTAL_CERTIFICADOS = 27;

const corpoPlanilha = $("#planilha-corpo");
const pilha = $("#pilha");
const numCert = $("#cert-num");
const engrenagem = $("#engrenagem");
const btnCert = $("#btn-certificados");

function montarPlanilha() {
  corpoPlanilha.innerHTML = INSCRITOS.map(
    ([nome, curso, presente], i) =>
      `<tr><td>${i + 2}</td><td>${nome}</td><td title="${curso}">${SIGLAS[curso] || curso}</td><td class="${presente === "Sim" ? "sim" : "nao"}">${presente}</td></tr>`
  ).join("") + `<tr><td>⋮</td><td colspan="3" style="color:#8a93a6">+ 20 linhas</td></tr>`;
}
montarPlanilha();

async function gerarCertificados() {
  btnCert.disabled = true;
  montarPlanilha();
  pilha.innerHTML = "";
  numCert.textContent = "0";
  engrenagem.classList.add("girando");
  let gerados = 0;
  const linhas = $$("tr", corpoPlanilha).slice(0, INSCRITOS.length);

  for (const [i, tr] of linhas.entries()) {
    const [nome, , presente] = INSCRITOS[i];
    tr.classList.add("lendo");
    await esperar(380);
    tr.classList.remove("lendo");
    if (presente === "Sim") {
      tr.classList.add("feito");
      gerados++;
      numCert.textContent = gerados;
      const cert = document.createElement("div");
      cert.className = "mini-cert";
      cert.style.setProperty("--x", `${aleatorio(-26, 26)}px`);
      cert.style.setProperty("--y", `${aleatorio(-22, 22)}px`);
      cert.style.setProperty("--r", `${aleatorio(-12, 12)}deg`);
      cert.innerHTML = `<div class="mini-cert-borda"><b>CERTIFICADO</b><small>Certificamos que</small><strong>${nome}</strong><i></i><i></i></div>`;
      cert.addEventListener("click", () => abrirLightbox(`assets/certificados/linha${i}.png`, `Certificado em PDF de ${nome}, gerado pelo script`));
      pilha.appendChild(cert);
    } else {
      tr.classList.add("pulado");
    }
  }

  // o resto da planilha, bem mais rápido
  for (let n = gerados; n <= TOTAL_CERTIFICADOS; n++) {
    numCert.textContent = n;
    await esperar(55);
  }
  engrenagem.classList.remove("girando");
  const r = numCert.getBoundingClientRect();
  confete(90, r.left + r.width / 2, r.top);
  btnCert.disabled = false;
  btnCert.innerHTML = "↺ Gerar de novo";
}
btnCert.addEventListener("click", gerarCertificados);

/* ==========================================================
   11. LIGHTBOX (imagens ampliadas)
   ========================================================== */
const lightbox = $("#lightbox");
function abrirLightbox(src, alt) {
  const img = $("img", lightbox);
  img.src = src; img.alt = alt || "";
  lightbox.classList.add("aberto");
}
function fecharLightbox() { lightbox.classList.remove("aberto"); }
lightbox.addEventListener("click", fecharLightbox);
$$(".zoomavel").forEach((img) => img.addEventListener("click", () => abrirLightbox(img.src, img.alt)));

/* ==========================================================
   12. FINAL: palavra que troca + QR code + confete
   ========================================================== */
const PALAVRAS = ["sua área", "Segurança da Informação", "Ciência de Dados", "Gestão de TI", "Inteligência Artificial", "Publicidade", "Análise de Sistemas", "Gestão Comercial", "Recursos Humanos", "sua vida"];
const rotativo = $("#rotativo");
let idxPalavra = 0;
setInterval(() => {
  if (!$(".final").classList.contains("visivel")) return;
  rotativo.classList.add("trocando");
  setTimeout(() => {
    idxPalavra = (idxPalavra + 1) % PALAVRAS.length;
    rotativo.textContent = PALAVRAS[idxPalavra];
    rotativo.classList.remove("trocando");
  }, 300);
}, 1900);

let confeteFinalFeito = false;
aoEntrar($(".obrigado"), () => {
  if (confeteFinalFeito) return;
  confeteFinalFeito = true;
  setTimeout(() => confete(220, innerWidth / 2, innerHeight * 0.75), 700);
});
$(".obrigado").addEventListener("click", (e) => confete(120, e.clientX, e.clientY));

(function qr() {
  const caixa = $("#qr-box");
  const online = location.protocol.startsWith("http");
  if (!online || typeof QRCode === "undefined") { caixa.hidden = true; return; }
  new QRCode($("#qr"), {
    text: location.origin + location.pathname,
    width: 220, height: 220, colorDark: "#1d2433", colorLight: "#ffffff",
  });
})();

/* ==========================================================
   13. CONFETE
   ========================================================== */
const confeteCanvas = $("#confete");
const cctx = confeteCanvas.getContext("2d");
let pedacos = [];
let confeteAtivo = false;

function confete(qtd = 120, x = innerWidth / 2, y = innerHeight / 2) {
  if (MOVIMENTO_REDUZIDO) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  confeteCanvas.width = innerWidth * dpr;
  confeteCanvas.height = innerHeight * dpr;
  cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cores = ["#ffd43b", "#4b8bbe", "#3ddc97", "#ff7ac6", "#ffffff", "#ff8c2b"];
  for (let i = 0; i < qtd; i++) {
    const ang = aleatorio(-Math.PI * 0.9, -Math.PI * 0.1);
    const vel = aleatorio(6, 15);
    pedacos.push({
      x, y,
      vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel,
      w: aleatorio(6, 11), h: aleatorio(8, 15),
      cor: sortear(cores), giro: aleatorio(0, Math.PI), vg: aleatorio(-0.3, 0.3),
      vida: 1,
    });
  }
  if (!confeteAtivo) { confeteAtivo = true; requestAnimationFrame(animarConfete); }
}

function animarConfete() {
  cctx.clearRect(0, 0, innerWidth, innerHeight);
  pedacos.forEach((p) => {
    p.vy += 0.32; p.vx *= 0.985; p.x += p.vx; p.y += p.vy;
    p.giro += p.vg; p.vida -= 0.007;
    cctx.save();
    cctx.globalAlpha = Math.max(0, p.vida);
    cctx.translate(p.x, p.y); cctx.rotate(p.giro);
    cctx.fillStyle = p.cor;
    cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.giro * 2)));
    cctx.restore();
  });
  pedacos = pedacos.filter((p) => p.vida > 0 && p.y < innerHeight + 40);
  if (pedacos.length) requestAnimationFrame(animarConfete);
  else { confeteAtivo = false; cctx.clearRect(0, 0, innerWidth, innerHeight); }
}
