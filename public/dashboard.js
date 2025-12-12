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

        const totalPlaylists = entries.length;
        const totalVideos = entries.filter(([, item]) => !!item).length;

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

        statPlaylists.textContent = totalPlaylists.toString();
        statVideos.textContent = totalVideos.toString();
        
        statusBar.textContent = 'Actualizado hace unos segundos.';
    } catch (err) {
        console.error(err);
        statusBar.textContent = 'Error de red al cargar el dashboard.';
        grid.innerHTML = '<div class="empty">Revisa la consola de Vercel o del navegador para más detalles.</div>';
    }
}

async function loadRecentActivity() {
  const res = await fetch('/api/dashboard/recent');
  const json = await res.json();
  const items = json.data || [];

  const ul = document.getElementById('recent-list');
  ul.innerHTML = items.map((item) => {
    const playlistLabel =
      PLAYLIST_LABELS[item.playlistId] || item.playlistName || item.playlistId;

    return `
      <li>
        <div class="recent-title">${item.title}</div>
        <div class="recent-meta">
          <span>${playlistLabel}</span>
          <span>·</span>
          <span>${formatDateShort(item.publishedAt || item.notifiedAt)}</span>
        </div>
      </li>
    `;
  }).join('');
}




function badge(status) {
  const color =
    status === 'ok' ? 'badge-ok' :
    status === 'warning' ? 'badge-warn' : 'badge-error';
  return `<span class="badge ${color}">${status}</span>`;
}

async function loadHealth() {
  const res = await fetch('/api/dashboard/health');
  const json = await res.json();

  const h = json.data || {};           // ← sacar el objeto data
  const services = h.services || {};   // ← evitar undefined

  const grid = document.getElementById('health-grid');
  grid.innerHTML = `
    <div class="health-row">
      <span>Último chequeo</span>
      <span>${formatDateShort(h.lastCheckAt)}</span>
    </div>
    <div class="health-row">
      <span>Servicios</span>
      <span>
        YT ${badge(services.youtube || 'ok')}
        DB ${badge(services.mongodb || 'ok')}
        TG ${badge(services.telegram || 'ok')}
      </span>
    </div>
    <div class="health-row">
      <span>Errores recientes</span>
      <span>${h.lastError ? 'Ver logs' : 'Sin errores'}</span>
    </div>
  `;
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
loadRecentActivity();
loadHealth();

