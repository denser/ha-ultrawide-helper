// ultrawide-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.7.0/index.js?module';

class UltrawideHelperCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _isWideScreen: { type: Boolean, state: true }
    };
  }

  constructor() {
    super();
    this._isWideScreen = window.innerWidth >= 1900;
    this._boundResizeHandler = this._handleResize.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._boundResizeHandler);
    this._injectGlobalStyles();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this._boundResizeHandler);
    this._removeGlobalStyles();
    super.disconnectedCallback();
  }

  _handleResize() {
    const minWidth = this.config?.min_width || 1900;
    const isWide = window.innerWidth >= minWidth;
    if (isWide !== this._isWideScreen) {
      this._isWideScreen = isWide;
      this._updateStyles();
    }
  }

  _injectGlobalStyles() {
    if (!this._styleElement) {
      this._styleElement = document.createElement('style');
      this._styleElement.id = 'ultrawide-helper-styles';
      document.head.appendChild(this._styleElement);
    }
    this._updateStyles();
  }

  _removeGlobalStyles() {
    if (this._styleElement) {
      this._styleElement.remove();
      this._styleElement = null;
    }
  }

  _updateStyles() {
    if (!this._styleElement) return;
    
    const enabled = this.config?.enabled !== false;
    const minWidth = this.config?.min_width || 1900;
    const maxColumns = this.config?.max_columns || 6;
    const excludeTypes = this.config?.exclude || [];
    const cardSpacing = this.config?.card_spacing || 8;
    const preserveAspectRatio = this.config?.preserve_aspect_ratio || false;
    
    if (!enabled || !this._isWideScreen) {
      this._styleElement.textContent = '';
      return;
    }
    
    // Генерируем CSS
    const css = `
      /* Ultrawide Helper Styles - Активен при ширине >= ${minWidth}px */
      
      /* Основные контейнеры */
      .view:not(.panel) {
        padding-left: ${cardSpacing}px !important;
        padding-right: ${cardSpacing}px !important;
      }
      
      /* Все карточки */
      ha-card {
        width: 100% !important;
        max-width: none !important;
        margin: ${cardSpacing / 2}px !important;
        ${preserveAspectRatio ? '' : 'height: auto !important;'}
      }
      
      /* Masonry Layout */
      .masonry-container {
        display: flex !important;
        flex-wrap: wrap !important;
      }
      
      .masonry-item {
        width: calc(${100 / maxColumns}% - ${cardSpacing}px) !important;
        margin: ${cardSpacing / 2}px !important;
      }
      
      /* Grid Layout */
      .grid-card {
        display: grid !important;
        grid-template-columns: repeat(${maxColumns}, 1fr) !important;
        gap: ${cardSpacing}px !important;
      }
      
      .grid-card-content {
        grid-template-columns: repeat(${maxColumns}, 1fr) !important;
      }
      
      /* Horizontal Stack */
      .horizontal-stack-card {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: ${cardSpacing}px !important;
      }
      
      .horizontal-stack-card > * {
        flex: 1 1 300px !important;
        min-width: 250px !important;
      }
      
      /* Vertical Stack */
      .vertical-stack-card {
        gap: ${cardSpacing}px !important;
      }
      
      /* Entities Card */
      .entities-card .state {
        flex: 1 1 auto !important;
        justify-content: flex-end !important;
      }
      
      .entities-card .info {
        flex: 0 1 auto !important;
      }
      
      /* Glance Card */
      .glance-card .entities {
        display: grid !important;
        grid-template-columns: repeat(${maxColumns}, 1fr) !important;
        gap: ${cardSpacing}px !important;
      }
      
      .glance-card .entity {
        min-width: 0 !important;
        padding: 12px !important;
      }
      
      /* Button Card */
      .button-card {
        min-height: 80px !important;
      }
      
      /* Graph Cards */
      .history-graph ha-card,
      .sensor-graph ha-card,
      .statistics-graph ha-card {
        height: 400px !important;
      }
      
      /* Map Card */
      .map-card ha-card {
        height: 600px !important;
      }
      
      /* Media Player */
      .media-player-card {
        padding: 16px !important;
      }
      
      .media-player-card .controls {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
      }
      
      /* Weather Card */
      .weather-card {
        padding: 16px !important;
      }
      
      .weather-card .forecast {
        display: grid !important;
        grid-template-columns: repeat(${maxColumns}, 1fr) !important;
        gap: 8px !important;
      }
      
      ${excludeTypes.map(type => `
        /* Исключения для типа: ${type} */
        ha-card[type="${type}"],
        .${type}-card,
        [data-card-type="${type}"] {
          width: var(--ha-card-width, auto) !important;
          max-width: var(--ha-card-max-width, 100%) !important;
          ${preserveAspectRatio ? 'aspect-ratio: auto !important;' : ''}
        }
      `).join('\n')}
      
      /* Кастомные стили пользователя */
      ${this.config?.custom_css || ''}
    `;
    
    this._styleElement.textContent = css;
  }

  render() {
    return html`
      <div style="display: none;"></div>
      
      ${this.config?.debug ? html`
        <div style="
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #333;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          z-index: 9999;
          font-family: monospace;
          font-size: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border-left: 4px solid ${this._isWideScreen ? '#4caf50' : '#f44336'};
        ">
          <div style="font-weight: bold; margin-bottom: 8px;">🖥️ Ultrawide Helper</div>
          <div>Статус: <span style="color: ${this._isWideScreen ? '#4caf50' : '#f44336'}">${this._isWideScreen ? 'Активен' : 'Отключен'}</span></div>
          <div>Ширина экрана: ${window.innerWidth}px</div>
          <div>Мин. ширина: ${this.config?.min_width || 1900}px</div>
          <div>Колонок: ${this.config?.max_columns || 6}</div>
          <div>Карточек на панели: ${document.querySelectorAll('ha-card').length}</div>
          ${this.config?.debug > 1 ? html`
            <div style="margin-top: 8px; font-size: 10px; color: #aaa;">
              Последнее обновление: ${new Date().toLocaleTimeString()}
            </div>
          ` : ''}
        </div>
      ` : ''}
    `;
  }

  setConfig(config) {
    if (!config) config = {};
    
    // Валидация
    if (config.min_width !== undefined && typeof config.min_width !== 'number') {
      throw new Error('min_width должен быть числом');
    }
    
    if (config.max_columns !== undefined && typeof config.max_columns !== 'number') {
      throw new Error('max_columns должен быть числом');
    }
    
    if (config.card_spacing !== undefined && typeof config.card_spacing !== 'number') {
      throw new Error('card_spacing должен быть числом');
    }
    
    if (config.exclude && !Array.isArray(config.exclude)) {
      throw new Error('exclude должен быть массивом');
    }
    
    this.config = config;
    this._updateStyles();
  }

  getCardSize() {
    return 0;
  }
}

customElements.define('ultrawide-helper-card', UltrawideHelperCard);

// Регистрация в каталоге HACS
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'ultrawide-helper-card',
  name: 'Ultrawide Helper',
  description: 'Автоматическая адаптация карточек для ультрашироких мониторов',
  preview: false,
  documentationURL: 'https://github.com/yourusername/ha-ultrawide-helper'
});

// Экспорт для использования в других модулях
export { UltrawideHelperCard };
