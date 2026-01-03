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
  renderAlleleLegend();
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
   6. PHENOTYPE ANALYSIS
   =============================== */

function analyzePhenotypesFromPunnett(cells) {
  const stats = {};
  cells.forEach(ph => {
    stats[ph.text] = (stats[ph.text] || 0) + 1;
  });

  const total = cells.length;
  return Object.entries(stats)
    .map(([text, count]) => ({
      text,
      count,
      percent: ((count / total) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);
}

/* ===============================
   7. RENDER HELPERS
   =============================== */

function renderAlleleLegend() {
  const el = document.getElementById("alleleLegend");
  if (!el) return;

  el.innerHTML = "";
  const traits = organisms[organism.value].traits;

  Object.entries(traits).forEach(([gene, tr]) => {
    el.innerHTML += `
      <div class="allele-item">
        <strong>${gene}</strong> — ${tr.dominant.text} ${tr.dominant.symbol}<br>
        <strong>${gene.toLowerCase()}</strong> — ${tr.recessive.text} ${tr.recessive.symbol}
      </div>
    `;
  });
}

function renderPhenotypeVisualFromAnalysis(analysis) {
  const container = document.getElementById("phenotypeVisual");
  container.innerHTML = "";

  analysis.forEach(item => {
    const symbols = [];
    const orgTraits = organisms[organism.value].traits;

    Object.values(orgTraits).forEach(tr => {
      if (item.text.includes(tr.dominant.text)) symbols.push(tr.dominant.symbol);
      if (item.text.includes(tr.recessive.text)) symbols.push(tr.recessive.symbol);
    });

    container.innerHTML += `
      <div class="phenotype-trait">
        <div class="phenotype-symbol">${symbols.join(" ")}</div>
        <div class="phenotype-text">${item.text} (${item.percent}%)</div>
      </div>
    `;
  });
}

function renderPhenotypeStats(analysis) {
  const el = document.getElementById("phenotypeStats");
  if (!el) return;

  el.innerHTML = "";
  analysis.forEach(a => {
    el.innerHTML += `
      <div class="phenotype-stat">
        <span>${a.text}</span> — ${a.percent}% (${a.count})
      </div>
    `;
  });
}

function renderExplanationFromAnalysis(analysis) {
  const el = document.getElementById("explanationText");
  let text = "Аналіз фенотипів потомства:\n\n";

  analysis.forEach(a => {
    text += `• ${a.text} — ${a.percent}%\n`;
  });

  text += "\nСпіввідношення фенотипів відповідає законам Менделя.";
  el.textContent = text;
}

/* ===============================
   8. PUNNETT TABLE (DEMO)
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

  const phenotypeCells = [];

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
      phenotypeCells.push(ph);

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

  const analysis = analyzePhenotypesFromPunnett(phenotypeCells);
  renderPhenotypeVisualFromAnalysis(analysis);
  renderPhenotypeStats(analysis);
  renderExplanationFromAnalysis(analysis);
}

/* ===============================
   9. MAIN CONTROLLER
   =============================== */

function runSimulation() {
  const p1 = [...parent1.querySelectorAll("select")].map(s => s.value);
  const p2 = [...parent2.querySelectorAll("select")].map(s => s.value);

  if (mode.value === MODES.DEMO) {
    renderPunnettTable(p1, p2);
  }
}

/* ===============================
   10. EVENTS
   =============================== */

organism.onchange = initParents;
crossType.onchange = initParents;
runCross.onclick = runSimulation;

initParents();



