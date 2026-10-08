// Função da Vercel: recebe eventos da LP e envia para a API de Conversões da Meta.
// Variáveis de ambiente (configure na Vercel em Settings > Environment Variables):
//   META_PIXEL_ID        ID do Pixel (o mesmo do index.html)
//   META_ACCESS_TOKEN    Token da API de Conversões (gerado no Gerenciador de Eventos)
//   META_TEST_EVENT_CODE Opcional. Código de teste, só enquanto estiver testando
//   META_API_VERSION     Opcional. Versão da Graph API (padrão: v21.0)

const PERMITIDOS = ["PageView", "ViewContent", "InitiateCheckout"];

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, erro: "Use POST" });

  const pixel = process.env.META_PIXEL_ID;
  const token = process.env.META_ACCESS_TOKEN;
  if (!pixel || !token) return res.status(200).json({ ok: false, erro: "Pixel ou token não configurados" });

  let b = req.body;
  try { if (typeof b === "string") b = JSON.parse(b); } catch (e) { b = null; }
  if (!b || !PERMITIDOS.includes(b.event_name)) return res.status(400).json({ ok: false, erro: "Evento inválido" });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "";
  const user_data = { client_ip_address: ip, client_user_agent: req.headers["user-agent"] || "" };
  if (b.fbp) user_data.fbp = b.fbp;
  if (b.fbc) user_data.fbc = b.fbc;

  const payload = {
    data: [{
      event_name: b.event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: String(b.event_id || ""),
      action_source: "website",
      event_source_url: b.event_source_url || "",
      user_data,
      custom_data: b.custom_data || {}
    }]
  };
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;

  const versao = process.env.META_API_VERSION || "v21.0";
  try {
    const r = await fetch(`https://graph.facebook.com/${versao}/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const j = await r.json();
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, meta: j });
  } catch (e) {
    return res.status(502).json({ ok: false, erro: "Falha ao enviar para a Meta" });
  }
};
