// Mapeamento de cores para modelos
const colorToModel = {
    'navy': 'modelo3d/modelo3_prime/navy-blazer.glb',
    'olive': 'modelo3d/modelo3_prime/olive-green.glb',
    'jacaranda': 'modelo3d/modelo3_prime/jacaranda.glb',
    'rooibos': 'modelo3d/modelo3_prime/rooibos-tea.glb',
    'turquoise': 'modelo3d/modelo3_prime/pastel-turquoise.glb'
};

// Função para criar elemento de log
function createLogElement() {
    let logDiv = document.getElementById('model-loading-log');
    if (!logDiv) {
        logDiv = document.createElement('div');
        logDiv.id = 'model-loading-log';
        logDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 14px;
            max-width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.5);
            border: 2px solid #00A0DC;
        `;
        document.body.appendChild(logDiv);

        // Adiciona botão para mostrar/esconder logs
        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-logs';
        toggleButton.textContent = '🔍 Logs';
        toggleButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00A0DC;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        toggleButton.onclick = () => {
            logDiv.style.display = logDiv.style.display === 'none' ? 'block' : 'none';
            toggleButton.textContent = logDiv.style.display === 'none' ? '🔍 Logs' : '❌ Fechar';
        };
        document.body.appendChild(toggleButton);
    }
    return logDiv;
}

// Função para adicionar log
function addLog(message) {
    const logDiv = createLogElement();
    const logEntry = document.createElement('div');
    logEntry.style.cssText = `
        margin-bottom: 8px;
        padding: 5px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    `;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logDiv.appendChild(logEntry);
    logDiv.scrollTop = logDiv.scrollHeight;
}

// Função para trocar a cor do modelo
function changeColor(color) {
    addLog(`Iniciando troca de cor para: ${color}`);
    
    // Atualiza a classe active nos botões de cor
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.color === color) {
            option.classList.add('active');
        }
    });

    // Obtém a cena A-Frame
    const scene = document.querySelector('a-scene');
    const modelContainer = document.querySelector('#modelo3d-1');
    const parentContainer = document.querySelector('#modelo-container');
    
    if (!scene || !modelContainer) {
        addLog('ERRO: Cena ou container do modelo não encontrado');
        return;
    }

    // Cria um novo asset para o modelo
    const modelId = `model-${color}`;
    const modelUrl = colorToModel[color];
    
    addLog(`Carregando modelo: ${modelUrl}`);
    
    // Preserva a posição, rotação e escala atuais do modelo
    const currentPosition = modelContainer.getAttribute('position') || {x: 0, y: 0, z: 0.1};
    const currentRotation = modelContainer.getAttribute('rotation') || {x: 0, y: 0, z: 0};
    const currentScale = modelContainer.getAttribute('scale') || {x: 8, y: 8, z: 8};
    const isVisible = modelContainer.getAttribute('visible');
    
    // Aplica uma animação de dissolução
    modelContainer.setAttribute('animation', {
        property: 'opacity',
        from: 1,
        to: 0,
        dur: 300,
        easing: 'easeInQuad'
    });
    
    // Remove o modelo após a animação de dissolução
    setTimeout(() => {
        // Remove o modelo atual primeiro
        modelContainer.removeAttribute('gltf-model');
        
        // Remove o asset anterior se existir
        const oldAsset = document.querySelector(`#${modelId}`);
        if (oldAsset) {
            oldAsset.parentNode.removeChild(oldAsset);
            addLog(`Asset anterior removido: ${modelId}`);
        }
        
        // Cria um novo asset
        const newAsset = document.createElement('a-asset-item');
        newAsset.setAttribute('id', modelId);
        newAsset.setAttribute('src', modelUrl);
        newAsset.setAttribute('crossorigin', 'anonymous');
        
        // Aplica uma classe para controle de estabilidade durante o carregamento
        if (parentContainer) {
            parentContainer.classList.add('loading-model');
        }
        
        // Adiciona listeners para monitorar o carregamento
        newAsset.addEventListener('loaded', () => {
            addLog(`Modelo carregado com sucesso: ${modelUrl}`);
            
            // Aguarda um curto período antes de aplicar o modelo
            setTimeout(() => {
                // Atualiza o modelo após o carregamento
                modelContainer.setAttribute('gltf-model', `#${modelId}`);
                
                // Restaura a posição, rotação e escala originais
                modelContainer.setAttribute('position', currentPosition);
                modelContainer.setAttribute('rotation', currentRotation);
                modelContainer.setAttribute('scale', currentScale);
                modelContainer.setAttribute('visible', isVisible);
                
                // Força a atualização da cena 
                modelContainer.object3D.visible = true;
                modelContainer.object3D.updateMatrix();
                modelContainer.object3D.updateMatrixWorld(true);
                
                // Anima a entrada do novo modelo
                modelContainer.setAttribute('animation', {
                    property: 'opacity',
                    from: 0,
                    to: 1,
                    dur: 300,
                    easing: 'easeOutQuad'
                });
                
                // Remove a classe de carregamento após terminar o processo
                if (parentContainer) {
                    parentContainer.classList.remove('loading-model');
                }
                
                // Força uma maior estabilidade após a troca do modelo
                if (parentContainer) {
                    // Estabilização adicional temporária
                    const currentStabilizerSettings = parentContainer.getAttribute('stabilizer') || {};
                    const enhancedSettings = {
                        smoothingFactor: 0.6, // Maior estabilização temporária
                        positionThreshold: 0.002,
                        rotationThreshold: 0.005
                    };
                    
                    parentContainer.setAttribute('stabilizer', enhancedSettings);
                    
                    // Voltar às configurações normais após um período
                    setTimeout(() => {
                        parentContainer.setAttribute('stabilizer', currentStabilizerSettings);
                    }, 1500);
                }
                
            }, 100);
        });
        
        newAsset.addEventListener('error', (error) => {
            addLog(`ERRO ao carregar modelo: ${modelUrl}`);
            addLog(`Detalhes do erro: ${error.message}`);
            
            // Remove o estado de carregamento em caso de erro
            if (parentContainer) {
                parentContainer.classList.remove('loading-model');
            }
        });
        
        // Adiciona o novo asset à cena
        scene.querySelector('a-assets').appendChild(newAsset);
    }, 300);
}

// Adiciona listener para erros de carregamento de modelo
document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('model-loaded', (e) => {
            addLog(`Modelo carregado: ${e.detail.model.src}`);
        });
        
        scene.addEventListener('model-error', (e) => {
            addLog(`ERRO ao carregar modelo: ${e.detail.model.src}`);
            addLog(`Detalhes do erro: ${e.detail.error}`);
        });
    }
}); 