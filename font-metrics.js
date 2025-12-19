/**
 * Font Metrics Inspector
 * Calculates and visualizes typography metrics including baseline, x-height, cap-height, etc.
 */

class FontMetricsInspector {
    constructor() {
        this.canvas = document.getElementById('metrics-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.textDisplay = document.getElementById('text-display');
        this.textContent = document.getElementById('text-content');
        
        // Control elements
        this.sampleTextInput = document.getElementById('sample-text');
        this.fontFamilySelect = document.getElementById('font-family');
        this.fontSizeRange = document.getElementById('font-size');
        this.lineHeightRange = document.getElementById('line-height');
        this.showGuidesCheckbox = document.getElementById('show-guides');
        
        // Value display elements
        this.fontSizeValue = document.getElementById('font-size-value');
        this.lineHeightValue = document.getElementById('line-height-value');
        
        // Info elements
        this.infoFontSize = document.getElementById('info-font-size');
        this.infoLineHeight = document.getElementById('info-line-height');
        this.infoBaseline = document.getElementById('info-baseline');
        this.infoXHeight = document.getElementById('info-xheight');
        this.infoCapHeight = document.getElementById('info-capheight');
        this.infoAscender = document.getElementById('info-ascender');
        this.infoDescender = document.getElementById('info-descender');
        
        this.metrics = {};
        this.showGuides = true;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateMetrics();
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.drawMetrics();
        });
    }
    
    setupEventListeners() {
        this.sampleTextInput.addEventListener('input', () => {
            this.textContent.textContent = this.sampleTextInput.value || 'Typography Metrics';
            this.updateMetrics();
        });
        
        this.fontFamilySelect.addEventListener('change', () => {
            this.updateMetrics();
        });
        
        this.fontSizeRange.addEventListener('input', () => {
            this.fontSizeValue.textContent = this.fontSizeRange.value;
            this.updateMetrics();
        });
        
        this.lineHeightRange.addEventListener('input', () => {
            this.lineHeightValue.textContent = this.lineHeightRange.value;
            this.updateMetrics();
        });
        
        this.showGuidesCheckbox.addEventListener('change', () => {
            this.showGuides = this.showGuidesCheckbox.checked;
            this.drawMetrics();
        });
    }
    
    resizeCanvas() {
        const rect = this.textDisplay.getBoundingClientRect();
        const parentRect = this.textDisplay.parentElement.getBoundingClientRect();
        
        this.canvas.width = parentRect.width;
        this.canvas.height = parentRect.height;
        
        // Set canvas position to match parent
        this.canvas.style.width = parentRect.width + 'px';
        this.canvas.style.height = parentRect.height + 'px';
    }
    
    updateMetrics() {
        const fontSize = parseInt(this.fontSizeRange.value);
        const lineHeight = parseFloat(this.lineHeightRange.value);
        const fontFamily = this.fontFamilySelect.value;
        
        // Apply styles to text
        this.textContent.style.fontSize = fontSize + 'px';
        this.textContent.style.lineHeight = lineHeight;
        this.textContent.style.fontFamily = fontFamily;
        
        // Calculate metrics
        this.calculateFontMetrics(fontSize, lineHeight, fontFamily);
        
        // Update info display
        this.updateInfoDisplay();
        
        // Redraw canvas
        this.resizeCanvas();
        this.drawMetrics();
    }
    
    calculateFontMetrics(fontSize, lineHeight, fontFamily) {
        // Create a temporary canvas for measuring
        const TEMP_CANVAS_SIZE = 500;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = TEMP_CANVAS_SIZE;
        tempCanvas.height = TEMP_CANVAS_SIZE;
        
        tempCtx.font = `${fontSize}px ${fontFamily}`;
        tempCtx.textBaseline = 'alphabetic';
        
        // Measure baseline using a sample with various letter heights
        // 'Hxgpqy' contains uppercase (H), lowercase (x), and descenders (g, p, y, q)
        const textMetrics = tempCtx.measureText('Hxgpqy');
        
        // Get bounding box measurements
        const actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        
        // Calculate line height in pixels
        const lineHeightPx = fontSize * lineHeight;
        
        // Store metrics
        this.metrics = {
            fontSize: fontSize,
            lineHeight: lineHeightPx,
            fontFamily: fontFamily,
            // Ascender (top of tallest letters like 'h', 'l', 'b')
            ascender: textMetrics.actualBoundingBoxAscent,
            // Descender (bottom of letters like 'g', 'p', 'y')
            descender: textMetrics.actualBoundingBoxDescent,
            // Cap height (estimated from 'H')
            capHeight: this.measureCapHeight(tempCtx, fontSize, fontFamily),
            // X-height (estimated from 'x')
            xHeight: this.measureXHeight(tempCtx, fontSize, fontFamily),
            // Baseline is at position 0 in our coordinate system
            baseline: 0
        };
    }
    
    measureCapHeight(ctx, fontSize, fontFamily) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textBaseline = 'alphabetic';
        
        const metrics = ctx.measureText('H');
        return metrics.actualBoundingBoxAscent;
    }
    
    measureXHeight(ctx, fontSize, fontFamily) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textBaseline = 'alphabetic';
        
        const metrics = ctx.measureText('x');
        return metrics.actualBoundingBoxAscent;
    }
    
    updateInfoDisplay() {
        this.infoFontSize.textContent = `${this.metrics.fontSize}px`;
        this.infoLineHeight.textContent = `${this.metrics.lineHeight.toFixed(1)}px`;
        this.infoBaseline.textContent = '0px (reference)';
        this.infoXHeight.textContent = `${this.metrics.xHeight.toFixed(1)}px`;
        this.infoCapHeight.textContent = `${this.metrics.capHeight.toFixed(1)}px`;
        this.infoAscender.textContent = `${this.metrics.ascender.toFixed(1)}px`;
        this.infoDescender.textContent = `${this.metrics.descender.toFixed(1)}px`;
    }
    
    drawMetrics() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.showGuides) {
            return;
        }
        
        // Get text element position
        const textRect = this.textContent.getBoundingClientRect();
        const parentRect = this.canvas.parentElement.getBoundingClientRect();
        
        // Calculate offsets
        const offsetX = textRect.left - parentRect.left;
        const offsetY = textRect.top - parentRect.top;
        
        // Calculate baseline position
        // The baseline is roughly at: top + ascender
        const baselineY = offsetY + this.metrics.ascender;
        
        // Calculate line height boundaries
        const lineTop = offsetY;
        const lineBottom = offsetY + this.metrics.lineHeight;
        
        // Draw line height boundaries (gray dashed)
        this.drawLine(offsetX, lineTop, textRect.width, '#95a5a6', 1, [5, 5]);
        this.drawLine(offsetX, lineBottom, textRect.width, '#95a5a6', 1, [5, 5]);
        
        // Draw ascender line (purple)
        this.drawLine(offsetX, baselineY - this.metrics.ascender, textRect.width, '#9b59b6', 2);
        
        // Draw cap height (green)
        this.drawLine(offsetX, baselineY - this.metrics.capHeight, textRect.width, '#27ae60', 2);
        
        // Draw x-height (blue)
        this.drawLine(offsetX, baselineY - this.metrics.xHeight, textRect.width, '#3498db', 2);
        
        // Draw baseline (red - most important)
        this.drawLine(offsetX, baselineY, textRect.width, '#e74c3c', 3);
        
        // Draw descender line (orange)
        this.drawLine(offsetX, baselineY + this.metrics.descender, textRect.width, '#f39c12', 2);
        
        // Draw labels
        this.drawLabel('Ascender', offsetX + textRect.width + 10, baselineY - this.metrics.ascender, '#9b59b6');
        this.drawLabel('Cap Height', offsetX + textRect.width + 10, baselineY - this.metrics.capHeight, '#27ae60');
        this.drawLabel('X-Height', offsetX + textRect.width + 10, baselineY - this.metrics.xHeight, '#3498db');
        this.drawLabel('Baseline', offsetX + textRect.width + 10, baselineY, '#e74c3c');
        this.drawLabel('Descender', offsetX + textRect.width + 10, baselineY + this.metrics.descender, '#f39c12');
    }
    
    drawLine(x, y, width, color, lineWidth = 2, dash = []) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.setLineDash(dash);
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + width, y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawLabel(text, x, y, color) {
        this.ctx.font = '12px sans-serif';
        this.ctx.fillStyle = color;
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
    }
}

// Initialize the inspector when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FontMetricsInspector();
});
