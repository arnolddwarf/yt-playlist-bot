function badge(status) {
  const color =
    status === 'ok' ? 'badge-ok' :
    status === 'warning' ? 'badge-warn' : 'badge-error';
  return `<span class="badge ${color}">${status}</span>`;
}

async function loadHealth() {
  const res = await fetch('/api/dashboard/health');
  const h = await res.json();
  const grid = document.getElementById('health-grid');
  grid.innerHTML = `
    <div class="health-row">
      <span>Último chequeo</span>
      <span>${formatDateTimeShort(h.lastCheckAt)}</span>
    </div>
    <div class="health-row">
      <span>Videos nuevos hoy</span>
      <span>${h.todayVideos}</span>
    </div>
    <div class="health-row">
      <span>Servicios</span>
      <span>
        YT ${badge(h.services.youtube)}
        DB ${badge(h.services.mongodb)}
        TG ${badge(h.services.telegram)}
      </span>
    </div>
    <div class="health-row">
      <span>Errores recientes</span>
      <span>${h.lastError ? 'Ver logs' : 'Sin errores'}</span>
    </div>
  `;
}
