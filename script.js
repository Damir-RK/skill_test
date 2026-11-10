(() => {
  const mascot = document.querySelector('#mascot');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let x = window.innerWidth / 2;
  let y = window.innerHeight * 0.76;
  let vx = 0;
  let vy = 0;
  let targetX = x;
  let targetY = y;
  let lastPointerAt = -Infinity;
  let nextWanderAt = 0;
  let facing = 1;
  let previousFrameAt = 0;

  const idleDelay = 1900;
  const maxSpeed = 390;
  const acceleration = 560;
  const braking = 590;
  const margin = 72;
  const tips = [
    { text: 'Введите `/`, чтобы открыть меню команд; продолжайте печатать, чтобы отфильтровать список.', source: 'https://code.claude.com/docs/en/commands.md' },
    { text: 'Slash-команда распознаётся в начале сообщения; следующий текст передаётся ей как аргумент.', source: 'https://code.claude.com/docs/en/commands.md' },
    { text: '`/clear` начинает новый сеанс; прежний разговор можно позднее возобновить.', source: 'https://code.claude.com/docs/en/sessions.md' },
    { text: '`/compact focus on tests` сжимает историю с учётом указанной темы.', source: 'https://code.claude.com/docs/en/sessions.md' },
    { text: '`/context` показывает, какие данные занимают контекстное окно.', source: 'https://code.claude.com/docs/en/context-window.md' },
    { text: '`/memory` открывает файлы памяти и позволяет редактировать их.', source: 'https://code.claude.com/docs/en/context-window.md' },
    { text: '`/resume` открывает выбор предыдущего разговора внутри сеанса.', source: 'https://code.claude.com/docs/en/sessions.md' },
    { text: '`claude --resume` без аргументов открывает выбор сеанса в терминале.', source: 'https://code.claude.com/docs/en/sessions.md' },
    { text: '`claude --continue` открывает последний сеанс в текущей папке проекта.', source: 'https://code.claude.com/docs/en/sessions.md' },
    { text: '`claude --resume <имя>` возобновляет сеанс по имени.', source: 'https://code.claude.com/docs/en/sessions.md' },
    { text: '`/rename auth-fix` задаёт сеансу имя для поиска и продолжения.', source: 'https://code.claude.com/docs/en/sessions.md' },
    { text: '`/branch test-idea` создаёт отдельную ветку разговора, сохраняя исходный сеанс.', source: 'https://code.claude.com/docs/en/sessions.md' },
    { text: '`/export report.txt` сохраняет разговор в текстовый файл.', source: 'https://code.claude.com/docs/en/sessions.md' },
    { text: 'Ctrl+C прерывает текущую операцию; если она не выполняется, очищает ввод.', source: 'https://code.claude.com/docs/en/interactive-mode.md' },
    { text: 'Нажмите `?` в полноэкранном просмотре транскрипта, чтобы увидеть доступные клавиши.', source: 'https://code.claude.com/docs/en/interactive-mode.md' },
    { text: '`claude` запускает интерактивный сеанс в текущей папке.', source: 'https://code.claude.com/docs/en/cli-reference.md' },
    { text: '`claude "объясни проект"` запускает сеанс с начальным запросом.', source: 'https://code.claude.com/docs/en/cli-reference.md' },
    { text: '`claude -p "объясни функцию"` отвечает без интерактивного сеанса и завершает работу.', source: 'https://code.claude.com/docs/en/cli-reference.md' },
    { text: 'В PowerShell передайте файл через stdin: `Get-Content .\\log.txt | claude -p "объясни журнал"`.', source: 'https://code.claude.com/docs/en/cli-reference.md' },
    { text: '`claude update` обновляет Claude Code до последней версии.', source: 'https://code.claude.com/docs/en/cli-reference.md' },
    { text: '`claude install stable` устанавливает или переустанавливает стабильную версию.', source: 'https://code.claude.com/docs/en/cli-reference.md' },
    { text: '`claude -p --output-format json "запрос"` возвращает JSON для скрипта.', source: 'https://code.claude.com/docs/en/cli-reference.md' },
    { text: '`/plan` переключает сеанс в режим планирования перед изменениями.', source: 'https://code.claude.com/docs/en/permission-modes.md' },
    { text: '`claude --permission-mode plan` запускает Claude в режиме планирования.', source: 'https://code.claude.com/docs/en/permission-modes.md' },
    { text: 'В режиме планирования Claude исследует задачу, но ждёт одобрения плана перед правками.', source: 'https://code.claude.com/docs/en/permission-modes.md' },
    { text: 'Нажимайте Shift+Tab, чтобы переключать режимы разрешений в интерактивном сеансе.', source: 'https://code.claude.com/docs/en/permission-modes.md' },
    { text: 'Режим `acceptEdits` автоматически одобряет правки файлов, но не все команды.', source: 'https://code.claude.com/docs/en/permission-modes.md' },
    { text: 'Вызовите skill сообщением `/имя-навыка аргументы`, например `/deploy staging`.', source: 'https://code.claude.com/docs/en/skills.md' },
    { text: 'С `disable-model-invocation: true` Claude не запускает skill автоматически.', source: 'https://code.claude.com/docs/en/skills.md' },
    { text: 'При нехватке контекста Claude Code сжимает историю автоматически; вручную запустите `/compact`.', source: 'https://code.claude.com/docs/en/context-window.md' }
  ];

  const counter = document.querySelector('#counter');
  const tip = document.querySelector('#tip');
  const tipText = document.querySelector('#tip-text');
  const tipNumber = document.querySelector('#tip-number');
  const hintCountKey = 'one-click-one-wisdom-count';
  let openedCount = 0;
  let previousTipIndex = -1;
  try {
    const savedCount = Number(sessionStorage.getItem(hintCountKey));
    if (Number.isSafeInteger(savedCount) && savedCount >= 0) openedCount = savedCount;
  } catch {
    // Keep the counter usable if browser storage is unavailable.
  }

  function updateCounter() {
    counter.textContent = `${openedCount} ${openedCount === 1 ? 'tip' : 'tips'} opened`;
  }

  updateCounter();

  document.addEventListener('click', (event) => {
    const candidates = tips.map((_, index) => index).filter((index) => index !== previousTipIndex);
    const tipIndex = candidates[Math.floor(Math.random() * candidates.length)];
    previousTipIndex = tipIndex;
    openedCount += 1;
    try {
      sessionStorage.setItem(hintCountKey, String(openedCount));
    } catch {
      // Keep the counter usable if browser storage is unavailable.
    }
    updateCounter();
    tipText.textContent = tips[tipIndex].text;
    tipNumber.textContent = `${String(tipIndex + 1).padStart(2, '0')} / ${tips.length}`;
    tip.hidden = false;

    requestAnimationFrame(() => {
      const gutter = 12;
      const box = tip.getBoundingClientRect();
      let left = event.clientX + 16;
      let top = event.clientY + 16;
      if (left + box.width > window.innerWidth - gutter) left = event.clientX - box.width - 16;
      if (top + box.height > window.innerHeight - gutter) top = event.clientY - box.height - 16;
      tip.style.left = `${Math.max(gutter, Math.min(left, window.innerWidth - box.width - gutter))}px`;
      tip.style.top = `${Math.max(gutter, Math.min(top, window.innerHeight - box.height - gutter))}px`;
    });
  });

  function limits() {
    const safeX = Math.min(margin, window.innerWidth / 3);
    const safeY = Math.min(margin, window.innerHeight / 3);
    return {
      minX: safeX,
      maxX: window.innerWidth - safeX,
      minY: safeY,
      maxY: window.innerHeight - safeY
    };
  }

  function clampTarget(px, py) {
    const bounds = limits();
    targetX = Math.min(bounds.maxX, Math.max(bounds.minX, px));
    targetY = Math.min(bounds.maxY, Math.max(bounds.minY, py));
  }

  function chooseWanderTarget(now) {
    if (reducedMotion.matches) {
      nextWanderAt = now + 1800;
      return;
    }
    const bounds = limits();
    const spanX = Math.max(0, bounds.maxX - bounds.minX);
    const spanY = Math.max(0, bounds.maxY - bounds.minY);
    clampTarget(
      bounds.minX + spanX * (0.12 + Math.random() * 0.76),
      bounds.minY + spanY * (0.18 + Math.random() * 0.64)
    );
    nextWanderAt = now + 2600 + Math.random() * 2400;
  }

  function onPointerMove(event) {
    lastPointerAt = performance.now();
    // Stay a little behind the pointer so the character never sits directly under it.
    clampTarget(event.clientX - 68, event.clientY + 54);
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', () => {
    const bounds = limits();
    x = Math.min(bounds.maxX, Math.max(bounds.minX, x));
    y = Math.min(bounds.maxY, Math.max(bounds.minY, y));
    clampTarget(targetX, targetY);
  }, { passive: true });

  function animate(now) {
    const dt = previousFrameAt ? Math.min((now - previousFrameAt) / 1000, 0.032) : 0;
    previousFrameAt = now;

    const followingPointer = now - lastPointerAt < idleDelay;
    if (!followingPointer && (now >= nextWanderAt || Math.hypot(targetX - x, targetY - y) < 12)) {
      chooseWanderTarget(now);
    }

    if (dt > 0) {
      const dx = targetX - x;
      const dy = targetY - y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0.5) {
        // Slow down before arrival instead of snapping or overshooting the target.
        const desiredSpeed = Math.min(maxSpeed, Math.sqrt(2 * braking * distance));
        const desiredVx = (dx / distance) * desiredSpeed;
        const desiredVy = (dy / distance) * desiredSpeed;
        const changeX = desiredVx - vx;
        const changeY = desiredVy - vy;
        const change = Math.hypot(changeX, changeY);
        const maxChange = acceleration * dt;
        const scale = change > maxChange ? maxChange / change : 1;
        vx += changeX * scale;
        vy += changeY * scale;
        x += vx * dt;
        y += vy * dt;
      } else {
        // Ease residual drift away, keeping arrivals soft even after a target switch.
        const drag = Math.exp(-5.5 * dt);
        vx *= drag;
        vy *= drag;
        x += vx * dt;
        y += vy * dt;
      }
    }

    const bounds = limits();
    if (x < bounds.minX || x > bounds.maxX) {
      x = Math.min(bounds.maxX, Math.max(bounds.minX, x));
      vx *= -0.28;
    }
    if (y < bounds.minY || y > bounds.maxY) {
      y = Math.min(bounds.maxY, Math.max(bounds.minY, y));
      vy *= -0.28;
    }

    if (Math.abs(vx) > 3) facing = vx < 0 ? -1 : 1;
    const tilt = Math.max(-8, Math.min(8, vy * 0.018));
    mascot.style.left = `${x}px`;
    mascot.style.top = `${y}px`;
    mascot.style.transform = `translate(-50%, -50%) scaleX(${facing}) rotate(${tilt}deg)`;

    requestAnimationFrame(animate);
  }

  chooseWanderTarget(performance.now());
  requestAnimationFrame(animate);
})();
