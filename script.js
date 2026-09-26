/* ---------- elementi comuni a tutte le pagine ---------- */
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

/* mobile nav */
const navToggle = document.getElementById('navToggle');
if(navToggle){
  navToggle.addEventListener('click', function(){
    const links = document.querySelector('.nav-links');
    links.classList.toggle('open');
  });
}

/* scroll reveal — richiamabile più volte, anche dopo contenuti generati dinamicamente */
let revealObserver = null;
function initReveals(){
  const targets = document.querySelectorAll('.reveal:not(.reveal-bound), .tl-item:not(.reveal-bound)');
  if(!targets.length) return;
  if(!revealObserver){
    revealObserver = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); } });
    },{threshold:0.15});
  }
  targets.forEach(el=>{ el.classList.add('reveal-bound'); revealObserver.observe(el); });
}
initReveals();

/* ---------- HERO: braci + pizza (solo home) ---------- */
const embersHolder = document.getElementById('embers');
if(embersHolder){
  const n = window.innerWidth < 700 ? 10 : 18;
  for(let i=0;i<n;i++){
    const e = document.createElement('div');
    e.className='ember';
    e.style.left = (60 + Math.random()*35) + '%';
    e.style.setProperty('--drift', (Math.random()*80-40)+'px');
    e.style.animationDelay = (Math.random()*6)+'s';
    e.style.animationDuration = (5+Math.random()*3)+'s';
    embersHolder.appendChild(e);
  }
}

/* ---------- ORARI live (solo home) ---------- */
const hoursList = document.getElementById('hoursList');
if(hoursList){
  const hours = [
    {d:"Lunedì", open:false},
    {d:"Martedì", ranges:[[18,30,23,0]]},
    {d:"Mercoledì", ranges:[[18,30,23,0]]},
    {d:"Giovedì", ranges:[[18,30,23,0]]},
    {d:"Venerdì", ranges:[[18,30,23,0]]},
    {d:"Sabato", ranges:[[18,30,23,0]]},
    {d:"Domenica", ranges:[[18,30,23,0]]},
  ];
  const fmt = (h,m)=> String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
  function renderHours(){
    const todayIdx = (new Date().getDay()+6)%7; // lun=0
    hoursList.innerHTML = hours.map((h,i)=>{
      const label = h.open===false ? "Chiuso" : h.ranges.map(r=>fmt(r[0],r[1])+"–"+fmt(r[2],r[3])).join(' · ');
      return `<div class="hours-row ${i===todayIdx?'today':''}"><span>${h.d}</span><span>${label}</span></div>`;
    }).join('');

    const now = new Date();
    const nowMin = now.getHours()*60+now.getMinutes();
    const today = hours[todayIdx];
    let isOpen=false, reopenText='';
    if(today.open!==false){
      for(const r of today.ranges){
        const start=r[0]*60+r[1], end=r[2]*60+r[3];
        if(nowMin>=start && nowMin<=end){ isOpen=true; break; }
      }
      if(!isOpen){
        const next = today.ranges.find(r=> nowMin < r[0]*60+r[1]);
        if(next) reopenText = "Apre alle " + fmt(next[0],next[1]);
      }
    }
    const badge = document.getElementById('statusBadge');
    const text = document.getElementById('statusText');
    if(isOpen){
      badge.classList.remove('closed');
      text.textContent = "Aperto ora — si accettano prenotazioni";
    } else {
      badge.classList.add('closed');
      text.textContent = reopenText ? `Chiuso ora — ${reopenText}` : "Chiuso ora — consulta gli orari sotto";
    }
  }
  renderHours();
  setInterval(renderHours, 60000);
}

/* ---------- METEO (Open-Meteo, no key) — previsione indicativa ore 19:00 (solo home) ---------- */
const weatherPlace = document.getElementById('weatherPlace');
if(weatherPlace){
  const lat=45.1677, lon=11.0619; // Nogara (VR), indirizzo del locale
  const today = new Date();
  const dateStr = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
  const dateLabel = today.toLocaleDateString('it-IT', {day:'numeric', month:'long'});
  weatherPlace.textContent = `Ore 19:00 (indicativo) · ${dateLabel}`;

  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&timezone=Europe%2FRome&forecast_days=1`)
    .then(r=>r.json())
    .then(data=>{
      const h = data.hourly;
      if(!h) throw new Error('no data');
      const targetTime = dateStr + 'T19:00';
      let idx = h.time.indexOf(targetTime);
      if(idx === -1) idx = h.time.length - 1;
      const t = Math.round(h.temperature_2m[idx]);
      const code = h.weathercode[idx];
      document.getElementById('weatherTemp').textContent = t+'°';
      let icon='☀️', msg='Bel tempo previsto: il dehors dovrebbe essere perfetto stasera.';
      if(code===0){icon='☀️'; msg='Cielo sereno previsto: ottima serata per mangiare fuori.';}
      else if([1,2,3].includes(code)){icon='⛅'; msg='Un po\' di nuvole previste, ma si dovrebbe stare comunque bene fuori.';}
      else if([45,48].includes(code)){icon='🌫️'; msg='Foschia prevista: dentro si starà più comodi.';}
      else if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)){icon='🌧️'; msg='Pioggia prevista: meglio prenotare un tavolo in sala.';}
      else if([71,73,75,77,85,86].includes(code)){icon='❄️'; msg='Freddo previsto: perfetto per una pizza bollente e un tavolo al caldo.';}
      else if([95,96,99].includes(code)){icon='⛈️'; msg='Temporale previsto: vi aspettiamo comodi in sala.';}
      document.getElementById('weatherIcon').textContent = icon;
      document.getElementById('weatherSuggest').textContent = msg;
    })
    .catch(()=>{
      document.getElementById('weatherTemp').textContent = '—';
      document.getElementById('weatherSuggest').textContent = 'Qualunque sia il tempo, da noi si sta sempre bene.';
      document.getElementById('weatherIcon').textContent = '🍕';
    });
}

/* ---------- MENU (solo pagina menu.html) ---------- */
const menuGrid = document.getElementById('menuGrid');
if(menuGrid){
  const menu = [
    {n:"Marinara", p:"6,50 €", ing:"Pomodoro San Marzano, aglio, origano, olio EVO", tags:["veg","gf"], desc:"La più antica della carta: solo pomodoro, aglio e origano. Come la faceva Tommy nel '78.", img:"images/marinara.jpeg"},
    {n:"Margherita", p:"7,50 €", ing:"Pomodoro, fior di latte, basilico fresco", tags:["veg","gf"], desc:"Semplice e perfetta: la prova del cuoco per ogni pizzaiolo.", img:"images/margherita.jpeg"},
    {n:"Diavola", p:"9,00 €", ing:"Pomodoro, fior di latte, salame piccante calabrese", tags:["hot","gf"], desc:"Per chi ama il piccante vero, non quello finto.", img:"images/diavola.jpeg"},
    {n:"Capricciosa", p:"10,00 €", ing:"Pomodoro, mozzarella, prosciutto cotto, funghi, carciofi, olive", tags:["gf"], desc:"Un po' di tutto, come piace a chi non vuole scegliere.", img:"images/capriciosa.jpeg"},
    {n:"Quattro Formaggi", p:"9,50 €", ing:"Fior di latte, gorgonzola, provola, grana, un filo di miele", tags:["veg","gf"], desc:"Cremosa, decisa, con un tocco dolce a bilanciare.", img:"images/4formaggi.jpeg"},
    {n:"Parmigiana", p:"9,00 €", ing:"Pomodoro, melanzane fritte, fior di latte, grana, basilico", tags:["veg"], desc:"La parmigiana di famiglia, versione pizza.", img:"images/parmigiana.jpeg"},
    {n:"Bufala e Crudo", p:"12,00 €", ing:"Pomodoro, mozzarella di bufala, prosciutto crudo 18 mesi, rucola", tags:["gf"], desc:"Ingredienti pochi, tutti veri: bufala DOP e crudo stagionato.", img:"images/bufala_e_crudo.jpeg"},
    {n:"Tommy Special", p:"12,50 €", ing:"Crema di zucca, salsiccia, provola affumicata, rosmarino", tags:[], desc:"La pizza fuori menu diventata fissa dopo mille richieste.", img:"images/special.jpeg"},
  ];
  const tagLabel = {veg:'Vegetariana', gf:'Senza glutine', hot:'Piccante'};
  const cameraSvgSmall = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 15l-5-4-4 4-3-2-6 5"/></svg>`;

  function renderMenu(filter){
    menuGrid.innerHTML='';
    menu.filter(m=> filter==='tutte' ? true : m.tags.includes(filter)).forEach(m=>{
      const card = document.createElement('div');
      card.className='menu-card reveal';
      const photoHtml = m.img
        ? `<div class="menu-card-photo"><img src="${m.img}" alt="${m.n}" loading="lazy"></div>`
        : `<div class="menu-card-photo placeholder">${cameraSvgSmall}<span>Foto in arrivo</span></div>`;
      card.innerHTML = `
        ${photoHtml}
        <div class="menu-card-body">
          <div class="menu-card-top"><h4>${m.n}</h4><div class="menu-price">${m.p}</div></div>
          <div class="ingredients">${m.ing}</div>
          <div class="tags">${m.tags.map(t=>`<span class="tag ${t}">${tagLabel[t]}</span>`).join('')}</div>
          <div class="menu-hint">Tocca per i dettagli →</div>
        </div>`;
      card.addEventListener('click', ()=> openModal(m));
      menuGrid.appendChild(card);
    });
    initReveals();
  }
  renderMenu('tutte');
  document.getElementById('filters').addEventListener('click', (e)=>{
    const btn = e.target.closest('.chip');
    if(!btn) return;
    document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    renderMenu(btn.dataset.filter);
  });

  const ristorante = {
    "Antipasti": [
      {n:"Tagliere della casa", p:"9,00 €", ing:"Salumi e formaggi del territorio, miele, giardiniera"},
      {n:"Bruschette miste", p:"6,00 €", ing:"Pomodoro fresco, crema di olive, lardo e rosmarino"},
    ],
    "Primi": [
      {n:"Tagliatelle al ragù", p:"9,50 €", ing:"Pasta fresca fatta in casa, ragù di carne"},
      {n:"Risotto ai funghi porcini", p:"10,50 €", ing:"Riso Carnaroli, porcini, parmigiano"},
      {n:"Gnocchi al gorgonzola", p:"9,00 €", ing:"Gnocchi di patate fatti in casa, gorgonzola, noci"},
    ],
    "Secondi": [
      {n:"Tagliata di manzo", p:"14,00 €", ing:"Rucola, scaglie di grana, riduzione di aceto balsamico"},
      {n:"Grigliata mista", p:"13,50 €", ing:"Salsiccia, pollo, costine, verdure grigliate"},
      {n:"Cotoletta alla milanese", p:"12,00 €", ing:"Con patate al forno"},
    ],
    "Contorni": [
      {n:"Patate al forno", p:"4,00 €", ing:"Rosmarino e sale grosso"},
      {n:"Verdure grigliate", p:"4,50 €", ing:"Di stagione"},
    ],
    "Dolci": [
      {n:"Tiramisù della casa", p:"5,00 €", ing:"Ricetta di famiglia"},
      {n:"Panna cotta", p:"5,00 €", ing:"Con coulis di frutti di bosco"},
    ],
  };
  function renderRistorante(){
    document.getElementById('ristoranteGrid').innerHTML = Object.entries(ristorante).map(([cat, dishes])=>`
      <div class="ristorante-category reveal">
        <h3>${cat}</h3>
        ${dishes.map(d=>`
          <div class="dish-row">
            <div>
              <div class="dish-name">${d.n}</div>
              <div class="dish-ing">${d.ing}</div>
            </div>
            <div class="dish-price">${d.p}</div>
          </div>`).join('')}
      </div>`).join('');
    initReveals();
  }
  renderRistorante();

  document.getElementById('menuTabs').addEventListener('click', (e)=>{
    const btn = e.target.closest('.tab-btn');
    if(!btn) return;
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const isPizze = btn.dataset.tab === 'pizze';
    document.getElementById('pizzeWrap').style.display = isPizze ? '' : 'none';
    document.getElementById('ristoranteWrap').style.display = isPizze ? 'none' : '';
  });

  const backdrop = document.getElementById('modalBackdrop');
  function openModal(m){
    document.getElementById('modalName').textContent = m.n;
    document.getElementById('modalPrice').textContent = m.p;
    document.getElementById('modalDesc').textContent = m.desc + " Ingredienti: " + m.ing + ".";
    document.getElementById('modalTags').innerHTML = m.tags.map(t=>`<span class="tag ${t}">${tagLabel[t]}</span>`).join('') || '';
    const modalPhoto = document.getElementById('modalPhoto');
    modalPhoto.innerHTML = m.img
      ? `<img src="${m.img}" alt="${m.n}">`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="34" height="34"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 15l-5-4-4 4-3-2-6 5"/></svg><span>Foto in arrivo</span>`;
    backdrop.classList.add('open');
  }
  document.getElementById('modalClose').addEventListener('click', ()=>backdrop.classList.remove('open'));
  backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) backdrop.classList.remove('open'); });
}

/* ---------- GALLERIA (solo pagina galleria.html) ---------- */
const galleryGrid = document.getElementById('galleryGrid');
if(galleryGrid){
  const galleryItems = [
    {label:"Sala principale", tall:true, img:"images/sala.jpeg"},
    {label:"Il forno a legna", img:"images/forno_a_legna.jpeg"},
    {label:"Margherita appena sfornata", img:"images/margherita_appena_sfornata.jpeg"},
    {label:"Il bancone", img:"images/bancone_pizzeria.jpeg"},
    {label:"Dehors estivo", img:"images/dehors_pizzeria.jpeg"},
    {label:"Impasto in lavorazione", img:"images/impasto.jpeg"},
  ];
  galleryGrid.innerHTML = galleryItems.map(g=>
    `<div class="photo-slot filled reveal ${g.tall?'tall':''}"><img src="${g.img}" alt="${g.label}" loading="lazy"><span class="photo-caption">${g.label}</span></div>`
  ).join('');
  initReveals();
}

/* ---------- PRENOTAZIONE (solo pagina prenota.html) ---------- */
const bookForm = document.getElementById('bookForm');
if(bookForm){
  const ticketPreview = document.getElementById('ticketPreview');
  const ticketNum = document.getElementById('ticketNum');
  ticketNum.textContent = 100 + Math.floor(Math.random()*80);

  function updateTicket(){
    const name = document.getElementById('fName').value || '—';
    const date = document.getElementById('fDate').value || '—';
    const time = document.getElementById('fTime').value || '—';
    const people = document.getElementById('fPeople').value || '—';
    ticketPreview.innerHTML = `
      <div class="ticket-line">
        NOME ..... ${name}<br>
        DATA ..... ${date}<br>
        ORA ...... ${time}<br>
        COPERTI .. ${people}
      </div>`;
  }
  ['fName','fDate','fTime','fPeople'].forEach(id=>{
    document.getElementById(id).addEventListener('input', updateTicket);
    document.getElementById(id).addEventListener('change', updateTicket);
  });

  bookForm.addEventListener('submit', function(e){
    e.preventDefault();
    updateTicket();
    const name = document.getElementById('fName').value;
    const phone = document.getElementById('fPhone').value;
    const date = document.getElementById('fDate').value;
    const time = document.getElementById('fTime').value;
    const people = document.getElementById('fPeople').value;
    const note = document.getElementById('fNote').value;
    const msg = `Ciao! Vorrei prenotare un tavolo da Tommy.%0A` +
      `Nome: ${name}%0ATelefono: ${phone}%0AData: ${date}%0AOra: ${time}%0APersone: ${people}` +
      (note ? `%0ANote: ${note}` : '');
    window.open(`https://wa.me/393665488260?text=${msg}`, '_blank');
    document.getElementById('confirmBox').classList.add('show');
  });
}

/* ---------- COOKIE e mappa col consenso ---------- */
(function(){
  const KEY = 'dt-consent';
  const read = () => { try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } };
  const save = v => { try{ localStorage.setItem(KEY, JSON.stringify({maps:v, ts:Date.now()})); }catch(e){} };

  const bar = document.createElement('div');
  bar.className = 'cookie-bar';
  bar.setAttribute('role','dialog');
  bar.setAttribute('aria-label','Preferenze cookie');
  bar.innerHTML = `
    <p>Questo sito usa solo ciò che serve a funzionare. La mappa di Google si carica solo se sei d'accordo. <a href="legale.html#cookie">Cookie policy</a></p>
    <div class="cookie-actions">
      <button type="button" class="btn btn-outline" data-consent="0">Solo necessari</button>
      <button type="button" class="btn btn-primary" data-consent="1">Accetta tutti</button>
    </div>`;
  document.body.appendChild(bar);

  function loadMap(){
    const wrap = document.getElementById('mapWrap');
    if(!wrap || wrap.querySelector('iframe')) return;
    wrap.innerHTML = '<iframe src="https://maps.google.com/maps?q=Via%20P.%20Sterzi%2041%2C%20Nogara%20VR&t=&z=16&ie=UTF8&iwloc=&output=embed" loading="lazy" title="Mappa Da Tommy"></iframe>';
  }

  const c = read();
  if(!c) bar.classList.add('show');
  else if(c.maps) loadMap();

  bar.addEventListener('click', e => {
    const b = e.target.closest('[data-consent]'); if(!b) return;
    const ok = b.dataset.consent === '1';
    save(ok); bar.classList.remove('show');
    if(ok) loadMap();
  });
  document.addEventListener('click', e => {
    if(e.target.closest('[data-cookie-prefs]')) bar.classList.add('show');
    if(e.target.closest('[data-load-map]')){ save(true); loadMap(); }
  });
})();
