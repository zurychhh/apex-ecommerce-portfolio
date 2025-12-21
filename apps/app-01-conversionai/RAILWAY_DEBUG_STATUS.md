# Railway Deployment Debug Status
**Data:** 2025-12-20
**Status:** WORKING

---

## ROZWIĄZANY PROBLEM

Deployment crashował z błędem:
```
Error: listen EADDRNOTAVAIL: address not available 66.33.22.47:8080
```

**Przyczyna:** Zmienna `HOST` była ustawiona na `conversionai-web-production.up.railway.app`. Remix-serve próbował zresolwować hostname przez DNS i bindować serwer na tym zewnętrznym IP, które nie było dostępne w kontenerze.

**Rozwiązanie:** Zmieniono `HOST` na `0.0.0.0` - serwer teraz poprawnie nasłuchuje na wszystkich interfejsach.

---

## RAILWAY API - DZIAŁAJĄCY TOKEN

```bash
# Ten token działa przez API (nie przez CLI!)
RAILWAY_TOKEN="d89e435b-d16d-4614-aa16-6b63cf54e86b"

# Przykład użycia:
curl -s -X POST "https://backboard.railway.app/graphql/v2" \
  -H "Authorization: Bearer d89e435b-d16d-4614-aa16-6b63cf54e86b" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{me{id email}}"}'
```

---

## RAILWAY PROJECT IDS

| Nazwa | ID |
|-------|-----|
| Project | `c1ad5a4a-a4ff-4698-bf0f-e1f950623869` |
| Environment (production) | `6fd2892b-9846-4e7b-bf9a-dafef8bc1c4e` |
| Service (conversionai-web) | `08837d5d-0ed5-4332-882e-51d00b61eee6` |
| Service (postgres) | `7ea07ba1-13ee-4da6-8344-8b8e75477eb9` |
| Service (redis) | `3a2363c9-1f26-4819-99fb-66cc36699ad8` |

---

## AKTUALNE ZMIENNE ŚRODOWISKOWE (Railway) - POPRAWNE

- `DATABASE_URL` = postgresql://conversionai:secure2025pass@turntable.proxy.rlwy.net:50904/conversionai
- `REDIS_URL` = redis://mainline.proxy.rlwy.net:43368
- `SHOPIFY_API_KEY` = 30c5af756ea767c28f82092b98ffc9e1
- `SHOPIFY_API_SECRET` = [REDACTED - see Railway env vars]
- `SHOPIFY_APP_URL` = https://conversionai-web-production.up.railway.app
- `HOST` = 0.0.0.0 (NAPRAWIONE!)
- `ANTHROPIC_API_KEY` = sk-ant-api03-...
- `RESEND_API_KEY` = re_GBTvPDNw_...

---

## KOMENDY API DO UŻYCIA

### Pobierz zmienne środowiskowe:
```bash
cat > /tmp/railway_query.json << 'EOFQ'
{"query":"query { variables(projectId: \"c1ad5a4a-a4ff-4698-bf0f-e1f950623869\", environmentId: \"6fd2892b-9846-4e7b-bf9a-dafef8bc1c4e\", serviceId: \"08837d5d-0ed5-4332-882e-51d00b61eee6\") }"}
EOFQ
curl -s -X POST "https://backboard.railway.app/graphql/v2" \
  -H "Authorization: Bearer d89e435b-d16d-4614-aa16-6b63cf54e86b" \
  -H "Content-Type: application/json" \
  -d @/tmp/railway_query.json
```

### Ustaw zmienną środowiskową:
```bash
cat > /tmp/railway_mutation.json << 'EOFQ'
{"query":"mutation { variableUpsert(input: { projectId: \"c1ad5a4a-a4ff-4698-bf0f-e1f950623869\", environmentId: \"6fd2892b-9846-4e7b-bf9a-dafef8bc1c4e\", serviceId: \"08837d5d-0ed5-4332-882e-51d00b61eee6\", name: \"NAZWA_ZMIENNEJ\", value: \"WARTOSC\" }) }"}
EOFQ
curl -s -X POST "https://backboard.railway.app/graphql/v2" \
  -H "Authorization: Bearer d89e435b-d16d-4614-aa16-6b63cf54e86b" \
  -H "Content-Type: application/json" \
  -d @/tmp/railway_mutation.json
```

### Trigger redeploy:
```bash
cat > /tmp/railway_mutation.json << 'EOFQ'
{"query":"mutation { serviceInstanceRedeploy(environmentId: \"6fd2892b-9846-4e7b-bf9a-dafef8bc1c4e\", serviceId: \"08837d5d-0ed5-4332-882e-51d00b61eee6\") }"}
EOFQ
curl -s -X POST "https://backboard.railway.app/graphql/v2" \
  -H "Authorization: Bearer d89e435b-d16d-4614-aa16-6b63cf54e86b" \
  -H "Content-Type: application/json" \
  -d @/tmp/railway_mutation.json
```

### Sprawdź status deploymentu:
```bash
cat > /tmp/railway_query.json << 'EOFQ'
{"query":"query { deployments(first: 1, input: { projectId: \"c1ad5a4a-a4ff-4698-bf0f-e1f950623869\", serviceId: \"08837d5d-0ed5-4332-882e-51d00b61eee6\" }) { edges { node { id status createdAt } } } }"}
EOFQ
curl -s -X POST "https://backboard.railway.app/graphql/v2" \
  -H "Authorization: Bearer d89e435b-d16d-4614-aa16-6b63cf54e86b" \
  -H "Content-Type: application/json" \
  -d @/tmp/railway_query.json
```

### Pobierz logi:
```bash
cat > /tmp/railway_logs.json << 'EOFQ'
{"query":"query { deploymentLogs(deploymentId: \"DEPLOYMENT_ID\", limit: 50) { message severity timestamp } }"}
EOFQ
curl -s -X POST "https://backboard.railway.app/graphql/v2" \
  -H "Authorization: Bearer d89e435b-d16d-4614-aa16-6b63cf54e86b" \
  -H "Content-Type: application/json" \
  -d @/tmp/railway_logs.json | jq -r '.data.deploymentLogs[] | "\(.timestamp) [\(.severity)] \(.message)"'
```

---

## NOTATKI

- Railway CLI nie działa z tokenem (wymaga zaszyfrowanego formatu) - używaj tylko API przez curl
- PostgreSQL, Redis już istnieją w projekcie
- Wszystkie env vars są ustawione poprawnie
- Aplikacja działa i zwraca 302 (redirect na Shopify OAuth)
- Ostrzeżenia o MODULE_TYPELESS_PACKAGE_JSON można zignorować (lub dodać "type": "module" do package.json)
