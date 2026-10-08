# Workshop de Automação com Python 🐍

Site de apresentação do workshop da **Jornada Interdisciplinar**: palestra + práticas guiadas de automação com Python.

## Como apresentar

| Tecla | Ação |
|---|---|
| `→` `↓` `PageDown` `Espaço` | Próximo slide (funciona com passador de slides) |
| `←` `↑` `PageUp` | Slide anterior |
| `Home` / `End` | Primeiro / último slide |
| `F` | Tela cheia |

Demos interativas:
- **Gancho:** clique nos cartões para contar as mãos levantadas (botão direito zera)
- **Organizador:** clique em `▶ py organizador.py`. Os arquivos podem ser arrastados
- **Certificados:** clique em `▶ Gerar certificados` e depois num certificado para ver o PDF real

## Como editar

| Quero mudar... | Onde |
|---|---|
| Textos de qualquer slide | `index.html` (cada slide é uma `<section class="slide">`) |
| Adicionar um slide | Copie uma `<section class="slide" data-titulo="...">` inteira no `index.html` |
| Cores do site | Variáveis no topo do `css/style.css` (`:root`) |
| Cursos e exemplos do slide 5 | `index.html`, slide "Serve para o seu curso também" |
| Planilha da demo, pastas do organizador, código digitado, palavras do final | `js/main.js`, trechos marcados com **PARA EDITAR** |
| Memoji, estrela e favicon | `assets/memoji.png`, `assets/estrela.png`, `assets/favicon.png` |

Os três arquivos têm comentários explicando cada parte.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie estes arquivos
2. Vá em **Settings → Pages**
3. Em *Source*, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`
4. Em alguns minutos o site fica disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

## Rodar localmente (sem internet)

Funciona abrindo o `index.html` direto no navegador. Sem internet, só as fontes e o QR code ficam de fora.

## Estrutura

```
index.html                 página com todos os slides
css/style.css              visual e animações
js/main.js                 navegação, efeitos e demos interativas
assets/                    imagens reais geradas pelos scripts do workshop
material/                  material_alunos.zip (para download)
```
