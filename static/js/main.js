// static/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores de DOM ---
    const form = document.getElementById('prompt-form');
    const finalPromptPre = document.getElementById('final-prompt');
    const copyButton = document.getElementById('copy-button');
    const resetButton = document.getElementById('reset-button');
    const addOpeningCheckbox = document.getElementById('add-opening-checkbox');
    const toastNotification = document.getElementById('toast-notification');
    
    // --- Constantes e Estado ---
    const CHAR_LIMIT = 250;
    const PRESET_FIELDS = ['resultado', 'orquestracao', 'perimetro', 'tom'];
    let presets = initialPresets;

    // --- Funções de Gerenciamento de Presets ---
    function renderAllPresets() {
        PRESET_FIELDS.forEach(field => {
            const select = document.querySelector(`.preset-controls[data-field="${field}"] .preset-select`);
            if (!select) return;
            while (select.options.length > 1) { select.remove(1); }
            const fieldPresets = presets[field] || [];
            fieldPresets.forEach(preset => {
                const option = document.createElement('option');
                option.value = preset.id;
                option.textContent = preset.value.split('\n')[0].substring(0, 70) + (preset.value.includes('\n') ? '...' : '');
                select.appendChild(option);
            });
        });
    }

    async function savePreset(field) {
        const textarea = document.getElementById(field);
        const value = textarea.value.trim();
        if (!value) {
            alert(`O campo "${field}" deve ser preenchido para salvar um preset.`);
            return;
        }
        try {
            const response = await fetch(`/save_preset/${field}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ value: value })
            });
            if (!response.ok) throw new Error('Falha ao salvar.');
            const newPreset = await response.json();
            presets[field].unshift(newPreset);
            renderAllPresets();
            alert(`Preset para "${field}" salvo com sucesso!`);
        } catch (error) {
            console.error('Erro:', error);
            alert(`Não foi possível salvar o preset para "${field}".`);
        }
    }

    async function deletePreset(field) {
        const select = document.querySelector(`.preset-controls[data-field="${field}"] .preset-select`);
        const presetId = select.value;
        if (!presetId) {
            alert('Selecione um preset para excluir.');
            return;
        }
        if (!confirm('Tem certeza que deseja excluir o preset selecionado?')) return;
        try {
            const response = await fetch(`/delete_preset/${field}/${presetId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir.');
            presets[field] = presets[field].filter(p => p.id != presetId);
            renderAllPresets();
        } catch (error) {
            console.error('Erro:', error);
            alert(`Não foi possível excluir o preset para "${field}".`);
        }
    }

    function applyPreset(field, presetId) {
        const textarea = document.getElementById(field);
        if (!presetId) {
            textarea.value = '';
            return;
        }
        const preset = presets[field].find(p => p.id == presetId);
        if (preset) {
            textarea.value = preset.value;
        }
        assemblePreview();
    }
    
    // --- Funções de Geração de Conteúdo ---
    const escapeHtml = (unsafe) => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

    const getSectionContentHTML = (id, title, className) => {
        const el = document.getElementById(id);
        const value = el ? el.value.trim() : '';
        if (!value) return '';
        return `<span class="prompt-section-title prompt-${className}">## ${title}\n</span><span class="prompt-section-content">${escapeHtml(value)}\n\n</span>`;
    };

    const getPersonaContentHTML = () => {
        const template = document.getElementById('persona').dataset.template;
        const input1 = document.getElementById('persona-input-1').value.trim();
        const input2 = document.getElementById('persona-input-2').value.trim();
        if (input1 || input2) {
            const text = template.replace('{}', input1 || '[Especialidade]').replace('{}', input2 || '[Seu Papel]');
            return `<span class="prompt-section-title prompt-persona">## 👤 PERSONA\n</span><span class="prompt-section-content">${escapeHtml(text)}\n\n</span>`;
        }
        return '';
    };

    const getMessageContentHTML = () => {
        const checkedFiles = Array.from(document.querySelectorAll('input[name="context_files"]:checked'));
        if (checkedFiles.length === 0) return '';
        
        let html = `<span class="prompt-section-title prompt-mensagem">## ✉️ MENSAGEM (CONTEXTO)\n</span>`;
        html += `<span class="prompt-section-content">Considere o conteúdo dos seguintes arquivos:\n\n`;

        checkedFiles.forEach(cb => {
            const file = fileData.find(f => f.filename === cb.value);
            if (file) {
                let content = file.content;
                html += `--- INÍCIO DO ARQUIVO: ${file.filename} ---\n`;
                const displayContent = (content.length > CHAR_LIMIT) 
                    ? content.substring(0, CHAR_LIMIT) + `... (total de ${content.length} caracteres)\n` 
                    : content + '\n';
                html += escapeHtml(displayContent);
                html += `--- FIM DO ARQUIVO: ${file.filename} ---\n\n`;
            }
        });
        html += `</span>`;
        return html;
    };
    
    const getOpeningContentHTML = () => {
        return addOpeningCheckbox.checked ? `<span class="prompt-section-content">Dando continuidade à nossa última interação, que foi excelente, por favor, me ajude com o seguinte:\n\n</span>` : "";
    };

    // --- Funções Principais ---
    
    function assemblePreview() {
        let html = '';
        html += getOpeningContentHTML();
        html += getPersonaContentHTML();
        html += getSectionContentHTML('resultado', '🎯 RESULTADO', 'resultado');
        html += getSectionContentHTML('orquestracao', '⚙️ ORQUESTRAÇÃO', 'orquestracao');
        html += getSectionContentHTML('perimetro', '🚧 PERÍMETRO (RESTRIÇÕES)', 'perimetro');
        html += getSectionContentHTML('tom', '🎨 TOM', 'tom');
        html += getMessageContentHTML();
        
        if (html.trim() === '') {
            finalPromptPre.innerHTML = 'Preencha ao menos um campo para gerar o prompt...';
        } else {
            finalPromptPre.innerHTML = html.trim().replace(/\n\n/g, '\n').replace(/\n/g, '<br>');
        }
    }
    
    function assembleForCopying() {
        const getSectionContentText = (id, title) => {
            const el = document.getElementById(id);
            const value = el ? el.value.trim() : '';
            return value ? `## ${title}\n${value}\n\n` : '';
        };

        const getPersonaContentText = () => {
            const template = document.getElementById('persona').dataset.template;
            const input1 = document.getElementById('persona-input-1').value.trim();
            const input2 = document.getElementById('persona-input-2').value.trim();
            if (input1 || input2) {
                return `## 👤 PERSONA\n${template.replace('{}', input1 || '[Especialidade]').replace('{}', input2 || '[Seu Papel]')}\n\n`;
            }
            return '';
        };

        const getOpeningContentText = () => {
            return addOpeningCheckbox.checked ? "Dando continuidade à nossa última interação, que foi excelente, por favor, me ajude com o seguinte:\n\n" : "";
        };

        const getMessageContentText = () => {
            const checkedFiles = Array.from(document.querySelectorAll('input[name="context_files"]:checked'));
            if (checkedFiles.length === 0) return '';
            let text = `## ✉️ MENSAGEM (CONTEXTO)\nConsidere o conteúdo dos seguintes arquivos:\n\n`;
            checkedFiles.forEach(cb => {
                const file = fileData.find(f => f.filename === cb.value);
                if (file) {
                    text += `--- INÍCIO DO ARQUIVO: ${file.filename} ---\n`;
                    text += file.content + '\n';
                    text += `--- FIM DO ARQUIVO: ${file.filename} ---\n\n`;
                }
            });
            return text;
        };

        let text = '';
        text += getOpeningContentText();
        text += getPersonaContentText();
        text += getSectionContentText('resultado', '🎯 RESULTADO');
        text += getSectionContentText('orquestracao', '⚙️ ORQUESTRAÇÃO');
        text += getSectionContentText('perimetro', '🚧 PERÍMETRO (RESTRIÇÕES)');
        text += getSectionContentText('tom', '🎨 TOM');
        text += getMessageContentText(); // Mensagem por último

        return text.trim();
    }

    function showToast() {
        toastNotification.classList.add('show');
        setTimeout(() => toastNotification.classList.remove('show'), 3000);
    }

    function copyToClipboard() {
        const textToCopy = assembleForCopying();
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(showToast).catch(err => {
            console.error('Erro ao copiar: ', err);
            alert('Falha ao copiar o prompt.');
        });
    }

    function resetForm() {
        form.reset();
        document.getElementById('persona-input-1').value = '';
        document.getElementById('persona-input-2').value = '';
        document.querySelectorAll('.preset-select').forEach(select => select.value = '');
        assemblePreview();
    }

    // --- Event Listeners e Inicialização ---
    form.addEventListener('input', assemblePreview);
    copyButton.addEventListener('click', copyToClipboard);
    resetButton.addEventListener('click', resetForm);

    form.addEventListener('click', (e) => {
        const field = e.target.closest('.preset-controls')?.dataset.field;
        if (!field) return;
        if (e.target.matches('.save-preset-btn')) savePreset(field);
        if (e.target.matches('.delete-preset-btn')) deletePreset(field);
    });

    form.addEventListener('change', (e) => {
        const field = e.target.closest('.preset-controls')?.dataset.field;
        if (field && e.target.matches('.preset-select')) {
            applyPreset(field, e.target.value);
        }
    });
    
    renderAllPresets();
    assemblePreview();
});