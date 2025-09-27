import os

IGNORAR = {"venv", "files",".git"}  # pastas a ignorar

def listar_diretorio(caminho, nivel=0):
    prefixo = "    " * nivel + "|-- "
    try:
        for item in os.listdir(caminho):
            if item in IGNORAR:
                continue  # ignora a pasta
            item_path = os.path.join(caminho, item)
            print(prefixo + item)
            if os.path.isdir(item_path):
                listar_diretorio(item_path, nivel + 1)
    except PermissionError:
        print(prefixo + "[Acesso Negado]")

if __name__ == "__main__":
    diretorio_atual = os.getcwd()
    listar_diretorio(diretorio_atual)
