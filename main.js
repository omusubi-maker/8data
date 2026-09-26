let serverData = null;
const dataPromise = loadJson();

async function loadJson() {
  const url = "data.json";
  const res = await fetch(url);
  return await res.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  serverData = await dataPromise;
  initApp();

  const cardList = document.getElementById("wrapper");
  if (cardList) {
    new Sortable(cardList, {
      swap: true,
      handle: '.charaName',
      delay: 200,
      delayOnTouchOnly: true,
      animation: 150,
    });
  }
});

function initApp() {
  setupCharaList(serverData.chara);
  createCards(serverData.chara, serverData.kotadame);
  setupEventListeners();
}

const imgBase = "./img/";

const PHY_MAP = {
  '1': { cls: 'w-sword',  title: '剣' },
  '2': { cls: 'w-axe',    title: '斧' },
  '3': { cls: 'w-short',  title: '短剣' },
  '4': { cls: 'w-book',   title: '本' },
  '5': { cls: 'w-staff',  title: '杖' },
  '6': { cls: 'w-bow',    title: '弓' },
  '7': { cls: 'w-spear',  title: '槍' },
  '8': { cls: 'w-fan',    title: '扇' }
};

const ATR_MAP = {
  '1': { cls: 'a-fire',    title: '火' },
  '2': { cls: 'a-ice',     title: '氷' },
  '3': { cls: 'a-thunder', title: '雷' },
  '4': { cls: 'a-wind',    title: '風' },
  '5': { cls: 'a-light',   title: '光' },
  '6': { cls: 'a-dark',    title: '闇' },
  '7': { cls: 'a-crit',    title: '属クリ' }
};

const UPPER_ICON_MAP = {
  atkValue: {
    "物攻": { cls: "atk-phy", title: "物攻", type: "percent-fixed" },
    "属攻": { cls: "atk-atr", title: "属攻", type: "percent-fixed" },
    "上撒": { cls: "dmgLimit", title: "ダメ上限撒き", type: "text" }
  },

  atkPhys: {
    "剣攻": { cls: "w-sword", title: "剣ダメ", type: "percent" },
    "斧攻": { cls: "w-axe", title: "斧ダメ", type: "percent" },
    "短攻": { cls: "w-short", title: "短剣ダメ", type: "percent" },
    "本攻": { cls: "w-book", title: "本ダメ", type: "percent" },
    "杖攻": { cls: "w-staff", title: "杖ダメ", type: "percent" },
    "弓攻": { cls: "w-bow", title: "弓ダメ", type: "percent" },
    "槍攻": { cls: "w-spear", title: "槍ダメ", type: "percent" },
    "扇攻": { cls: "w-fan", title: "扇ダメ", type: "percent" }
  },

  atkAtrs: {
    "火攻": { cls: "a-fire", title: "火ダメ", type: "percent" },
    "氷攻": { cls: "a-ice", title: "氷ダメ", type: "percent" },
    "雷攻": { cls: "a-thunder", title: "雷ダメ", type: "percent" },
    "風攻": { cls: "a-wind", title: "風ダメ", type: "percent" },
    "光攻": { cls: "a-light", title: "光ダメ", type: "percent" },
    "闇攻": { cls: "a-dark", title: "闇ダメ", type: "percent" }
  },

  atkOther: {
    "会心": { cls: "o-crit", title: "会心", type: "percent" },
    "速度": { cls: "o-speed", title: "速度", type: "percent" },
    "クリ": { cls: "o-cri", title: "クリダメ", type: "percent" },
    "全":   { cls: "o-all", title: "全ダメ", type: "percent" },
    "威力": { cls: "o-power", title: "威力", type: "percent" }
  },

  defPA: {
    "物防": { cls: "def-phy", title: "物防", type: "percent" },
    "属防": { cls: "def-atr", title: "属防", type: "percent" },
    "物耐": { cls: "res-phy", title: "物耐", type: "percent" },
    "属耐": { cls: "res-atr", title: "属耐", type: "percent" }
  },

  rdtAtr: {
    "火耐": { cls: "res-fire", title: "火耐", type: "percent-fixed" },
    "氷耐": { cls: "res-ice", title: "氷耐", type: "percent-fixed" },
    "雷耐": { cls: "res-thunder", title: "雷耐", type: "percent-fixed" },
    "風耐": { cls: "res-wind", title: "風耐", type: "percent-fixed" },
    "光耐": { cls: "res-light", title: "光耐", type: "percent-fixed" },
    "闇耐": { cls: "res-dark", title: "闇耐", type: "percent-fixed" }
  },

  補足: {
    "補足": { cls: "note", title: "補足", type: "text" }
  }
};

function createCards(charaList, kotoDame) {
  const wrapper = document.getElementById('wrapper');
  const temp = document.getElementById('temp');
  const frag = document.createDocumentFragment();
  wrapper.textContent = '';

  charaList.forEach(chara => {
    const clone = temp.content.cloneNode(true);
    setupCharaDetails(clone, chara, kotoDame);
    setupUpperOrigin(clone, chara);
    renderAbilities(clone, chara);
    frag.appendChild(clone);
  });

  wrapper.appendChild(frag);
}

function setupCharaDetails(clone, chara, kotoDame) {
  const nb = clone.querySelector('.nameBlock');
  nb.dataset.star = chara['星'] || '';
  nb.dataset.job = chara['職'] || '';
  nb.dataset.influ = chara['影響力'] || '';

  let phyList = [];
  if (chara["物"] != null) {
    const str = String(chara["物"]).trim();
    const types = str.split(",");
    phyList = types
      .map(t => PHY_MAP[t]?.cls)
      .filter(Boolean);
  }
  nb.dataset.phyatk = phyList.join(",");

  let atrList = [];
  if (chara["属"] != null) {
    const str = String(chara["属"]).trim();
    const types = str.split(",");
    atrList = types
      .map(t => ATR_MAP[t]?.cls)
      .filter(Boolean);
  }
  nb.dataset.atratk = atrList.join(",");

  const influence = nb.querySelector('.triangle');
  const influenceValue = chara['影響力'] || '';

  const influenceClassMap = {
    "富": "influence1", "所有": "influence1",
    "権力": "influence2", "支配": "influence2",
    "名声": "influence3", "承認": "influence3"
  };

  const cls = influenceClassMap[influenceValue];
  if (cls) {
    influence.classList.add(cls);
  }

  const nameEl = nb.querySelector('.charaName');
  if (nameEl) nameEl.textContent = chara['名前'] || '';

  const imgS = nb.querySelector('.imgS');

  if (imgS) {
    const fileName = chara['imgS'] || 'no-img.png';
    const img = document.createElement('img');
    img.src = imgBase + fileName;
    img.alt = chara['名前'];
    img.title = chara['名前'];
    img.width = 36;
    img.height = 33;
    img.loading = 'lazy';

    imgS.appendChild(img);
  }

  const upperDameVal = nb.querySelector('.upperDameVal');
  const safeNum = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };
  const upperBonus1 = safeNum(chara['上限']);
  const upperBonus2 = safeNum(chara['星6']);
  const upperDame = 99999 + safeNum(kotoDame) + upperBonus1 + upperBonus2;
  upperDameVal.textContent = upperDame.toLocaleString();

  renderAttackTypes(nb.querySelector('.physicalA'), chara['物'], PHY_MAP);
  renderAttackTypes(nb.querySelector('.attributeA'), chara['属'], ATR_MAP);
}

function setupUpperOrigin(clone, chara) {
  const upperBlock = clone.querySelector('.upperBlock');

  const komeClassMap = { '1': 'kome1', '2': 'kome2', '3': 'kome3' };

  const SECTIONS = {
    atkValue: { data: chara.atkValue },
    atkPhys:  { data: chara.atkPhys },
    atkAtrs:  { data: chara.atkAtrs },
    atkOther: { data: chara.atkOther },
    defPA:    { data: chara.defPA },
    補足:     { data: chara["補足"] },
    rdtAtr:   { data: chara.rdtAtr }
  };

  const ORDER = [
    "atkValue",
    "atkPhys",
    "atkAtrs",
    "atkOther",
    "defPA",
    "補足",
    "rdtAtr"
  ];

  for (const sectionName of ORDER) {
    const section = SECTIONS[sectionName];
    if (!section) continue;

    const data = section.data;
    if (!data) continue;

    if (sectionName === "補足") {
      const iconInfo = UPPER_ICON_MAP["補足"]["補足"];
      if (!iconInfo) continue;

      const div = document.createElement('div');
      div.classList.add("note");

      const icon = document.createElement('div');
      icon.classList.add('icon', iconInfo.cls);
      icon.title = iconInfo.title;
      div.appendChild(icon);

      div.insertAdjacentHTML('beforeend', String(data).trim());
      upperBlock.appendChild(div);
      continue;
    }

    const keys = Object.keys(data);

    if (sectionName !== "atkValue" && sectionName !== "rdtAtr") {
      const hasValidValue = keys.some(key => {
        const v = data[key];
        return v !== null && v !== "" && v !== undefined;
      });
      if (!hasValidValue) continue;
    }

    const rowDiv = document.createElement('div');
    rowDiv.classList.add('upper', sectionName);

    if (sectionName === "atkValue") {
      rowDiv.style.gridTemplateColumns = "1fr 1fr 6fr";
    }

    upperBlock.appendChild(rowDiv);

    for (const key of keys) {
      const rawVal = data[key];
      const iconInfo = UPPER_ICON_MAP[sectionName][key];
      if (!iconInfo) continue;

      const keyType = iconInfo.type;
      let valHtml = "";

      if (keyType === "text") {
        if (!rawVal) continue;
        valHtml = String(rawVal).trim();
      } else if (keyType === "percent-fixed") {
        if (!rawVal) {
          valHtml = '<span class="none">－</span>';
        } else {
          const str = String(rawVal).trim();
          if (str.includes(',')) {
            const [num, type] = str.split(',');
            const cls = komeClassMap[type] || "";
            valHtml = `<span class="${cls}">${num}<span class="per">%</span></span>`;
          } else {
            valHtml = `${str}<span class="per">%</span>`;
          }
        }
      } else if (keyType === "percent") {
        if (!rawVal) continue;
        const str = String(rawVal).trim();
        if (str.includes(',')) {
          const [num, type] = str.split(',');
          const cls = komeClassMap[type] || "";
          valHtml = `<span class="${cls}">${num}<span class="per">%</span></span>`;
        } else {
          valHtml = `${str}<span class="per">%</span>`;
        }
      }

      const span = document.createElement('span');
      const icon = document.createElement('div');
      icon.classList.add('icon', iconInfo.cls);
      icon.title = iconInfo.title;
      span.appendChild(icon);

      span.insertAdjacentHTML('beforeend', valHtml);
      rowDiv.appendChild(span);
    }
  }
}

function renderAbilities(clone, chara) {
  const tmplB = document.getElementById('tmpl-bAbi');
  const tmplE = document.getElementById('tmpl-eAbi');
  const tmplSM = document.getElementById('tmpl-sMove');
  const tmplS = document.getElementById('tmpl-sAbi');

  const bAbiBlock = clone.querySelector('.bAbiBlock');
  if (chara.bAbi && chara.bAbi.length > 0) {
    chara.bAbi.forEach(abi => {
      const item = tmplB.content.cloneNode(true);
      item.querySelector('.bAbiName').textContent = abi['アビリティ名'] || '';
      item.querySelector('.spVal').textContent = abi['SP'] || '';
      item.querySelector('.bAbiDetail').textContent = abi['効果'] || '';
      item.querySelector('.boosts').textContent = abi['ブースト'] || '';

      const rare = abi['RARE'] ? String(abi['RARE']).trim().toUpperCase() : '';
      const sengiEl = item.querySelector('.bAbiName');
      if (rare) {
        const span = document.createElement('span');
        span.classList.add('sengi');

        if (['S', 'A'].includes(rare)) {
          span.classList.add(`sengi_${rare.toLowerCase()}`);
          span.textContent = rare;
        }
        sengiEl.appendChild(span);
      }
      bAbiBlock.appendChild(item);
    });
  }

  const eAbiBlock = clone.querySelector('.eAbiBlock');
  const ex = chara.eAbi;
  const itemE = tmplE.content.cloneNode(true);

  itemE.querySelector('.eAbiName').textContent = ex['技名'] || '';
  itemE.querySelector('.eAbiRequire').textContent = ex['条件'] || '';
  itemE.querySelector('.eAbiNum').textContent = ex['回数'] != null ? `${ex['回数']}回` : '';

  const effect = ex['効果'] || '';
  const boost = ex['ブースト'] || '';
  const detailEl = itemE.querySelector('.eAbiDetail');

  if (boost) {
    detailEl.innerHTML = `${effect}<br>${boost}`;
  } else {
    detailEl.textContent = effect;
  }
  eAbiBlock.appendChild(itemE);

  const sm = chara.sMove;
  const itemSM = tmplSM.content.cloneNode(true);
  itemSM.querySelector('.sMoveName').textContent = sm['技名'] || '';
  itemSM.querySelector('.sMoveCate').textContent = sm['秘奥'] || '';
  itemSM.querySelector('.sMoveDetail').textContent = sm['効果'] || '';
  eAbiBlock.appendChild(itemSM);

  const sAbiBlock = clone.querySelector('.sAbiBlock');
  if (chara.sAbi && chara.sAbi.length > 0) {
    chara.sAbi.forEach(abi => {
      const item = tmplS.content.cloneNode(true);
      item.querySelector('.sAbiName').textContent = abi['アビリティ名'] || '';
      item.querySelector('.sAbiDetail').textContent = abi['効果'] || '';
      sAbiBlock.appendChild(item);
    });
  }
}

function renderAttackTypes(targetElement, typeString, map) {
  const str = typeString != null ? String(typeString).trim() : '';
  if (!str || !map || !targetElement) return;

  const fragment = document.createDocumentFragment();
  const types = str.split(',');

  for (const t of types) {
    const key = t.trim();
    const info = map[key];
    if (!info) continue;

    const div = document.createElement('div');
    div.classList.add('icon', info.cls);
    div.title = info.title;

    fragment.appendChild(div);
  }
  targetElement.appendChild(fragment);
}

function setupCharaList(charaList) {
  const ul = document.getElementById('charaList');
  const frag = document.createDocumentFragment();

  const sorted = [...charaList].sort((a, b) =>
    (a['名前'] || '').localeCompare(b['名前'] || '', 'ja', {
      sensitivity: 'base',
      numeric: true,
      ignorePunctuation: true
    })
  );

  sorted.forEach((chara, index) => {
    const uniqueId = `chkChara${index + 1}`;
    const li = document.createElement('li');

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = uniqueId;
    input.name = 'chara';
    input.value = chara['名前'];

    const label = document.createElement('label');
    label.htmlFor = uniqueId;
    label.textContent = chara['名前'];

    li.appendChild(input);
    li.appendChild(label);
    frag.appendChild(li);
  });

  ul.appendChild(frag);
}

//現操作モードを管理('filter': 絞り込みモード / 'select': キャラ選択モード)
let activeMode = 'filter';

function setupEventListeners(){
  const cbStar = document.getElementsByName('star');
  const cbInfluence = document.getElementsByName('influence');
  const cbJob = document.getElementsByName('job');
  const cbPhyAtk = document.getElementsByName('phyAtk');
  const cbAtrAtk = document.getElementsByName('atrAtk');

  const onFilterChange = () => {
    activeMode = 'filter';
    cbChoice();
  };

  for(let star of cbStar){ star.addEventListener('click', onFilterChange); }
  for(let influence of cbInfluence){ influence.addEventListener('click', onFilterChange); }
  for(let job of cbJob){ job.addEventListener('click', onFilterChange); }
  for(let phyAtk of cbPhyAtk){ phyAtk.addEventListener('click', onFilterChange); }
  for(let atrAtk of cbAtrAtk){ atrAtk.addEventListener('click', onFilterChange); }

  const btnOnOff = document.getElementById('btnOnOff');
  const checkGroup = document.querySelectorAll('.cbList input[type="checkbox"]');
  btnOnOff.addEventListener('click', () => {
    const isChecked = btnOnOff.name !== '0';

    checkGroup.forEach((checkbox) => {
      if(isChecked){
        if(checkbox.name !== 'influence'){
          checkbox.checked = false;
        }
      } else{
        checkbox.checked = true;
      }
    });
    btnOnOff.name = isChecked ? '0' : '1';
    activeMode = 'filter';
    cbChoice();
  });

  const cbChara = document.getElementsByName('chara');
  const btnReset = document.getElementById('btnReset');

  for (const chara of cbChara) {
    chara.addEventListener('change', () => {
      activeMode = 'select';
      cbChoice();
    });
  }

  btnReset.addEventListener('click', () => {
    const cbChara = document.getElementsByName('chara');
    cbChara.forEach(c => c.checked = false);
    activeMode = 'filter';
    cbChoice();
  });

  document.getElementById('btnAllbAbi')?.addEventListener('click', () => toggleAbilityContainer('bAbi'));
  document.getElementById('btnAlleAbi')?.addEventListener('click', () => toggleAbilityContainer('eAbi'));
  document.getElementById('btnAllsAbi')?.addEventListener('click', () => toggleAbilityContainer('sAbi'));

  document.addEventListener('click', function(e) {
    const el = e.target;
    if (el.classList.contains('js-ac')) {
      const type = el.className.includes('bAbiTitle') ? 'bAbi' :
                   el.className.includes('eAbiTitle') ? 'eAbi' : 'sAbi';
      const block = el.closest('.bottomBlock').querySelector(`.${type}Block`);
      const isNowOpen = block.classList.contains('is-open');
      el.classList.toggle('is-active', !isNowOpen);
      block.classList.toggle('is-open', !isNowOpen);
    }
  });
}

function cbChoice() {
  const nameBlocks = document.getElementsByClassName('nameBlock');
  let visibleCount = 0;

  if (activeMode === 'select') {
    const selectChara = [...document.getElementsByName('chara')].filter(cb => cb.checked).map(cb => cb.value);

    for (let i = 0; i < nameBlocks.length; i++) {
      const nb = nameBlocks[i];
      const card = nb.closest('.charaBox');
      const charName = nb.querySelector('.charaName')?.textContent || '';
      card.style.display = '';

      if (selectChara.includes(charName)) {
        card.classList.remove("is-hidden");
        visibleCount++;
      } else {
        card.classList.add("is-hidden");
      }
    }
    document.getElementById("chara_count").textContent = visibleCount;
    return;
  }

  const selectStar = [...document.getElementsByName('star')].filter(cb => cb.checked).map(cb => cb.value);
  const selectInfluence = [...document.getElementsByName('influence')].filter(cb => cb.checked).map(cb => cb.value);
  const selectJob = [...document.getElementsByName('job')].filter(cb => cb.checked).map(cb => cb.value);
  const selectPhyAtk = [...document.getElementsByName('phyAtk')].filter(cb => cb.checked).map(cb => cb.value);
  const selectAtrAtk = [...document.getElementsByName('atrAtk')].filter(cb => cb.checked).map(cb => cb.value);

  if (selectStar.length === 0 || selectInfluence.length === 0) {
    hideAllCharacters();
    document.getElementById("chara_count").textContent = 0;
    return;
  }

  const influenceMap = {
    "富": ["富", "所有"],
    "権力": ["権力", "支配"],
    "名声": ["名声", "承認"]
  };

  for (let i = 0; i < nameBlocks.length; i++) {
    const nb = nameBlocks[i];
    const card = nb.closest('.charaBox');
    card.style.display = '';

    const charStar = nb.dataset.star;
    if (!selectStar.includes(charStar)) {
      card.classList.add("is-hidden");
      continue;
    }

    const charInflu = nb.dataset.influ;
    const influencePass = selectInfluence.some(sel => influenceMap[sel].includes(charInflu));
    if (!influencePass) {
      card.classList.add("is-hidden");
      continue;
    }

    const charJob = nb.dataset.job;
    if (selectJob.length > 0 && !selectJob.includes(charJob)) {
      card.classList.add("is-hidden");
      continue;
    }

    const charPhyList = nb.dataset.phyatk ? nb.dataset.phyatk.split(",").filter(v => v) : [];
    const phyPass = selectPhyAtk.length > 0 && charPhyList.some(phy => selectPhyAtk.includes(phy));

    const charAtrList = nb.dataset.atratk ? nb.dataset.atratk.split(",").filter(v => v) : [];
    const atrPass = selectAtrAtk.length > 0 && charAtrList.some(atr => selectAtrAtk.includes(atr));

    const atkPass = (selectPhyAtk.length === 0 && selectAtrAtk.length === 0)
      ? true
      : (phyPass || atrPass);

    if (!atkPass) {
      card.classList.add("is-hidden");
      continue;
    }

    card.classList.remove("is-hidden");
    visibleCount++;
  }

  document.getElementById("chara_count").textContent = visibleCount;
}

function hideAllCharacters() {
  const nameBlocks = document.getElementsByClassName('nameBlock');
  for (let i = 0; i < nameBlocks.length; i++) {
    const card = nameBlocks[i].closest('.charaBox');
    card.classList.add("is-hidden");
  }
}

function toggleAbilityContainer(type, forceState = null) {
  const allBtn = document.getElementById(`btnAll${type}`);
  const titles = document.querySelectorAll(`.${type}Title`);
  const blocks = document.querySelectorAll(`.${type}Block`);
  const shouldOpen = forceState !== null ? forceState : !allBtn.classList.contains('is-active');

  if (allBtn) {
    allBtn.classList.toggle('is-active', shouldOpen);
  }

  blocks.forEach((block, index) => {
    block.classList.toggle('is-open', shouldOpen);
    if (titles[index]) {
      titles[index].classList.toggle('is-active', shouldOpen);
    }
  });
}