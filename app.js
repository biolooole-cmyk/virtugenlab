/* =====================================================
   VIRTUAL GENETIC LAB – CORE LOGIC
   Level: Grade 9 (Advanced)
   DEMO: Punnett table (mono / di / tri)
   EXPERIMENT: random simulation (mutation + crossover)
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
        dominant: { text: "Карі очі", icon: "eye-brown", symbol: "👁️🟤" },
        recessive: { text: "Блакитні очі", icon: "eye-blue", symbol: "👁️🔵" }
      },
      B: {
        dominant: { text: "Темне волосся", icon: "hair-dark", symbol: "🧑🏽‍🦱" },
        recessive: { text: "Світле волосся", icon: "hair-light", symbol: "🧑🏼‍🦱" }
      },
      C: {
        dominant: { text: "Є веснянки", icon: "freckles-yes", symbol: "✨" },
        recessive: { text: "Немає веснянок", icon: "freckles-no", symbol: "🚫✨" }
      }
    }
  },

  cat: {
    name: "Кіт",
    genes: ["A", "B", "C"],
    traits: {
      A: {
        dominant: { text: "Темна шерсть", icon: "fur-dark", symbol: "🐈‍⬛" },
        recessive: { text: "Світла шерсть", icon: "fur-light", symbol: "🐈" }
      },
      B: {
        dominant: { text: "Зелені очі", icon: "eye-green", symbol: "👁️🟢" },
        recessive: { text: "Блакитні очі", icon: "eye-blue", symbol: "👁️🔵" }
      },
      C: {
        dominant: { text: "Коротка шерсть", icon: "fur-short", symbol: "✂️" },
        recessive: { text: "Довга шерсть", icon: "fur-long", symbol: "🧶" }
      }
    }
  },

  rose: {
    name: "Роза",
    genes: ["A", "B", "C"],
    traits: {
      A: {
        dominant: { text: "Червоні пелюстки", icon: "petal-red", symbol: "🌹" },
        recessive: { text: "Білі пелюстки", icon: "petal-white", symbol: "🤍🌹" }
      },
      B: {
        dominant: { text: "Махрова квітка", icon: "flower-double", symbol: "🌸" },
        recessive: { text: "Проста квітка", icon: "flower-simple", symbol: "🌼" }
      },
      C: {
        dominant: { text: "Високий кущ", icon: "bush-tall", symbol: "⬆️🌿" },
        recessive: { text: "Низький кущ", icon: "bush-low", symbol: "⬇️🌿" }
      }
    }
  }
};

/* ===============================
   3. UI HELPERS
   =============================== */

function getActiveGenes() {
  const count = Number(crossType.value);
  return organisms[organism.value].genes.slice(0, count);
}

function createParentUI(containerId) {
  const genes = getActiveGenes();
  const el = document.getElementById(containerId);
  el.innerHTML = "";

  genes.forEach(gene => {
    const select = document.createElement("select");
    const D = gene;
    const r = gene.toLowerCase();

    [D + D, D + r, r + r].forEach(v => {
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
}

/* ===============================
   4. GAMETES
   =============================== */

function generateGametesDeterministic(genotypes) {
  let gametes = [""];
  genotypes.forEach(pair => {
    const alleles = pair[0] === pair[1] ? [pair[0]] : [pair[0], pair[1]];
    gametes = gametes.flatMap(g => alleles.map(a => g + a));
  });
  return gametes;
}

function mutateAllele(a, rate) {
  if (Math.random() * 100 < rate) {
    return a === a.toUpperCase() ? a.toLowerCase() : a.toUpperCase();
  }
  return a;
}

function generateGameteRandom(genotypes, mutation, crossover) {
  let g = "";
  for (let i = 0; i < genotypes.length; i++) {
    let allele = Math.random() < 0.5 ? genotypes[i][0] : genotypes[i][1];
    if (i > 0 && Math.random() * 100 < crossover) allele = g[i - 1];
    g += mutateAllele(allele, mutation);
  }
  return g;
}

/* ===============================
   5. PHENOTYPE
   =============================== */

function getPhenotype(genotype, orgKey) {
  const traits = organisms[orgKey].traits;
  const phenotype = { traits: [], textParts: [] };

  Object.entries(genotype).forEach(([gene, pair]) => {
    const dominant = pair.includes(gene);
    const data = dominant ? traits[gene].dominant : traits[gene].recessive;

    phenotype.traits.push(data);
    phenotype.textParts.push(data.text);
  });

  phenotype.text = phenotype.textParts.join(", ");
  return phenotype;
}

/* ===============================
   6. VISUALIZATION
   =============================== */

function renderPhenotypeVisual(phenotype) {
  const container = document.getElementById("phenotypeVisual");
  container.innerHTML = "";

  phenotype.traits.forEach(t => {
    const block = document.createElement("div");
    block.className = "phenotype-trait";
    block.innerHTML = `
      <div class="phenotype-symbol">${t.symbol}</div>
      <div class="phenotype-text">${t.text}</div>
    `;
    container.appendChild(block);
  });
}

function renderExplanation(phenotype) {
  document.getElementById("explanationText").textContent =
    `Отриманий фенотип потомства:\n${phenotype.text}.\n` +
    `Прояв ознак визначається домінантними та рецесивними алелями батьків.`;
}

/* ===============================
   7. PUNNETT TABLE (DEMO)
   =============================== */

function renderPunnettTable(p1, p2) {
  const container = document.getElementById("punnett");
  container.innerHTML = "";

  const g1 = generateGametesDeterministic(p1);
  const g2 = generateGametesDeterministic(p2);

  const table = document.createElement("table");
  table.className = "punnett-table";

  table.innerHTML =
    "<tr><th>♂ / ♀</th>" + g2.map(g => `<th>${g}</th>`).join("") + "</tr>";

  let examplePhenotype = null;

  g1.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<th>${r}</th>`;

    g2.forEach(c => {
      const genotype = {};
      for (let i = 0; i < r.length; i++) {
        const gene = r[i].toUpperCase();
        genotype[gene] = [r[i], c[i]].sort().join("");
      }

      const ph = getPhenotype(genotype, organism.value);
      if (!examplePhenotype) examplePhenotype = ph;

      tr.innerHTML += `
        <td>
          <strong>${Object.values(genotype).join(" ")}</strong>
          <div>${ph.text}</div>
          <div>${ph.traits.map(t => t.symbol).join(" ")}</div>
        </td>`;
    });

    table.appendChild(tr);
  });

  container.appendChild(table);

  if (examplePhenotype) {
    renderPhenotypeVisual(examplePhenotype);
    renderExplanation(examplePhenotype);
  }
}

/* ===============================
   8. STATISTICS
   =============================== */

function renderPhenotypeStats(stats) {
  const list = document.getElementById("phenotypeList");
  list.innerHTML = "";

  Object.entries(stats).forEach(([k, v]) => {
    const li = document.createElement("li");
    li.textContent = `${k} — ${v}`;
    list.appendChild(li);
  });
}

/* ===============================
   9. EXPERIMENT
   =============================== */

function runExperiment(p1, p2, cfg) {
  const stats = {};
  let lastPhenotype = null;

  for (let i = 0; i < cfg.runs; i++) {
    const g1 = generateGameteRandom(p1, cfg.mutation, cfg.crossover);
    const g2 = generateGameteRandom(p2, cfg.mutation, cfg.crossover);

    const genotype = {};
    for (let j = 0; j < g1.length; j++) {
      const gene = g1[j].toUpperCase();
      genotype[gene] = [g1[j], g2[j]].sort().join("");
    }

    const ph = getPhenotype(genotype, organism.value);
    lastPhenotype = ph;
    stats[ph.text] = (stats[ph.text] || 0) + 1;
  }

  return { stats, lastPhenotype };
}

/* ===============================
   10. MAIN CONTROLLER
   =============================== */

function runSimulation() {
  const p1 = [...parent1.querySelectorAll("select")].map(s => s.value);
  const p2 = [...parent2.querySelectorAll("select")].map(s => s.value);

  if (mode.value === MODES.DEMO) {
    renderPunnettTable(p1, p2);
    return;
  }

  const result = runExperiment(p1, p2, {
    runs: +experimentCount.value,
    mutation: +mutationRate.value,
    crossover: +crossRate.value
  });

  renderPhenotypeStats(result.stats);
  renderPhenotypeVisual(result.lastPhenotype);
  renderExplanation(result.lastPhenotype);
}

/* ===============================
   11. EVENTS
   =============================== */

organism.onchange = initParents;
crossType.onchange = initParents;
runCross.onclick = runSimulation;

initParents();
