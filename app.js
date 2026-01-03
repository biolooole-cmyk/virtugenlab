/* =====================================================
   VIRTUAL GENETIC LAB – CORE LOGIC
   Level: Grade 9 (Advanced)
   DEMO: Punnett table (mono / di / tri)
   EXPERIMENT: stochastic simulation
   ===================================================== */

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

    [
      gene + gene,
      gene + gene.toLowerCase(),
      gene.toLowerCase() + gene.toLowerCase()
    ].forEach(v => {
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
   4. GAMETES
   =============================== */

function generateGametesDeterministic(genotypes) {
  let gametes = [""];

  genotypes.forEach(pair => {
    const alleles =
      pair[0] === pair[1] ? [pair[0]] : [pair[0], pair[1]];

    gametes = gametes.flatMap(g =>
      alleles.map(a => g + a)
    );
  });

  return gametes;
}

function getRandomGamete(genotypes) {
  const gametes = generateGametesDeterministic(genotypes);
  return gametes[Math.floor(Math.random() * gametes.length)];
}

/* ===============================
   5. PHENOTYPE
   =============================== */

function getPhenotype(genotype, orgKey) {
  const phenotype = {
    traits: [],
    textParts: []
  };

  Object.entries(genotype).forEach(([gene, pair]) => {
    const tr = organisms[orgKey].traits[gene];
    const data = pair.includes(gene)
      ? tr.dominant
      : tr.recessive;

    phenotype.traits.push(data);
    phenotype.textParts.push(data.text);
  });

  phenotype.text = phenotype.textParts.join(", ");
  return phenotype;
}

/* ===============================
   6. ANALYSIS
   =============================== */

function analyzePhenotypes(cells) {
  const stats = {};
  cells.forEach(p => {
    stats[p.text] = (stats[p.text] || 0) + 1;
  });

  const total = cells.length;

  return Object.entries(stats).map(([text, count]) => ({
    text,
    count,
    percent: ((count / total) * 100).toFixed(1)
  }));
}

/* ===============================
   7. RENDERS
   =============================== */

function renderAlleleLegend() {
  const el = document.getElementById("alleleLegend");
  el.innerHTML = "";

  Object.entries(organisms[organism.value].traits).forEach(([g, t]) => {
    el.innerHTML += `
      <div class="allele-item">
        <strong>${g}</strong> — ${t.dominant.text} ${t.dominant.symbol}<br>
        <strong>${g.toLowerCase()}</strong> — ${t.recessive.text} ${t.recessive.symbol}
      </div>`;
  });
}

function renderPhenotypeVisualFromAnalysis(analysis) {
  const el = document.getElementById("phenotypeVisual");
  el.innerHTML = "";

  analysis.forEach(a => {
    const symbols = [];

    Object.values(organisms[organism.value].traits).forEach(tr => {
      if (a.text.includes(tr.dominant.text)) symbols.push(tr.dominant.symbol);
      if (a.text.includes(tr.recessive.text)) symbols.push(tr.recessive.symbol);
    });

    el.innerHTML += `
      <div class="phenotype-trait">
        <div class="phenotype-symbol">${symbols.join(" ")}</div>
        <div class="phenotype-text">${a.text} (${a.percent}%)</div>
      </div>`;
  });
}

function renderPhenotypeList(analysis) {
  const list = document.getElementById("phenotypeList");
  list.innerHTML = "";

  analysis.forEach(a => {
    const li = document.createElement("li");
    li.textContent = `${a.text} — ${a.percent}% (${a.count})`;
    list.appendChild(li);
  });
}

function renderPhenotypeStats(analysis) {
  const el = document.getElementById("phenotypeStats");
  el.innerHTML = "";

  analysis.forEach(a => {
    el.innerHTML += `
      <div class="phenotype-stat">
        <span>${a.text}</span> — ${a.percent}% (${a.count})
      </div>`;
  });
}

function renderExplanationFromAnalysis(analysis) {
  const el = document.getElementById("explanationText");
  el.textContent = analysis
    .map(a => `• ${a.text} — ${a.percent}%`)
    .join("\n");
}

/* ===============================
   8. DEMO: PUNNETT TABLE
   =============================== */

function runDemo(p1, p2) {
  const g1 = generateGametesDeterministic(p1);
  const g2 = generateGametesDeterministic(p2);
  const phenotypes = [];

  g1.forEach(r =>
    g2.forEach(c => {
      const genotype = {};
      r.split("").forEach((a, i) => {
        genotype[a.toUpperCase()] =
          [a, c[i]].sort().join("");
      });
      phenotypes.push(getPhenotype(genotype, organism.value));
    })
  );

  const analysis = analyzePhenotypes(phenotypes);

  renderPhenotypeVisualFromAnalysis(analysis);
  renderPhenotypeList(analysis);
  renderPhenotypeStats(analysis);
  renderExplanationFromAnalysis(analysis);
}

/* ===============================
   9. EXPERIMENT: STOCHASTIC
   =============================== */

function runExperiment(p1, p2) {
  const runs = Number(experimentCount.value);
  const phenotypes = [];

  for (let i = 0; i < runs; i++) {
    const g1 = getRandomGamete(p1);
    const g2 = getRandomGamete(p2);

    const genotype = {};
    g1.split("").forEach((a, i) => {
      genotype[a.toUpperCase()] =
        [a, g2[i]].sort().join("");
    });

    phenotypes.push(getPhenotype(genotype, organism.value));
  }

  const analysis = analyzePhenotypes(phenotypes);

  renderPhenotypeVisualFromAnalysis(analysis);
  renderPhenotypeList(analysis);
  renderPhenotypeStats(analysis);
  renderExplanationFromAnalysis(analysis);
}

/* ===============================
   10. MAIN CONTROLLER
   =============================== */

function runSimulation() {
  const p1 = [...parent1.querySelectorAll("select")].map(s => s.value);
  const p2 = [...parent2.querySelectorAll("select")].map(s => s.value);

  if (mode.value === MODES.DEMO) {
    runDemo(p1, p2);
  }

  if (mode.value === MODES.EXPERIMENT) {
    runExperiment(p1, p2);
  }
}

/* ===============================
   11. EVENTS
   =============================== */

organism.onchange = initParents;
crossType.onchange = initParents;
runCross.onclick = runSimulation;

initParents();
