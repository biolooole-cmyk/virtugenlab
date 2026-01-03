/* =====================================================
   VIRTUAL GENETIC LAB – CORE LOGIC
   Level: Grade 9 (Advanced)
   DEMO: Punnett table (mono / di / tri)
   EXPERIMENT: stochastic simulation with meiosis
   ===================================================== */

/* ===============================
   0. DOM REFERENCES (CRITICAL)
   =============================== */

const organism = document.getElementById("organism");
const crossType = document.getElementById("crossType");
const mode = document.getElementById("mode");

const parent1 = document.getElementById("parent1");
const parent2 = document.getElementById("parent2");

const runCross = document.getElementById("runCross");

const mutationRate = document.getElementById("mutationRate");
const crossRate = document.getElementById("crossRate");
const mutationValue = document.getElementById("mutationValue");
const crossValue = document.getElementById("crossValue");
const experimentCount = document.getElementById("experimentCount");

const punnett = document.getElementById("punnett");
const phenotypeVisual = document.getElementById("phenotypeVisual");
const phenotypeList = document.getElementById("phenotypeList");
const phenotypeStats = document.getElementById("phenotypeStats");
const explanationText = document.getElementById("explanationText");
const alleleLegend = document.getElementById("alleleLegend");

/* ===============================
   1. GLOBAL CONFIG
   =============================== */

const MODES = {
  DEMO: "demo",
  EXPERIMENT: "experiment"
};

/* ===============================
   2. ORGANISM MODELS
   =============================== */

const organisms = {
  human: {
    name: "Людина",
    genes: ["A", "B", "C"],
    traits: {
      A: {
        dominant: { text: "Карі очі", symbol: "👁️🟤" },
        recessive: { text: "Блакитні очі", symbol: "👁️🔵" }
      },
      B: {
        dominant: { text: "Темне волосся", symbol: "🧑🏽‍🦱" },
        recessive: { text: "Світле волосся", symbol: "🧑🏼‍🦱" }
      },
      C: {
        dominant: { text: "Є веснянки", symbol: "✨" },
        recessive: { text: "Немає веснянок", symbol: "🚫✨" }
      }
    }
  },

  cat: {
    name: "Кіт",
    genes: ["A", "B", "C"],
    traits: {
      A: {
        dominant: { text: "Темна шерсть", symbol: "🐈‍⬛" },
        recessive: { text: "Світла шерсть", symbol: "🐈" }
      },
      B: {
        dominant: { text: "Зелені очі", symbol: "👁️🟢" },
        recessive: { text: "Блакитні очі", symbol: "👁️🔵" }
      },
      C: {
        dominant: { text: "Коротка шерсть", symbol: "✂️" },
        recessive: { text: "Довга шерсть", symbol: "🧶" }
      }
    }
  },

  rose: {
    name: "Роза",
    genes: ["A", "B", "C"],
    traits: {
      A: {
        dominant: { text: "Червоні пелюстки", symbol: "🌹" },
        recessive: { text: "Білі пелюстки", symbol: "🤍🌹" }
      },
      B: {
        dominant: { text: "Махрова квітка", symbol: "🌸" },
        recessive: { text: "Проста квітка", symbol: "🌼" }
      },
      C: {
        dominant: { text: "Високий кущ", symbol: "⬆️🌿" },
        recessive: { text: "Низький кущ", symbol: "⬇️🌿" }
      }
    }
  }
};

/* ===============================
   3. UI HELPERS
   =============================== */

function getActiveGenes() {
  return organisms[organism.value].genes.slice(0, Number(crossType.value));
}

function createParentUI(containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = "";

  getActiveGenes().forEach(gene => {
    const select = document.createElement("select");
    [gene + gene, gene + gene.toLowerCase(), gene.toLowerCase() + gene.toLowerCase()]
      .forEach(v => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
      });
    el.appendChild(select);
  });
}

function initParents() {
  createParentUI("parent1");
  createParentUI("parent2");
  renderAlleleLegend();
}

/* ===============================
   4. MENDELIAN GAMETES (DEMO)
   =============================== */

function generateGametesDeterministic(genotypes) {
  let gametes = [""];
  genotypes.forEach(pair => {
    const alleles = pair[0] === pair[1] ? [pair[0]] : [pair[0], pair[1]];
    gametes = gametes.flatMap(g => alleles.map(a => g + a));
  });
  return gametes;
}

/* ===============================
   5. MEIOSIS (EXPERIMENT)
   =============================== */

function mutateAllele(a) {
  const rate = Number(mutationRate.value) / 100;
  if (Math.random() < rate) {
    return a === a.toUpperCase() ? a.toLowerCase() : a.toUpperCase();
  }
  return a;
}

function performCrossover(c1, c2) {
  const rate = Number(crossRate.value) / 100;
  if (Math.random() >= rate) return [c1, c2];

  const point = Math.floor(Math.random() * (c1.length - 1)) + 1;
  return [
    [...c1.slice(0, point), ...c2.slice(point)],
    [...c2.slice(0, point), ...c1.slice(point)]
  ];
}

function formGamete(genotypes) {
  let c1 = [], c2 = [];
  genotypes.forEach(p => {
    c1.push(p[0]);
    c2.push(p[1]);
  });

  [c1, c2] = performCrossover(c1, c2);
  const chosen = Math.random() < 0.5 ? c1 : c2;
  return chosen.map(mutateAllele).join("");
}

/* ===============================
   6. PHENOTYPE
   =============================== */

function getPhenotype(genotype, orgKey) {
  const ph = { textParts: [] };
  Object.entries(genotype).forEach(([gene, pair]) => {
    const tr = organisms[orgKey].traits[gene];
    ph.textParts.push(pair.includes(gene) ? tr.dominant.text : tr.recessive.text);
  });
  ph.text = ph.textParts.join(", ");
  return ph;
}

/* ===============================
   7. ANALYSIS
   =============================== */

function analyzePhenotypes(cells) {
  const stats = {};
  cells.forEach(p => stats[p.text] = (stats[p.text] || 0) + 1);
  const total = cells.length;

  return Object.entries(stats).map(([text, count]) => ({
    text,
    count,
    percent: ((count / total) * 100).toFixed(1)
  }));
}

/* ===============================
   8. RENDERS
   =============================== */

function renderPhenotypeVisualFromAnalysis(a) {
  phenotypeVisual.innerHTML = "";
  a.forEach(p => {
    const d = document.createElement("div");
    d.className = "phenotype-trait";
    d.innerHTML = `<div class="phenotype-text">${p.text}<br>${p.percent}%</div>`;
    phenotypeVisual.appendChild(d);
  });
}

function renderPhenotypeList(a) {
  phenotypeList.innerHTML = "";
  a.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.text} — ${p.percent}% (${p.count})`;
    phenotypeList.appendChild(li);
  });
}

function renderPhenotypeStats(a) {
  phenotypeStats.innerHTML = "";
  a.forEach(p => {
    phenotypeStats.innerHTML +=
      `<div class="phenotype-stat"><span>${p.text}</span> — ${p.percent}%</div>`;
  });
}

function renderExplanationFromAnalysis(a) {
  explanationText.textContent =
    a.map(p => `• ${p.text} — ${p.percent}%`).join("\n");
}

function renderAlleleLegend() {
  alleleLegend.innerHTML = "";
  Object.entries(organisms[organism.value].traits).forEach(([g, t]) => {
    alleleLegend.innerHTML +=
      `<div class="allele-item"><strong>${g}</strong> — ${t.dominant.text}<br>
       <strong>${g.toLowerCase()}</strong> — ${t.recessive.text}</div>`;
  });
}

function renderPunnettTable(g1, g2) {
  punnett.innerHTML = "";
  const table = document.createElement("table");
  table.className = "punnett-table";

  table.innerHTML =
    `<tr><th></th>${g2.map(g => `<th>${g}</th>`).join("")}</tr>` +
    g1.map(r =>
      `<tr><th>${r}</th>${g2.map(c => `<td>${r}${c}</td>`).join("")}</tr>`
    ).join("");

  punnett.appendChild(table);
}

function renderAll(a) {
  renderPhenotypeVisualFromAnalysis(a);
  renderPhenotypeList(a);
  renderPhenotypeStats(a);
  renderExplanationFromAnalysis(a);
}

/* ===============================
   9. MODES
   =============================== */

function runDemo(p1, p2) {
  const g1 = generateGametesDeterministic(p1);
  const g2 = generateGametesDeterministic(p2);
  renderPunnettTable(g1, g2);

  const phenotypes = [];
  g1.forEach(r => g2.forEach(c => {
    const gt = {};
    r.split("").forEach((a, i) => gt[a.toUpperCase()] = [a, c[i]].sort().join(""));
    phenotypes.push(getPhenotype(gt, organism.value));
  }));

  renderAll(analyzePhenotypes(phenotypes));
}

function runExperiment(p1, p2) {
  punnett.innerHTML = "";
  const runs = Number(experimentCount.value);
  const phenotypes = [];

  for (let i = 0; i < runs; i++) {
    const g1 = formGamete(p1);
    const g2 = formGamete(p2);

    const gt = {};
    g1.split("").forEach((a, i) => gt[a.toUpperCase()] = [a, g2[i]].sort().join(""));
    phenotypes.push(getPhenotype(gt, organism.value));
  }

  renderAll(analyzePhenotypes(phenotypes));
}

/* ===============================
   10. CONTROLLER
   =============================== */

function runSimulation() {
  const p1 = [...parent1.querySelectorAll("select")].map(s => s.value);
  const p2 = [...parent2.querySelectorAll("select")].map(s => s.value);
  mode.value === MODES.DEMO ? runDemo(p1, p2) : runExperiment(p1, p2);
}

/* ===============================
   11. EVENTS
   =============================== */

organism.onchange = initParents;
crossType.onchange = initParents;
runCross.onclick = runSimulation;

mutationRate.oninput = () => {
  mutationValue.textContent = `${mutationRate.value}%`;
  if (mode.value === MODES.EXPERIMENT) runSimulation();
};

crossRate.oninput = () => {
  crossValue.textContent = `${crossRate.value}%`;
  if (mode.value === MODES.EXPERIMENT) runSimulation();
};

mode.onchange = () => {
  const demo = mode.value === MODES.DEMO;
  mutationRate.disabled = demo;
  crossRate.disabled = demo;
};

mutationValue.textContent = `${mutationRate.value}%`;
crossValue.textContent = `${crossRate.value}%`;
mode.onchange();

initParents();
