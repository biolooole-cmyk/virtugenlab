/* =====================================================
   VIRTUAL GENETIC LAB – CORE LOGIC
   Level: Grade 9 (Advanced)
   DEMO: Punnett table (mono / di / tri)
   EXPERIMENT: stochastic simulation with meiosis
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
   4. PURE MENDELIAN GAMETES (DEMO)
   =============================== */

function generateGametesDeterministic(genotypes) {
  let gametes = [""];

  genotypes.forEach(pair => {
    const alleles =
      pair[0] === pair[1] ? [pair[0]] : [pair[0], pair[1]];
    gametes = gametes.flatMap(g => alleles.map(a => g + a));
  });

  return gametes;
}

/* ===============================
   5. MEIOSIS MECHANICS (EXPERIMENT)
   =============================== */

// --- Mutation ---
function mutateAllele(allele) {
  const rate = Number(mutationRate.value) / 100;
  if (Math.random() < rate) {
    return allele === allele.toUpperCase()
      ? allele.toLowerCase()
      : allele.toUpperCase();
  }
  return allele;
}

// --- Proper crossover ---
function performCrossover(chrom1, chrom2) {
  const rate = Number(crossRate.value) / 100;
  if (Math.random() >= rate) return [chrom1, chrom2];

  const point = Math.floor(Math.random() * (chrom1.length - 1)) + 1;

  const new1 = [...chrom1.slice(0, point), ...chrom2.slice(point)];
  const new2 = [...chrom2.slice(0, point), ...chrom1.slice(point)];

  return [new1, new2];
}

// --- Gamete formation ---
function formGamete(genotypes) {
  let chrom1 = [];
  let chrom2 = [];

  genotypes.forEach(pair => {
    chrom1.push(pair[0]);
    chrom2.push(pair[1]);
  });

  [chrom1, chrom2] = performCrossover(chrom1, chrom2);

  const selected = Math.random() < 0.5 ? chrom1 : chrom2;
  return selected.map(a => mutateAllele(a)).join("");
}

/* ===============================
   6. PHENOTYPE
   =============================== */

function getPhenotype(genotype, orgKey) {
  const phenotype = { traits: [], textParts: [] };

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

function renderAll(analysis) {
  renderPhenotypeVisualFromAnalysis(analysis);
  renderPhenotypeList(analysis);
  renderPhenotypeStats(analysis);
  renderExplanationFromAnalysis(analysis);
}

/* ===============================
   9. DEMO MODE
   =============================== */

function runDemo(p1, p2) {
  const phenotypes = [];

  generateGametesDeterministic(p1).forEach(g1 =>
    generateGametesDeterministic(p2).forEach(g2 => {
      const genotype = {};
      g1.split("").forEach((a, i) => {
        genotype[a.toUpperCase()] = [a, g2[i]].sort().join("");
      });
      phenotypes.push(getPhenotype(genotype, organism.value));
    })
  );

  renderAll(analyzePhenotypes(phenotypes));
}

/* ===============================
   10. EXPERIMENT MODE
   =============================== */

function runExperiment(p1, p2) {
  const runs = Number(experimentCount.value);
  const phenotypes = [];

  for (let i = 0; i < runs; i++) {
    const g1 = formGamete(p1);
    const g2 = formGamete(p2);

    const genotype = {};
    g1.split("").forEach((a, i) => {
      genotype[a.toUpperCase()] = [a, g2[i]].sort().join("");
    });

    phenotypes.push(getPhenotype(genotype, organism.value));
  }

  renderAll(analyzePhenotypes(phenotypes));
}

/* ===============================
   11. MAIN CONTROLLER
   =============================== */

function runSimulation() {
  const p1 = [...parent1.querySelectorAll("select")].map(s => s.value);
  const p2 = [...parent2.querySelectorAll("select")].map(s => s.value);

  mode.value === MODES.DEMO
    ? runDemo(p1, p2)
    : runExperiment(p1, p2);
}

/* ===============================
   12. EVENTS
   =============================== */

organism.onchange = initParents;
crossType.onchange = initParents;
runCross.onclick = runSimulation;

/* ---- SLIDER REACTIVITY ---- */

mutationRate.oninput = () => {
  mutationValue.textContent = `${mutationRate.value}%`;
  if (mode.value === MODES.EXPERIMENT) runSimulation();
};

crossRate.oninput = () => {
  crossValue.textContent = `${crossRate.value}%`;
  if (mode.value === MODES.EXPERIMENT) runSimulation();
};

mode.onchange = () => {
  const isDemo = mode.value === MODES.DEMO;
  mutationRate.disabled = isDemo;
  crossRate.disabled = isDemo;
};

mutationValue.textContent = `${mutationRate.value}%`;
crossValue.textContent = `${crossRate.value}%`;
mode.onchange();

initParents();
