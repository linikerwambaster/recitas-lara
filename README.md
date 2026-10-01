# LP 120 Receitas na Airfryer (Lara)

Página de vendas estática com Pixel da Meta + API de Conversões, pronta para GitHub + Vercel.

## Estrutura

- `index.html`: a página. A configuração fica no topo, em `window.LP_CONFIG`.
- `privacidade.html`: política de privacidade, linkada no rodapé.
- `api/capi.js`: função da Vercel que envia os eventos para a API de Conversões.
- `assets/`: imagens otimizadas em WebP.

## 1. Cakto

Crie dois produtos novos, além do e-book de 120 receitas:

- **20 Doces na Airfryer**: R$ 6,90 (arquivo `20_Doces_na_Airfryer_Lara.pdf`)
- **45 Receitas de Almoço e Jantar**: R$ 8,90 (arquivo `45_Receitas_Almoco_e_Jantar_Lara.pdf`)

Copie os 3 links de checkout. Os order bumps ficam só no checkout do e-book de 120.

## 2. Configurar o index.html

No topo do arquivo, preencha:

```js
pixelId: "SEU_PIXEL_ID",
doces:    { ..., checkout: "LINK_CHECKOUT_DOCES" },
almoco:   { ..., checkout: "LINK_CHECKOUT_45" },
completo: { ..., checkout: "LINK_CHECKOUT_120" }
```

Nunca coloque o token da API de Conversões no index.html. Ele vai só na Vercel (passo 4).

## 3. GitHub

Crie um repositório novo e envie todos os arquivos desta pasta, mantendo as pastas `api` e `assets`.

## 4. Vercel

1. Add New > Project > importe o repositório.
2. Framework Preset: **Other**. Não precisa de build command.
3. Em Settings > Environment Variables, crie:
   - `META_PIXEL_ID`: o ID do Pixel
   - `META_ACCESS_TOKEN`: o token da API de Conversões
   - `META_TEST_EVENT_CODE`: código de teste (apague depois de validar)
   - `META_API_VERSION`: opcional, versão da Graph API (padrão v21.0)
4. Faça um novo deploy depois de criar as variáveis.

## 5. Eventos enviados

| Evento | Quando dispara |
|---|---|
| PageView | Ao abrir a página |
| ViewContent | Quando a seção de ofertas aparece na tela |
| InitiateCheckout | No clique de qualquer botão de compra, com valor e nome do produto |

Cada evento vai pelo Pixel e pela API de Conversões com o mesmo `event_id`, para a Meta desduplicar.
Os botões repassam `utm_*`, `src`, `sck` e `fbclid` para o checkout da Cakto.

O **Purchase** acontece no checkout, então configure o Pixel e a API de Conversões dentro da Cakto.

## 6. Testar

No Gerenciador de Eventos > Testar eventos, abra a página e clique em um botão. Os três eventos devem aparecer como "Navegador e servidor" e desduplicados.
