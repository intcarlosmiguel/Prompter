# setup_and_run.py
import sys
import subprocess
import os
import time
import webbrowser

VENV_DIR = "venv"
REQUIREMENTS_FILE = "requirements.txt"
FLASK_APP_FILE = "app.py"
URL = "http://127.0.0.1:5000"

def print_step(message):
    """Imprime uma mensagem de etapa formatada."""
    print(f"\n--- {message} ---")

def run_command(command, check=True):
    """Executa um comando no shell e imprime a saída."""
    print(f"Executando: {' '.join(command)}")
    try:
        subprocess.run(command, check=check, text=True, capture_output=False)
    except subprocess.CalledProcessError as e:
        print(f"Erro ao executar o comando: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print(f"Erro: O comando '{command[0]}' não foi encontrado. Verifique se o Python está no seu PATH.")
        sys.exit(1)

def main():
    """Script principal para configurar o ambiente e iniciar a aplicação."""
    print_step("Verificando a versão do Python")
    if sys.version_info < (3, 6):
        print("Erro: Este script requer Python 3.6 ou superior.")
        sys.exit(1)
    print("Versão do Python OK.")

    # Determina os caminhos corretos para o sistema operacional
    if sys.platform == "win32":
        python_executable = os.path.join(VENV_DIR, "Scripts", "python.exe")
    else:
        python_executable = os.path.join(VENV_DIR, "bin", "python")

    # 1. Cria o ambiente virtual se não existir
    if not os.path.isdir(VENV_DIR):
        print_step(f"Criando ambiente virtual em '{VENV_DIR}'")
        run_command([sys.executable, "-m", "venv", VENV_DIR])
    else:
        print_step("Ambiente virtual já existe.")

    # 2. Instala as dependências usando o pip do venv
    print_step(f"Instalando dependências de '{REQUIREMENTS_FILE}'")
    run_command([python_executable, "-m", "pip", "install", "-r", REQUIREMENTS_FILE])
    print("Dependências instaladas com sucesso.")

    # 3. Inicia o servidor Flask em um processo separado
    print_step(f"Iniciando o servidor Flask ({FLASK_APP_FILE})")
    try:
        # Popen inicia o processo em segundo plano
        server_process = subprocess.Popen([python_executable, FLASK_APP_FILE])
        print(f"Servidor iniciado com PID: {server_process.pid}")
    except Exception as e:
        print(f"Erro ao iniciar o servidor Flask: {e}")
        sys.exit(1)

    # 4. Aguarda um pouco e abre o navegador
    print_step(f"Aguardando o servidor iniciar...")
    time.sleep(3) # Dá tempo para o Flask iniciar
    
    print_step(f"Abrindo a aplicação no navegador em {URL}")
    webbrowser.open(URL)
    
    print("\nSetup concluído! O servidor está rodando.")
    print("Para parar o servidor, feche a janela do terminal que foi aberta ou pressione Ctrl+C nesta janela.")

    # Mantém o script principal rodando para que o usuário possa parar com Ctrl+C
    try:
        server_process.wait()
    except KeyboardInterrupt:
        print("\nParando o servidor Flask...")
        server_process.terminate()
        print("Servidor parado.")

if __name__ == "__main__":
    main()