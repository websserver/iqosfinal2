// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const loading = document.querySelector('.loading');
  const modelo = document.querySelector("#modelo3d-1");
  const target = document.querySelector('a-entity[mindar-image-target]');
  let modeloInicializado = false;
  let posicaoInicial = null;

  // Função para esconder loading
  function hideLoading() {
    if (loading) {
      loading.style.display = 'none';
    }
  }

  // Função para salvar posição inicial
  function salvarPosicaoInicial() {
    if (modelo && modelo.object3D) {
      posicaoInicial = {
        position: { x: 0, y: 0, z: 0.1 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 8, y: 8, z: 8 }
      };
    }
  }

  // Função para restaurar posição inicial
  function restaurarPosicaoInicial() {
    if (modelo && posicaoInicial) {
      modelo.object3D.position.set(
        posicaoInicial.position.x,
        posicaoInicial.position.y,
        posicaoInicial.position.z
      );
      modelo.object3D.rotation.set(
        posicaoInicial.rotation.x,
        posicaoInicial.rotation.y,
        posicaoInicial.rotation.z
      );
      modelo.object3D.scale.set(
        posicaoInicial.scale.x,
        posicaoInicial.scale.y,
        posicaoInicial.scale.z
      );
    }
  }

  // Função para inicializar o modelo
  function initializeModel() {
    if (!modeloInicializado && modelo) {
      modelo.setAttribute('visible', 'true');
      modelo.setAttribute('scale', '8 8 8');
      modelo.setAttribute('position', '0 0 0.1');
      modelo.setAttribute('rotation', '0 0 0');
      
      // Desabilitar raycaster e physics
      modelo.setAttribute('raycaster', 'enabled: false');
      modelo.removeAttribute('dynamic-body');
      modelo.removeAttribute('static-body');
      
      salvarPosicaoInicial();
      modeloInicializado = true;
      hideLoading();
    }
  }

  // Eventos de detecção do marcador
  if (target) {
    target.addEventListener("targetFound", () => {
      initializeModel();
      if (modeloInicializado) {
        modelo.setAttribute('visible', 'true');
        restaurarPosicaoInicial();
      }
    });

    target.addEventListener("targetLost", () => {
      if (modeloInicializado) {
        // Manter o modelo visível e na última posição conhecida
        modelo.setAttribute('visible', 'true');
      }
    });
  }

  // Monitorar o modelo
  if (modelo) {
    modelo.addEventListener('model-loaded', () => {
      initializeModel();
    });
  }

  // Garantir que o modelo permaneça visível
  setInterval(() => {
    if (modeloInicializado) {
      modelo.setAttribute('visible', 'true');
    }
  }, 100);

  // Esconder loading após 5 segundos (fallback)
  setTimeout(hideLoading, 5000);
});
