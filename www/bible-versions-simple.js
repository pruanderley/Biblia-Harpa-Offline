/**
 * 🔥 SELETOR DE VERSÕES SIMPLIFICADO E VISÍVEL
 * 
 * Características:
 * - Mostra versões em um botão na barra de topo
 * - Dropdown com versões disponíveis
 * - Mostra versão atual de forma clara
 * - Fácil para os irmãos usarem
 * - Totalmente integrado com seu design
 * 
 * Uso:
 * 1. Copie este arquivo
 * 2. Inclua: <script src="bible-versions-simple.js" defer></script>
 * 3. Chame: BibleVersionsSimple.init(['JFA', 'NVI', 'ARA'])
 */

class BibleVersionsSimple {
  static versions = {};
  static currentVersion = 'JFA';
  static versionOrder = [];
  
  /**
   * Inicializa o sistema de versões SIMPLES
   */
  static async init(versionNames = ['JFA'], defaultVersion = null) {
    console.log('🔥 Iniciando Seletor de Versões Simples:', versionNames);
    
    this.versionOrder = versionNames;
    
    // Carrega todas as versões
    for (const version of versionNames) {
      await this.loadVersion(version);
    }
    
    // Define versão padrão
    const saved = localStorage.getItem('biblia_version');
    this.currentVersion = saved || defaultVersion || versionNames[0];
    
    // Cria o seletor VISÍVEL na barra de topo
    this.createVersionButton();
    
    // Expõe globalmente
    window.bibleData = this.getCurrentData();
    window.BibleVersionsSimple = this;
    
    console.log('✅ Seletor de Versões Pronto!');
    console.log('📖 Versão Ativa:', this.currentVersion);
  }
  
  /**
   * Carrega uma versão dinamicamente
   */
  static async loadVersion(versionName) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `Biblia_data_${versionName}.js`;
      script.onload = () => {
        const varName = `bibleDataExterno_${versionName}` || `bibleData_${versionName}` || `bibleDataExterno`;
        const data = window[varName] || window.bibleDataExterno;
        
        if (data) {
          this.versions[versionName] = data;
          console.log(`✅ Versão '${versionName}' carregada`);
          resolve(data);
        } else {
          reject(new Error(`Versão ${versionName} não carregada`));
        }
      };
      script.onerror = () => reject(new Error(`Erro ao carregar ${versionName}`));
      document.head.appendChild(script);
    });
  }
  
  /**
   * Obtém dados da versão atual
   */
  static getCurrentData() {
    return this.versions[this.currentVersion] || [];
  }
  
  /**
   * Troca de versão
   */
  static switchVersion(versionName) {
    if (!this.versions[versionName]) {
      console.error(`❌ Versão '${versionName}' não carregada!`);
      return false;
    }
    
    this.currentVersion = versionName;
    window.bibleData = this.getCurrentData();
    
    // Salva preferência
    localStorage.setItem('biblia_version', versionName);
    
    // Atualiza botão
    this.updateButton();
    
    // Dispara evento
    window.dispatchEvent(new CustomEvent('bible-version-changed', {
      detail: { version: versionName }
    }));
    
    console.log(`📖 Versão alterada para: ${versionName}`);
    return true;
  }
  
  /**
   * Obtém label bonito da versão
   */
  static getVersionLabel(version) {
    const labels = {
      'JFA': 'JFA',
      'NVI': 'NVI',
      'ARA': 'ARA',
      'ACF': 'ACF',
      'TLA': 'TLA',
      'NVT': 'NVT',
    };
    return labels[version] || version;
  }
  
  /**
   * Cria o botão de versões na barra de topo (VISÍVEL)
   */
  static createVersionButton() {
    // Procura pelo header
    const header = document.getElementById('header') || document.querySelector('header');
    if (!header) {
      console.warn('⚠️  Nenhum header encontrado. Criando container...');
      return this.createFloatingButton(); // Fallback: flutuante
    }
    
    // Cria container do seletor
    const container = document.createElement('div');
    container.id = 'bible-version-container';
    container.className = 'bible-version-container';
    container.innerHTML = `
      <div class="bible-version-btn-wrapper">
        <button class="bible-version-btn" id="bible-version-btn">
          <span class="bible-version-icon">📖</span>
          <span class="bible-version-text">${this.getVersionLabel(this.currentVersion)}</span>
          <span class="bible-version-arrow">▼</span>
        </button>
        
        <div class="bible-version-menu" id="bible-version-menu">
          ${this.versionOrder.map(v => `
            <button class="bible-version-item ${v === this.currentVersion ? 'active' : ''}" 
                    data-version="${v}">
              ${this.getVersionLabel(v)}
              ${v === this.currentVersion ? ' ✓' : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    
    // Injeta CSS
    this.injectCSS();
    
    // Insere no header (à direita)
    header.appendChild(container);
    
    // Adiciona listeners
    const btn = document.getElementById('bible-version-btn');
    const menu = document.getElementById('bible-version-menu');
    
    if (btn && menu) {
      // Toggle menu
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('visible');
      });
      
      // Clica em uma versão
      menu.querySelectorAll('.bible-version-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const version = item.dataset.version;
          this.switchVersion(version);
          menu.classList.remove('visible');
        });
      });
      
      // Fecha ao clicar fora
      document.addEventListener('click', () => {
        menu.classList.remove('visible');
      });
    }
  }
  
  /**
   * Cria botão flutuante (fallback)
   */
  static createFloatingButton() {
    const btn = document.createElement('button');
    btn.id = 'bible-version-floating';
    btn.className = 'bible-version-floating';
    btn.textContent = this.getVersionLabel(this.currentVersion);
    btn.innerHTML = `📖 ${this.getVersionLabel(this.currentVersion)}`;
    
    btn.addEventListener('click', () => {
      const version = prompt(
        `Escolha uma versão:\n${this.versionOrder.map(v => `• ${this.getVersionLabel(v)}`).join('\n')}`,
        this.currentVersion
      );
      
      if (version && this.versionOrder.includes(version)) {
        this.switchVersion(version);
      }
    });
    
    document.body.appendChild(btn);
    this.injectFloatingCSS();
  }
  
  /**
   * Atualiza o botão
   */
  static updateButton() {
    const btn = document.querySelector('.bible-version-btn');
    if (btn) {
      const text = btn.querySelector('.bible-version-text');
      if (text) text.textContent = this.getVersionLabel(this.currentVersion);
    }
    
    // Atualiza menu
    const menu = document.getElementById('bible-version-menu');
    if (menu) {
      menu.querySelectorAll('.bible-version-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.version === this.currentVersion) {
          item.classList.add('active');
          item.textContent = `${this.getVersionLabel(item.dataset.version)} ✓`;
        } else {
          item.textContent = this.getVersionLabel(item.dataset.version);
        }
      });
    }
  }
  
  /**
   * Injeta CSS do seletor INTEGRADO
   */
  static injectCSS() {
    if (document.getElementById('bible-version-css')) return;
    
    const style = document.createElement('style');
    style.id = 'bible-version-css';
    style.textContent = `
      /* ── SELETOR DE VERSÕES ── */
      .bible-version-container {
        display: flex;
        align-items: center;
        margin-left: auto; /* Alinha à direita */
        margin-right: 12px;
      }
      
      .bible-version-btn-wrapper {
        position: relative;
      }
      
      .bible-version-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        background: var(--bg-card, #1e1812);
        border: 1px solid var(--border, #3a2e22);
        border-radius: 8px;
        color: var(--text-primary, #e6dbc8);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: 'Cinzel', Georgia, serif;
        letter-spacing: 0.5px;
      }
      
      .bible-version-btn:hover {
        background: var(--bg-secondary, #161110);
        border-color: var(--accent-gold, #D4A528);
        color: var(--accent-gold, #D4A528);
      }
      
      .bible-version-btn:active {
        transform: scale(0.95);
      }
      
      .bible-version-icon {
        font-size: 16px;
      }
      
      .bible-version-text {
        font-weight: 700;
        min-width: 50px;
        text-align: center;
      }
      
      .bible-version-arrow {
        font-size: 10px;
        opacity: 0.7;
      }
      
      .bible-version-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 6px;
        background: var(--bg-panel, #261f17);
        border: 1px solid var(--border, #3a2e22);
        border-radius: 8px;
        min-width: 140px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: all 0.2s ease;
        
        display: flex;
        flex-direction: column;
      }
      
      .bible-version-menu.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .bible-version-item {
        padding: 10px 16px;
        background: transparent;
        border: none;
        color: var(--text-secondary, #c4a06a);
        font-size: 13px;
        font-family: 'Cinzel', Georgia, serif;
        cursor: pointer;
        text-align: left;
        transition: all 0.15s ease;
        letter-spacing: 0.5px;
        font-weight: 600;
      }
      
      .bible-version-item:hover {
        background: rgba(212, 165, 40, 0.1);
        color: var(--accent-gold, #D4A528);
        padding-left: 20px;
      }
      
      .bible-version-item.active {
        background: rgba(212, 165, 40, 0.15);
        color: var(--accent-gold, #D4A528);
        border-left: 3px solid var(--accent-gold, #D4A528);
        padding-left: 13px;
      }
      
      .bible-version-item:first-child {
        border-radius: 7px 7px 0 0;
      }
      
      .bible-version-item:last-child {
        border-radius: 0 0 7px 7px;
      }
      
      /* Light theme */
      body.light .bible-version-btn {
        background: var(--bg-card, #f0f0f0);
        border-color: var(--border, #c8bca8);
        color: var(--text-primary, #2a2218);
      }
      
      body.light .bible-version-btn:hover {
        background: var(--bg-secondary, #f5f5f5);
        border-color: var(--accent-gold, #9A7200);
        color: var(--accent-gold, #9A7200);
      }
      
      body.light .bible-version-menu {
        background: var(--bg-panel, #eae4d8);
        border-color: var(--border, #c8bca8);
      }
      
      body.light .bible-version-item {
        color: var(--text-secondary, #3a2a14);
      }
      
      body.light .bible-version-item:hover {
        background: rgba(154, 114, 0, 0.1);
        color: var(--accent-gold, #9A7200);
      }
      
      body.light .bible-version-item.active {
        background: rgba(154, 114, 0, 0.15);
        color: var(--accent-gold, #9A7200);
        border-color: var(--accent-gold, #9A7200);
      }
      
      /* Mobile */
      @media (max-width: 600px) {
        .bible-version-btn {
          padding: 6px 10px;
          font-size: 12px;
        }
        
        .bible-version-text {
          min-width: 35px;
        }
        
        .bible-version-icon {
          font-size: 14px;
        }
        
        .bible-version-menu {
          min-width: 130px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * CSS para botão flutuante (fallback)
   */
  static injectFloatingCSS() {
    if (document.getElementById('bible-version-float-css')) return;
    
    const style = document.createElement('style');
    style.id = 'bible-version-float-css';
    style.textContent = `
      .bible-version-floating {
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 999;
        padding: 8px 12px;
        background: var(--accent-gold, #D4A528);
        color: #000;
        border: none;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        font-size: 13px;
      }
    `;
    document.head.appendChild(style);
  }
}

// Auto-init se houver dados
document.addEventListener('DOMContentLoaded', () => {
  if (window.bibleDataExterno && !window.BibleVersionsSimple) {
    window.bibleDataExterno_JFA = window.bibleDataExterno;
    BibleVersionsSimple.init(['JFA']);
  }
});
