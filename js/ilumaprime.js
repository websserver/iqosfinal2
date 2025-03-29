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

  // Função para inicializar o modelo
  function initializeModel() {
    if (!modeloInicializado && modelo) {
      console.log('Inicializando modelo');
      modelo.setAttribute('visible', 'true');
      modelo.setAttribute('scale', '8 8 8');
      
      // Desabilitar o raycaster para evitar problemas de interação
      modelo.setAttribute('raycaster', 'enabled: false');
      
      // Fixar a posição do modelo
      modelo.object3D.position.set(0, 0, 0.1);
      modelo.object3D.rotation.set(0, 0, 0);
      
      modeloInicializado = true;
      hideLoading();
    }
  }

  // Eventos de detecção do marcador
  if (target) {
    target.addEventListener("targetFound", () => {
      console.log('Marcador detectado!');
      initializeModel();
    });

    // Remover comportamento de targetLost
    target.addEventListener("targetLost", () => {
      console.log('Marcador perdido - mantendo modelo visível');
      if (modeloInicializado) {
        modelo.setAttribute('visible', 'true');
      }
    });
  }

  // Adicionar evento para quando o modelo for carregado
  if (modelo) {
    modelo.addEventListener('model-loaded', () => {
      console.log('Modelo carregado com sucesso');
      initializeModel();
    });
  }

  // Esconder loading após 5 segundos (fallback)
  setTimeout(hideLoading, 5000);
});
