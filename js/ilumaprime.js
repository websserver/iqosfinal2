// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const loading = document.querySelector('.loading');
  const modelo = document.querySelector("#modelo3d-1");
  const target = document.querySelector('a-entity[mindar-image-target]');
  const sceneEl = document.querySelector('a-scene');
  let modeloInicializado = false;

  // Criar elemento para logs visuais
  const logContainer = document.createElement('div');
  logContainer.style.position = 'fixed';
  logContainer.style.top = '100px';
  logContainer.style.left = '10px';
  logContainer.style.right = '10px';
  logContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
  logContainer.style.color = 'white';
  logContainer.style.padding = '10px';
  logContainer.style.fontSize = '12px';
  logContainer.style.fontFamily = 'monospace';
  logContainer.style.zIndex = '9999';
  logContainer.style.maxHeight = '200px';
  logContainer.style.overflowY = 'auto';
  document.body.appendChild(logContainer);

  // Função para adicionar logs
  function addLog(message) {
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] ${message}`);
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${time}] ${message}`;
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    if (logContainer.children.length > 20) {
      logContainer.removeChild(logContainer.lastChild);
    }
  }

  // Função para esconder loading
  function hideLoading() {
    if (loading) {
      loading.style.display = 'none';
      addLog('Loading escondido');
    }
  }

  // Função para inicializar o modelo
  function initializeModel() {
    if (!modeloInicializado && modelo) {
      addLog('Tentando inicializar modelo');
      try {
        modelo.setAttribute('visible', 'true');
        modelo.setAttribute('scale', '8 8 8');
        modelo.setAttribute('position', '0 0 0.1');
        modelo.setAttribute('rotation', '0 0 0');
        
        // Verificar se o modelo está realmente visível
        setTimeout(() => {
          const isVisible = modelo.getAttribute('visible');
          const currentScale = modelo.getAttribute('scale');
          addLog(`Estado após inicialização - Visível: ${isVisible}, Escala: ${currentScale.x}`);
        }, 100);

        modeloInicializado = true;
        addLog('Modelo inicializado com sucesso');
      } catch (error) {
        addLog(`Erro ao inicializar modelo: ${error.message}`);
      }
    } else {
      addLog(`Não inicializou - já inicializado: ${modeloInicializado}, modelo existe: ${!!modelo}`);
    }
  }

  // Log inicial
  addLog('Aplicação AR iniciada');
  addLog(`Modelo encontrado: ${!!modelo}`);
  addLog(`Target encontrado: ${!!target}`);

  // Monitorar estado da cena
  if (sceneEl) {
    sceneEl.addEventListener('loaded', () => {
      addLog('Cena A-Frame carregada');
    });

    sceneEl.addEventListener('renderstart', () => {
      addLog('Renderização iniciada');
    });
  }

  // Eventos de detecção do marcador
  if (target) {
    target.addEventListener("targetFound", () => {
      addLog('🎯 Marcador detectado');
      initializeModel();
    });

    target.addEventListener("targetLost", () => {
      addLog('❌ Marcador perdido');
      if (modeloInicializado) {
        addLog('Mantendo modelo visível');
        modelo.setAttribute('visible', 'true');
      }
    });
  }

  // Monitorar o modelo
  if (modelo) {
    modelo.addEventListener('model-loaded', () => {
      addLog('📦 Modelo 3D carregado');
      initializeModel();
    });

    modelo.addEventListener('loaded', () => {
      addLog('Entidade do modelo carregada');
    });

    // Monitorar mudanças de visibilidade
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'visible') {
          const isVisible = modelo.getAttribute('visible');
          addLog(`🔍 Visibilidade alterada: ${isVisible}`);
        }
      });
    });

    observer.observe(modelo, { attributes: true });
  }

  // Esconder loading após 5 segundos (fallback)
  setTimeout(hideLoading, 5000);
});
