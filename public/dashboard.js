const PLAYLIST_LABELS = {
        'PLTKJJiHaMZjeEDrhGz2ae07ArkWm8GbN4': 'Hard Rock / AOR (80s & 90s)',
        'PLTKJJiHaMZjfOGUN4u96fTmhkPPDM5dQ6': 'Heavy Metal (80s & 90s)',
        'PLTKJJiHaMZjexSsYWCb4y4eYJPaNgHCIC': 'Thrash Metal (80s & 90s)'
    };

function formatDateShort(iso) {
  if (!iso) return 'Fecha desconocida';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
}


async function loadDashboard() {
    const grid = document.getElementById('grid');
    const statusBar = document.getElementById('status-bar').querySelector('.value');
    const statPlaylists = document.querySelector('#stat-playlists .stat-value');
    const statVideos = document.querySelector('#stat-videos .stat-value');
    const statReactions = document.querySelector('#stat-reactions .stat-value');

    statusBar.textContent = 'Cargando datos…';
    grid.innerHTML = '';

    try {
        const res = await fetch('/api/dashboard/latest');
        const json = await res.json();

        if (!json.ok) {
            statusBar.textContent = 'Error cargando datos del dashboard.';
            grid.innerHTML = '<div class="empty">No se pudo cargar la información.</div>';
            return;
        }

        const data = json.data || {};
        const entries = Object.entries(data);

        let totalVideos = 0;
        let totalReactions = 0;

        for (const [playlistId, item] of entries) {
            const card = document.createElement('div');
            card.className = 'card';

            const playlistName = PLAYLIST_LABELS[playlistId] || `Playlist ${playlistId.slice(0, 8)}…`;

            if (!item) {
                card.innerHTML = `
              <div class="card-inner">
                <div class="playlist-pill">
                  <span class="dot"></span>
                  <span>${label}</span>
                </div>
                <div class="empty">Sin videos registrados aún para esta playlist.</div>
              </div>
            `;
                grid.appendChild(card);
                continue;
            }

            totalVideos += 1;
            const reactions = item.reactions || {};
            const like = reactions.like || 0;
            const love = reactions.love || 0;
            const angry = reactions.angry || 0;
            totalReactions += like + love + angry;

            const published = formatDateShort(item.publishedAt) || 'Desconocido';

            const thumbHtml = item.thumbnailUrl
  ? `<div class="thumb" data-thumb="${item.thumbnailUrl}">
       <img src="${item.thumbnailUrl}" alt="Miniatura" loading="lazy" />
     </div>`
  : '';

card.innerHTML = `
  <div class="card-inner">
    ${thumbHtml}
    <div class="card-main">
      <div class="playlist-pill">
        <span class="dot"></span>
        <span>${playlistName}</span>
      </div>
      <div class="title">${item.title}</div>
      <div class="meta">
        <span>${item.channelTitle || 'Canal desconocido'}</span>
        <span class="dot-separator">${published}</span>
      </div>
      <div class="reactions">
        <span>👍 ${like}</span>
        <span>❤️ ${love}</span>
        <span>😡 ${angry}</span>
      </div>
      <div class="links">
        <a href="${item.url}" target="_blank" rel="noopener noreferrer">
          Ver video
        </a>
      </div>
    </div>
  </div>
`;





            grid.appendChild(card);
        }

        statPlaylists.textContent = entries.length.toString();
        statVideos.textContent = totalVideos.toString();
        statReactions.textContent = totalReactions.toString();
        statusBar.textContent = 'Actualizado hace unos segundos.';
    } catch (err) {
        console.error(err);
        statusBar.textContent = 'Error de red al cargar el dashboard.';
        grid.innerHTML = '<div class="empty">Revisa la consola de Vercel o del navegador para más detalles.</div>';
    }
}

document.getElementById('refresh-btn').addEventListener('click', loadDashboard);


function setupLightbox() {
  const backdrop = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');

  document.body.addEventListener('click', (e) => {
    const thumb = e.target.closest('.thumb');
    if (thumb && thumb.dataset.thumb) {
      img.src = thumb.dataset.thumb;
      backdrop.classList.add('open');
    } else if (e.target === backdrop) {
      backdrop.classList.remove('open');
      img.src = '';
    }
  });
}

document.getElementById('refresh-btn').addEventListener('click', loadDashboard);
setupLightbox();
loadDashboard();

