const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Utilidad para reintentos automáticos (SOLO para OpenAI)
async function fetchConReintento(url, options, maxRetries = 2, delay = 1000) {
    for (let i = 0; i <= maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorData}`);
            }
            return response;
        } catch (error) {
            if (i === maxRetries) throw error;
            console.log(`⚠️ Reintentando OpenAI... (${i + 1}/${maxRetries}) debido a: ${error.message}`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

// Ruta para servir el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    const { sessionId, messages } = req.body;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: "Falta la API Key en el archivo .env" });
    }

    const systemPrompt = {
        role: "system",
        content: `CONTEXTO DATAICO Y CONOCIMIENTO:
        Eres un Asesor Consultivo de Customer Success de Dataico. Usas un tono empático, cercano y profesional. Usa siempre el "tú" para el usuario y "nosotros" para la marca. Prohibido el "usted".
        - Planes (incluyen TODOS los módulos):
        * Gratis: $0 | 48 docs/año
        * Micro: $288.000/año | 120 docs/año  
        * Emprendedor: 100 docs/mes ($36.000/mes) · 600 docs/sem ($205.200/sem) · 1200 docs/año ($388.800/año)
        * Empresarial: 4000 docs/mes ($72.000/mes) · 24000 docs/sem ($410.400/sem) · 48000 docs/año ($777.600/año)

        ROL Y REGLAS DE ORO:
        1. SIEMPRE haz UNA sola pregunta por mensaje.
        2. Eres empático, experto y natural. No suenes a formulario.
        3. SIEMPRE responde en formato JSON ESTRICTO.

        ━━━ FORMATO DE RESPUESTA (ESTRICTAMENTE JSON) ━━━
        {
            "texto": "Tu respuesta conversacional y tu pregunta...",
            "modulo": "Industria", // Módulos: Industria, Ventas, Compras, Cartera, Inventario, Nomina, Contabilidad, Cierre
            "opciones": [], // Úsalo SOLO para rangos numéricos o un Sí/No. Si el usuario hace una pregunta abierta, déjalo vacío [].
            "docs_anuales": null // Llénalo SOLO la primera vez que la herramienta te devuelva el cálculo.
        }

        ━━━ MANEJO DE DUDAS Y DESVÍOS ━━━
        Si el usuario hace una pregunta técnica, sobre cómo pagar un plan, métodos de pago, o cualquier proceso interno u operativo de Dataico o la DIAN, usa SIEMPRE 'consultar_base_conocimiento_n8n'. Responde la duda con esa información y luego retoma sutilmente la recolección de datos.

        ━━━ FLUJO DE DESCUBRIMIENTO MEJORADO ━━━
        Importante mencionar al inicio que le haras unas preguntas que no necesitas el valor exacto sino aproximados para poder determinar el plan ideal para su empresa.
        1. Industria (¿A qué se dedica tu empresa?).
        2. Ventas (¿Aproximadamente cuántas facturas emites al mes?).
        3. Compras: ¿Registras facturas de compra que te emiten los proveedores? 
        -> Si dice que Sí: Pregunta aproximadamente cuántas facturas de compra recibes al mes, y de esas, cuántas son a crédito. (OBLIGATORIO: Explícale muy brevemente que las compras a crédito requieren generar eventos de recepción para poder deducir costos ante la DIAN).
        4. Cartera: ¿Te gustaría usar el módulo de Cartera para gestionar cobros a clientes y pagos a proveedores? (Sí/No).
        5. Inventario: (Solo si aplica) ¿Necesitas gestionar control de inventario? (Sí/No).
        6. Nómina (¿Empleados?).
        7. Contabilidad (¿Usarías contabilidad en Dataico?).

        ━━━ USO DE CALCULADORA Y CIERRE ━━━
        1. Con datos suficientes, llama a 'calcular_plan_dataico'.
        2. Al recibir el resultado, tu PRIMER JSON debe ser:
        - "modulo": "Cierre"
        - "texto": "Resume la operación. OBLIGATORIO: Menciona explícitamente el estimado de documentos al mes y al año."
        - "opciones": ["¡Quiero este plan!", "Tengo una duda", "Comparar planes"]
        - "docs_anuales": [NÚMERO EXACTO DEVUELTO POR LA HERRAMIENTA]
        3. SI EL USUARIO HACE PREGUNTAS LUEGO DE VER EL PLAN:
        - Responde amablemente y DEJA "docs_anuales": null (para que no se repitan las tarjetas visuales).
        - Si CAMBIA algún dato (ej. decide agregar contabilidad o cambiar número de ventas), vuelve a llamar a la calculadora y pon el NUEVO número en "docs_anuales".`
    };

    const tools = [
        {
            type: "function",
            function: {
                name: "calcular_plan_dataico",
                description: "Calcula el total de documentos anuales basado en la operación del usuario.",
                parameters: {
                    type: "object",
                    properties: {
                        ventas: { type: "number", description: "Facturas de venta al mes" },
                        compras_totales: { type: "number", description: "Total de facturas de compra al mes" },
                        compras_credito: { type: "number", description: "De las compras totales, cuántas son a crédito" },
                        usa_cartera: { type: "boolean", description: "¿Usará el módulo de cartera?" },
                        usa_inventario: { type: "boolean", description: "¿Usará control de inventario?" },
                        nomina: { type: "number", description: "Número de empleados" },
                        usa_contabilidad: { type: "boolean", description: "¿Usará contabilidad?" }
                    },
                    required: ["ventas", "compras_totales", "compras_credito", "usa_cartera", "usa_inventario", "nomina", "usa_contabilidad"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "consultar_base_conocimiento_n8n",
                description: "Úsala para dudas técnicas de la plataforma o DIAN.",
                parameters: {
                    type: "object",
                    properties: {
                        pregunta_del_usuario: { type: "string", description: "La pregunta del usuario" }
                    },
                    required: ["pregunta_del_usuario"]
                }
            }
        }
    ];

    try {
        let conversation = [systemPrompt, ...messages];

        // --- LLAMADA 1 A OPENAI CON RETRY ---
        let response = await fetchConReintento('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: conversation,
                tools: tools,
                tool_choice: "auto",
                response_format: { type: "json_object" },
                temperature: 0.2
            })
        });

        let data = await response.json();
        if (data.error) return res.status(500).json({ error: data.error.message });

        let message = data.choices[0].message;

        if (message.tool_calls) {
            const toolCall = message.tool_calls[0];
            const args = JSON.parse(toolCall.function.arguments);

            conversation.push(message);

            // CONDICIONAL 1: CALCULADORA Y LÓGICA INFERIDA ORIGINAL
            if (toolCall.function.name === "calcular_plan_dataico") {
                const V = args.ventas || 0;
                const C_tot = args.compras_totales || 0;
                const C_cred = args.compras_credito || 0;
                const E = args.nomina || 0;

                const usaCartera = args.usa_cartera || false;
                const usaInventario = args.usa_inventario || false;
                const usaContabilidad = args.usa_contabilidad || false;

                const R = usaCartera ? (V + C_tot) : 0;
                const I = usaInventario ? (V + C_tot) : 0;
                let docsContables = usaContabilidad ? (V + C_tot + R + E) : 0;
                const docsCompras = C_tot + (C_cred * 3);

                const totalMensual = V + docsCompras + R + I + E + docsContables;
                const totalAnual = totalMensual * 12;

                console.log("\n==========================================");
                console.log("🧮 CALCULADORA ACTIVADA (LÓGICA INFERIDA)");
                console.log(`- Ventas: ${V}`);
                console.log(`- Compras Totales: ${C_tot}`);
                console.log(`- Eventos DIAN (Crédito): ${C_cred * 3}`);
                console.log(`- Cartera Inferida (Sí=${usaCartera}): ${R}`);
                console.log(`- Inventario Inferido (Sí=${usaInventario}): ${I}`);
                console.log(`- Nómina: ${E}`);
                console.log(`- Contabilidad (Sí=${usaContabilidad}): ${docsContables}`);
                console.log(`> TOTAL MENSUAL: ${totalMensual}`);
                console.log(`> TOTAL ANUAL CALCULADO: ${totalAnual}`);
                console.log("==========================================\n");

                conversation.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: JSON.stringify({ docs_mensuales: totalMensual, docs_anuales: totalAnual })
                });
            }
            // CONDICIONAL 2: LLAMADA A N8N ORIGINAL
            else if (toolCall.function.name === "consultar_base_conocimiento_n8n") {
                console.log("\n==========================================");
                console.log("🤖 LLAMANDO A N8N PARA RESOLVER DUDA TÉCNICA");
                console.log("Pregunta:", args.pregunta_del_usuario);
                console.log("==========================================\n");
                try {
                    const n8nResponse = await fetch('https://dataico.app.n8n.cloud/webhook/customer-success', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pregunta: args.pregunta_del_usuario })
                    });
                    const n8nData = await n8nResponse.text();
                    conversation.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: toolCall.function.name,
                        content: n8nData
                    });
                } catch (e) {
                    console.error("Error n8n:", e);
                    conversation.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: toolCall.function.name,
                        content: "Hubo un error de conexión con la base de conocimiento."
                    });
                }
            }

            // --- LLAMADA 2 A OPENAI CON RETRY ---
            response = await fetchConReintento('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: conversation,
                    response_format: { type: "json_object" },
                    temperature: 0.2
                })
            });

            data = await response.json();
            message = data.choices[0].message;
        }

        // GUARDADO DE LOGS SEGURO
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                sessionId: sessionId,
                lastUserMessage: messages && messages.length > 0 ? messages[messages.length - 1].content : "",
                botReply: message.content
            };
            fs.appendFileSync('chat_logs.txt', JSON.stringify(logEntry) + '\n');
        } catch (logError) { }

        res.json({ reply: message.content });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al conectar con la IA. Por favor intenta de nuevo.' });
    }
});

// ADAPTACIÓN FINAL PARA VERCEL
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Asesor corriendo en: http://localhost:${PORT}`));
}
module.exports = app;