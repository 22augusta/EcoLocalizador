## 🌱 EcoLocalizador

**EcoLocalizador** é um aplicativo mobile progressivo (PWA) que ajuda usuários a encontrar estações de carregamento de veículos elétricos próximas, utilizando geolocalização e uma API pública.

---
````markdown
## 🌱 EcoLocalizador

**EcoLocalizador** é um aplicativo mobile progressivo (PWA) que ajuda usuários a encontrar estações de carregamento de veículos elétricos próximas, utilizando geolocalização e a API pública Open Charge Map.

---

### 📦 Funcionalidades

- ✅ Aplicativo PWA (instalável via navegador)
- 📍 Uso de geolocalização via hardware do dispositivo
- 🔌 Consumo da API pública https://openchargemap.org/
- 🗺️ Exibição de resultados com mapa (Leaflet) e lista de estações
- 📶 Funciona offline com cache básico via Service Worker

---

### 🚀 Como rodar o projeto

1. Clone o repositório:
  ```bash
  git clone https://github.com/seu-usuario/eco-localizador.git
  cd eco-localizador
  ```

2. Hospede os arquivos em um servidor HTTPS (ex: Vercel, Netlify ou GitHub Pages).

  Observação: para testes locais o Service Worker funciona em http://localhost:8000 sem HTTPS.

3. Acesse a URL no navegador e instale como app.

---

### 🧪 Teste como PWA

- Acesse [https://www.pwabuilder.com/](https://www.pwabuilder.com/)
- Cole a URL do seu app hospedado
- Verifique os requisitos:
  - Manifesto válido
  - Service Worker ativo
  - HTTPS (em produção)
  - Responsividade

---

### 🛠️ Tecnologias usadas

- HTML, CSS, JavaScript
- API Open Charge Map
- Geolocation API
- Leaflet (mapa)
- Service Worker

---

### 📁 Estrutura do projeto

```
eco-localizador/
├── index.html
├── app.js
├── styles.css
├── manifest.json
├── service-worker.js
├── offline.html
├── icon-192.svg
├── icon-512.svg
```

---

### 📌 Observações

- Este projeto **não é um app de clima**, conforme exigência da atividade.
- A API usada é gratuita e não requer autenticação para uso básico.

---

### Mudanças implementadas nesta sessão

- Adicionado `index.html` com mapa (Leaflet) e controle de localização.
- `app.js` agora registra o Service Worker, trata erros e mostra resultados no mapa.
- `service-worker.js` atualizado com cache versionado, fallback `offline.html` e estratégia network-first para a API.
- Ícones SVG placeholder adicionados (`icon-192.svg`, `icon-512.svg`).

### Teste rápido local

1. Inicie um servidor estático no diretório do projeto:

```bash
# exemplo usando python
python3 -m http.server 8000
```

2. Abra http://localhost:8000 no navegador (ou hospede em HTTPS) e clique em "Buscar minha localização". Verifique permissões de geolocalização.

````

