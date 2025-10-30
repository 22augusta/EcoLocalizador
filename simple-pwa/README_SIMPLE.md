# Simple PWA — Geo + Camera

Projeto mínimo demonstrando um PWA que usa hardware (geolocalização + câmera) e consome API pública (Overpass / OpenStreetMap) para buscar estações de carregamento.

Como testar localmente:

1. Inicie um servidor estático na raiz do repositório:

```bash
python3 -m http.server 8000
```

2. Abra no navegador:

http://localhost:8000/simple-pwa/

3. Permita permissões quando solicitado (geolocalização e câmera).

Observações sobre a API usada
- Agora o app usa a Overpass API (OpenStreetMap) para buscar POIs (estações de carregamento). A Overpass não requer chave, mas tem limites de uso; para produção considere cache ou proxy.


Notas:
- Manifest e Service Worker já inclusos.
- Para validação PWA use o URL hospedado (https) ou localhost. Para produção hospede em Vercel/Netlify.
