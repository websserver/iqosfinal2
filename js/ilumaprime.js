// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const loading = document.querySelector('.loading');
  const modelo = document.querySelector("#modelo3d-1");
  const target = document.querySelector('a-entity[mindar-image-target]');
  const sceneEl = document.querySelector('a-scene');
  let modeloInicializado = false;
  let ultimaPosicao = null;

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

  // Função para salvar a posição atual do modelo
  function salvarPosicao() {
    if (modelo && modelo.object3D) {
      ultimaPosicao = {
        position: modelo.object3D.position.clone(),
        rotation: modelo.object3D.rotation.clone(),
        scale: modelo.object3D.scale.clone()
      };
      addLog('Posição do modelo salva');
    }
  }

  // Função para restaurar a última posição do modelo
  function restaurarPosicao() {
    if (modelo && ultimaPosicao) {
      modelo.object3D.position.copy(ultimaPosicao.position);
      modelo.object3D.rotation.copy(ultimaPosicao.rotation);
      modelo.object3D.scale.copy(ultimaPosicao.scale);
      addLog('Posição do modelo restaurada');
    }
  }

  // Função para inicializar o modelo
  function initializeModel() {
    if (!modeloInicializado && modelo) {
      addLog('Inicializando modelo');
      try {
        modelo.setAttribute('visible', 'true');
        modelo.setAttribute('scale', '8 8 8');
        modelo.setAttribute('position', '0 0 0.1');
        modelo.setAttribute('rotation', '0 0 0');
        
        // Desabilitar o raycaster para evitar problemas de interação
        modelo.setAttribute('raycaster', 'enabled: false');
        
        modeloInicializado = true;
        salvarPosicao();
        addLog('Modelo inicializado com sucesso');
      } catch (error) {
        addLog(`Erro ao inicializar modelo: ${error.message}`);
      }
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
      if (modeloInicializado) {
        modelo.setAttribute('visible', 'true');
        salvarPosicao();
      }
    });

    target.addEventListener("targetLost", () => {
      addLog('❌ Marcador perdido - mantendo modelo visível');
      if (modeloInicializado) {
        modelo.setAttribute('visible', 'true');
        restaurarPosicao();
      }
    });
  }

  // Monitorar o modelo
  if (modelo) {
    modelo.addEventListener('model-loaded', () => {
      addLog('📦 Modelo 3D carregado');
      initializeModel();
    });

    // Garantir que o modelo permaneça visível
    setInterval(() => {
      if (modeloInicializado && !modelo.getAttribute('visible')) {
        addLog('Forçando visibilidade do modelo');
        modelo.setAttribute('visible', 'true');
        restaurarPosicao();
      }
    }, 1000);
  }

  // Esconder loading após 5 segundos (fallback)
  setTimeout(hideLoading, 5000);
});
