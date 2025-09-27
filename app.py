# app.py
import os
import json
import time
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# --- Constantes e Caminhos de Arquivos ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILES_DIR = os.path.join(BASE_DIR, 'files')
PRESETS_FILE = os.path.join(BASE_DIR, 'ropt_presets.json')
ALLOWED_EXTENSIONS = {'.txt', '.py', '.md', '.json', '.html', '.css', '.js'}
PRESET_FIELDS = ['resultado', 'orquestracao', 'perimetro', 'tom']

# --- Funções de Suporte ---

def get_context_files():
    """Lê o diretório 'files' e retorna uma lista de arquivos com seu conteúdo."""
    files_data = []
    if not os.path.isdir(FILES_DIR): return files_data
    for filename in os.listdir(FILES_DIR):
        if any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
            filepath = os.path.join(FILES_DIR, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    files_data.append({"filename": filename, "content": f.read()})
            except Exception as e:
                print(f"Erro ao ler o arquivo {filename}: {e}")
    return files_data

def load_presets():
    """Carrega os presets do arquivo JSON, garantindo a estrutura correta."""
    if not os.path.exists(PRESETS_FILE):
        return {field: [] for field in PRESET_FIELDS}
    try:
        with open(PRESETS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Garante que todos os campos esperados existam
            for field in PRESET_FIELDS:
                if field not in data:
                    data[field] = []
            return data
    except (json.JSONDecodeError, IOError):
        return {field: [] for field in PRESET_FIELDS}

def save_presets(presets):
    """Salva a estrutura completa de presets no arquivo JSON."""
    with open(PRESETS_FILE, 'w', encoding='utf-8') as f:
        json.dump(presets, f, indent=4, ensure_ascii=False)

# --- Rotas da Aplicação ---

@app.route('/')
def home():
    """Renderiza a página principal com a estrutura e dados iniciais."""
    prompt_structure = [
        {"id": "persona", "type": "template_persona", "label": "P - Persona (Papel)", "template": "Atue como um especialista em {} com 20 anos de experiência que irá trabalhar comigo que sou {}.", "placeholders": ["Ex: Marketing Digital", "Ex: um iniciante na área"], "help_text": "Defina a profissão da IA e quem você é no contexto da interação."},
        {"id": "resultado", "type": "textarea", "label": "R - Resultado (Objetivo)", "placeholder": "Ex: O objetivo é criar o código completo para...", "help_text": "O que você quer que a IA produza? Seja específico."},
        {"id": "orquestracao", "type": "textarea", "label": "O - Orquestração (Processo)", "placeholder": "Ex: Comece pela estrutura de pastas, depois o app.py...", "help_text": "Quais são os passos que a IA deve seguir?"},
        {"id": "mensagem", "type": "file_selector", "label": "M - Mensagem (Contexto)", "help_text": "Selecione os arquivos de contexto para incluir no prompt."},
        {"id": "perimetro", "type": "textarea", "label": "P - Perímetro (Restrições)", "placeholder": "Ex: Não use bibliotecas externas além do Flask...", "help_text": "Quais são as regras, limites ou coisas a evitar?"},
        {"id": "tom", "type": "textarea", "label": "T - Tom (Estilo)", "placeholder": "Ex: O tom deve ser profissional, didático...", "help_text": "Como a IA deve soar? Formal, casual, técnico?"}
    ]
    context_files = get_context_files()
    ropt_presets = load_presets()
    return render_template('index.html', structure=prompt_structure, files=context_files, presets=ropt_presets)

# --- Rotas da API de Presets Granulares ---

@app.route('/save_preset/<field_name>', methods=['POST'])
def save_field_preset(field_name):
    """Salva um novo preset para um campo específico (resultado, tom, etc.)."""
    if field_name not in PRESET_FIELDS:
        return jsonify({"error": "Campo inválido"}), 400
    
    data = request.get_json()
    if not data or 'value' not in data or not data['value'].strip():
        return jsonify({"error": "Conteúdo do preset não pode ser vazio"}), 400

    presets = load_presets()
    new_preset = {
        "id": int(time.time() * 1000),
        "value": data['value']
    }
    presets[field_name].insert(0, new_preset)
    save_presets(presets)
    return jsonify(new_preset), 201

@app.route('/delete_preset/<field_name>/<int:preset_id>', methods=['DELETE'])
def delete_field_preset(field_name, preset_id):
    """Deleta um preset de um campo específico pelo seu ID."""
    if field_name not in PRESET_FIELDS:
        return jsonify({"error": "Campo inválido"}), 400
        
    presets = load_presets()
    initial_count = len(presets[field_name])
    presets[field_name] = [p for p in presets[field_name] if p.get('id') != preset_id]
    
    if len(presets[field_name]) == initial_count:
        return jsonify({"error": "Preset não encontrado"}), 404
        
    save_presets(presets)
    return jsonify({"success": True}), 200

if __name__ == '__main__':
    app.run(debug=True)