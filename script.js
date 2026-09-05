const groups = [
  { label: "Corpo", code: "C", rows: [
    ["Saúde", "Cuidar", "Prevenir", "Sono e ciclos", "Estresse e ansiedade", "Terapias somáticas"],
    ["Vitalidade", "Alimentação", "Movimento e força", "Descanso", "Esporte", "Técnicas corporais"],
    ["Fluxo e prazer", "Expressão corporal", "Natureza", "Prazer sensorial", "Eros"],
    ["Identidade", "Modelagem", "Dieta", "Intervenção", "Apresentação"],
    ["Qualidades", "Consciência", "Relaxamento", "Mobilidade", "Resistência", "Coordenação e destreza"]
  ]},
  { label: "Mente", code: "M", rows: [
    ["Saúde", "Cuidar", "Terapia", "Meditação e regulação", "Detox cognitivo", "Ócio restaurativo"],
    ["Emoções positivas", "Gratidão", "Pertencimento", "Segurança", "Amor", "Otimismo"],
    ["Fluxo e conexão", "Arte", "Cultura", "Beleza", "Hobbies", "Contemplação"],
    ["Significado", "Realidade", "Destino", "Espiritualidade", "Transcendência", "Finitude e Morte"],
    ["Qualidades", "Fluxo", "Introspecção", "Calma", "Abertura", "Gratidão", "Atenção", "Resiliência"]
  ]},
  { label: "Pessoa", code: "P", rows: [
    ["Identidade", "Individuação", "Autoestima", "Autoaceitação", "Crescimento pessoal", "Mitos pessoais", "Internalidade"],
    ["Propósito", "Carreira", "Vocação", "Legado", "Papéis sociais", "Missão", "Generatividade"],
    ["Ambiente", "Autonomia", "Domínio do ambiente", "Uso do tempo", "Organização", "Hábitos e vícios"],
    ["Conquistas", "Patrimônio", "Impulso criativo", "Experiências", "Altruísmo", "Formação"],
    ["Qualidades", "Autoeficácia", "Autorregulação", "Adaptabilidade", "Empatia", "Generosidade", "Superação"]
  ]},
  { label: "Relações", code: "R", rows: [
    ["O outro importante", "Encontrar", "Aprofundar", "Conviver", "Realinhar", "Encerrar dignamente"],
    ["Família", "Reconhecer", "Aprofundar", "Conviver", "Realinhar", "Despedir-se"],
    ["Amigos", "Encontrar", "Aprofundar", "Conviver", "Realinhar", "Encerrar dignamente"],
    ["Comunidade e Cultura", "Encontrar", "Aprofundar", "Conviver", "Realinhar", "Encerrar dignamente"],
    ["Qualidades", "Confiança", "Perdão", "Abertura", "Resiliência", "Crescimento mútuo"]
  ]}
];

const state = { selected: new Set(JSON.parse(localStorage.getItem("pdsonhos-selected") || "[]")), objectives: JSON.parse(localStorage.getItem("pdsonhos-objectives") || "{}") };
const themeGroups = document.querySelector("#theme-groups");

function themeId(group, field, theme) { return `${group.code}|${field}|${theme}`; }
function parseId(id) { const [code, field, theme] = id.split("|"); return { code, field, theme, group: groups.find(g => g.code === code)?.label || code }; }
function save() { localStorage.setItem("pdsonhos-selected", JSON.stringify([...state.selected])); localStorage.setItem("pdsonhos-objectives", JSON.stringify(state.objectives)); }

function renderThemes() {
  themeGroups.innerHTML = groups.map(group => `<article class="theme-group"><div class="group-title"><span>${group.code}</span><h3>${group.label}</h3></div><div class="theme-grid">${group.rows.flatMap(row => row.slice(1).map(theme => { const id = themeId(group, row[0], theme); return `<button class="theme-chip ${state.selected.has(id) ? "is-selected" : ""}" data-id="${id}" aria-pressed="${state.selected.has(id)}"><small>${row[0]}</small> · ${theme}</button>`; })).join("")}</div></article>`).join("");
  document.querySelector("#selection-count").textContent = state.selected.size;
}

function renderObjectives() {
  const list = document.querySelector("#objectives-list");
  const empty = document.querySelector("#empty-objectives");
  empty.hidden = state.selected.size > 0;
  list.hidden = state.selected.size === 0;
  list.innerHTML = [...state.selected].map(id => { const item = parseId(id), value = state.objectives[id] || ""; return `<article class="objective-card"><div class="objective-theme"><small>${item.group} · ${item.field}</small><strong>${item.theme}</strong></div><div class="input-wrap"><label for="obj-${safeId(id)}">Objetivo</label><input id="obj-${safeId(id)}" data-objective="${id}" maxlength="100" value="${escapeHtml(value)}" placeholder="Ex.: reservar duas manhãs por semana para..."><span class="char-count">${value.length}/100</span></div></article>`; }).join("");
}

function renderMap() {
  const content = document.querySelector("#map-content");
  const selected = [...state.selected];
  const date = new Intl.DateTimeFormat("pt-BR", { day:"2-digit", month:"long", year:"numeric" }).format(new Date());
  content.innerHTML = `<div class="map-cover"><div><h3>TOMATe</h3><p>Do sonho à agenda</p></div><span class="map-date">Criado em ${date}</span></div>${selected.length ? `<div class="map-themes">${selected.map(id => { const item = parseId(id); return `<span>${item.group} &middot; ${item.field} &middot; ${item.theme}</span>`; }).join("")}</div><div class="map-objectives">${selected.map(id => { const item=parseId(id), objective=state.objectives[id]?.trim(); return `<div class="map-item"><strong>${item.theme}<br><small>${item.group} · ${item.field}</small></strong><p class="${objective ? "" : "no-objective"}">${objective || "Objetivo ainda não definido."}</p></div>`; }).join("")}</div>` : `<div class="empty-state"><span>◇</span><h3>Seu mapa está esperando</h3><p>Selecione temas e escreva seus objetivos para construir esta visão.</p><button class="secondary next" data-next="temas">Começar agora</button></div>`}`;
}

function showStep(id) {
  document.querySelectorAll(".panel").forEach(panel => { const active=panel.id===id; panel.hidden=!active; panel.classList.toggle("is-active", active); });
  document.querySelectorAll(".step").forEach(step => step.classList.toggle("is-active", step.dataset.step===id));
  if (id === "objetivos") renderObjectives();
  if (id === "mapa") renderMap();
  window.scrollTo({ top: document.querySelector(".app-shell").offsetTop - 16, behavior:"smooth" });
}

function safeId(value) { return value.replace(/[^a-z0-9]/gi, "-"); }
function escapeHtml(value) { const node=document.createElement("div"); node.textContent=value; return node.innerHTML.replace(/"/g,"&quot;"); }
function pdfEscape(text) { return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "").replace(/([\\()])/g, "\\$1"); }
function wrap(text, max=78) { const words=text.split(/\s+/); const lines=[]; let line=""; words.forEach(word => { if ((line+" "+word).trim().length>max) { if(line) lines.push(line); line=word; } else line=(line+" "+word).trim(); }); if(line) lines.push(line); return lines; }

function generatePdf() {
  const selected=[...state.selected], lines=["TOMATe - do sonho a agenda", "Protetor de Sonhos", "", `Mapa criado em ${new Date().toLocaleDateString("pt-BR")}`, ""];
  if (!selected.length) lines.push("Nenhum tema selecionado.");
  selected.forEach((id,index) => { const item=parseId(id); lines.push(`${index+1}. ${item.theme}  |  ${item.group} - ${item.field}`); wrap(state.objectives[id]?.trim() || "Objetivo ainda nao definido.").forEach(line => lines.push(`   ${line}`)); lines.push(""); });
  const pageHeight=792, margin=58, lineHeight=15, maxLines=44, pages=[];
  for(let i=0;i<lines.length;i+=maxLines) pages.push(lines.slice(i,i+maxLines));
  const objects=[]; const add=obj => { objects.push(obj); return objects.length; };
  const catalog=add("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesRef=add(""); const font=add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"); const pageRefs=[];
  pages.forEach((pageLines,pageIndex) => { let stream=`BT /F1 11 Tf ${margin} ${pageHeight-margin} Td`;
    pageLines.forEach((line,i) => { const size=(pageIndex===0&&i===0)?20:(pageIndex===0&&i===1)?10:11; stream+=` /F1 ${size} Tf 0 ${i===0?0:-lineHeight} Td (${pdfEscape(line)}) Tj`; }); stream+=" ET";
    const contentRef=add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`); pageRefs.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${contentRef} 0 R >>`));
  });
  objects[pagesRef-1]=`<< /Type /Pages /Kids [${pageRefs.map(r=>`${r} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;
  let pdf="%PDF-1.4\n", offsets=[0]; objects.forEach((obj,i)=>{ offsets.push(pdf.length); pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`; }); const xref=pdf.length; pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`; offsets.slice(1).forEach(offset=>pdf+=`${String(offset).padStart(10,"0")} 00000 n \n`); pdf+=`trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const blob=new Blob([pdf],{type:"application/pdf"}), url=URL.createObjectURL(blob), link=document.createElement("a"); link.href=url; link.download="meu-mapa-de-sonhos.pdf"; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); showToast("Seu mapa foi gerado com sucesso.");
}

function showToast(message){ const toast=document.querySelector("#toast"); toast.textContent=message; toast.classList.add("show"); setTimeout(()=>toast.classList.remove("show"),2600); }

document.addEventListener("click", event => {
  const theme=event.target.closest(".theme-chip"); if(theme){ state.selected.has(theme.dataset.id) ? state.selected.delete(theme.dataset.id) : state.selected.add(theme.dataset.id); save(); renderThemes(); return; }
  const nav=event.target.closest("[data-step], [data-next]"); if(nav){ showStep(nav.dataset.step || nav.dataset.next); return; }
  if(event.target.closest("#download-pdf")) generatePdf();
});
document.addEventListener("input", event => { if(!event.target.matches("[data-objective]")) return; state.objectives[event.target.dataset.objective]=event.target.value; event.target.nextElementSibling.textContent=`${event.target.value.length}/100`; save(); });
renderThemes();
