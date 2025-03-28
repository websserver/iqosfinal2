// Gerenciador de captura de modelo 3D
const ModelCapture = {
  isCaptured: false,
  originalPosition: null,
  capturedPosition: null,
  
  // Inicializa o sistema de captura
  init: function() {
    this.setupEventListeners();
    console.log('Sistema de captura de modelo inicializado');
  },
  
  // Configura os listeners de eventos
  setupEventListeners: function() {
    const target = document.querySelector('a-entity[mindar-image-target]');
    const model = document.querySelector('#modelo3d-1');
    
    if (!target || !model) {
      console.error('Elementos necessários não encontrados');
      return;
    }
    
    // Evento de marcador encontrado
    target.addEventListener('targetFound', () => {
      if (!this.isCaptured) {
        setTimeout(() => {
          this.captureModel(model);
        }, 500); // Pequeno atraso para estabilizar o tracking inicial
      } else {
        console.log('Modelo já está capturado');
      }
    });
    
    console.log('Event listeners configurados');
  },
  
  // Captura o modelo na posição atual
  captureModel: function(model) {
    if (!model || this.isCaptured) return;
    
    // Salva a posição original
    this.originalPosition = new THREE.Vector3();
    model.object3D.getWorldPosition(this.originalPosition);
    
    // Guarda a posição capturada
    this.capturedPosition = this.originalPosition.clone();
    
    // Fixa o modelo nesta posição
    model.setAttribute('position', {
      x: this.capturedPosition.x,
      y: this.capturedPosition.y,
      z: this.capturedPosition.z
    });
    
    this.isCaptured = true;
    console.log('Modelo capturado na posição:', this.capturedPosition);
  },
  
  // Libera o modelo da posição capturada
  releaseModel: function() {
    const model = document.querySelector('#modelo3d-1');
    if (!model || !this.isCaptured) return;
    
    this.isCaptured = false;
    console.log('Modelo liberado da captura');
  }
};

// Inicializa o sistema quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  ModelCapture.init();
}); 