(() => {
  const messages = {
    'Muse 邀请码分享站 · 把灵感传下去': ['Muse Invite Hub · Pass it forward', 'Muse 招待コード共有 · チャンスをつなごう'],
    '分享站': ['Invite Hub', '招待コード共有'],
    '领取邀请码': ['Get a code', 'コードを探す'],
    '使用指南': ['Getting started', '使い方'],
    'COMMUNITY / 免费分享 · 一起探索': ['COMMUNITY / Share freely. Explore together.', 'COMMUNITY / 無料で共有、一緒に探索'],
    '一个邀请码，': ['One invitation.', 'ひとつの招待から、'],
    '开启你的': ['Meet your ', 'あなたの '],
    '让好奇心先出发。领取一个社区分享的邀请码，': ['Let curiosity lead. Pick up a community invite code,', '好奇心のままに。みんなが共有した招待コードで、'],
    '也把你的邀请机会，留给下一个有灵感的人。': ['and pass your own invitation on to the next curious mind.', 'Muse を始めて、次の誰かにもチャンスを届けよう。'],
    '找一个邀请码': ['Find an invite code', '招待コードを探す'],
    '我也来分享': ['Share a code', 'コードを共有'],
    '✓ 无需登录本站': ['✓ No site login needed', '✓ 本サイトへのログイン不要'],
    '✓ 点击即可复制': ['✓ Click to copy', '✓ クリックでコピー'],
    '✓ 每个码展示 24 小时': ['✓ Each code listed for 24h', '✓ 各コードを24時間掲載'],
    '好奇心，值得被邀请。': ['Curiosity deserves an invitation.', '好奇心に、招待状を。'],
    '分享一点机会': ['Pass on an invitation', 'チャンスを分け合い、'],
    '遇见更多可能': ['Open up new possibilities', '新しい可能性に出会う'],
    '先分享，先展示': ['First shared, first listed', '投稿順に表示'],
    '按提交时间排列，不随机插队': ['Listed in submission order', 'ランダム表示なし、投稿順に掲載'],
    '每个邀请码独立计时': ['An individual timer for every code', 'コードごとに個別カウント'],
    '提交满 24 小时后自动下架': ['Automatically delisted after 24 hours', '投稿から24時間で自動掲載終了'],
    '复制后尽快兑换': ['Redeem soon after copying', 'コピー後は早めに利用'],
    '展示期限不代表官方有效期': ['Listing time is not official validity', '掲載期間は公式の有効期限とは異なります'],
    '领取你的邀请码': ['Find your invite code', '招待コードを受け取る'],
    '↻ 刷新': ['↻ Refresh', '↻ 更新'],
    '从前往后选择，点击号码即可复制。一次复制不会消耗邀请次数。': ['Start at the top. Click a code to copy it. Copying does not use an invitation.', '上から順に選び、コードをクリックしてコピー。コピーだけでは招待枠は消費されません。'],
    '正在连接分享站…': ['Connecting to the community…', '共有サイトに接続中…'],
    '每 30 秒自动更新 · 到期号码单独下架': ['Updates every 30s · Each code expires independently', '30秒ごとに更新 · 各コードは個別に掲載終了'],
    '把机会传下去。': ['Pass it forward.', 'チャンスをつなごう。'],
    '有多余的邀请机会？': ['Have an invitation to spare?', '招待枠が余っていますか？'],
    '分享你的 Muse 邀请码，让下一位朋友也能开始。': ['Share your Muse code and help someone else get started.', 'Muse の招待コードを共有して、次の人の一歩を応援しましょう。'],
    '你的邀请码': ['Your invite code', 'あなたの招待コード'],
    '输入邀请码': ['Enter your invite code', '招待コードを入力'],
    '仅填写邀请码，请勿填写密码或登录验证码。': ['Invite codes only. Never enter a password or login verification code.', '招待コードのみ入力してください。パスワードやログイン認証コードは入力しないでください。'],
    '我确认这是自己可公开分享的邀请码，并同意在本站展示 24 小时。': ['I confirm this is my code to share publicly and agree to list it for 24 hours.', '自分が公開共有できる招待コードであることを確認し、24時間の掲載に同意します。'],
    '分享邀请码': ['Share invite code', '招待コードを共有'],
    '公开免费分享 · 请勿售卖邀请码': ['Free, public sharing · Do not sell invite codes', '無料で公開共有 · 招待コードの販売はご遠慮ください'],
    '在此浏览器提交后，可主动下架自己的号码。': ['Use this browser to remove your own code after submitting.', '投稿したブラウザーから、自分のコードを掲載終了にできます。'],
    '从这里开始认识 Muse': ['Your first steps with Muse', 'ここから始める Muse'],
    '三步，开启探索': ['Three steps to start exploring', '3つのステップで始めよう'],
    '前往 Muse 注册': ['Sign up for Muse', 'Muse に登録する'],
    '访问 Muse 官方网站，按照页面提示完成注册和必要验证。': ['Visit the official Muse website and follow the signup and verification steps.', 'Muse の公式サイトで、案内に沿って登録と必要な認証を行います。'],
    '打开 Muse 官网 ↗': ['Visit Muse ↗', 'Muse 公式サイトへ ↗'],
    '复制社区邀请码': ['Copy a community code', '共有コードをコピー'],
    '选择上方的邀请码，点击复制。如果号码已用完，可以尝试下一个。': ['Click a code above to copy it. If it has no uses left, try the next one.', '上のコードをクリックしてコピー。利用上限に達していたら、次のコードをお試しください。'],
    '去找一个邀请码 ↑': ['Find an invite code ↑', '招待コードを探す ↑'],
    '在设置中兑换': ['Redeem in Settings', '設定でコードを利用'],
    '按官方邀请说明，新用户需在加入后 48 小时内兑换。具体资格和奖励以 Muse 当前规则为准。': ['The official invitation screen says new users must redeem within 48 hours of joining. Eligibility and rewards depend on current Muse rules.', '公式の招待画面では、参加から48時間以内の利用が必要とされています。対象条件や特典は Muse の最新ルールをご確認ください。'],
    '本站不保证号码可用或奖励到账': ['Code availability and rewards are not guaranteed', 'コードの利用可否や特典の付与は保証しません'],
    'Muse 注册与使用教程': ['Muse signup & getting started', 'Muse 登録・使い方ガイド'],
    '视频正在准备中。发布后，这里会放上完整操作演示。': ['A video walkthrough is on the way. Find the full guide here once it is published.', '解説動画を準備中です。公開後、ここから詳しい手順をご覧いただけます。'],
    '观看完整教程 ↗': ['Watch the full tutorial ↗', '解説動画を見る ↗'],
    '即将上线': ['Coming soon', '近日公開'],
    '观看教程': ['Watch tutorial', '動画を見る'],
    'AI，也能找到你的风格。': ['Find your style with AI.', 'AI で、自分らしいスタイルへ。'],
    '发型、眼镜、穿搭与配色。': ['Hair, eyewear, outfits and colors.', '髪型、メガネ、服装、配色。'],
    '看看我做的 AI 个人风格指南。': ['Explore my AI-powered personal style guide.', '私が作った AI スタイルガイドをチェック。'],
    '探索 AI Style Guide ↗': ['Explore AI Style Guide ↗', 'AI Style Guide を見る ↗'],
    '一些小问题': ['A few helpful answers', 'よくある質問'],
    '这里的 24 小时，和官方的 48 小时有什么区别？': ['How do the 24-hour listing and official 48-hour window differ?', '掲載期間の24時間と、公式の48時間はどう違いますか？'],
    '24 小时是本站的展示时间，从每个邀请码提交时单独计算。官方邀请页面中的 48 小时，是指新用户加入 Muse 后兑换邀请码的期限。两者互不替代，请复制后尽快兑换。': ['Each code is listed here for 24 hours from submission. The official 48-hour window starts when a new user joins Muse and is the deadline for redeeming a code. These are separate timers. Please redeem soon after copying.', '本サイトの24時間は、各コードの投稿時から数える掲載期間です。公式の48時間は、新規ユーザーが Muse に参加してから招待コードを利用できる期限です。別々の期限なので、コピー後は早めにご利用ください。'],
    '复制一次，邀请码就会失效吗？': ['Does copying a code use it up?', 'コピーすると招待枠が減りますか？'],
    '不会。复制只是把号码放入剪贴板，不代表已经兑换，也不会消耗官方邀请次数。本站无法查询 Muse 的实时剩余次数，号码能否使用以官方兑换结果为准。': ['No. Copying only saves the code to your clipboard; it is not a redemption and uses no invitation slots. This site cannot check remaining Muse uses. Availability is determined when you redeem on Muse.', 'いいえ。コピーはクリップボードにコードを保存するだけで、招待枠を消費しません。本サイトでは Muse の残り利用回数を確認できません。利用可否は公式サイトでの結果をご確認ください。'],
    '我的邀请码用完了，怎么下架？': ['How can I remove my code when it is used up?', '招待枠を使い切ったら、どう掲載終了にしますか？'],
    '用提交时的同一个浏览器打开本站，自己的号码下方会显示「已用完 / 下架」按钮，可提前移除。清除浏览器存储后将失去该操作凭证，号码仍会在提交满 24 小时后自动下架。': ['Return using the same browser you used to submit. Your code has a “Used up / Remove” button. Clearing browser storage removes this permission, but the code will still be automatically delisted 24 hours after submission.', '投稿時と同じブラウザーで開くと、自分のコードの下に「使用済み / 掲載終了」ボタンが表示されます。ブラウザーの保存データを消すと操作できなくなりますが、投稿から24時間後に自動で掲載終了します。'],
    '/ 社区分享站': ['/ Community Invite Hub', '/ 招待コード共有'],
    '独立社区项目，与 Meta 或 Muse 无隶属、授权或合作关系。': ['An independent community project. Not affiliated with, endorsed by, or partnered with Meta or Muse.', '独立したコミュニティプロジェクトです。Meta または Muse との提携・公認・協力関係はありません。'],
    '邀请码由用户自愿提供；可用性、兑换资格及奖励均以官方规则为准。': ['Codes are voluntarily shared by users. Availability, eligibility and rewards are subject to official rules.', 'コードはユーザーが任意で提供しています。利用可否、対象条件、特典は公式ルールに従います。'],
    '手动复制邀请码': ['Copy your code manually', '招待コードを手動でコピー'],
    '浏览器未允许自动复制，请长按或选中下方号码复制。': ['Your browser blocked automatic copying. Select or long-press the code below to copy it.', 'ブラウザーが自動コピーを許可していません。下のコードを選択、または長押ししてコピーしてください。'],
    '完成': ['Done', '完了'],
    'Muse 分享站首页': ['Muse Invite Hub home', 'Muse 招待コード共有 ホーム'],
    '主导航': ['Main navigation', 'メインナビゲーション'],
    '分享规则': ['Sharing rules', '共有ルール'],
    '可复制的邀请码': ['Available invite codes', 'コピーできる招待コード'],
    '待复制的邀请码': ['Invite code to copy', 'コピーする招待コード'],
    '免费的 Muse 社区邀请码分享站。按提交顺序展示，点击复制，每个邀请码展示 24 小时。': ['Free community Muse invite codes, listed in submission order. Click to copy; each code is listed for 24 hours.', 'Muse の招待コードを無料で共有。投稿順に表示し、クリックでコピー。各コードを24時間掲載します。'],
    '第一份分享，从你开始': ['Be the first to share', '最初の共有を、あなたから'],
    '目前还没有展示中的邀请码。欢迎留下你的邀请机会。': ['No codes are listed right now. Share an invitation to help someone get started.', '現在掲載中のコードはありません。招待コードを共有してみませんか。'],
    '分享第一个邀请码 ↗': ['Share the first code ↗', '最初のコードを共有 ↗'],
    '{hours} 小时 {minutes} 分后下架': ['Delisted in {hours}h {minutes}m', 'あと{hours}時間{minutes}分で掲載終了'],
    '{minutes} 分钟后下架': ['Delisted in {minutes}m', 'あと{minutes}分で掲載終了'],
    '已复制邀请码，请尽快前往 Muse 兑换': ['Code copied. Redeem it on Muse soon.', 'コピーしました。お早めに Muse でご利用ください。'],
    '复制邀请码 {code}': ['Copy invite code {code}', '招待コード {code} をコピー'],
    '复制 ⧉': ['Copy ⧉', 'コピー ⧉'],
    '提交于 {date}': ['Shared {date}', '投稿 {date}'],
    '社区分享': ['Community', 'みんなの共有'],
    '已用完 / 下架': ['Used up / Remove', '使用済み / 掲載終了'],
    '确定下架这个邀请码？下架后将不再展示。': ['Remove this invite code? It will no longer be listed.', 'この招待コードの掲載を終了しますか？一覧に表示されなくなります。'],
    '邀请码已下架': ['Invite code removed', 'コードの掲載を終了しました'],
    '暂时无法更新邀请码：{error}': ['Unable to update codes: {error}', 'コードを更新できません：{error}'],
    '正在分享…': ['Sharing…', '共有中…'],
    '分享成功！号码将展示 24 小时，感谢你的分享。': ['Shared! Your code will be listed for 24 hours. Thank you.', '共有しました！コードは24時間掲載されます。ありがとうございます。'],
    '分享成功！浏览器无法保存下架凭证，请保留当前页面；号码将在 24 小时后自动下架。': ['Shared! Your browser could not save the removal permission. Keep this page open; the code will be delisted after 24 hours.', '共有しましたが、掲載終了用の情報を保存できませんでした。このページを開いたままにしてください。コードは24時間後に自動で掲載終了します。'],
    '谢谢你，把机会传给了下一个人': ['Thanks for passing an invitation forward.', '次の誰かへのチャンスを、ありがとうございます。'],
    '分享服务尚未连接，请稍后重试。': ['The sharing service is unavailable. Please try again later.', '共有サービスに接続できません。しばらくしてからお試しください。'],
    '操作失败，请稍后重试': ['Something went wrong. Please try again later.', '操作に失敗しました。しばらくしてからお試しください。'],
    '服务暂时不可用，请稍后重试': ['Service temporarily unavailable. Please try again later.', '一時的に利用できません。しばらくしてからお試しください。'],
    '请求来源无效': ['Invalid request origin. Please reload this site.', 'リクエスト元が無効です。ページを再読み込みしてください。'],
    '请使用 JSON 提交': ['Invalid request format. Please reload and try again.', '送信形式が無効です。再読み込みしてお試しください。'],
    '提交内容过长': ['The submitted code is too long.', '送信内容が長すぎます。'],
    '提交格式无效': ['Invalid submission format.', '送信形式が無効です。'],
    '请输入 4–64 位字母、数字、短横线或下划线': ['Enter 4–64 letters, numbers, hyphens or underscores.', '4～64文字の英数字・ハイフン・アンダースコアで入力してください。'],
    '这个注册码已经在列表里了': ['This invite code is already listed.', 'この招待コードはすでに掲載されています。'],
    '提交太快啦，请一分钟后再试': ['Please wait a minute before sharing another code.', '次の投稿まで1分ほどお待ちください。'],
    '仅提交者可下架自己的邀请码': ['Only the person who shared this code can remove it.', '投稿者のみが自分のコードを掲載終了にできます。'],
    '邀请码已下架或你没有操作权限': ['This code has been removed, or you do not have permission.', '掲載終了済み、または操作権限がありません。'],
    '接口不存在': ['This service endpoint does not exist.', 'このサービスは見つかりません。'],
    '请填写邀请码': ['Please enter an invite code.', '招待コードを入力してください。'],
    '请先勾选公开分享确认': ['Please confirm that you can share this code publicly.', '公開共有の確認にチェックを入れてください。'],
    '跟着视频，一步步完成注册与邀请码兑换。': ['Follow the video to sign up and redeem an invite code.', '動画を見ながら、登録と招待コードの利用を進めましょう。'],
    '从注册、填写邀请码，到开始使用 Muse，跟着视频一步步操作。': ['Follow the video from signup and invite redemption to your first steps with Muse.', '登録から招待コードの入力、Muse の使い始めまで、動画でわかりやすく解説します。']
  };
  const originals = new Map(Object.entries(messages).flatMap(([key, variants]) => variants.map(value => [value, key])));
  const locales = { en: 'en', zh: 'zh-CN', ja: 'ja' };
  let lang;
  try { lang = localStorage.getItem('muse-language'); } catch {}
  if (!locales[lang]) lang = navigator.language.startsWith('ja') ? 'ja' : navigator.language.startsWith('zh') ? 'zh' : 'en';
  function t(key, values = {}) {
    key = originals.get(key) || key;
    let value = lang === 'zh' ? key : messages[key]?.[lang === 'en' ? 0 : 1] ?? key;
    return value.replace(/\{(\w+)\}/g, (match, name) => values[name] === undefined ? match : typeof values[name] === 'string' ? t(values[name]) : values[name]);
  }
  const records = [];
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script,style')) continue;
    const key = node.textContent.trim();
    if (messages[key]) records.push({ node, key, prefix: node.textContent.match(/^\s*/)[0], suffix: node.textContent.match(/\s*$/)[0] });
  }
  const attributes = [];
  document.querySelectorAll('[aria-label],[placeholder],meta[name="description"]').forEach(node => {
    for (const attr of ['aria-label', 'placeholder', 'content']) {
      const key = node.getAttribute(attr);
      if (messages[key]) attributes.push({node, attr, key});
    }
  });
  const live = new Map();
  function setText(node, key, values = {}) { live.set(node, {key, values}); node.textContent = t(key, values); }
  function apply() {
    document.documentElement.lang = locales[lang];
    records.forEach(({node, key, prefix, suffix}) => { if (node.isConnected) node.textContent = prefix + t(key) + suffix; });
    attributes.forEach(({node, attr, key}) => node.setAttribute(attr, t(key)));
    live.forEach(({key, values}, node) => { if (node.isConnected) node.textContent = t(key, values); });
    document.querySelectorAll('[data-lang]').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.lang === lang)); });
    document.dispatchEvent(new CustomEvent('languagechange'));
  }
  window.I18N = { t, setText, apply, get language() { return lang; }, get locale() { return locales[lang]; } };
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => {
    lang = button.dataset.lang;
    try { localStorage.setItem('muse-language', lang); } catch {}
    apply();
  }));
  apply();
})();
