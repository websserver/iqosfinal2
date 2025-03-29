// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const loading = document.querySelector('.loading');
  const modelo = document.querySelector("#modelo3d-1");
  const target = document.querySelector('a-entity[mindar-image-target]');
  let modeloInicializado = false;

  // Função para esconder loading
  function hideLoading() {
    if (loading) {
      loading.style.display = 'none';
    }
  }

  // Log inicial
  console.log('Iniciando aplicação AR');
  console.log('Modelo encontrado:', !!modelo);
  console.log('Target encontrado:', !!target);

  // Eventos de detecção do marcador
  if (target) {
    target.addEventListener("targetFound", () => {
      console.log('Marcador detectado!');
      if (modelo && !modeloInicializado) {
        console.log('Inicializando modelo pela primeira vez');
        modelo.setAttribute('visible', 'true');
        modelo.setAttribute('scale', '8 8 8');
        modeloInicializado = true;
        hideLoading();
      } else {
        console.log('Modelo já inicializado ou não encontrado');
      }
    });

    // Adicionar log para targetLost
    target.addEventListener("targetLost", () => {
      console.log('Marcador perdido!');
      console.log('Estado do modelo - Visível:', modelo.getAttribute('visible'));
      console.log('Estado do modelo - Inicializado:', modeloInicializado);
    });

    // Adicionar log para tracking
    target.addEventListener("tracking", (event) => {
      console.log('Tracking atual:', event.detail.tracking);
    });
  }

  // Esconder loading após 5 segundos (fallback)
  setTimeout(hideLoading, 5000);
});
