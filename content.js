(() => {
  const key = 'blockedXuids';
  let blocked = new Set();
  let pending = false;
  let saving = false;
  function scan() {
    for (const author of document.querySelectorAll('#bbs_list > tbody > tr > td.list_name > span[data-xuid]')) {
      const id = author.getAttribute('data-xuid')?.trim();
      if (!id) continue;
      const row = author.closest('tr');
      if (blocked.has(id)) { row.remove(); continue; }
      if (author.nextElementSibling?.classList.contains('slr-xuid-block')) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slr-xuid-block';
      button.textContent = '이새끼 글 안보기';
      button.title = `작성자 차단 (${id})`;
      button.addEventListener('click', async event => {
        event.preventDefault();
        event.stopPropagation();
        if (saving) return;
        saving = true;
        button.disabled = true;
        try {
          const data = await chrome.storage.local.get(key);
          const ids = new Set(Array.isArray(data[key]) ? data[key] : []);
          ids.add(id);
          await chrome.storage.local.set({[key]: [...ids]});
          blocked = ids;
          scan();
        } catch {
          alert('차단 목록을 저장하지 못했습니다. 페이지를 새로고침하고 다시 시도해 주세요.');
        } finally { saving = false; button.disabled = false; }
      });
      author.after(button);
    }
  }
  function schedule() {
    if (pending) return;
    pending = true;
    queueMicrotask(() => { pending = false; scan(); });
  }
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
