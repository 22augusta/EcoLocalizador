## 🌱 EcoLocalizador

**EcoLocalizador** é um aplicativo mobile progressivo (PWA) que ajuda usuários a encontrar estações de carregamento de veículos elétricos próximas, utilizando geolocalização e uma API pública.

---

### 📦 Funcionalidades

- ✅ Aplicativo PWA (instalável via navegador)
- 📍 Uso de geolocalização via hardware do dispositivo
- 🔌 Consumo da API pública https://openchargemap.org/
- 🗺️ Exibição de resultados com nome e endereço das estações
- 📶 Funciona offline com cache básico via Service Worker

---

### 🚀 Como rodar o projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/eco-localizador.git
   cd eco-localizador
   ```

2. Hospede os arquivos em um servidor HTTPS (ex: Vercel, Netlify ou GitHub Pages).

3. Acesse a URL no navegador e instale como app.

---

### 🧪 Teste como PWA

- Acesse [https://www.pwabuilder.com/](https://www.pwabuilder.com/)
- Cole a URL do seu app hospedado
- Verifique os requisitos:
  - Manifesto válido
  - Service Worker ativo
  - HTTPS
  - Responsividade

---

### 🛠️ Tecnologias usadas

- HTML, CSS, JavaScript
- API Open Charge Map
- Geolocation API
- PWA Builder
- Service Worker

---

### 📁 Estrutura do projeto

```
eco-localizador/
├── index.html
├── app.js
├── style.css
├── manifest.json
├── service-worker.js
```

---

### 📌 Observações

- Este projeto **não é um app de clima**, conforme exigência da atividade.
- A API usada é gratuita e não requer autenticação para uso básico.

