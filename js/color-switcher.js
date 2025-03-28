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
    
    // Verifica se o asset já existe para evitar duplicação
    let assetItem = document.querySelector(`#${modelId}`);
    if (!assetItem) {
        // Cria um novo asset item
        assetItem = document.createElement('a-asset-item');
        assetItem.id = modelId;
        assetItem.setAttribute('src', modelUrl);
        assetItem.setAttribute('crossorigin', 'anonymous');
        scene.querySelector('a-assets').appendChild(assetItem);
    }
    
    // Adiciona listener para carregamento do asset
    assetItem.addEventListener('loaded', function onAssetLoaded() {
        addLog(`Asset ${modelId} carregado com sucesso`);
        // Remove o listener após o carregamento para evitar duplicação
        assetItem.removeEventListener('loaded', onAssetLoaded);
    });
    
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
        // Remove o modelo atual
        modelContainer.removeAttribute('gltf-model');
        
        // Aplica uma classe para controle de estabilidade durante o carregamento
        if (parentContainer) {
            parentContainer.classList.add('loading-model');
        }
        
        // Aguarda um curto período antes de aplicar o novo modelo
        setTimeout(() => {
            // Atualiza o modelo
            addLog(`Aplicando modelo: #${modelId}`);
            modelContainer.setAttribute('gltf-model', `#${modelId}`);
            
            // Restaura a posição, rotação e escala originais
            modelContainer.setAttribute('position', currentPosition);
            modelContainer.setAttribute('rotation', currentRotation);
            modelContainer.setAttribute('scale', currentScale);
            modelContainer.setAttribute('visible', isVisible !== false);
            
            // Força a atualização da cena
            if (modelContainer.object3D) {
                modelContainer.object3D.visible = true;
                modelContainer.object3D.updateMatrix();
                modelContainer.object3D.updateMatrixWorld(true);
            }
            
            // Listener para verificar se o modelo foi carregado
            const checkModelLoaded = function() {
                if (modelContainer.components && 
                    modelContainer.components['gltf-model'] && 
                    modelContainer.components['gltf-model'].model) {
                    
                    addLog(`Modelo carregado: ${modelUrl}`);
                    modelContainer.removeEventListener('model-loaded', checkModelLoaded);
                    
                    // Anima a entrada do novo modelo
                    modelContainer.setAttribute('animation', {
                        property: 'opacity',
                        from: 0,
                        to: 1,
                        dur: 300,
                        easing: 'easeOutQuad'
                    });
                    
                    // Remove a classe de carregamento
                    if (parentContainer) {
                        parentContainer.classList.remove('loading-model');
                    }
                    
                    // Força uma maior estabilidade após a troca do modelo
                    if (parentContainer) {
                        // Estabilização adicional temporária
                        const currentStabilizerSettings = parentContainer.getAttribute('stabilizer') || {};
                        const enhancedSettings = {
                            smoothingFactor: 0.6,
                            positionThreshold: 0.002,
                            rotationThreshold: 0.005
                        };
                        
                        parentContainer.setAttribute('stabilizer', enhancedSettings);
                        
                        // Voltar às configurações normais após um período
                        setTimeout(() => {
                            parentContainer.setAttribute('stabilizer', currentStabilizerSettings);
                        }, 1500);
                    }
                }
            };
            
            modelContainer.addEventListener('model-loaded', checkModelLoaded);
            
            // Se o modelo não carregar em 5 segundos, tenta novamente
            setTimeout(() => {
                if (!modelContainer.components || 
                    !modelContainer.components['gltf-model'] || 
                    !modelContainer.components['gltf-model'].model) {
                    
                    addLog(`AVISO: Timeout ao carregar modelo, tentando novamente...`);
                    modelContainer.removeEventListener('model-loaded', checkModelLoaded);
                    changeColor(color); // Tenta novamente
                }
            }, 5000);
            
        }, 100);
        
    }, 300);
    
    // Listener para erros de carregamento
    assetItem.addEventListener('error', function(error) {
        addLog(`ERRO ao carregar asset: ${modelUrl}, ${error.message || 'Motivo desconhecido'}`);
        
        // Remove o estado de carregamento em caso de erro
        if (parentContainer) {
            parentContainer.classList.remove('loading-model');
        }
    });
}

// Adiciona listener para erros de carregamento de modelo
document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    if (scene) {
        // Carrega todos os modelos no asset management system no início
        Object.entries(colorToModel).forEach(([color, url]) => {
            const modelId = `model-${color}`;
            
            // Verifica se o asset já existe
            if (!document.querySelector(`#${modelId}`)) {
                const assetItem = document.createElement('a-asset-item');
                assetItem.id = modelId;
                assetItem.setAttribute('src', url);
                assetItem.setAttribute('crossorigin', 'anonymous');
                scene.querySelector('a-assets').appendChild(assetItem);
                
                addLog(`Pré-carregando modelo: ${url}`);
            }
        });
        
        scene.addEventListener('model-loaded', (e) => {
            if (e.detail && e.detail.model) {
                addLog(`Modelo carregado: ${e.detail.model.src || e.target.id}`);
            } else {
                addLog(`Modelo carregado: objeto de evento incompleto`);
            }
        });
        
        scene.addEventListener('model-error', (e) => {
            addLog(`ERRO ao carregar modelo: ${e.detail?.model?.src || 'Desconhecido'}`);
            if (e.detail && e.detail.error) {
                addLog(`Detalhes do erro: ${e.detail.error}`);
            }
        });
    }
}); 