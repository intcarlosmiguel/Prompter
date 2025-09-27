# Assistente de Prompt P.R.O.M.P.T.

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

Este projeto é uma aplicação web construída com Flask, projetada para resolver um desafio central na era da IA generativa: a criação de prompts eficazes, estruturados e consistentes. A ferramenta implementa a metodologia **P.R.O.M.P.T.**, transformando o processo de escrita de comandos em uma disciplina de engenharia, em vez de um exercício de adivinhação.

A aplicação oferece uma interface limpa e intuitiva que guia o usuário através de cada componente essencial de um prompt de alta qualidade, gerando um resultado final pronto para ser utilizado em qualquer modelo de linguagem.

<!-- Adicione aqui um screenshot da sua aplicação em funcionamento! -->
<!-- Exemplo: ![Screenshot da Aplicação](caminho/para/sua/imagem.png) -->

## 🎯 Principais Ideias e Funcionalidades

O objetivo principal é fornecer uma estrutura robusta que maximize a precisão e a relevância das respostas da IA. Isso é alcançado através de:

*   **Interface Estruturada:** A UI é dividida com base na metodologia P.R.O.M.P.T., garantindo que nenhum aspecto crítico do comando seja esquecido.
*   **Geração em Tempo Real:** Conforme o usuário preenche os campos, uma pré-visualização do prompt final é montada instantaneamente, oferecendo feedback imediato.
*   **Gerenciamento de Presets:** Para agilizar o fluxo de trabalho, o usuário pode salvar, carregar e excluir `presets` (trechos de texto pré-definidos) para os campos de Resultado, Orquestração, Perímetro e Tom.
*   **Inclusão de Contexto Dinâmico:** A aplicação lê automaticamente arquivos de um diretório `/files`, permitindo que o usuário anexe facilmente contextos (como trechos de código, documentos, etc.) ao prompt final com um simples clique.
*   **Design Funcional:** A interface, com o tema "Deep Focus", foi projetada para ser agradável e funcional, com foco na usabilidade e na clareza das informações.

### A Metodologia P.R.O.M.P.T.

O coração da ferramenta é a sua estrutura, que se baseia no seguinte acrônimo:

*   **P - Persona:** Define o papel que a IA deve assumir.
*   **R - Resultado:** Especifica o objetivo final, o que se espera como entrega.
*   **O - Orquestração:** Descreve o processo e os passos que a IA deve seguir.
*   **M - Mensagem:** Fornece o contexto, dados e exemplos necessários.
*   **P - Perímetro:** Estabelece as restrições, regras e o que deve ser evitado.
*   **T - Tom:** Determina o estilo de comunicação e a voz da IA.

## 🛠️ Tecnologias Utilizadas

*   **Backend:** Flask (Python)
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
*   **Servidor de Desenvolvimento:** Werkzeug (padrão do Flask)

## 🚀 Como Executar o Projeto

Para colocar a aplicação em funcionamento localmente, siga estes passos:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio
    ```

2.  **Crie e ative um ambiente virtual (recomendado):**
    ```bash
    # Para Windows
    python -m venv venv
    .\venv\Scripts\activate

    # Para macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **(Opcional) Adicione arquivos de contexto:**
    Crie uma pasta chamada `files` na raiz do projeto e adicione arquivos `.txt`, `.py`, `.md`, etc. que você queira usar como contexto em seus prompts.

5.  **Execute a aplicação:**
    ```bash
    python app.py
    ```

6.  Abra seu navegador e acesse `http://127.0.0.1:5000`.

## 📂 Estrutura do Projeto

```
|-- README.md           # Este arquivo
|-- app.py              # Lógica principal do backend Flask (rotas, API de presets)
|-- requirements.txt    # Dependências do Python
|-- .gitattributes      # Atributos do Git
|-- static              # Arquivos estáticos (CSS, JS)
|   |-- css/style.css   # Folha de estilos principal
|   |-- js/main.js      # Lógica do frontend (geração de preview, presets, etc.)
|-- templates
|   |-- index.html      # Estrutura HTML da página principal
|-- .gitignore          # Arquivos e pastas a serem ignorados pelo Git
|-- directory.py        # (Arquivo não utilizado pela aplicação principal, pode conter scripts auxiliares)
|-- ropt_presets.json   # (Será criado automaticamente) Armazena os presets salvos pelo usuário
|-- files/              # (Opcional, crie esta pasta) Local para os arquivos de contexto
```

## 🏁 Conclusão

A grande conclusão deste trabalho é que a qualidade da interação com modelos de linguagem generativa não precisa ser um processo de tentativa e erro. Ao aplicar uma metodologia estruturada como a **P.R.O.M.P.T.**, é possível obter resultados drasticamente melhores, mais rápidos e mais consistentes.

Esta ferramenta serve como uma prova de conceito funcional, demonstrando como uma simples aplicação web pode transformar a "arte" de criar prompts em uma **disciplina de engenharia replicável**, economizando tempo e aumentando a produtividade de desenvolvedores, criadores de conteúdo e qualquer pessoa que utilize IA em seu dia a dia.

---

### Dicas Adicionais para Você (de especialista para iniciante):

1.  **Adicione um Screenshot:** A parte `<!-- Adicione aqui um screenshot... -->` é um lembrete. Uma imagem vale mais que mil palavras. Tire um print da sua aplicação funcionando e adicione ao `README`. Isso aumenta muito o engajamento.
2.  **Considere um GIF:** Para mostrar a interatividade (como a pré-visualização em tempo real e o sistema de presets), um GIF curto é ainda mais poderoso.
3.  **Licença:** É uma boa prática adicionar uma seção de Licença no final (por exemplo, `## 📜 Licença` e `Este projeto está sob a licença MIT.`). Isso diz aos outros como eles podem usar seu código.

Parabéns pelo excelente trabalho! É um projeto muito relevante e bem executado. Se tiver mais alguma dúvida, estou à disposição.