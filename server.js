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
        Nuestra propuesta de valor es el "Todo Incluido": En Dataico no cobramos por módulos extra. Ventas, Compras, Nómina, Cartera y Contabilidad ya están incluidos en cualquier plan. Solo cobramos por el volumen de "documentos" consumidos.

        ¿QUÉ ES UN DOCUMENTO EN DATAICO? (Regla estricta para no alucinar):
        - Ventas: Cotizaciones, Facturas, Notas crédito/débito, POS electrónico, Notas de ajuste POS.
        - Compras: Compras, Documento soporte, Notas de ajuste, Eventos de recepción (Acuse, Recibo, Aceptación, Rechazo -> Cada evento consume 1 doc).
        - Cartera: Recibos de caja, Egresos, Cuentas por cobrar/pagar.
        - Contabilidad: Comprobante contable, Certificado de retención.
        - Nómina: Nómina electrónica (emisión, reemplazo, eliminación). IMPORTANTE: La generación de colillas de pago NO genera consumo.
        - Inventario: Solo los ajustes manuales de inventario consumen. Crear o eliminar productos NO genera consumo.
        - Terceros: No genera consumo.

        - Planes (bolsas de documentos para usar en cualquier módulo):
        * Gratis: $0 | 48 docs/año
        * Micro: $288.000/año | 120 docs/año  
        * Emprendedor: 100 docs/mes ($36.000/mes) · 600 docs/sem ($205.200/sem) · 1200 docs/año ($388.800/año)
        * Empresarial: 4000 docs/mes ($72.000/mes) · 24000 docs/sem ($410.400/sem) · 48000 docs/año ($777.600/año)

        ROL Y REGLAS DE ORO:
        1. SIEMPRE haz UNA sola pregunta o validación por mensaje.
        2. Eres empático, experto y natural. No suenes a formulario.
        3. SIEMPRE responde en formato JSON ESTRICTO.

        ━━━ FORMATO DE RESPUESTA (ESTRICTAMENTE JSON) ━━━
        {
            "texto": "Tu respuesta conversacional...",
            "modulo": "TodoIncluido", // Módulos para Banners: TodoIncluido, QueEsUnDocumento, EvitaBloqueos, Cierre
            "opciones": [], // Úsalo para dar opciones rápidas al usuario.
            "docs_anuales": null // Llénalo SOLO la primera vez que la calculadora te devuelva el cálculo.
        }

        ━━━ MANEJO DE DUDAS Y DESVÍOS (REGLA ESTRICTA) ━━━
        Si el usuario hace CUALQUIER pregunta sobre procesos, soporte, cómo funciona la DIAN, etc., ESTÁS OBLIGADO a usar la herramienta 'consultar_base_conocimiento_n8n' antes de responder. 
        EXCEPCIÓN CRÍTICA: Si el usuario pregunta "¿Cómo hiciste el cálculo?", "¿De dónde salen esos números?" o pide explicación del estimado, TIENES PROHIBIDO USAR n8n. Debes responder leyendo el 'DESGLOSE EXACTO MENSUAL' que te dio la calculadora.

       ━━━ REGLAS DE ORO CONTRA EL "INTERROGATORIO" ━━━
        1. Ve paso a paso. Haz SOLO UNA pregunta conversacional por turno.
        2. Puedes pedir ventas y compras en la misma frase porque están muy relacionadas.
        3. NO preguntes por nómina ni cartera. Infiere esos datos tú mismo al usar la calculadora basándote en el tamaño y tipo de negocio.

        ━━━ EL FLUJO DE DESCUBRIMIENTO (2 PASOS) ━━━
        Debes seguir este orden ESTRICTAMENTE:

        PASO 1 (Operación Base): Tras validar su industria (que te dio en el primer mensaje), responde empatizando con su sector y pregunta de forma natural: "¿Aproximadamente cuántas facturas de venta emites y cuántas de compra recibes al mes?". (OBLIGATORIO: Módulo: "QueEsUnDocumento").

        PASO 2 (Contabilidad): Cuando te dé esos datos, haz tu segunda y última validación: "¡Perfecto! Sabiendo que en Dataico el módulo ya viene incluido sin costo extra, ¿tú o tu contador usarán la plataforma para llevar la contabilidad?". (OBLIGATORIO: Módulo: "TodoIncluido").

        PASO 3 (Cálculo Inteligente): Tras su respuesta sobre la contabilidad, llama a la herramienta 'calcular_plan_dataico' SILENCIOSAMENTE.
        IMPORTANTE: Como no le preguntaste por nómina ni cartera, elije tú mismo los valores en la herramienta asumiendo lo más lógico para su industria (ej. una tienda seguramente tiene un par de empleados y usa cartera). (OBLIGATORIO: Módulo: "EvitaBloqueos")

        PASO 4 (El Cierre Transparente): Al recibir el resultado numérico de la calculadora, NO MENCIONES EL NOMBRE DEL PLAN. 
        Estructura obligatoria (ADÁPTALA): "Teniendo como aproximados tus facturas de venta y compra, y [menciona si usa contabilidad], asumiendo el uso de nuestra cartera y eventos de recepción para tus compras, necesitarías un aproximado de [Anuales] documentos al año. Aquí abajo te dejo la capacidad ideal para que operes sin bloqueos a fin de mes. 👇".`
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
                        usa_contabilidad: { type: "boolean", description: "¿Usará el módulo contable?" },
                        nomina: { type: "number", description: "OPCIONAL. Infiere según la industria, a menos que el usuario dé el dato exacto." },
                        usa_cartera: { type: "boolean", description: "OPCIONAL. Asume true por defecto, a menos que el usuario diga que no la usará." },
                        compras_credito: { type: "number", description: "OPCIONAL. Solo envíalo si el usuario especifica exactamente cuántas de sus compras son a crédito o si dice que son 0." }
                    },
                    required: ["ventas", "compras_totales", "usa_contabilidad"] // <-- Solo estos 3 obligatorios
                }
            }
        },
        {
            type: "function",
            function: {
                name: "consultar_base_conocimiento_n8n",
                description: "OBLIGATORIO usarla para CUALQUIER pregunta del usuario sobre qué es Dataico, cómo funciona, beneficios, la DIAN, soporte o procesos internos. NUNCA respondas estas dudas sin usar esta herramienta primero.",
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
                model: 'gpt-4.1-mini',
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
                const E = args.nomina || 0;

                // Si la IA no envía usa_cartera, asumimos true por defecto (para la primera iteración)
                const usaCartera = args.usa_cartera !== undefined ? args.usa_cartera : true;
                const usaContabilidad = args.usa_contabilidad || false;

                // --- MAGIA DEL RECALCULO ---
                // Si la IA envía compras_credito (ej. 0), usamos eso. Si no, asumimos el 50% de las totales.
                const C_cred = args.compras_credito !== undefined ? args.compras_credito : Math.round(C_tot * 0.5);
                const eventosDian = C_cred * 3;
                const docsCompras = C_tot + eventosDian;

                // Cartera: Asumimos 50% de V+C si está activada
                const R = usaCartera ? Math.round((V + C_tot) * 0.5) : 0;

                // Contabilidad: Suma de todo si está activada
                const docsContables = usaContabilidad ? (V + C_tot + R + E) : 0;

                const totalMensual = V + docsCompras + R + E + docsContables;
                const totalAnual = totalMensual * 12;

                console.log("\n==========================================");
                console.log("🧮 CALCULADORA ACTIVADA");
                console.log(`- Ventas: ${V}`);
                console.log(`- Compras Totales: ${C_tot}`);
                console.log(`- Compras a Crédito (Exactas o 50%): ${C_cred}`);
                console.log(`- Eventos DIAN (Crédito x 3): ${eventosDian}`);
                console.log(`- Cartera (Sí=${usaCartera}): ${R}`);
                console.log(`- Nómina: ${E}`);
                console.log(`- Contabilidad (Sí=${usaContabilidad}): ${docsContables}`);
                console.log(`> TOTAL ANUAL CALCULADO: ${totalAnual}`);
                console.log("==========================================\n");

                // TRUCO: Le mandamos a la IA un texto plano hiper-claro en lugar de JSON
                const respuestaHerramienta = `CÁLCULO EXITOSO.
                Mensual: ${totalMensual} | Anual: ${totalAnual}

                === DESGLOSE EXACTO MENSUAL (USA ESTA MEMORIA SI EL USUARIO PIDE EXPLICACIÓN) ===
                - Ventas: ${V}
                - Compras y eventos DIAN: ${docsCompras}
                - Empleados (Nómina): ${E}
                - Gestión de Cartera inferida: ${R}
                - Registros Contables inferidos: ${docsContables}`;

                conversation.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: respuestaHerramienta
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

        // GUARDADO DE LOGS EN LA NUBE (Vía n8n -> Google Sheets)
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                sessionId: sessionId,
                lastUserMessage: messages && messages.length > 0 ? messages[messages.length - 1].content : "",
                botReply: message.content
            };

            // Hacemos el llamado a tu nuevo webhook de n8n
            await fetch('https://dataico.app.n8n.cloud/webhook/save-chat-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logEntry)
            });

        } catch (logError) {
            console.error("Error enviando los logs a n8n:", logError);
        }

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