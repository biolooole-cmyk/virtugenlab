/* =====================================================
   VIRTUAL GENETIC LAB – CORE LOGIC
   Level: Grade 9 (Advanced)
   DEMO: Punnett table (mono / di / tri)
   EXPERIMENT: random simulation (mutation + crossover)
   ===================================================== */

const MODES = { DEMO: "demo", EXPERIMENT: "experiment" };

/* ===============================
   2. ORGANISM MODELS
   =============================== */
const organisms = {
  human: {
    name: "Людина",
    genes: ["A", "B", "C"],
    traits: {
      A: { dominant: { text: "Карі очі" }, recessive: { text: "Блакитні очі" } },
      B: { dominant: { text: "Темне волосся" }, recessive: { text: "Світле волосся" } },
      C: { dominant: { text: "Є веснянки" }, recessive: { text: "Немає веснянок" } }
    }
  },
  cat: {
    name: "Кіт",
    genes: ["A", "B", "C"],
    traits: {
      A: { dominant: { text: "Темна шерсть" }, recessive: { text: "Світла шерсть" } },
      B: { dominant: { text: "Зелені очі" }, recessive: { text: "Блакитні очі" } },
      C: { dominant: { text: "Коротка шерсть" }, recessive: { text: "Довга шерсть" } }
    }
  },
  rose: {
    name: "Роза",
    genes: ["A", "B", "C"],
    traits: {
      A: { dominant: { text: "Червоні пелюстки" }, recessive: { text: "Білі пелюстки" } },
      B: { dominant: { text: "Махрова квітка" }, recessive: { text: "Проста квітка" } },
      C: { dominant: { text: "Високий кущ" }, recessive: { text: "Низький кущ" } }
    }
  }
};

/* ===============================
   3. UI HELPERS
   =============================== */
function getActiveGenes() {
  const count = Number(crossType.value);
  const orgKey = organism.value;
  return organisms[orgKey].genes.slice(0, count);
}
function createParentUI(containerId) {
  const genes = getActiveGenes();
  const el = document.getElementById(containerId);
  el.innerHTML = "";
  genes.forEach(gene => {
    const select = document.createElement("select");
    [gene+gene, gene+gene.toLowerCase(), gene.toLowerCase()+gene.toLowerCase()].forEach(value => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      select.appendChild(opt);
    });
    el.appendChild(select);
  });
}
function initParents() { createParentUI("parent1"); createParentUI("parent2"); }

/* ===============================
   4. GAMETES
   =============================== */
function generateGametesDeterministic(genotypes) {
  let gametes = [""];
  genotypes.forEach(pair => {
    const alleles = pair[0]===pair[1] ? [pair[0]] : [pair[0],pair[1]];
    gametes = gametes.flatMap(g => alleles.map(a => g+a));
  });
  return gametes;
}
function mutateAllele(a, rate) {
  if (Math.random()*100<rate) return a===a.toUpperCase()?a.toLowerCase():a.toUpperCase();
  return a;
}
function generateGameteRandom(genotypes, mutation, crossover) {
  let gamete="";
  for (let i=0;i<genotypes.length;i++) {
    let allele = Math.random()<0.5?genotypes[i][0]:genotypes[i][1];
    if (i>0 && Math.random()*100<crossover) allele=gamete[i-1];
    gamete+=mutateAllele(allele,mutation);
  }
  return gamete;
}

/* ===============================
   5. PHENOTYPE
   =============================== */
function getPhenotype(genotype, orgKey) {
  const traits=organisms[orgKey].traits;
  const text=[]; 
  Object.entries(genotype).forEach(([gene,pair])=>{
    const dominant=pair.includes(gene);
    const ph=dominant?traits[gene].dominant:traits[gene].recessive;
    text.push(ph.text);
  });
  return { text:text.join(", ") };
}

/* ===============================
   6. PUNNETT TABLE
   =============================== */
function formatGenotypeWithHighlight(pair,gene){
  return pair.split("").map(a=>a===gene?`<span class="allele-dominant">${a}</span>`:`<span class="allele-recessive">${a}</span>`).join("");
}
function renderPunnettTable(p1,p2){
  const container=document.getElementById("punnett");
  container.innerHTML="";
  const g1=generateGametesDeterministic(p1);
  const g2=generateGametesDeterministic(p2);
  const orgKey=organism.value;
  const table=document.createElement("table");
  table.className="punnett-table";
  const header=document.createElement("tr");
  header.innerHTML="<th>Гамети ♂ / ♀</th>"+g2.map(g=>`<th>${g}</th>`).join("");
  table.appendChild(header);
  g1.forEach(row=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<th>${row}</th>`;
    g2.forEach(col=>{
      const genotype={};
      const genotypeHTML=[];
      for(let i=0;i<row.length;i++){
        const gene=row[i].toUpperCase();
        const pair=[row[i],col[i]].sort().join("");
        genotype[gene]=pair;
        genotypeHTML.push(formatGenotypeWithHighlight(pair,gene));
      }
      const ph=getPhenotype(genotype,orgKey);
      tr.innerHTML+=`<td><strong>${genotypeHTML.join(" ")}</strong><div>${ph.text}</div></td>`;
    });
    table.appendChild(tr);
  });
  container.appendChild(table);
}

/* ===============================
   7. EXPERIMENT
   =============================== */
function runExperiment(p1,p2,cfg){
  const stats={}; const orgKey=organism.value;
  for(let i=0;i<cfg.runs;i++){
    const g1=generateGameteRandom(p1,cfg.mutation,cfg.crossover);
    const g2=generateGameteRandom(p2,cfg.mutation,cfg.crossover);
    const genotype={};
    for(let j=0;j<g1.length;j++){
      const gene=g1[j].toUpperCase();
      genotype[gene]=[g1[j],g2[j]].sort().join("");
    }
    const ph=getPhenotype(genotype,orgKey);
    stats[ph.text]=(stats[ph.text]||0)+1;
  }
  return stats;
}

/* ===============================
   8. PHENOTYPE STATS + CHART
   =============================== */
function renderPhenotypeStats(stats){
  const list=document.getElementById("phenotypeList");
  const chartCanvas=document.getElementById("chart");
  list.innerHTML="";
  const total=Object.values(stats).reduce((a,b)=>a+b,0);
  Object.entries(stats).forEach(([phenotype,count])=>{
    const li=document.createElement("li");
    const percent=((count/total)*100).toFixed(1);
    li.innerHTML=`<strong>${phenotype}</strong> — ${count} (${percent}%)`;
    list.appendChild(li);
  });
  if(window.myChart) window.myChart.destroy();
  window.myChart=new Chart(chartCanvas,{type:"pie",data:{labels:Object.keys(stats),datasets:[{data:Object.values(stats),backgroundColor:["#58a6ff","#3fb950","#d29922","#d73a49","#8b949e"]}]},options:{plugins:{legend:{labels:{color:"#e6edf3"}}}}});
  renderExplanation(stats,total);
  const examplePh=Object.keys(stats)[0];
  renderPhenotypeVisual({text:examplePh},organism.value);
}

/* ===============================
   9. PHENOTYPE VISUAL (EMOJI)
   =============================== */
function renderPhenotypeVisual(phenotype,orgKey){
  const visual=document.getElementById("phenotypeVisual");
  visual.innerHTML="";
  const emojiMap={
    human:{"Карі очі":"