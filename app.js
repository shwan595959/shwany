// ── 카탈로그 캐싱 ──────────────────────────────────────
let _cachedVideos = null

async function fetchCatalog() {
  if (_cachedVideos) return _cachedVideos
  
  // ✅ 캐시 무력화 - 항상 최신 파일 가져오기
  const res  = await fetch(CONFIG.CATALOG_URL + '?t=' + Date.now())
  const data = await res.json()
  _cachedVideos = data.videos
  return _cachedVideos
}

// ── 카드 HTML 생성 ─────────────────────────────────────
function createCard(video) {
  return `
    <div class="video-card" onclick="goPlayer(${video.id})">
      <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
      <div class="card-hover">
        <div class="card-play">▶</div>
        <div class="card-title">${video.title}</div>
        <div class="card-meta">
          <span class="match">✔ ${video.match || 97}%</span>
          <span class="badge">${video.rating}</span>
          <span>${video.year}</span>
        </div>
        <div class="card-category">${video.category}</div>
      </div>
    </div>
  `
}

// ── 플레이어 페이지로 이동 ─────────────────────────────
async function goPlayer(id) {
  id = Number(id)
  const videos = await fetchCatalog()
  const video  = videos.find(v => v.id === id)

  if (!video) return

  // 비밀번호 없으면 바로 이동
  if (!video.password) {
    location.href = `player.html?id=${id}`
    return
  }

  // 이미 인증된 영상이면 바로 이동
  const unlocked = sessionStorage.getItem(`unlocked_${id}`)
  if (unlocked === 'true') {
    location.href = `player.html?id=${id}`
    return
  }

  // 비밀번호 모달 표시
  showPasswordModal(id, video)
}

// ── 네비게이션 스크롤 효과 ─────────────────────────────
function setupNavScroll() {
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar')
    if (!nav) return
    nav.classList.toggle('scrolled', window.scrollY > 50)
  })
}

// ── 로딩 표시 ──────────────────────────────────────────
function showLoading(show) {
  const el = document.getElementById('loading')
  if (!el) return
  el.classList.toggle('active', show)
}

// ── 비밀번호 모달 ──────────────────────────────────────
function showPasswordModal(id, video) {
  const existing = document.getElementById('pwModal')
  if (existing) existing.remove()

  const modal = document.createElement('div')
  modal.id = 'pwModal'
  modal.innerHTML = `
    <div class="pw-overlay" onclick="closePwModal()"></div>
    <div class="pw-modal">
      <div class="pw-thumb">
        <img src="${video.thumbnail}" alt="${video.title}">
        <div class="pw-thumb-gradient"></div>
      </div>
      <div class="pw-body">
        <div class="pw-lock">🔐</div>
        <h3 class="pw-title">${video.title}</h3>
        <p class="pw-desc">이 영상은 인가된 사람만 볼 수 있어요.</p>
        <div class="pw-input-wrap">
          <input
            type="password"
            id="pwInput"
            class="pw-input"
            placeholder="비밀번호를 입력하세요."
            onkeydown="if(event.key==='Enter') checkPassword(${id})"
            autofocus
          >
          <button class="pw-eye" onclick="togglePwEye()">👁️</button>
        </div>
        <p class="pw-error" id="pwError"></p>
        <div class="pw-buttons">
          <button class="pw-btn-cancel" onclick="closePwModal()">돌아가기</button>
          <button class="pw-btn-confirm" onclick="checkPassword(${id})">확인</button>
        </div>
      </div>
    </div>
  `
  document.body.appendChild(modal)
  requestAnimationFrame(() => modal.classList.add('active'))
}

function closePwModal() {
  const modal = document.getElementById('pwModal')
  if (!modal) return
  modal.classList.remove('active')
  setTimeout(() => modal.remove(), 300)
}

function togglePwEye() {
  const input = document.getElementById('pwInput')
  input.type  = input.type === 'password' ? 'text' : 'password'
}

async function checkPassword(id) {
  const input   = document.getElementById('pwInput')
  const errorEl = document.getElementById('pwError')
  const entered = input.value.trim()

  if (!entered) {
    shakeInput()
    errorEl.textContent = '하남자처럼 왜 입력 안하나요?'
    return
  }

  const videos = await fetchCatalog()
  const video  = videos.find(v => v.id === id)

  if (entered === video.password) {
    sessionStorage.setItem(`unlocked_${id}`, 'true')
    closePwModal()
    setTimeout(() => {
      location.href = `player.html?id=${id}`
    }, 300)
  } else {
    errorEl.textContent = '설마 비밀번호 아는 척 하는 건가요?'
    input.value = ''
    input.focus()
    shakeInput()
  }
}

function shakeInput() {
  const input = document.getElementById('pwInput')
  input.classList.remove('shake')
  requestAnimationFrame(() => input.classList.add('shake'))
}
