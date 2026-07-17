// ── 카탈로그 로드 ──────────────────────────────────────
async function fetchCatalog() {
  const res  = await fetch(CONFIG.CATALOG_URL)
  const data = await res.json()
  return data.videos
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
function goPlayer(id) {
  window.location.href = `player.html?id=${id}`
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
