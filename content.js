(() => {
  const key = 'blockedXuids';
  const authorSelector = '#bbs_list > tbody > tr > td.list_name > span[data-xuid]';
  let blocked = new Set();
  let selectedAuthor = null;
  let pending = false;
  let saving = false;

  async function blockAuthor(event) {
    event.preventDefault();
    event.stopPropagation();
    const id = selectedAuthor?.getAttribute('data-xuid')?.trim();
    if (!id || saving || !selectedAuthor.isConnected) return;
    saving = true;
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const data = await chrome.storage.local.get(key);
      const ids = new Set(Array.isArray(data[key]) ? data[key] : []);
      ids.add(id);
      await chrome.storage.local.set({[key]: [...ids]});
      blocked = ids;
      selectedAuthor = null;
      scan();
    } catch {
      alert('차단 목록을 저장하지 못했습니다. 페이지를 새로고침하고 다시 시도해 주세요.');
    } finally {
      saving = false;
      button.disabled = false;
    }
  }

  function updateMenu() {
    const list = document.querySelector('#su > ul');
    const id = selectedAuthor?.getAttribute('data-xuid')?.trim();
    const valid = selectedAuthor?.isConnected && id && !blocked.has(id);
    const existing = document.querySelectorAll('#su .slr-xuid-block-item');
    if (!list || !valid) {
      existing.forEach(item => item.remove());
      return;
    }
    // The site can reuse the menu or replace its contents on each click.
    existing.forEach(item => { if (item.parentElement !== list) item.remove(); });
    let item = list.querySelector(':scope > .slr-xuid-block-item');
    if (!item) {
      item = document.createElement('li');
      item.className = 'slr-xuid-block-item';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slr-xuid-block';
      button.textContent = '이새끼 글 안보기';
      button.addEventListener('click', blockAuthor);
      item.append(button);
      list.append(item);
    }
    item.firstElementChild.title = `작성자 차단 (${id})`;
  }

  function scan() {
    for (const author of document.querySelectorAll(authorSelector)) {
      const id = author.getAttribute('data-xuid')?.trim();
      if (id && blocked.has(id)) author.closest('tr')?.remove();
    }
    updateMenu();
  }

  function schedule() {
    if (pending) return;
    pending = true;
    queueMicrotask(() => { pending = false; scan(); });
  }

  // Capture the author before the site's inline/bubbling menu handlers run.
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('#su')) return;
    selectedAuthor = target?.closest(authorSelector) || null;
    schedule();
  }, true);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[key]) {
      blocked = new Set(Array.isArray(changes[key].newValue) ? changes[key].newValue : []);
      schedule();
    }
  });
  chrome.storage.local.get(key).then(data => {
    blocked = new Set(Array.isArray(data[key]) ? data[key] : []);
    new MutationObserver(schedule).observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['data-xuid']
    });
    scan();
  }).catch(() => console.warn('SLRCLUB 차단 목록을 읽지 못했습니다.'));
})();
