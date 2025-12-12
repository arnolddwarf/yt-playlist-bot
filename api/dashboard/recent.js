async function loadRecentActivity() {
  const res = await fetch('/api/dashboard/recent');
  const items = await res.json(); // array
  const ul = document.getElementById('recent-list');
  ul.innerHTML = items.map(item => `
    <li>
      <div class="recent-title">${item.title}</div>
      <div class="recent-meta">
        <span>${item.playlistName}</span>
        <span>·</span>
        <span>${formatDateShort(item.publishedAt || item.notifiedAt)}</span>
      </div>
    </li>
  `).join('');
}
