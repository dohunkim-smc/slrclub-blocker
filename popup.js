const key = 'blockedXuids';
async function render() {
  const data = await chrome.storage.local.get(key);
  const ids = Array.isArray(data[key]) ? data[key] : [];
  const list = document.getElementById('list');
  list.replaceChildren();
  document.getElementById('status').textContent = ids.length ? `${ids.length}명 차단 중` : '차단한 작성자가 없습니다.';
  for (const id of ids) {
    const li = document.createElement('li');
    li.append(document.createTextNode(id));
    const button = document.createElement('button');
    button.textContent = '차단 해제';
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        const latest = await chrome.storage.local.get(key);
        await chrome.storage.local.set({[key]: (Array.isArray(latest[key]) ? latest[key] : []).filter(value => value !== id)});
        await render();
      } catch { document.getElementById('status').textContent = '해제에 실패했습니다. 다시 시도해 주세요.'; button.disabled = false; }
    });
    li.append(button); list.append(li);
  }
}
chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes[key]) render().catch(showError); });
function showError() { document.getElementById('status').textContent = '차단 목록을 읽지 못했습니다.'; }
render().catch(showError);
