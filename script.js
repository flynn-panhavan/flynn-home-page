(function () {
  const $ = s => document.querySelector(s);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* official site logo (favicon) for any address */
  function favicon(host, size) {
    return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(host) + '&sz=' + (size || 64);
  }
  function hostOf(url) { try { return new URL(url).hostname; } catch (e) { return ''; } }

  function toast(msg, icon) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<i class="fa-solid ' + (icon || 'fa-circle-check') + '"></i>';
    t.appendChild(document.createTextNode(msg));
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  /* ---------- professional dialogs (replace native prompt boxes) ---------- */
  const FOCUSABLE = 'button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function dialog(o) {
    return new Promise(resolve => {
      const prev = document.activeElement;
      const ov = el('<div class="m-ov"><div class="m-card' + (o.wide ? ' wide' : '') + '" role="dialog" aria-modal="true">' +
        '<div class="m-head"><span class="m-ico"><i class="fa-solid ' + (o.icon || 'fa-circle-info') + '"></i></span>' +
        '<div class="m-ttl"><h3></h3><p></p></div>' +
        '<button class="m-x" type="button" aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>' +
        '<div class="m-body"></div></div></div>');
      const card = ov.firstChild;
      ov.querySelector('h3').textContent = o.title;
      ov.querySelector('p').textContent = o.desc || '';
      if (!o.desc) ov.querySelector('p').remove();
      let done = false;
      const close = val => {
        if (done) return; done = true;
        document.removeEventListener('keydown', onKey, true);
        ov.classList.add('out');
        document.body.classList.remove('m-lock');
        setTimeout(() => ov.remove(), 200);
        if (prev && prev.focus) try { prev.focus({ preventScroll: true }); } catch (e) {}
        resolve(val);
      };
      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(null); }
        else if (e.key === 'Tab') {
          const f = [...card.querySelectorAll(FOCUSABLE)].filter(x => x.offsetParent !== null);
          if (!f.length) return;
          const a = f[0], z = f[f.length - 1];
          if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
          else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
        }
      }
      document.addEventListener('keydown', onKey, true);
      ov.addEventListener('mousedown', e => { if (e.target === ov) close(null); });
      ov.querySelector('.m-x').onclick = () => close(null);
      document.body.appendChild(ov);
      document.body.classList.add('m-lock');
      o.build(card.querySelector('.m-body'), close);
      const first = card.querySelector('[data-autofocus]') || card.querySelector('input,button:not(.m-x)');
      if (first) setTimeout(() => { first.focus(); if (first.select) first.select(); }, 60);
    });
  }

  /* form dialog: fields -> Promise<{id: value} | null> */
  function formDialog(o) {
    return dialog({
      icon: o.icon, title: o.title, desc: o.desc,
      build(body, close) {
        const form = el('<form class="m-form" novalidate></form>');
        const inputs = {}, errs = {};
        o.fields.forEach(f => {
          const row = el('<div class="m-field"><label></label><div class="m-input"><i class="fa-solid ' + (f.icon || 'fa-pen') + '"></i><input type="text" autocomplete="off" spellcheck="false"></div><small class="m-hint"></small><small class="m-err" role="alert"></small></div>');
          const inp = row.querySelector('input'), lab = row.querySelector('label');
          inp.id = 'mf-' + f.id; lab.htmlFor = inp.id; lab.textContent = f.label;
          if (f.optional) { const s = document.createElement('span'); s.textContent = 'Optional'; lab.appendChild(s); }
          inp.placeholder = f.placeholder || ''; inp.value = f.value || '';
          if (f.maxlength) inp.maxLength = f.maxlength;
          if (f.inputmode) inp.inputMode = f.inputmode;
          row.querySelector('.m-hint').textContent = f.hint || '';
          if (!f.hint) row.querySelector('.m-hint').remove();
          inputs[f.id] = inp; errs[f.id] = row.querySelector('.m-err');
          inp.addEventListener('input', () => { row.classList.remove('bad'); errs[f.id].textContent = ''; if (o.onChange) o.onChange(vals(), ui); });
          form.appendChild(row);
        });
        const ui = { inputs, form };
        const vals = () => { const v = {}; o.fields.forEach(f => { v[f.id] = inputs[f.id].value.trim(); }); return v; };
        if (o.preview) { const p = el('<div class="m-prev"></div>'); form.appendChild(p); ui.preview = p; }
        const foot = el('<div class="m-foot"><button type="button" class="m-btn ghost">Cancel</button><button type="submit" class="m-btn primary"></button></div>');
        foot.querySelector('.primary').textContent = o.submit || 'Save';
        foot.querySelector('.ghost').onclick = () => close(null);
        form.appendChild(foot);
        form.addEventListener('submit', e => {
          e.preventDefault();
          const v = vals(); let bad = null;
          o.fields.forEach(f => {
            const msg = (!f.optional && !v[f.id]) ? (f.requiredMsg || 'This field is required.') : (f.validate ? f.validate(v[f.id], v) : '');
            const row = inputs[f.id].closest('.m-field');
            row.classList.toggle('bad', !!msg); errs[f.id].textContent = msg || '';
            if (msg && !bad) bad = inputs[f.id];
          });
          if (bad) { bad.focus(); return; }
          close(v);
        });
        body.appendChild(form);
        if (o.onChange) o.onChange(vals(), ui);
      }
    });
  }

  /* ---------- Cambodia: capital city + provinces (25 administrative entities) ---------- */
  const LOCS = [
    { id: 'phnom-penh',       n: 'Phnom Penh',       km: 'ភ្នំពេញ',          t: 'capital',  lat: 11.5564, lon: 104.9282 },
    { id: 'banteay-meanchey', n: 'Banteay Meanchey', km: 'បន្ទាយមានជ័យ',     t: 'province', lat: 13.5867, lon: 102.9736 },
    { id: 'battambang',       n: 'Battambang',       km: 'បាត់ដំបង',         t: 'province', lat: 13.0957, lon: 103.2022 },
    { id: 'kampong-cham',     n: 'Kampong Cham',     km: 'កំពង់ចាម',         t: 'province', lat: 11.9934, lon: 105.4635 },
    { id: 'kampong-chhnang',  n: 'Kampong Chhnang',  km: 'កំពង់ឆ្នាំង',      t: 'province', lat: 12.2500, lon: 104.6667 },
    { id: 'kampong-speu',     n: 'Kampong Speu',     km: 'កំពង់ស្ពឺ',        t: 'province', lat: 11.4533, lon: 104.5206 },
    { id: 'kampong-thom',     n: 'Kampong Thom',     km: 'កំពង់ធំ',          t: 'province', lat: 12.7112, lon: 104.8887 },
    { id: 'kampot',           n: 'Kampot',           km: 'កំពត',             t: 'province', lat: 10.6104, lon: 104.1815 },
    { id: 'kandal',           n: 'Kandal',           km: 'កណ្ដាល',           t: 'province', lat: 11.4833, lon: 104.9500 },
    { id: 'kep',              n: 'Kep',              km: 'កែប',              t: 'province', lat: 10.4829, lon: 104.3167 },
    { id: 'koh-kong',         n: 'Koh Kong',         km: 'កោះកុង',           t: 'province', lat: 11.6153, lon: 102.9838 },
    { id: 'kratie',           n: 'Kratie',           km: 'ក្រចេះ',           t: 'province', lat: 12.4881, lon: 106.0188 },
    { id: 'mondulkiri',       n: 'Mondulkiri',       km: 'មណ្ឌលគិរី',        t: 'province', lat: 12.4553, lon: 107.1881 },
    { id: 'oddar-meanchey',   n: 'Oddar Meanchey',   km: 'ឧត្តរមានជ័យ',      t: 'province', lat: 14.1819, lon: 103.5175 },
    { id: 'pailin',           n: 'Pailin',           km: 'ប៉ៃលិន',           t: 'province', lat: 12.8489, lon: 102.6093 },
    { id: 'preah-sihanouk',   n: 'Preah Sihanouk',   km: 'ព្រះសីហនុ',        t: 'province', lat: 10.6275, lon: 103.5222 },
    { id: 'preah-vihear',     n: 'Preah Vihear',     km: 'ព្រះវិហារ',        t: 'province', lat: 13.8000, lon: 104.9833 },
    { id: 'prey-veng',        n: 'Prey Veng',        km: 'ព្រៃវែង',          t: 'province', lat: 11.4842, lon: 105.3253 },
    { id: 'pursat',           n: 'Pursat',           km: 'ពោធិ៍សាត់',        t: 'province', lat: 12.5388, lon: 103.9192 },
    { id: 'ratanakiri',       n: 'Ratanakiri',       km: 'រតនគិរី',          t: 'province', lat: 13.7394, lon: 106.9873 },
    { id: 'siem-reap',        n: 'Siem Reap',        km: 'សៀមរាប',           t: 'province', lat: 13.3671, lon: 103.8448 },
    { id: 'stung-treng',      n: 'Stung Treng',      km: 'ស្ទឹងត្រែង',       t: 'province', lat: 13.5259, lon: 105.9683 },
    { id: 'svay-rieng',       n: 'Svay Rieng',       km: 'ស្វាយរៀង',         t: 'province', lat: 11.0878, lon: 105.7994 },
    { id: 'takeo',            n: 'Takeo',            km: 'តាកែវ',            t: 'province', lat: 10.9908, lon: 104.7850 },
    { id: 'tboung-khmum',     n: 'Tboung Khmum',     km: 'ត្បូងឃ្មុំ',       t: 'province', lat: 11.8884, lon: 105.6498 }
  ];
  const T_LABEL = { capital: 'Capital City', province: 'Province' };

  function pickLocation(current) {
    return dialog({
      icon: 'fa-location-dot', wide: true, title: 'Choose weather location',
      desc: 'Select the capital city or a province. Forecast is shown for its main town.',
      build(body, close) {
        const root = el('<div class="m-loc"></div>');
        root.innerHTML =
          '<div class="m-input m-search"><i class="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search by English or Khmer name" autocomplete="off" spellcheck="false" aria-label="Search locations" data-autofocus></div>' +
          '<div class="seg m-seg" role="tablist"></div>' +
          '<div class="m-list" role="listbox" aria-label="Locations"></div>' +
          '<div class="m-count"></div>';
        body.appendChild(root);
        const inp = root.querySelector('input'), seg = root.querySelector('.m-seg'), list = root.querySelector('.m-list'), cnt = root.querySelector('.m-count');
        const FILTERS = [['all', 'All', LOCS.length], ['capital', 'Capital City', 1], ['province', 'Provinces', LOCS.length - 1]];
        let filter = 'all';
        function draw() {
          seg.innerHTML = '';
          FILTERS.forEach(([k, n, c]) => {
            const b = el('<button type="button" role="tab"></button>'); b.textContent = n + ' · ' + c;
            b.className = filter === k ? 'on' : ''; b.setAttribute('aria-selected', filter === k);
            b.onclick = () => { filter = k; draw(); inp.focus(); };
            seg.appendChild(b);
          });
          const q = inp.value.trim().toLowerCase();
          const items = LOCS.filter(x => (filter === 'all' || x.t === filter) && (!q || x.n.toLowerCase().includes(q) || x.km.includes(q)));
          list.innerHTML = '';
          let lastT = null;
          items.forEach(x => {
            if (x.t !== lastT) { lastT = x.t; const h = el('<div class="m-grp"></div>'); h.textContent = x.t === 'capital' ? 'Capital City' : 'Provinces'; list.appendChild(h); }
            const on = current && (current.id === x.id || (current.name || '').indexOf(x.n) === 0);
            const b = el('<button type="button" class="m-opt' + (on ? ' on' : '') + '" role="option" aria-selected="' + !!on + '"><span class="m-oi"><i class="fa-solid ' + (x.t === 'capital' ? 'fa-landmark' : 'fa-map-pin') + '"></i></span><span class="m-on"><b></b><em></em></span><span class="m-tag"></span><i class="fa-solid fa-check m-ck"></i></button>');
            b.querySelector('b').textContent = x.n; b.querySelector('em').textContent = x.km; b.querySelector('.m-tag').textContent = T_LABEL[x.t];
            b.onclick = () => close(x);
            list.appendChild(b);
          });
          if (!items.length) list.innerHTML = '<div class="m-empty"><i class="fa-solid fa-magnifying-glass"></i>No location matches “' + q.replace(/[<>&"]/g, '') + '”.</div>';
          cnt.textContent = 'Showing ' + items.length + ' of ' + LOCS.length + ' locations';
        }
        inp.addEventListener('input', draw);
        root.addEventListener('keydown', e => {
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
          const opts = [...list.querySelectorAll('.m-opt')]; if (!opts.length) return;
          e.preventDefault();
          const i = opts.indexOf(document.activeElement);
          const n = e.key === 'ArrowDown' ? Math.min(opts.length - 1, i + 1) : i - 1;
          if (n < 0) inp.focus(); else opts[n].focus();
        });
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const f = list.querySelector('.m-opt'); if (f) f.click(); } });
        draw();
        setTimeout(() => { const on = list.querySelector('.m-opt.on'); if (on) on.scrollIntoView({ block: 'center' }); }, 80);
      }
    });
  }


  /* ---------- settings ---------- */
  const DEF = { theme: 'aurora', mode: 'auto', custom: ['#4f46e5', '#06b6d4', '#ec4899', '#0b1020'], tab: 'theme', blobs: true, particles: true, pCount: 80, pSize: 100, pSpeed: 100, pLink: 100, pLines: true, pMouse: true, blur: 16, scale: 110, clock: 100, hr24: false, seconds: false, unit: 'C', weather: true, dayBar: true, engines: true, newTab: false, sNew: false, sTools: true,
    dpH: 116, dpW: 100, dpR: 16, dpPct: 100, dpDim: 50, dpTxt: true, dpPctOn: true, dpFace: true, dpClouds: true, dpBubbles: true, dpGrad: 'aqua' };
  const saved = store.get('settings', {});
  const S = Object.assign({}, DEF, saved);
  if (saved.sNew === undefined && saved.newTab) S.sNew = true; /* keep old behavior for existing users */
  const THEMES = {
    aurora:   { n: 'Aurora',   d: ['#1b1464', '#0f766e', '#7c3aed', '#0b1020'], l: ['#c7d2fe', '#a7f3d0', '#e9d5ff', '#fdf2f8'] },
    sunset:   { n: 'Sunset',   d: ['#7c1d3a', '#c2410c', '#6d28d9', '#1a0b1f'], l: ['#fecaca', '#fed7aa', '#fbcfe8', '#fff7ed'] },
    ocean:    { n: 'Ocean',    d: ['#0c4a6e', '#0e7490', '#1e3a8a', '#04101f'], l: ['#bae6fd', '#a5f3fc', '#bfdbfe', '#f0f9ff'] },
    forest:   { n: 'Forest',   d: ['#14532d', '#3f6212', '#115e59', '#07140d'], l: ['#bbf7d0', '#d9f99d', '#99f6e4', '#f7fee7'] },
    candy:    { n: 'Candy',    d: ['#831843', '#6b21a8', '#1e40af', '#140a1f'], l: ['#fbcfe8', '#ddd6fe', '#bfdbfe', '#fdf4ff'] },
    graphite: { n: 'Graphite', d: ['#3f3f46', '#52525b', '#27272a', '#09090b'], l: ['#e4e4e7', '#f4f4f5', '#d4d4d8', '#fafafa'] }
  };
  const DPG = {
    aqua:   { n: 'Aqua',   c: ['#34e0c0', '#4cc9d0', '#7b7fd6', '#9a6fdc'] },
    sunset: { n: 'Sunset', c: ['#ffb347', '#ff7e5f', '#e8508f', '#a64bd6'] },
    ocean:  { n: 'Ocean',  c: ['#38bdf8', '#3b82f6', '#4f46e5', '#7c3aed'] },
    forest: { n: 'Forest', c: ['#a3e635', '#4ade80', '#14b8a6', '#0e7490'] },
    candy:  { n: 'Candy',  c: ['#f9a8d4', '#f472b6', '#c084fc', '#818cf8'] },
    mono:   { n: 'Mono',   c: ['#9ca3af', '#6b7280', '#4b5563', '#374151'] }
  };
  const dark = matchMedia('(prefers-color-scheme: dark)');
  let pc = '255,200,230', lastC = null;
  const isDark = () => S.mode === 'auto' ? dark.matches : S.mode === 'dark';
  const palette = (t, d) => t === 'custom' ? S.custom : THEMES[t][d ? 'd' : 'l'];
  function apply() {
    const r = document.documentElement, d = isDark();
    r.dataset.mode = d ? 'dark' : 'light';
    palette(S.theme, d).forEach((v, i) => r.style.setProperty('--c' + (i + 1), v));
    r.style.setProperty('--scale', S.scale / 100);
    r.style.setProperty('--ck', S.clock / 100);
    r.style.setProperty('--blur', S.blur + 'px');
    pc = d ? '255,200,230' : '50,50,90';
    const b = document.body.classList;
    b.toggle('no-blobs', !S.blobs); b.toggle('hide-weather', !S.weather);
    b.toggle('hide-day', !S.dayBar); b.toggle('hide-engines', !S.engines);
    r.style.setProperty('--dp-h', S.dpH + 'px');
    r.style.setProperty('--dp-w', S.dpW + '%');
    r.style.setProperty('--dp-r', S.dpR + 'px');
    r.style.setProperty('--dp-pct', S.dpPct / 100);
    r.style.setProperty('--dp-dim', S.dpDim / 100);
    const g = (DPG[S.dpGrad] || DPG.aqua).c;
    r.style.setProperty('--dp-grad', 'linear-gradient(90deg,' + g[0] + ' 0%,' + g[1] + ' 35%,' + g[2] + ' 75%,' + g[3] + ' 100%)');
    b.toggle('no-dptxt', !S.dpTxt); b.toggle('no-dppct', !S.dpPctOn); b.toggle('no-dpface', !S.dpFace);
    b.toggle('no-dpclouds', !S.dpClouds); b.toggle('no-dpbubs', !S.dpBubbles);
    b.toggle('hide-tools', !S.sTools);
    $('#bg').style.display = S.particles ? 'block' : 'none';
  }
  apply();
  if (dark.addEventListener) dark.addEventListener('change', apply);
  const commit = () => { store.set('settings', S); apply(); syncP(); tick(); drawLinks(); drawEngines(); renderTemp(); };
  const drawerEl = $('#drawer');
  drawerEl.inert = true;
  const openDrawer = on => {
    document.body.classList.toggle('open', on);
    drawerEl.inert = !on; drawerEl.setAttribute('aria-hidden', String(!on));
    if (on) render();
    else { if (drawerEl.contains(document.activeElement)) $('#gear').focus({ preventScroll: true }); $('#dFind').value = ''; }
  };
  $('#gear').onclick = () => openDrawer(true);
  $('#scrim').onclick = $('#dClose').onclick = () => openDrawer(false);

  const SCHEMA = [
    ['theme', 'Theme', 'fa-palette', [
      { t: 'h', l: 'Color theme', d: 'Pick a background palette for your home page.' },
      { t: 'themes', l: 'Color theme', kw: 'palette background colour' },
      { k: 'mode', t: 'seg', l: 'Appearance', d: 'Auto follows your device light or dark setting.', o: [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']] },
      { t: 'h', l: 'Custom colors', d: 'Create your own four-color background.' },
      { t: 'colors', l: 'Background colors', h: 'Pick any color to switch to the Custom theme.' },
      { t: 'h', l: 'Effects' },
      { k: 'blobs', t: 'sw', l: 'Animated color glow', d: 'Soft moving color behind the page.' },
      { k: 'blur', t: 'rng', l: 'Glass blur', d: 'Frosted effect on cards and panels.', min: 0, max: 32, u: 'px' }
    ]],
    ['search', 'Search', 'fa-magnifying-glass', [
      { t: 'h', l: 'Search bar', d: 'Choose what appears around the search box.' },
      { k: 'engines', t: 'sw', l: 'Show search engine chips', d: 'Turn off to hide the engine picker below the search bar.', kw: 'hide engines google youtube github duckduckgo maps' },
      { k: 'sTools', t: 'sw', l: 'Voice, Lens & AI Mode buttons', d: 'Show these shortcut buttons inside the search bar.', kw: 'microphone camera' },
      { t: 'h', l: 'Default engine', d: 'Used when you press Enter in the search bar.' },
      { t: 'engsel', l: 'Default search engine', kw: 'google youtube github duckduckgo maps' },
      { t: 'h', l: 'Results', d: 'Where a search opens after you press Enter.' },
      { k: 'sNew', t: 'seg', l: 'Open search results in', d: 'Also applies to typed URLs, Google Lens and AI Mode.', kw: 'tab blank window same new', o: [[false, 'Same tab'], [true, 'New tab']] }
    ]],
    ['display', 'Display', 'fa-eye', [
      { t: 'h', l: 'Clock', d: 'Time and date format.' },
      { k: 'hr24', t: 'sw', l: '24-hour clock' },
      { k: 'seconds', t: 'sw', l: 'Show seconds' },
      { t: 'h', l: 'Weather' },
      { k: 'weather', t: 'sw', l: 'Weather card', d: 'Show current conditions for your chosen location.' },
      { k: 'unit', t: 'seg', l: 'Temperature unit', dep: 'weather', o: [['C', '°C'], ['F', '°F']] },
      { t: 'h', l: 'Shortcuts' },
      { k: 'newTab', t: 'sw', l: 'Open shortcuts in a new tab', d: 'Applies to the pinned website shortcuts only.', kw: 'links blank window' }
    ]],
    ['particles', 'Particles', 'fa-braille', [
      { t: 'h', l: 'Particle network', d: 'Animated dots and lines in the background.' },
      { k: 'particles', t: 'sw', l: 'Enable particles' },
      { k: 'pCount', t: 'rng', l: 'Amount', dep: 'particles', min: 10, max: 250, step: 5, u: '' },
      { k: 'pSize', t: 'rng', l: 'Dot size', dep: 'particles', min: 40, max: 400, step: 10, u: '%' },
      { k: 'pSpeed', t: 'rng', l: 'Speed', dep: 'particles', min: 0, max: 400, step: 10, u: '%' },
      { t: 'h', l: 'Lines and interaction' },
      { k: 'pLines', t: 'sw', l: 'Connecting lines', dep: 'particles' },
      { k: 'pLink', t: 'rng', l: 'Line distance', dep: 'particles', min: 40, max: 250, step: 10, u: 'px' },
      { k: 'pMouse', t: 'sw', l: 'Dots move away from cursor', dep: 'particles' }
    ]],
    ['size', 'Size', 'fa-up-right-and-down-left-from-center', [
      { t: 'h', l: 'Scale', d: 'Make everything bigger or smaller.' },
      { k: 'scale', t: 'rng', l: 'Interface size', min: 80, max: 160, step: 5, u: '%' },
      { k: 'clock', t: 'rng', l: 'Clock size', min: 50, max: 160, step: 5, u: '%' }
    ]],
    ['day', 'Day bar', 'fa-bars-progress', [
      { t: 'h', l: 'Day progress card' },
      { k: 'dayBar', t: 'sw', l: 'Show day progress bar' },
      { t: 'dpg', l: 'Color', dep: 'dayBar' },
      { t: 'h', l: 'Shape' },
      { k: 'dpH', t: 'rng', l: 'Height', dep: 'dayBar', min: 56, max: 220, step: 2, u: 'px' },
      { k: 'dpW', t: 'rng', l: 'Width', dep: 'dayBar', min: 30, max: 100, step: 5, u: '%' },
      { k: 'dpR', t: 'rng', l: 'Corner roundness', dep: 'dayBar', min: 0, max: 60, step: 1, u: 'px' },
      { k: 'dpPct', t: 'rng', l: 'Percentage size', dep: 'dayBar', min: 50, max: 160, step: 5, u: '%' },
      { k: 'dpDim', t: 'rng', l: 'Dim passed time', dep: 'dayBar', min: 0, max: 90, step: 5, u: '%' },
      { t: 'h', l: 'Details' },
      { k: 'dpPctOn', t: 'sw', l: 'Show percentage', dep: 'dayBar' },
      { k: 'dpTxt', t: 'sw', l: 'Show “Today” and time left', dep: 'dayBar' },
      { k: 'dpFace', t: 'sw', l: 'Show face', dep: 'dayBar' },
      { k: 'dpClouds', t: 'sw', l: 'Show clouds', dep: 'dayBar' },
      { k: 'dpBubbles', t: 'sw', l: 'Show bubbles', dep: 'dayBar' }
    ]],
    ['data', 'Data', 'fa-database', [
      { t: 'h', l: 'Profile', d: 'Your name and weather location.' },
      { t: 'acts', l: 'Profile', kw: 'name location', a: 'profile' },
      { t: 'h', l: 'Backup', d: 'Everything is stored in this browser only.' },
      { t: 'acts', l: 'Backup and restore', kw: 'export import json', a: 'backup' },
      { t: 'h', l: 'Reset' },
      { t: 'acts', l: 'Reset all settings', kw: 'default restore', a: 'reset' }
    ]]
  ];
  function el(html) { const d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }
  const clone = v => JSON.parse(JSON.stringify(v));

  /* confirmation dialog built on the shared dialog() */
  function confirmDialog(o) {
    return dialog({
      icon: o.icon || 'fa-triangle-exclamation', title: o.title, desc: o.desc,
      build(body, close) {
        const foot = el('<div class="m-foot"><button type="button" class="m-btn ghost">Cancel</button><button type="button" class="m-btn primary"></button></div>');
        const ok = foot.querySelector('.primary');
        ok.textContent = o.ok || 'Confirm';
        if (o.danger) ok.classList.add('danger');
        foot.querySelector('.ghost').onclick = () => close(null);
        ok.onclick = () => close(true);
        body.appendChild(foot);
      }
    });
  }

  /* keys that a group of fields controls (used by per-section reset) */
  function keysOf(fields) {
    const k = [];
    fields.forEach(f => {
      if (f.k) k.push(f.k);
      else if (f.t === 'themes') k.push('theme');
      else if (f.t === 'colors') k.push('custom');
      else if (f.t === 'dpg') k.push('dpGrad');
    });
    return k;
  }
  async function resetSection(id) {
    const sc = SCHEMA.find(x => x[0] === id); if (!sc) return;
    const ok = await confirmDialog({
      icon: 'fa-rotate-left', title: 'Reset ' + sc[1] + ' settings?',
      desc: 'Only the options in this section return to their defaults. Your shortcuts, name and location are not affected.',
      ok: 'Reset section', danger: true
    });
    if (!ok) return;
    keysOf(sc[3]).forEach(k => { S[k] = clone(DEF[k]); });
    if (sc[3].some(f => f.t === 'engsel')) { eng = 'Google'; store.set('engine', eng); }
    commit(); render(); toast(sc[1] + ' settings reset', 'fa-rotate-left');
  }
  async function resetAll() {
    const ok = await confirmDialog({
      icon: 'fa-triangle-exclamation', title: 'Reset all settings?',
      desc: 'Every appearance and behavior option returns to its default. Your shortcuts, name and location are kept.',
      ok: 'Reset everything', danger: true
    });
    if (!ok) return;
    Object.assign(S, clone(DEF)); eng = 'Google'; store.set('engine', eng);
    commit(); render(); toast('All settings reset', 'fa-rotate-left');
  }

  function refreshDeps() {
    document.querySelectorAll('#dBody [data-dep]').forEach(r => {
      const off = !S[r.dataset.dep];
      r.classList.toggle('dis', off);
      r.querySelectorAll('input,button').forEach(x => { x.disabled = off; });
    });
  }

  function buildRow(f, d) {
    let row;
    const note = f.d ? '<small class="note">' + f.d + '</small>' : '';
    if (f.t === 'themes') {
      row = el('<div class="row"><div class="sw-grid"></div></div>');
      Object.keys(THEMES).concat('custom').forEach(k => {
        const c = palette(k, d), b = el('<button type="button" aria-pressed="' + (S.theme === k) + '" class="' + (S.theme === k ? 'on' : '') + '"><span></span>' + (k === 'custom' ? 'Custom' : THEMES[k].n) + '</button>');
        b.firstChild.style.background = 'linear-gradient(135deg,' + c[0] + ',' + c[1] + ',' + c[2] + ')';
        b.onclick = () => { S.theme = k; commit(); render(); };
        row.firstChild.appendChild(b);
      });
    } else if (f.t === 'dpg') {
      row = el('<div class="row"><div class="lab">' + f.l + '</div><div class="sw-grid"></div></div>');
      Object.keys(DPG).forEach(k => {
        const c = DPG[k].c, b = el('<button type="button" aria-pressed="' + (S.dpGrad === k) + '" class="' + (S.dpGrad === k ? 'on' : '') + '"><span></span>' + DPG[k].n + '</button>');
        b.firstChild.style.background = 'linear-gradient(135deg,' + c[0] + ',' + c[1] + ',' + c[2] + ',' + c[3] + ')';
        b.onclick = () => { S.dpGrad = k; commit(); render(); };
        row.lastChild.appendChild(b);
      });
    } else if (f.t === 'engsel') {
      row = el('<div class="row"><div class="lab">' + f.l + '</div><div class="eng-grid"></div></div>');
      Object.keys(ENGINES).forEach(k => {
        const b = el('<button type="button" class="eng-opt' + (eng === k ? ' on' : '') + '" aria-pressed="' + (eng === k) + '"><img alt="" src="' + favicon(ENGINES[k].host, 32) + '"><span></span><i class="fa-solid fa-check"></i></button>');
        b.querySelector('span').textContent = k;
        b.onclick = () => { eng = k; store.set('engine', k); drawEngines(); render(); };
        row.lastChild.appendChild(b);
      });
    } else if (f.t === 'seg') {
      row = el('<div class="row"><div class="lab">' + f.l + '</div><div class="seg"></div>' + note + '</div>');
      f.o.forEach(([v, n]) => {
        const b = el('<button type="button" aria-pressed="' + (S[f.k] === v) + '" class="' + (S[f.k] === v ? 'on' : '') + '">' + n + '</button>');
        b.onclick = () => { S[f.k] = v; commit(); render(); };
        row.querySelector('.seg').appendChild(b);
      });
    } else if (f.t === 'sw') {
      row = el('<div class="row"><label class="sw"><span class="sw-t"><b>' + f.l + '</b>' + note + '</span><input type="checkbox"><i></i></label></div>');
      const i = row.querySelector('input'); i.checked = !!S[f.k];
      i.onchange = () => { S[f.k] = i.checked; commit(); refreshDeps(); };
    } else if (f.t === 'rng') {
      row = el('<div class="row"><div class="lab"><span>' + f.l + '</span><em></em></div><input type="range" aria-label="' + f.l + '">' + note + '</div>');
      const i = row.querySelector('input'), o = row.querySelector('em');
      i.min = f.min; i.max = f.max; i.step = f.step || 1; i.value = S[f.k]; o.textContent = S[f.k] + f.u;
      i.oninput = () => { S[f.k] = +i.value; o.textContent = i.value + f.u; commit(); };
    } else if (f.t === 'colors') {
      row = el('<div class="row"><div class="lab">' + f.l + '</div><div class="cols"></div><small>' + f.h + '</small></div>');
      S.custom.forEach((v, n) => {
        const i = el('<input type="color" aria-label="Color ' + (n + 1) + '">'); i.value = v;
        i.oninput = () => { S.custom[n] = i.value; S.theme = 'custom'; commit(); };
        i.onchange = render;
        row.querySelector('.cols').appendChild(i);
      });
    } else if (f.t === 'acts') {
      row = el('<div class="row acts"></div>');
      const sets = {
        profile: [['Change name', 'fa-user', () => nameEl.click()], ['Change location', 'fa-location-dot', () => $('#weather').click()]],
        backup: [['Export backup', 'fa-download', exportData], ['Import backup', 'fa-upload', importData]],
        reset: [['Reset all settings', 'fa-rotate-left', resetAll, true]]
      }[f.a];
      sets.forEach(([n, ico, fn, danger]) => {
        const b = el('<button type="button"' + (danger ? ' class="danger"' : '') + '><i class="fa-solid ' + ico + '"></i>' + n + '</button>'); b.onclick = fn; row.appendChild(b);
      });
    }
    if (f.dep) { row.dataset.dep = f.dep; }
    return row;
  }

  function render() {
    const body = $('#dBody'), tabs = $('#dTabs'), d = isDark();
    const term = $('#dFind').value.trim().toLowerCase();
    const top = body.scrollTop;
    body.innerHTML = ''; tabs.innerHTML = '';
    tabs.classList.toggle('hid', !!term);
    if (!SCHEMA.some(x => x[0] === S.tab)) S.tab = 'theme';
    SCHEMA.forEach(([id, title, ico]) => {
      const t = el('<button type="button" role="tab" aria-selected="' + (S.tab === id) + '" class="' + (S.tab === id ? 'on' : '') + '"><i class="fa-solid ' + ico + '"></i><span>' + title + '</span></button>');
      t.onclick = () => { S.tab = id; store.set('settings', S); render(); body.scrollTop = 0; };
      tabs.appendChild(t);
    });
    const heading = (l, d2, ico) => {
      const h = el('<div class="grp"><h4></h4><p></p></div>');
      h.querySelector('h4').textContent = l;
      if (ico) h.querySelector('h4').insertBefore(el('<i class="fa-solid ' + ico + '"></i>'), h.querySelector('h4').firstChild);
      if (d2) h.querySelector('p').textContent = d2; else h.querySelector('p').remove();
      return h;
    };
    if (term) {
      let hits = 0;
      SCHEMA.forEach(([id, title, ico, fields]) => {
        const m = fields.filter(f => f.t !== 'h' && ((f.l || '') + ' ' + (f.d || '') + ' ' + (f.kw || '') + ' ' + title).toLowerCase().includes(term));
        if (!m.length) return;
        hits += m.length;
        const sec = el('<div class="sec"></div>');
        sec.appendChild(heading(title, '', ico));
        m.forEach(f => sec.appendChild(buildRow(f, d)));
        body.appendChild(sec);
      });
      if (!hits) body.appendChild(el('<div class="d-empty"><i class="fa-solid fa-magnifying-glass"></i>No settings match “<span></span>”.</div>')).querySelector('span').textContent = term;
    } else {
      const sc = SCHEMA.find(x => x[0] === S.tab), sec = el('<div class="sec"></div>');
      sc[3].forEach(f => sec.appendChild(f.t === 'h' ? heading(f.l, f.d) : buildRow(f, d)));
      if (keysOf(sc[3]).length) {
        const r = el('<button type="button" class="d-reset"><i class="fa-solid fa-rotate-left"></i>Reset this section</button>');
        r.onclick = () => resetSection(sc[0]);
        sec.appendChild(r);
      }
      body.appendChild(sec);
    }
    refreshDeps();
    body.scrollTop = top;
  }
  $('#dFind').addEventListener('input', () => { render(); $('#dBody').scrollTop = 0; });
  const KEYS = ['settings', 'name', 'links', 'loc', 'engine'];
  function exportData() {
    const o = {}; KEYS.forEach(k => { o[k] = store.get(k, null); });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(o, null, 2)], { type: 'application/json' }));
    a.download = 'home-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
    toast('Backup downloaded', 'fa-download');
  }
  function importData() {
    const i = document.createElement('input'); i.type = 'file'; i.accept = 'application/json';
    i.onchange = () => {
      const r = new FileReader();
      r.onload = () => { try { const o = JSON.parse(r.result); KEYS.forEach(k => { if (o[k] != null) store.set(k, o[k]); }); location.reload(); } catch (e) { toast('Invalid backup file', 'fa-triangle-exclamation'); } };
      if (i.files[0]) r.readAsText(i.files[0]);
    };
    i.click();
  }
  addEventListener('keydown', e => {
    if (e.key === 'Escape') openDrawer(false);
    if (e.key === ',' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openDrawer(!document.body.classList.contains('open')); }
  });

  /* ---------- particles ---------- */
  const cv = $('#bg'), cx = cv.getContext('2d');
  let W, H, mouse = { x: -999, y: -999 };
  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  addEventListener('resize', resize); resize();
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
  const mk = () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() * 2 - 1) * 0.125, vy: (Math.random() * 2 - 1) * 0.125,
    r: 0.6 + Math.random() * 2.2, o: 0.15 + Math.random() * 0.5
  });
  let P = [];
  function syncP() { while (P.length < S.pCount) P.push(mk()); P.length = S.pCount; }
  syncP();
  function frame() {
    cx.clearRect(0, 0, W, H);
    if (!S.particles) return requestAnimationFrame(frame);
    for (const p of P) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (S.pMouse && d < 120 && d > 0) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
      p.x += p.vx * S.pSpeed / 100; p.y += p.vy * S.pSpeed / 100;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    }
    const L = S.pLink;
    for (let i = 0; S.pLines && i < P.length; i++) {
      for (let j = i + 1; j < P.length; j++) {
        const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
        if (d < L) {
          cx.strokeStyle = 'rgba(' + pc + ',' + (0.2 * (1 - d / L)) + ')';
          cx.lineWidth = 1; cx.beginPath();
          cx.moveTo(P[i].x, P[i].y); cx.lineTo(P[j].x, P[j].y); cx.stroke();
        }
      }
    }
    for (const p of P) {
      cx.fillStyle = 'rgba(' + pc + ',' + p.o + ')';
      cx.beginPath(); cx.arc(p.x, p.y, p.r * S.pSize / 100, 0, Math.PI * 2); cx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();

  /* ---------- welcome animation (letters reveal one by one) ---------- */
  const greetEl = $('#greeting'), nameEl = $('#name');
  function letters(el, text, start) {
    el.innerHTML = '';
    let i = start || 0;
    for (const c of text) {
      const s = document.createElement('span');
      s.className = 'ch' + (c === ' ' ? ' sp' : '');
      s.style.setProperty('--i', i++);
      s.textContent = c === ' ' ? ' ' : c;
      el.appendChild(s);
    }
    return i;
  }
  let greetText = '';
  function greetingFor(h) {
    return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }
  function drawWelcome() {
    const g = greetingFor(new Date().getHours()) + ', ';
    greetText = g;
    const n = letters(greetEl, g, 0);
    letters(nameEl, store.get('name', 'friend'), n);
  }
  drawWelcome();
  nameEl.onclick = async () => {
    const r = await formDialog({
      icon: 'fa-user', title: 'Display name', desc: 'This name appears in your welcome greeting.',
      submit: 'Save name',
      fields: [{ id: 'name', label: 'Your name', icon: 'fa-user', value: store.get('name', 'friend'), placeholder: 'e.g. Flynn', maxlength: 24,
        requiredMsg: 'Please enter a name.' }]
    });
    if (r) {
      store.set('name', r.name);
      letters(nameEl, r.name, 0);
      toast('Name updated', 'fa-user');
    }
  };

  /* ---------- day progress card ---------- */
  const EYE = 'fill="#fff" stroke="#0b5f5a" stroke-width="3"', INK = '#0b5f5a';
  const FACES = [
    // sleepy (start of day)
    '<path d="M10 24q10 9 20 0M50 24q10 9 20 0" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="40" cy="47" rx="5" ry="3.5" fill="none" stroke="' + INK + '" stroke-width="3"/>',
    // happy
    '<circle cx="20" cy="22" r="10" ' + EYE + '/><circle cx="60" cy="22" r="10" ' + EYE + '/><path class="pu" d="M20 22h0M60 22h0" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><path d="M20 44q20 14 40 0" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>',
    // tongue out
    '<circle cx="20" cy="22" r="10" ' + EYE + '/><circle cx="60" cy="22" r="10" ' + EYE + '/><path class="pu" d="M20 22h0M60 22h0" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><path d="M38 47v8a5 5 0 0 0 10 0v-6" fill="#3aa6cf" stroke="' + INK + '" stroke-width="3"/><path d="M16 49q22-9 40-1" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>',
    // yawning (end of day)
    '<path d="M10 24q10 9 20 0M50 24q10 9 20 0" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="40" cy="48" rx="9" ry="8" fill="' + INK + '"/>'
  ];
  let faceN = -1;
  function dayUI(p, left) {
    $('#dayCard').style.setProperty('--p', p.toFixed(2) + '%');
    $('#dayPct').textContent = Math.round(p) + '%';
    $('#dpLeft').textContent = Math.floor(left / 3600) + 'h ' + Math.floor(left % 3600 / 60) + 'm left';
    const n = p < 20 ? 0 : p < 50 ? 1 : p < 80 ? 2 : 3;
    if (n !== faceN) { faceN = n; $('#dpFace').innerHTML = '<svg viewBox="0 0 80 62" width="64" height="50">' + FACES[n] + '</svg>'; }
  }
  addEventListener('mousemove', e => {
    const f = $('#dpFace'); if (!f) return;
    const r = f.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), m = Math.hypot(dx, dy) || 1, k = Math.min(4, m / 40);
    f.querySelectorAll('.pu').forEach(p => { p.style.transform = 'translate(' + (dx / m * k) + 'px,' + (dy / m * k) + 'px)'; });
  });

  /* ---------- clock ---------- */
  function tick() {
    const d = new Date(), h = d.getHours();
    const p = n => String(n).padStart(2, '0'), hh = S.hr24 ? p(h) : (h % 12 || 12);
    $('#clock').innerHTML = hh + ':' + p(d.getMinutes()) + (S.seconds ? ':' + p(d.getSeconds()) : '') + (S.hr24 ? '' : '<small>' + (h < 12 ? 'AM' : 'PM') + '</small>');
    $('#date').textContent = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (greetingFor(h) + ', ' !== greetText) drawWelcome();
    const s = (h * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400 * 100;
    dayUI(s, 86400 - (h * 3600 + d.getMinutes() * 60 + d.getSeconds()));
  }
  tick(); setInterval(tick, 1000);

  /* ---------- search ---------- */
  const ENGINES = {
    Google:     { url: 'https://www.google.com/search?q=',              host: 'google.com' },
    YouTube:    { url: 'https://www.youtube.com/results?search_query=', host: 'youtube.com' },
    GitHub:     { url: 'https://github.com/search?q=',                  host: 'github.com' },
    Maps:       { url: 'https://www.google.com/maps/search/',           host: 'maps.google.com' },
    DuckDuckGo: { url: 'https://duckduckgo.com/?q=',                    host: 'duckduckgo.com' }
  };
  let eng = store.get('engine', 'Google');
  if (!ENGINES[eng]) eng = 'Google';
  const G_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/></svg>';
  function drawEngines() {
    $('#sIco').innerHTML = eng === 'Google' ? G_SVG : '<img alt="" src="' + favicon(ENGINES[eng].host, 64) + '">';
    $('#q').placeholder = eng === 'Google' ? 'Ask Google or type a URL' : 'Search ' + eng + ' or type a URL';
    const box = $('#engines'); box.innerHTML = '';
    Object.keys(ENGINES).forEach(k => {
      const b = document.createElement('button');
      b.className = 'chip' + (k === eng ? ' active' : '');
      b.innerHTML = '<img alt="" src="' + favicon(ENGINES[k].host, 32) + '">';
      b.appendChild(document.createTextNode(k));
      b.onclick = () => { eng = k; store.set('engine', k); drawEngines(); $('#q').focus(); };
      box.appendChild(b);
    });
  }
  drawEngines();
  const go = u => {
    if (!S.sNew) { location.href = u; return; }
    const w = window.open(u, '_blank');
    if (w) { try { w.opener = null; } catch (e) {} }
    else { toast('Pop-up blocked. Opened in this tab instead', 'fa-window-restore'); location.href = u; }
  };
  $('#searchForm').onsubmit = e => {
    e.preventDefault();
    const v = $('#q').value.trim(); if (!v) return;
    if (/^(https?:\/\/|[\w-]+\.[a-z]{2,}(\/|$))/i.test(v) && !v.includes(' ')) {
      go(/^https?:/i.test(v) ? v : 'https://' + v);
    } else go(ENGINES[eng].url + encodeURIComponent(v));
  };
  const q = () => $('#q').value.trim();
  $('#lens').onclick = () => go('https://lens.google.com/');
  $('#aiMode').onclick = () => go('https://www.google.com/search?udm=50' + (q() ? '&q=' + encodeURIComponent(q()) : ''));
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  $('#mic').onclick = () => {
    if (!SR) return toast('Voice search is not supported in this browser', 'fa-microphone-slash');
    const r = new SR(), m = $('#mic'); r.lang = navigator.language || 'en-US';
    r.onresult = e => { $('#q').value = e.results[0][0].transcript; $('#searchForm').requestSubmit(); };
    r.onerror = () => toast('Could not hear you. Check mic permission', 'fa-microphone-slash');
    r.onend = () => m.classList.remove('rec');
    m.classList.add('rec'); toast('Listening...', 'fa-microphone'); r.start();
  };
  addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); $('#q').focus(); }
  });

  /* ---------- shortcuts (official site logos) ---------- */
  const DEFAULT_LINKS = [
    { n: 'Gmail',    u: 'https://mail.google.com' },
    { n: 'YouTube',  u: 'https://www.youtube.com' },
    { n: 'Claude',   u: 'https://claude.ai' },
    { n: 'GitHub',   u: 'https://github.com' },
    { n: 'Calendar', u: 'https://calendar.google.com' },
    { n: 'Drive',    u: 'https://drive.google.com' },
    { n: 'Maps',     u: 'https://maps.google.com' },
    { n: 'LinkedIn', u: 'https://www.linkedin.com' }
  ];
  let links = store.get('links', DEFAULT_LINKS);
  function drawLinks() {
    const g = $('#linkGrid'); g.innerHTML = '';
    links.forEach((l, i) => {
      const a = document.createElement('a');
      a.className = 'link'; a.href = l.u;
      if (S.newTab) { a.target = '_blank'; a.rel = 'noopener'; }
      a.innerHTML = '<span class="ico"><img alt="" src="' + favicon(hostOf(l.u), 128) + '"></span><span class="n"></span><button class="x" title="Remove"><i class="fa-solid fa-xmark"></i></button>';
      a.querySelector('.n').textContent = l.n;
      a.querySelector('img').onerror = function () {
        this.parentNode.innerHTML = '<i class="fa-solid fa-globe"></i>';
      };
      a.querySelector('.x').onclick = e => {
        e.preventDefault(); e.stopPropagation();
        links.splice(i, 1); store.set('links', links); drawLinks(); toast('Shortcut removed', 'fa-trash');
      };
      g.appendChild(a);
    });
    if (!links.length) g.innerHTML = '<div class="empty">No shortcuts yet. Tap Add.</div>';
  }
  drawLinks();
  $('#editLinks').onclick = () => {
    const on = $('#linkGrid').classList.toggle('editing');
    $('#editLinks span').textContent = on ? 'Done' : 'Edit';
  };
  const normUrl = v => { v = (v || '').trim(); return !v ? '' : /^https?:\/\//i.test(v) ? v : 'https://' + v; };
  const validHost = u => { const h = hostOf(u); return /^[^\s.]+(\.[^\s.]+)+$/.test(h) || h === 'localhost'; };
  $('#addLink').onclick = async () => {
    let nameTouched = false;
    const r = await formDialog({
      icon: 'fa-link', title: 'Add shortcut', desc: 'Pin a website to your home page for one-click access.',
      submit: 'Add shortcut', preview: true,
      fields: [
        { id: 'url', label: 'Website address', icon: 'fa-globe', placeholder: 'e.g. notion.so', inputmode: 'url', requiredMsg: 'Please enter a website address.',
          hint: 'The https:// prefix is added automatically.',
          validate: v => validHost(normUrl(v)) ? '' : 'Enter a valid address, such as notion.so.' },
        { id: 'name', label: 'Display name', icon: 'fa-tag', placeholder: 'Auto-filled from the address', maxlength: 24, optional: true }
      ],
      onChange(v, ui) {
        const nameInp = ui.inputs.name;
        if (document.activeElement === nameInp) nameTouched = !!v.name;
        const host = hostOf(normUrl(v.url)), ok = validHost(normUrl(v.url));
        if (!nameTouched) nameInp.value = ok ? host.replace(/^www\./, '').split('.')[0].replace(/^./, c => c.toUpperCase()) : '';
        const nm = nameInp.value.trim();
        ui.preview.innerHTML = '';
        if (ok) {
          ui.preview.appendChild(el('<span class="m-pi"><img alt="" src="' + favicon(host, 64) + '"></span>'));
          const t = el('<span class="m-pt"><b></b><em></em></span>');
          t.querySelector('b').textContent = nm || host; t.querySelector('em').textContent = host;
          ui.preview.appendChild(t); ui.preview.classList.add('on');
        } else ui.preview.classList.remove('on');
      }
    });
    if (!r) return;
    const u = normUrl(r.url), host = hostOf(u);
    links.push({ n: r.name || host.replace(/^www\./, '').split('.')[0], u }); store.set('links', links); drawLinks(); toast('Shortcut added', 'fa-plus');
  };

  /* ---------- weather (Open-Meteo, no API key) ---------- */
  const CODES = {
    0: ['fa-sun', 'Clear'], 1: ['fa-cloud-sun', 'Mostly clear'], 2: ['fa-cloud-sun', 'Partly cloudy'], 3: ['fa-cloud', 'Overcast'],
    45: ['fa-smog', 'Fog'], 48: ['fa-smog', 'Fog'],
    51: ['fa-cloud-rain', 'Light drizzle'], 53: ['fa-cloud-rain', 'Drizzle'], 55: ['fa-cloud-rain', 'Heavy drizzle'],
    61: ['fa-cloud-rain', 'Light rain'], 63: ['fa-cloud-showers-heavy', 'Rain'], 65: ['fa-cloud-showers-heavy', 'Heavy rain'],
    80: ['fa-cloud-sun-rain', 'Showers'], 81: ['fa-cloud-showers-heavy', 'Showers'], 82: ['fa-cloud-showers-heavy', 'Heavy showers'],
    95: ['fa-cloud-bolt', 'Thunderstorm'], 96: ['fa-cloud-bolt', 'Thunderstorm'], 99: ['fa-cloud-bolt', 'Thunderstorm']
  };
  let loc = store.get('loc', { id: 'phnom-penh', name: 'Phnom Penh, Cambodia', lat: 11.5564, lon: 104.9282 });
  function renderTemp() { if (lastC != null) $('#wTemp').textContent = Math.round(S.unit === 'F' ? lastC * 9 / 5 + 32 : lastC) + '°' + S.unit; }
  async function loadWeather() {
    $('#wLoad').style.display = 'block'; $('#wBody').style.display = 'none';
    try {
      const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + loc.lat + '&longitude=' + loc.lon + '&current=temperature_2m,weather_code&timezone=auto');
      const j = await r.json(); const c = j.current;
      const w = CODES[c.weather_code] || ['fa-temperature-half', 'Weather'];
      $('#wIco').className = 'w-ico fa-solid ' + w[0];
      lastC = c.temperature_2m; renderTemp();
      $('#wDesc').textContent = w[1];
      $('#wCity').textContent = loc.name;
    } catch (e) {
      $('#wIco').className = 'w-ico fa-solid fa-plug-circle-xmark';
      $('#wTemp').textContent = '--';
      $('#wDesc').textContent = 'Weather unavailable';
      $('#wCity').textContent = loc.name;
    }
    $('#wLoad').style.display = 'none'; $('#wBody').style.display = 'block';
  }
  loadWeather(); setInterval(loadWeather, 15 * 60 * 1000);
  $('#weather').onclick = async () => {
    const x = await pickLocation(loc);
    if (!x) return;
    loc = { id: x.id, name: x.n + ', Cambodia', lat: x.lat, lon: x.lon };
    store.set('loc', loc); loadWeather(); toast('Location set to ' + x.n, 'fa-location-dot');
  };
})();
