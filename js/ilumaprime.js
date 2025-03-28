// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const loading = document.querySelector('.loading');
  const modelo = document.querySelector("#modelo3d-1");
  const target = document.querySelector('a-entity[mindar-image-target]');
  const modeloContainer = document.querySelector('#modelo-container');

  // Função para esconder loading
  function hideLoading() {
    if (loading) {
      loading.style.display = 'none';
    }
  }

  // Configuração para estabilização avançada
  const setupStabilization = () => {
    // Configurações do modelo quando o marcador é encontrado
    if (modeloContainer) {
      // Garantir que os componentes estejam aplicados corretamente
      if (!modeloContainer.hasAttribute('stabilizer')) {
        modeloContainer.setAttribute('stabilizer', 'smoothingFactor: 0.4; positionThreshold: 0.005; rotationThreshold: 0.01');
      }
      
      if (!modeloContainer.hasAttribute('smooth-position')) {
        modeloContainer.setAttribute('smooth-position', 'smoothFactor: 0.25');
      }
      
      if (!modeloContainer.hasAttribute('smooth-rotation')) {
        modeloContainer.setAttribute('smooth-rotation', 'smoothFactor: 0.25');
      }
    }
  };

  // Inicializar estabilização
  setupStabilization();

  // Eventos de detecção do marcador
  if (target) {
    target.addEventListener("targetFound", () => {
      if (modelo) {
        modelo.setAttribute('visible', 'true');
        modelo.setAttribute('scale', '8 8 8');
        hideLoading();
        
        // Aplicar configurações de estabilização adicionais quando o marcador é encontrado
        setupStabilization();
        
        // Atualizar matrizes para garantir posicionamento correto
        if (modeloContainer) {
          modeloContainer.object3D.updateMatrix();
          modeloContainer.object3D.updateMatrixWorld(true);
        }
        
        modelo.object3D.updateMatrix();
        modelo.object3D.updateMatrixWorld(true);
      }
    });

    target.addEventListener("targetLost", () => {
      if (modelo) {
        modelo.setAttribute('visible', 'false');
      }
    });
  }

  // Esconder loading após 5 segundos (fallback)
  setTimeout(hideLoading, 5000);
  
  // Monitor de desempenho para ajustar dinamicamente a estabilização
  let lastTime = 0;
  let frameRates = [];
  
  function updatePerformanceMonitor(time) {
    if (lastTime === 0) {
      lastTime = time;
      requestAnimationFrame(updatePerformanceMonitor);
      return;
    }
    
    // Calcular FPS
    const frameTime = time - lastTime;
    const fps = 1000 / frameTime;
    
    // Guardar FPS histórico
    frameRates.push(fps);
    if (frameRates.length > 60) { // Guardar histórico de 1 segundo
      frameRates.shift();
    }
    
    // Calcular FPS médio
    const avgFps = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    
    // Ajustar estabilização baseado no desempenho
    if (modeloContainer && avgFps < 30) {
      // Se o desempenho for baixo, reduzir a qualidade da estabilização
      if (modeloContainer.hasAttribute('stabilizer')) {
        modeloContainer.setAttribute('stabilizer', 'smoothingFactor: 0.3; positionThreshold: 0.01; rotationThreshold: 0.02');
      }
      
      if (modeloContainer.hasAttribute('smooth-position')) {
        modeloContainer.setAttribute('smooth-position', 'smoothFactor: 0.2');
      }
      
      if (modeloContainer.hasAttribute('smooth-rotation')) {
        modeloContainer.setAttribute('smooth-rotation', 'smoothFactor: 0.2');
      }
    }
    
    lastTime = time;
    requestAnimationFrame(updatePerformanceMonitor);
  }
  
  // Iniciar monitoramento de desempenho
  requestAnimationFrame(updatePerformanceMonitor);
});
