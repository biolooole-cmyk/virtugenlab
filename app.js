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
const dominanceType = document.getElementById("dominanceType");

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
        recessive: { text: "Блакитні очі", symbol: "👁️🔵" },
        intermediate: { text: "Зелені очі", symbol: "👁️🟢" }
      },
      B: {
        dominant: { text: "Темне волосся", symbol: "🧑🏽‍🦱" },
        recessive: { text: "Світле волосся", symbol: "🧑🏼‍🦱" },
        intermediate: { text: "Русяве волосся", symbol: "🧑🏼" }
      },
      C: {
        dominant: { text: "Є веснянки", symbol: "✨" },
        recessive: { text: "Немає веснянок", symbol: "🚫✨" },
        intermediate: { text: "Деякі веснянки", symbol: "✨💫" }
      }
    }
  },

  cat: {
    name: "Кіт",
    genes: ["A", "B", "C"],
    traits: {
      A: {
        dominant: { text: "Темна шерсть", symbol: "🐈‍⬛" },
        recessive: { text: "Світла шерсть", symbol: "🐈" },
        intermediate: { text: "Сіра шерсть", symbol: "🐱" }
      },
      B: {
        dominant: { text: "Зелені очі", symbol: "👁️🟢" },
        recessive: { text: "Блакитні очі", symbol: "👁️🔵" },
        intermediate: { text: "Жовто-зелені очі", symbol: "👁️🟡" }
      },
      C: {
        dominant: { text: "Коротка шерсть", symbol: "✂️" },
        recessive: { text: "Довга шерсть", symbol: "🧶" },
        intermediate: { text: "Середня шерсть", symbol: "✂️🧶" }
      }
    }
  },

  rose: {
    name: "Роза",
    genes: ["A", "B", "C"],
    traits: {
      A: {
        dominant: { text: "Червоні пелюстки", symbol: "🌹" },
        recessive: { text: "Білі пелюстки", symbol: "🤍🌹" },
        intermediate: { text: "Рожеві пелюстки", symbol: "🌷" }
      },
      B: {
        dominant: { text: "Махрова квітка", symbol: "🌸" },
        recessive: { text: "Проста квітка", symbol: "🌼" },
        intermediate: { text: "Напівмахрова квітка", symbol: "🌺" }
      },
      C: {
        dominant: { text: "Високий кущ", symbol: "⬆️🌿" },
        recessive: { text: "Низький кущ", symbol: "⬇️🌿" },
        intermediate: { text: "Середній кущ", symbol: "↔️🌿" }
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

/* ===============================
   3.1 UNIFIED PHENOTYPE DETERMINATION (SINGLE SOURCE OF TRUTH)
   =============================== */

/**
 * Єдина функція визначення фенотипу для одного гена
 * Використовується у плашках, легенді, таблиці Пеннета
 * @param {string} genotype - генотип (AA, Aa, aa)
 * @param {string} gene - назва гена (A, B, C)
 * @param {string} orgKey - ключ організму (human, cat, rose)
 * @param {boolean} isComplete - чи повне домінування
 * @returns {object} - {text, symbol}
 */
function getSingleGenePhenotype(genotype, gene, orgKey, isComplete) {
  const traits = organisms[orgKey].traits[gene];
  if (!traits) return { text: "", symbol: "" };
  
  const isHeterozygous = genotype[0] !== genotype[1];
  const hasDominant = genotype.includes(gene);
  
  // При неповному домінуванні гетерозигота має проміжний фенотип
  if (!isComplete && isHeterozygous && traits.intermediate) {
    return traits.intermediate;
  }
  
  return hasDominant ? traits.dominant : traits.recessive;
}

// Обгортка для зручності (використовує поточні налаштування)
function getPhenotypeForGenotype(genotype, gene) {
  const isComplete = dominanceType.value === "complete";
  return getSingleGenePhenotype(genotype, gene, organism.value, isComplete);
}

// Функція для оновлення фенотипної плашки
function updatePhenotypeBadge(badge, genotype, gene) {
  const phenotype = getPhenotypeForGenotype(genotype, gene);
  badge.innerHTML = `
    <span class="phenotype-badge-icon">${phenotype.symbol}</span>
    <span class="phenotype-badge-text">${phenotype.text}</span>
  `;
  
  // Визначаємо клас залежно від типу фенотипу
  const traits = organisms[organism.value].traits[gene];
  const isComplete = dominanceType.value === "complete";
  const isHeterozygous = genotype[0] !== genotype[1];
  const hasDominant = genotype.includes(gene);
  
  let badgeClass = "phenotype-badge ";
  if (!isComplete && isHeterozygous && traits.intermediate) {
    badgeClass += "phenotype-intermediate";
  } else if (hasDominant) {
    badgeClass += "phenotype-dominant";
  } else {
    badgeClass += "phenotype-recessive";
  }
  
  badge.className = badgeClass;
}

function createParentUI(containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = "";

  getActiveGenes().forEach(gene => {
    // Створюємо контейнер для гена
    const geneContainer = document.createElement("div");
    geneContainer.className = "gene-container";
    
    // Створюємо фенотипну плашку
    const badge = document.createElement("div");
    badge.className = "phenotype-badge";
    badge.setAttribute("data-gene", gene);
    
    // Створюємо select
    const select = document.createElement("select");
    select.setAttribute("data-gene", gene);
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
    
    // Оновлюємо плашку при зміні select та запускаємо симуляцію
    select.addEventListener("change", () => {
      updatePhenotypeBadge(badge, select.value, gene);
      // Запускаємо симуляцію для оновлення результатів
      runSimulation();
    });
    
    // Ініціалізуємо плашку з початковим значенням
    updatePhenotypeBadge(badge, select.value, gene);
    
    // Додаємо елементи до контейнера
    geneContainer.appendChild(badge);
    geneContainer.appendChild(select);
    el.appendChild(geneContainer);
  });
}

function updateAllPhenotypeBadges() {
  // Оновлюємо плашки для обох батьків
  ["parent1", "parent2"].forEach(parentId => {
    const parentEl = document.getElementById(parentId);
    if (!parentEl) return;
    
    const badges = parentEl.querySelectorAll(".phenotype-badge");
    const selects = parentEl.querySelectorAll("select[data-gene]");
    
    badges.forEach((badge, idx) => {
      const select = selects[idx];
      if (select && badge) {
        const gene = badge.getAttribute("data-gene");
        if (gene) {
          updatePhenotypeBadge(badge, select.value, gene);
        }
      }
    });
  });
}

/**
 * Синхронізація всього UI
 * Викликається при будь-якій зміні налаштувань
 */
function syncUI() {
  // Оновлюємо легенду алелей
  renderAlleleLegend();
  
  // Оновлюємо фенотипні плашки
  updateAllPhenotypeBadges();
  
  // Запускаємо симуляцію для оновлення результатів
  runSimulation();
}

function initParents() {
  createParentUI("parent1");
  createParentUI("parent2");
  // Оновлюємо плашки після створення UI
  setTimeout(() => {
    updateAllPhenotypeBadges();
    renderAlleleLegend();
  }, 0);
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
   6. PHENOTYPE (TEXT + EMOJI)
   =============================== */

/**
 * Визначення фенотипу для множини генів (використовує єдину функцію)
 * @param {object} genotype - об'єкт {A: "AA", B: "aa", ...}
 * @param {string} orgKey - ключ організму
 * @returns {object} - {text, visual, key, textParts, symbols}
 */
function getPhenotype(genotype, orgKey) {
  const ph = {
    textParts: [],
    symbols: []
  };

  const isComplete = dominanceType.value === "complete";

  Object.entries(genotype).forEach(([gene, pair]) => {
    // Використовуємо єдину функцію визначення фенотипу
    const trait = getSingleGenePhenotype(pair, gene, orgKey, isComplete);
    ph.textParts.push(trait.text);
    ph.symbols.push(trait.symbol);
  });

  ph.text = ph.textParts.join(", ");
  ph.visual = ph.symbols.join(" ");
  ph.key = ph.text + "|" + ph.visual;

  return ph;
}

/* ===============================
   7. ANALYSIS (SAFE)
   =============================== */

function analyzePhenotypes(cells) {
  const stats = {};

  cells.forEach(p => {
    if (!stats[p.key]) {
      stats[p.key] = {
        text: p.text,
        visual: p.visual,
        count: 0
      };
    }
    stats[p.key].count++;
  });

  const total = cells.length;

  return Object.values(stats).map(p => ({
    text: p.text,
    visual: p.visual,
    count: p.count,
    percent: ((p.count / total) * 100).toFixed(1)
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
    d.innerHTML = `
      <div class="phenotype-symbol">${p.visual}</div>
      <div class="phenotype-text">${p.text}</div>
      <div class="phenotype-percent">${p.percent}%</div>
    `;
    phenotypeVisual.appendChild(d);
  });
}


/* ===============================
   7.1 GENETIC EXPLANATION GENERATOR
   =============================== */

// Функція для аналізу генотипу (гомозигота/гетерозигота)
function analyzeGenotype(genotype) {
  const result = {
    isHomozygous: genotype[0] === genotype[1],
    isHeterozygous: genotype[0] !== genotype[1],
    isDominant: genotype[0] === genotype[0].toUpperCase() && genotype[1] === genotype[1].toUpperCase(),
    isRecessive: genotype[0] === genotype[0].toLowerCase() && genotype[1] === genotype[1].toLowerCase(),
    hasDominant: genotype.includes(genotype[0].toUpperCase())
  };
  return result;
}

// Функція для аналізу співвідношення фенотипів
function analyzePhenotypeRatios(analysis) {
  const ratios = analysis.map(p => ({
    text: p.text,
    percent: parseFloat(p.percent),
    count: p.count,
    visual: p.visual
  }));
  
  // Визначаємо проміжні фенотипи за ключовими словами
  const intermediateKeywords = ['проміж', 'рожев', 'сір', 'зелен', 'русяв', 'середн', 'напів'];
  const recessiveKeywords = ['біл', 'світл', 'немає'];
  
  const intermediate = ratios.filter(p => {
    const textLower = p.text.toLowerCase();
    return intermediateKeywords.some(keyword => textLower.includes(keyword));
  });
  
  const recessive = ratios.filter(p => {
    const textLower = p.text.toLowerCase();
    return recessiveKeywords.some(keyword => textLower.includes(keyword)) && 
           !intermediateKeywords.some(keyword => textLower.includes(keyword));
  });
  
  const dominant = ratios.filter(p => 
    !intermediate.includes(p) && !recessive.includes(p)
  );
  
  return { dominant, recessive, intermediate, all: ratios };
}

// Генерація якісного генетичного пояснення
function generateGeneticExplanation(analysis, parent1Genotypes, parent2Genotypes) {
  const isComplete = dominanceType.value === "complete";
  const crossTypeValue = Number(crossType.value);
  const genes = getActiveGenes();
  const orgTraits = organisms[organism.value].traits;
  
  let explanation = "Результати схрещування пояснюються особливостями спадкування обраних ознак.\n\n";
  
  // Аналізуємо генотипи батьків
  const parent1Analysis = parent1Genotypes.map((gt, idx) => ({
    genotype: gt,
    gene: genes[idx],
    analysis: analyzeGenotype(gt)
  }));
  
  const parent2Analysis = parent2Genotypes.map((gt, idx) => ({
    genotype: gt,
    gene: genes[idx],
    analysis: analyzeGenotype(gt)
  }));
  
  // Блок про домінантні та рецесивні алелі
  explanation += "Домінантні та рецесивні алелі:\n";
  genes.forEach((gene, idx) => {
    const trait = orgTraits[gene];
    const p1 = parent1Analysis[idx];
    const p2 = parent2Analysis[idx];
    
    explanation += `• Ген ${gene}: домінантний алель (${gene}) визначає "${trait.dominant.text}", а рецесивний (${gene.toLowerCase()}) — "${trait.recessive.text}". `;
    
    if (p1.analysis.isHomozygous && p2.analysis.isHomozygous) {
      if (p1.analysis.isDominant && p2.analysis.isDominant) {
        explanation += `Обидва батьки гомозиготні домінантні (${p1.genotype} × ${p2.genotype}), тому все потомство матиме домінантну ознаку.\n`;
      } else if (p1.analysis.isRecessive && p2.analysis.isRecessive) {
        explanation += `Обидва батьки гомозиготні рецесивні (${p1.genotype} × ${p2.genotype}), тому все потомство матиме рецесивну ознаку.\n`;
      }
    } else {
      explanation += `Батько 1: ${p1.genotype}, Батько 2: ${p2.genotype}.\n`;
    }
  });
  
  explanation += "\n";
  
  // Блок про гетерозиготні поєднання
  const hasHeterozygotes = parent1Analysis.some(p => p.analysis.isHeterozygous) || 
                           parent2Analysis.some(p => p.analysis.isHeterozygous);
  
  if (hasHeterozygotes) {
    explanation += "Гетерозиготні поєднання:\n";
    genes.forEach((gene, idx) => {
      const p1 = parent1Analysis[idx];
      const p2 = parent2Analysis[idx];
      
      if (p1.analysis.isHeterozygous || p2.analysis.isHeterozygous) {
        explanation += `• Ген ${gene}: `;
        if (p1.analysis.isHeterozygous && p2.analysis.isHeterozygous) {
          explanation += `Обидва батьки гетерозиготні (${p1.genotype} × ${p2.genotype}). `;
          if (isComplete) {
            explanation += `При повному домінуванні це дає класичне співвідношення 3:1 (домінантна:рецесивна ознака) у потомстві.\n`;
          } else {
            explanation += `При неповному домінуванні це дає співвідношення 1:2:1 (домінантна:проміжна:рецесивна ознака).\n`;
          }
        } else if (p1.analysis.isHeterozygous) {
          explanation += `Батько 1 гетерозиготний (${p1.genotype}), що збільшує різноманітність потомства.\n`;
        } else {
          explanation += `Батько 2 гетерозиготний (${p2.genotype}), що збільшує різноманітність потомства.\n`;
        }
      }
    });
    explanation += "\n";
  }
  
  // Блок про неповне домінування
  if (!isComplete) {
    explanation += "Вплив неповного домінування:\n";
    explanation += "При неповному домінуванні гетерозиготні організми (наприклад, Aa) виявляють проміжний фенотип, ";
    explanation += "а не домінантний. Це означає, що жоден алель не пригнічує інший повністю, ";
    explanation += "і в результаті проявляється середнє значення ознаки між домінантною та рецесивною формами.\n\n";
    
    explanation += "Чому з'являється проміжний фенотип:\n";
    explanation += "Гетерозигота містить обидва алелі (домінантний і рецесивний), але жоден не домінує повністю. ";
    explanation += "Тому експресія гена дає проміжний результат, який відрізняється від обох гомозиготних форм.\n\n";
  } else {
    explanation += "Повне домінування:\n";
    explanation += "При повному домінуванні домінантний алель повністю пригнічує прояв рецесивного. ";
    explanation += "Тому гетерозигота (Aa) має такий самий фенотип, як гомозигота домінантна (AA).\n\n";
  }
  
  // Аналіз співвідношень
  const ratios = analyzePhenotypeRatios(analysis);
  
  explanation += "Співвідношення фенотипів:\n";
  
  if (ratios.intermediate.length > 0) {
    // Неповне домінування: є проміжні фенотипи
    explanation += `У потомстві спостерігається ${ratios.all.length} різних фенотипів. `;
    
    const parts = [];
    if (ratios.dominant.length > 0) {
      parts.push(`домінантна ознака — ${ratios.dominant[0].percent}%`);
    }
    if (ratios.intermediate.length > 0) {
      parts.push(`проміжний фенотип — ${ratios.intermediate[0].percent}%`);
    }
    if (ratios.recessive.length > 0) {
      parts.push(`рецесивна ознака — ${ratios.recessive[0].percent}%`);
    }
    
    explanation += `Розподіл: ${parts.join(', ')}. `;
    explanation += `Це співвідношення виникає через неповне домінування, коли гетерозиготні організми виявляють проміжний фенотип.\n\n`;
  } else {
    // Повне домінування
    if (ratios.dominant.length > 0 && ratios.recessive.length > 0) {
      const domPercent = ratios.dominant[0].percent;
      const recPercent = ratios.recessive[0].percent;
      explanation += `У потомстві домінантна ознака проявляється у ${domPercent}% випадків, а рецесивна — у ${recPercent}% випадків. `;
      explanation += `Це співвідношення виникає через те, що домінантний алель маскує прояв рецесивного у гетерозиготних організмах. `;
      explanation += `Класичне співвідношення 3:1 (домінантна:рецесивна) спостерігається, коли обидва батьки гетерозиготні.\n\n`;
    } else if (ratios.dominant.length > 0) {
      explanation += `Усе потомство має домінантну ознаку (${ratios.dominant[0].percent}%), `;
      explanation += `оскільки принаймні один з батьків є гомозиготним домінантним, або обидва батьки мають домінантний алель. `;
      explanation += `У цьому випадку рецесивний алель не може проявитися, навіть якщо він присутній у генотипі.\n\n`;
    } else if (ratios.recessive.length > 0) {
      explanation += `Усе потомство має рецесивну ознаку (${ratios.recessive[0].percent}%), `;
      explanation += `оскільки обидва батьки є гомозиготними рецесивними. `;
      explanation += `Це означає, що потомство може успадкувати тільки рецесивні алелі від обох батьків.\n\n`;
    }
  }
  
  // Узагальнюючий висновок
  explanation += "Висновок:\n";
  explanation += "Результати схрещування демонструють, як комбінація алелів від батьків визначає фенотип потомства. ";
  if (!isComplete) {
    explanation += "Неповне домінування дозволяє спостерігати проміжні форми, що робить зв'язок між генотипом і фенотипом більш наочним.";
  } else {
    explanation += "Повне домінування показує, як один алель може приховати прояв іншого, що є важливим механізмом спадкування.";
  }
  
  return explanation;
}

function renderExplanationFromAnalysis(analysis, parent1Genotypes, parent2Genotypes) {
  explanationText.textContent = generateGeneticExplanation(analysis, parent1Genotypes, parent2Genotypes);
}

/**
 * Відображення легенди алелей (тільки для активних генів)
 * Використовує єдину функцію визначення фенотипу
 */
function renderAlleleLegend() {
  if (!alleleLegend) return;
  
  alleleLegend.innerHTML = "";
  const isComplete = dominanceType.value === "complete";
  const activeGenes = getActiveGenes();
  const orgKey = organism.value;
  
  // Показуємо тільки активні гени (mono/di/tri)
  activeGenes.forEach(gene => {
    const traits = organisms[orgKey].traits[gene];
    if (!traits) return;
    
    // Використовуємо єдину функцію для отримання фенотипів
    const dominantPheno = getSingleGenePhenotype(gene + gene, gene, orgKey, isComplete);
    const recessivePheno = getSingleGenePhenotype(gene.toLowerCase() + gene.toLowerCase(), gene, orgKey, isComplete);
    
    let legendContent = `<div class="allele-item">
      <strong>${gene}</strong> (домінантний) — ${dominantPheno.text} ${dominantPheno.symbol}<br>
      <strong>${gene.toLowerCase()}</strong> (рецесивний) — ${recessivePheno.text} ${recessivePheno.symbol}`;
    
    // Додаємо проміжний фенотип, якщо неповне домінування
    if (!isComplete && traits.intermediate) {
      const intermediatePheno = getSingleGenePhenotype(gene + gene.toLowerCase(), gene, orgKey, isComplete);
      legendContent += `<br><strong>${gene}${gene.toLowerCase()}</strong> (гетерозигота) — ${intermediatePheno.text} ${intermediatePheno.symbol} (проміжний фенотип)`;
    }
    
    legendContent += `</div>`;
    alleleLegend.innerHTML += legendContent;
  });
}

function renderPunnettTable(g1, g2) {
  punnett.innerHTML = "";
  const table = document.createElement("table");
  table.className = "punnett-table";

  // Функція для отримання фенотипу з генотипу гамети
  // Гамета містить тільки один алель, тому показуємо символ домінантного або рецесивного
  const getPhenotypeFromGamete = (gamete) => {
    const orgKey = organism.value;
    const genes = getActiveGenes();
    const symbols = [];
    const isComplete = dominanceType.value === "complete";
    
    genes.forEach((gene, idx) => {
      const allele = gamete[idx];
      // Для гамети використовуємо єдину функцію (гамета = один алель, тому генеруємо генотип)
      const genotype = allele === gene ? gene + gene : gene.toLowerCase() + gene.toLowerCase();
      const pheno = getSingleGenePhenotype(genotype, gene, orgKey, isComplete);
      symbols.push(pheno.symbol);
    });
    
    return symbols.join(" ");
  };

  // Функція для отримання повного генотипу з двох гамет
  const getFullGenotype = (g1, g2) => {
    const genes = getActiveGenes();
    const result = {};
    g1.split("").forEach((a, i) => {
      const gene = genes[i];
      if (gene) {
        result[gene] = [a, g2[i]].sort().join("");
      }
    });
    return result;
  };

  // Створюємо заголовки
  let headerRow = `<tr><th></th>`;
  g2.forEach(g => {
    const phenotype = getPhenotypeFromGamete(g);
    headerRow += `<th><div class="gamete-header">${g}<br><span class="gamete-phenotype">${phenotype}</span></div></th>`;
  });
  headerRow += `</tr>`;
  
  // Створюємо рядки таблиці
  let rows = g1.map(r => {
    const rowPhenotype = getPhenotypeFromGamete(r);
    let row = `<tr><th><div class="gamete-header">${r}<br><span class="gamete-phenotype">${rowPhenotype}</span></div></th>`;
    row += g2.map(c => {
      const genotype = r + c;
      const fullGenotype = getFullGenotype(r, c);
      const phenotype = getPhenotype(fullGenotype, organism.value);
      return `<td class="punnett-cell" title="${phenotype.text}">
        <div class="punnett-genotype">${genotype}</div>
        <div class="punnett-phenotype">${phenotype.visual}</div>
      </td>`;
    }).join("");
    row += `</tr>`;
    return row;
  }).join("");

  table.innerHTML = headerRow + rows;
  punnett.appendChild(table);
}

function renderAll(a, parent1Genotypes, parent2Genotypes) {
  renderPhenotypeVisualFromAnalysis(a);
  renderExplanationFromAnalysis(a, parent1Genotypes, parent2Genotypes);
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
    r.split("").forEach((a, i) => {
      gt[a.toUpperCase()] = [a, c[i]].sort().join("");
    });
    phenotypes.push(getPhenotype(gt, organism.value));
  }));

  renderAll(analyzePhenotypes(phenotypes), p1, p2);
}

function runExperiment(p1, p2) {
  punnett.innerHTML = "";
  const runs = Number(experimentCount.value);
  const phenotypes = [];

  for (let i = 0; i < runs; i++) {
    const g1 = formGamete(p1);
    const g2 = formGamete(p2);

    const gt = {};
    g1.split("").forEach((a, i) => {
      gt[a.toUpperCase()] = [a, g2[i]].sort().join("");
    });

    phenotypes.push(getPhenotype(gt, organism.value));
  }

  renderAll(analyzePhenotypes(phenotypes), p1, p2);
}

/* ===============================
   10. CONTROLLER
   =============================== */

function runSimulation() {
  // Перевірка наявності елементів
  if (!parent1 || !parent2) return;
  
  const selects1 = parent1.querySelectorAll("select");
  const selects2 = parent2.querySelectorAll("select");
  
  // Перевірка, чи є селектори
  if (selects1.length === 0 || selects2.length === 0) return;
  
  const p1 = [...selects1].map(s => s.value);
  const p2 = [...selects2].map(s => s.value);

  mode.value === MODES.DEMO
    ? runDemo(p1, p2)
    : runExperiment(p1, p2);
}

/* ===============================
   11. EVENTS
   =============================== */

organism.onchange = () => {
  initParents();
  syncUI();
};

crossType.onchange = () => {
  initParents();
  syncUI();
};

dominanceType.onchange = () => {
  syncUI();
};

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
  runSimulation();
};

mutationValue.textContent = `${mutationRate.value}%`;
crossValue.textContent = `${crossRate.value}%`;

// Ініціалізація при завантаженні сторінки
mode.onchange();
initParents();
// Використовуємо syncUI для повного оновлення
setTimeout(() => {
  syncUI();
}, 100);
