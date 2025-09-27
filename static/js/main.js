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

            // Limpa opções antigas, exceto a primeira
            while (select.options.length > 1) {
                select.remove(1);
            }

            const fieldPresets = presets[field] || [];
            fieldPresets.forEach(preset => {
                const option = document.createElement('option');
                option.value = preset.id;
                // Usa a primeira linha do valor como texto da opção
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
        if (!presetId) { // Se "Carregar preset..." for selecionado
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

    const getSectionContent = (id, title) => {
        const el = document.getElementById(id);
        const value = el ? el.value.trim() : '';
        return value ? `## ${title}\n${value}\n\n` : '';
    };

    const getPersonaContent = () => {
        const template = document.getElementById('persona').dataset.template;
        const input1 = document.getElementById('persona-input-1').value.trim();
        const input2 = document.getElementById('persona-input-2').value.trim();
        if (input1 || input2) {
            const text = template.replace('{}', input1 || '[Especialidade]').replace('{}', input2 || '[Seu Papel]');
            return `## 👤 PERSONA\n${text}\n\n`;
        }
        return '';
    };

    const getMessageContent = (truncate = false) => {
        const checkedFiles = Array.from(document.querySelectorAll('input[name="context_files"]:checked'));
        if (checkedFiles.length === 0) return '';
        let text = '## ✉️ MENSAGEM (CONTEXTO)\nConsidere o conteúdo dos seguintes arquivos:\n\n';
        checkedFiles.forEach(cb => {
            const file = fileData.find(f => f.filename === cb.value);
            if (file) {
                let content = file.content;
                text += `--- INÍCIO DO ARQUIVO: ${file.filename} ---\n`;
                text += (truncate && content.length > CHAR_LIMIT) 
                    ? content.substring(0, CHAR_LIMIT) + `... (total de ${content.length} caracteres)\n` 
                    : content + '\n';
                text += `--- FIM DO ARQUIVO: ${file.filename} ---\n\n`;
            }
        });
        return text;
    };
    
    const getOpeningContent = () => {
        return addOpeningCheckbox.checked ? "Dando continuidade à nossa última interação, que foi excelente, por favor, me ajude com o seguinte:\n\n" : "";
    };

    // --- Funções Principais ---

    function assemblePreview() {
        let text = '';
        text += getOpeningContent(); // MOVEMOS PARA O INÍCIO
        text += getPersonaContent();
        text += getSectionContent('resultado', '🎯 RESULTADO');
        text += getSectionContent('orquestracao', '⚙️ ORQUESTRAÇÃO');
        text += getMessageContent(true);
        text += getSectionContent('perimetro', '🚧 PERÍMETRO (RESTRIÇÕES)');
        text += getSectionContent('tom', '🎨 TOM');
        finalPromptPre.textContent = text.trim() || 'Preencha ao menos um campo para gerar o prompt...';
    }
    
    function showToast() {
        toastNotification.classList.add('show');
        setTimeout(() => toastNotification.classList.remove('show'), 3000);
    }

    function copyToClipboard() {
        let textToCopy = '';
        textToCopy += getOpeningContent(); // MOVEMOS PARA O INÍCIO
        textToCopy += getPersonaContent();
        textToCopy += getSectionContent('resultado', '🎯 RESULTADO');
        textToCopy += getSectionContent('orquestracao', '⚙️ ORQUESTRAÇÃO');
        textToCopy += getSectionContent('perimetro', '🚧 PERÍMETRO (RESTRIÇÕES)');
        textToCopy += getSectionContent('tom', '🎨 TOM');
        textToCopy += getMessageContent(false);
        textToCopy = textToCopy.trim();
        
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

    // Event delegation para os controles de presets
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