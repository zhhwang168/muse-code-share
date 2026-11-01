const { t, setText } = window.I18N;
const $ = (selector) => document.querySelector(selector);
let codes = [], offset = 0, loading = false, toastTimer;
let ownership = {};
try { ownership = JSON.parse(localStorage.getItem('muse-owned') || '{}') || {}; } catch {}
const dateFormat = () => new Intl.DateTimeFormat(window.I18N.locale, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
function toast(message) { setText($('#toast'), message); $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3500); }
async function api(path, options = {}) {
  const response = await fetch(path, { ...options, signal: AbortSignal.timeout(15000) });
  let data;
  try { data = await response.json(); } catch { throw new Error(t('分享服务尚未连接，请稍后重试。')); }
  if (!response.ok) throw new Error(t(data.error || t('操作失败，请稍后重试')));
  return data;
}
function element(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
function remaining(expires) {
  const minutes = Math.max(1, Math.ceil((expires - (Date.now() + offset)) / 60000));
  return minutes >= 60 ? t('{hours} 小时 {minutes} 分后下架', {hours: Math.floor(minutes / 60), minutes: minutes % 60}) : t('{minutes} 分钟后下架', {minutes});
}
async function copy(code) {
  try { await navigator.clipboard.writeText(code); toast('已复制邀请码，请尽快前往 Muse 兑换'); }
  catch { $('#manual-code').value = code; $('#copy-dialog').showModal(); $('#manual-code').focus(); $('#manual-code').select(); }
}
function render() {
  const active = codes.filter(c => c.expires_at > Date.now() + offset);
  $('#code-count').textContent = active.length;
  const list = $('#code-list'); list.replaceChildren();
  if (!active.length) {
    const empty = element('div', 'empty-state');
    empty.append(element('div', 'empty-icon', '✳'), element('h3', '', t('第一份分享，从你开始')), element('p', '', t('目前还没有展示中的邀请码。欢迎留下你的邀请机会。')));
    const link = element('a', 'text-link', t('分享第一个邀请码 ↗')); link.href = '#share'; empty.append(link); list.append(empty); return;
  }
  active.forEach((item, index) => {
    const card = element('article', 'code-card'); card.dataset.id = item.id;
    const top = element('div', 'card-top');
    const time = element('span', 'remaining', remaining(item.expires_at)); time.dataset.expires = item.expires_at;
    if (item.expires_at - Date.now() - offset < 3600000) time.classList.add('expiring');
    top.append(element('span', 'queue-number', `NO. ${String(index + 1).padStart(2, '0')}`), time);
    const button = element('button', 'copy-code'); button.type = 'button'; button.setAttribute('aria-label', t('复制邀请码 {code}', {code: item.code}));
    button.append(element('span', 'code-value', item.code), element('span', 'copy-label', t('复制 ⧉')));
    button.addEventListener('click', () => copy(item.code));
    const dates = element('div', 'card-date');
    const date = element('time', '', t('提交于 {date}', {date: dateFormat().format(item.created_at)})); date.dateTime = new Date(item.created_at).toISOString(); date.title = new Date(item.created_at).toLocaleString(window.I18N.locale);
    dates.append(date, element('span', '', t('社区分享')));
    card.append(top, button, dates);
    if (ownership[item.id]) {
      const remove = element('button', 'remove-code', t('已用完 / 下架')); remove.type = 'button';
      remove.addEventListener('click', async () => {
        if (!confirm(t('确定下架这个邀请码？下架后将不再展示。'))) return;
        remove.disabled = true;
        try {
          await api(`/api/codes/${encodeURIComponent(item.id)}`, { method: 'DELETE', headers: { 'X-Delete-Token': ownership[item.id] } });
          delete ownership[item.id]; try { localStorage.setItem('muse-owned', JSON.stringify(ownership)); } catch {}
          codes = codes.filter(c => c.id !== item.id); render(); toast('邀请码已下架');
        } catch (error) { toast(error.name === 'TimeoutError' || error.name === 'TypeError' ? '分享服务尚未连接，请稍后重试。' : error.message); remove.disabled = false; }
      });
      card.append(remove);
    }
    list.append(card);
  });
}
async function refresh() {
  if (loading) return;
  loading = true; $('#refresh').disabled = true;
  try {
    const data = await api('/api/codes');
    const changed = JSON.stringify(codes) !== JSON.stringify(data.codes);
    offset = data.serverTime - Date.now(); codes = data.codes;
    // Keep keyboard focus intact when the server list has not changed.
    if (changed || !$('#code-list').children.length) render();
    $('#connection-status').hidden = true;
  } catch (error) {
    $('#connection-status').hidden = false; $('#connection-status').className = 'connection-status error';
    setText($('#connection-status'), '暂时无法更新邀请码：{error}', {error: error.name === 'TimeoutError' || error.name === 'TypeError' ? t('分享服务尚未连接，请稍后重试。') : error.message});
    if (!codes.length) $('#code-count').textContent = '—';
  } finally { loading = false; $('#refresh').disabled = false; }
}
$('#refresh').addEventListener('click', refresh);
$('#share-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button[type=submit]'); button.disabled = true;
  const message = $('#form-message'); message.className = ''; setText(message, '正在分享…');
  try {
    const data = await api('/api/codes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: $('#invite-code').value.trim() }) });
    ownership[data.id] = data.deleteToken;
    let saved = true; try { localStorage.setItem('muse-owned', JSON.stringify(ownership)); } catch { saved = false; }
    $('#share-form').reset(); setText(message, saved ? '分享成功！号码将展示 24 小时，感谢你的分享。' : '分享成功！浏览器无法保存下架凭证，请保留当前页面；号码将在 24 小时后自动下架。');
    toast('谢谢你，把机会传给了下一个人');
    document.activeElement?.blur(); await refresh();
  } catch (error) { message.className = 'error'; setText(message, error.name === 'TimeoutError' || error.name === 'TypeError' ? '分享服务尚未连接，请稍后重试。' : error.message); }
  finally { button.disabled = false; }
});
$('#close-copy').addEventListener('click', () => $('#copy-dialog').close());
const config = window.SITE_CONFIG || {};
function updateVideo() {
  try {
    const video = new URL(config.tutorialUrl);
    if (video.protocol === 'https:') {
      $('#video-link').href = video.href; $('#video-link').hidden = false;
      const description = typeof config.tutorialDescription === 'object' ? config.tutorialDescription[window.I18N.language] : config.tutorialDescription;
      $('#video-description').textContent = t(description || '跟着视频，一步步完成注册与邀请码兑换。');
      $('#video-badge').textContent = t('观看教程');
    }
  } catch {}
}
function localizeValidation() {
  const input = $('#invite-code');
  const consent = $('#share-form input[type=checkbox]');
  input.setCustomValidity(''); consent.setCustomValidity('');
  if (input.validity.valueMissing) input.setCustomValidity(t('请填写邀请码'));
  else if (!/^[A-Za-z0-9][A-Za-z0-9_-]{3,63}$/.test(input.value)) input.setCustomValidity(t('请输入 4–64 位字母、数字、短横线或下划线'));
  if (!consent.checked) consent.setCustomValidity(t('请先勾选公开分享确认'));
}
$('#invite-code').addEventListener('input', localizeValidation);
$('#share-form input[type=checkbox]').addEventListener('change', localizeValidation);
$('#share-form').addEventListener('invalid', localizeValidation, true);
document.addEventListener('languagechange', () => { render(); updateVideo(); localizeValidation(); });
updateVideo();
refresh();
setInterval(() => { if (!document.hidden) refresh(); }, 30000);
setInterval(() => {
  if (codes.some(c => c.expires_at <= Date.now() + offset)) { codes = codes.filter(c => c.expires_at > Date.now() + offset); render(); }
  document.querySelectorAll('[data-expires]').forEach(node => { node.textContent = remaining(Number(node.dataset.expires)); node.classList.toggle('expiring', Number(node.dataset.expires) - Date.now() - offset < 3600000); });
}, 15000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
