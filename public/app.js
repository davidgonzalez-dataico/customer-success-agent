const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Generamos un ID único para esta conversación
const sessionId = "sesion_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
let chatHistory = [];
let lastRenderedDocs = null; // Memoria para no repetir tarjetas

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addMessage(text, isBot) {
    let formattedText = text.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');

    // Aplicamos font-sans text-[14px] para el cuerpo del chat
    const html = `
        <div class="flex gap-3 w-full msg-enter ${isBot ? 'justify-start' : 'justify-end'}">
            ${isBot ? '<div class="w-8 h-8 rounded-full bg-[#ED5650] text-white flex-shrink-0 flex items-center justify-center font-body font-bold text-[12px] mt-1 shadow-sm tracking-wider">AI</div>' : ''}
            <div class="${isBot ? 'bot-bubble max-w-[85%] md:max-w-[80%]' : 'user-bubble max-w-[85%] md:max-w-[80%]'} font-sans text-[14px] leading-relaxed">
                ${formattedText}
            </div>
            ${!isBot ? '<div class="w-8 h-8 rounded-full bg-[#333333] text-white flex-shrink-0 flex items-center justify-center font-body text-[12px] mt-1 shadow-sm"><span class="material-symbols-outlined text-[16px]">person</span></div>' : ''}
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function showLoading() {
    const id = 'loading-' + Date.now();
    // Puntos de carga usando el color Warning del SD
    const html = `
        <div id="${id}" class="flex gap-3 w-full msg-enter justify-start">
            <div class="w-8 h-8 rounded-full bg-[#ED5650] text-white flex-shrink-0 flex items-center justify-center font-body font-bold text-[12px] pt-1 shadow-sm tracking-wider">AI</div>
            <div class="bot-bubble flex items-center gap-2 py-[16px] px-[24px]">
                <div class="w-2.5 h-2.5 bg-[#F39C12] rounded-full animate-bounce"></div>
                <div class="w-2.5 h-2.5 bg-[#F39C12] rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2.5 h-2.5 bg-[#F39C12] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
    return id;
}

function renderQuickReplies(options) {
    const id = 'qr-' + Date.now();
    // Pill buttons alineados al SD: redondeo 200px, fuente body medium, bordes tenues
    let buttonsHtml = options.map(opt =>
        `<button class="hover:bg-[#ED5650]/10 hover:text-[#ED5650] hover:border-[#ED5650] transition-colors bg-[#FFFFFF] border border-gray-200 text-[#3C3C3C] px-5 py-2.5 rounded-[200px] font-sans text-[14px] font-medium shadow-sm">${opt}</button>`
    ).join('');

    const html = `
        <div id="${id}" class="flex gap-2 w-full msg-enter justify-start pl-11 flex-wrap mt-2 mb-6">
            ${buttonsHtml}
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', html);
    scrollToBottom();

    const container = document.getElementById(id);
    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            container.remove();
            sendMessage(btn.textContent);
        });
    });
}

// Tarjetas finales con 2 planes y contraste dinámico
function renderFinalCards(docsAnuales) {
    let recPlan, docsTag, prices = [], altPlan, altTag, altPrice, altDesc;

    // Lógica estricta de asignación
    if (docsAnuales <= 48) {
        recPlan = "Plan Gratis"; docsTag = "Hasta 4 documentos al mes";
        prices = [{ label: "Mensual", price: "$0 COP", isRec: true }];
        altPlan = "Plan Micro"; altTag = "120 docs/año"; altPrice = "$288.000 COP / año";
        altDesc = "Si proyectas crecer pronto, esta es tu siguiente mejor opción.";
    } else if (docsAnuales <= 120) {
        recPlan = "Plan Micro"; docsTag = "Bolsa de 120 documentos anuales";
        prices = [{ label: "Anual", price: "$288.000 COP", isRec: true }];
        altPlan = "Plan Emprendedor"; altTag = "1.200 docs/año"; altPrice = "Desde $36.000 / mes";
        altDesc = "Si quieres tener más holgura para escalar, explora este plan.";
    } else if (docsAnuales <= 1200) {
        recPlan = "Plan Emprendedor"; docsTag = "Bolsa de 1.200 documentos anuales";
        prices = [
            { label: "Mensual", price: "$36.000 COP", isRec: false },
            { label: "Semestral", price: "$205.200 COP", isRec: false, note: "Ahorras un 5%" },
            { label: "Anual", price: "$388.800 COP", isRec: true, note: "Ahorras un 10%" }
        ];
        altPlan = "Plan Empresarial"; altTag = "48.000 docs/año"; altPrice = "Desde $72.000 / mes";
        altDesc = "Si prefieres tener capacidad de sobra para crecer sin límites, esta es tu opción.";
    } else {
        // Operaciones grandes (Recomienda Empresarial, descarta Emprendedor)
        recPlan = "Plan Empresarial"; docsTag = "Bolsa de 48.000 documentos anuales";
        prices = [
            { label: "Mensual", price: "$72.000 COP", isRec: false },
            { label: "Semestral", price: "$410.400 COP", isRec: false, note: "Ahorras un 5%" },
            { label: "Anual", price: "$777.600 COP", isRec: true, note: "Ahorras un 10%" }
        ];
        altPlan = "Plan Emprendedor"; altTag = "1.200 docs/año"; altPrice = "$388.800 COP / año";
        // Aquí hacemos el contraste que pediste:
        altDesc = "<span class='text-red-500 font-semibold'>⚠️ Capacidad insuficiente:</span> Este plan solo cubre 1.200 documentos al año, lo cual no alcanza para soportar tu volumen operativo actual.";
    }

    // HTML de los precios del plan recomendado
    let priceHtml = prices.map(p => `
        <div class="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 ${p.isRec ? 'bg-coral/5 -mx-4 px-4 rounded-lg border-none mt-2' : ''}">
            <div class="flex flex-col">
                <span class="${p.isRec ? 'text-coral font-bold' : 'text-gray-600'} text-sm">${p.label} ${p.isRec ? '<span class="text-[10px] bg-coral text-white px-2 py-0.5 rounded-full ml-1 align-middle">Sugerido</span>' : ''}</span>
                ${p.note ? `<span class="text-xs text-green-600 font-medium">${p.note}</span>` : ''}
            </div>
            <span class="${p.isRec ? 'text-coral text-xl' : 'text-gray-900 text-base'} font-bold">${p.price}</span>
        </div>
    `).join('');

    const html = `
        <div class="w-full flex flex-col mt-6 mb-6 msg-enter">
            <div class="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 text-center">Recomendación Final</div>
            
            <div class="flex flex-col md:flex-row gap-4 w-full justify-center">
                
                <div class="card-recommended w-full md:w-[60%] bg-white rounded-2xl p-6 relative shadow-lg border-2 border-coral">
                    <div class="absolute -top-3 right-4 bg-coral text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-sm">✦ Tu Ecosistema Ideal</div>
                    
                    <h3 class="font-black text-2xl text-gray-900 mb-2">${recPlan}</h3>
                    <p class="text-sm text-gray-600 bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-200 mb-4 font-medium">
                        ${docsTag}
                    </p>
                    
                    <div class="mb-5 flex flex-col">
                        ${priceHtml}
                    </div>
                    
                    <a href="https://app.dataico.com/?registro=true" target="_blank" class="w-full bg-coral hover:bg-[#e04f4a] text-white font-bold py-3 rounded-xl transition-colors shadow-md flex justify-center items-center gap-2 no-underline cursor-pointer">
                        Adquirir ${recPlan} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                    </a>
                </div>

                <div class="w-full md:w-[40%] bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-colors flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-lg text-gray-900 mb-1">${altPlan}</h3>
                        <p class="text-xs text-gray-500 mb-4">${altTag}</p>
                        <p class="text-sm text-gray-600 mb-6 leading-relaxed">${altDesc}</p>
                    </div>
                    <div>
                        <div class="text-gray-900 font-bold text-lg mb-4">${altPrice}</div>
                        <a href="https://www.dataico.com/planes-y-precios" target="_blank" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl transition-colors text-sm block text-center no-underline cursor-pointer">
                            Ver detalles
                        </a>
                    </div>
                </div>

            </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

async function sendMessage(text) {
    if (!text.trim()) return;

    // Quitamos opciones anteriores si el usuario decidió escribir en lugar de hacer clic
    const oldQrs = document.querySelectorAll('[id^="qr-"]');
    oldQrs.forEach(el => el.remove());

    // Agregamos el mensaje del usuario a la interfaz y al historial
    addMessage(text, false);
    userInput.value = '';
    chatHistory.push({ role: "user", content: text });

    const loadId = showLoading();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, messages: chatHistory })
        });

        const data = await response.json();
        document.getElementById(loadId).remove();

        // 1. Validar si el backend devolvió un error explícito
        if (data.error) {
            console.error("Error del Servidor:", data.error);
            addMessage(`❌ Error del Servidor: ${data.error}`, true);
            return;
        }

        // 2. Parseamos el JSON que envía el backend
        let parsedData = {};
        try {
            parsedData = JSON.parse(data.reply);
        } catch (e) {
            console.error("Error parseando JSON de OpenAI:", e);
            parsedData = { texto: "Hubo un pequeño error al procesar la respuesta. ¿Me repites lo último?", modulo: "Industria", opciones: [] };
        }

        // 2. Guardamos la respuesta del bot en el historial (solo el texto)
        chatHistory.push({ role: "assistant", content: parsedData.texto });

        // 3. Actualizamos el banner lateral según el módulo
        if (parsedData.modulo) {
            updateBanner(parsedData.modulo);
        }

        // 4. Mostramos el mensaje del bot en el chat
        if (parsedData.texto) {
            addMessage(parsedData.texto, true);
        }

        // 5. ESCUDO DE TARJETAS, BOTONES Y BANNER HARDCODEADOS
        if (parsedData.docs_anuales !== null && parsedData.docs_anuales !== undefined) {
            if (parsedData.docs_anuales !== lastRenderedDocs) {
                // 5.1 Pintamos las tarjetas de recomendación
                renderFinalCards(parsedData.docs_anuales);
                lastRenderedDocs = parsedData.docs_anuales;

                // 5.2 FORZAMOS el banner lateral al de Cierre (Tu Plan Ideal)
                updateBanner("Cierre");

                // 5.3 Pintamos los botones abajo después de un instante
                setTimeout(() => {
                    renderQuickReplies(["Tengo una duda sobre los planes", "¿Cómo adquiero este plan?"]);
                }, 100);
            }
        }
        // 6. Si NO hay tarjetas nuevas, actualizamos el banner con lo que mandó la IA
        else {
            if (parsedData.modulo) {
                updateBanner(parsedData.modulo);
            }
            if (parsedData.opciones && Array.isArray(parsedData.opciones) && parsedData.opciones.length > 0) {
                renderQuickReplies(parsedData.opciones);
            }
        }

    } catch (e) {
        if (document.getElementById(loadId)) document.getElementById(loadId).remove();
        addMessage("Lo siento, tuve un problema de conexión con el servidor.", true);
        console.error(e);
    }
}

sendBtn.addEventListener('click', () => sendMessage(userInput.value));
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(userInput.value); });

setTimeout(() => {
    // Simulamos la estructura JSON que devolvería OpenAI
    const saludoInicial = {
        texto: "👋 ¡Hola! Soy tu Asesor AI de Dataico. Mi meta es ayudarte a simplificar tu gestión para que te enfoques en lo que de verdad importa: hacer crecer tu negocio. \n\nAquí tienes un ecosistema completo (Facturación, Nómina, Compras y Contabilidad) sin pagar un solo peso por módulos extra. Para recomendarte el plan que mejor se adapte a tu empresa, cuéntame: **¿A qué se dedica tu negocio?**",
        modulo: "TodoIncluido",
        opciones: []
    };

    // Lo guardamos en el historial para que la IA tenga el contexto
    chatHistory.push({ role: "assistant", content: saludoInicial.texto });

    // Lo mostramos en pantalla
    updateBanner(saludoInicial.modulo);
    addMessage(saludoInicial.texto, true);
    renderQuickReplies(saludoInicial.opciones);

}, 500); // Aparece medio segundo después de cargar la página


// --- DICCIONARIO ESTRATÉGICO DE BANNERS EDUCATIVOS ---
const bannerContent = {
    "TodoIncluido": {
        icon: "all_inclusive", // Token del SD
        title: "Un ecosistema, sin cobros extra",
        text: "En Dataico <strong class='font-bold text-[#333333]'>no pagas por módulos</strong>. Ventas, Compras, Nómina, Cartera y Contabilidad ya forman parte de tu cuenta.<br><br>Tu plan se adapta únicamente a la cantidad de documentos que necesites generar cada mes, para que solo te preocupes por hacer crecer tu negocio."
    },
    "QueEsUnDocumento": {
        icon: "description", // Token del SD
        title: "¿Qué cuenta como Documento?",
        text: "Un Documento es un registro que consume tu saldo mensual. Incluye:<br><br>• Facturas, POS y Cotizaciones<br>• Facturas de Compra (y sus eventos de recepción)<br>• Nómina Electrónica<br>• Comprobantes Contables y de Cartera<br><br><span class='text-xs text-gray-500'>*Crear productos o generar colillas de nómina NO consume saldo.</span>"
    },
    "EvitaBloqueos": {
        icon: "shield", // Token del SD
        title: "Crece con total tranquilidad",
        text: "Cada plan te ofrece una bolsa de documentos. <br><br>Te recomendamos elegir uno con un poco de <strong class='font-bold text-[#333333]'>holgura (capacidad de sobra);</strong> así, si tienes un pico de ventas a fin de mes, tu operación seguirá fluyendo sin interrupciones.<br><br><span class='text-xs text-gray-500'>*Recuerda que los documentos no utilizados no son acumulables.</span>"
    },
    "Cierre": {
        icon: "stars",
        title: "Tu Plan Ideal",
        text: "Basándonos en tu operación, hemos calculado la capacidad que mejor se adapta a ti.<br><br>Disfruta la calma de saber que tienes todo bajo control y aprovecha todas las herramientas de Dataico para simplificar tu día a día."
    }
};

// Función para actualizar el banner lateral con animación
function updateBanner(moduloKey) {
    const banner = document.getElementById('dynamic-banner');
    const data = bannerContent[moduloKey] || bannerContent["Industria"];

    banner.style.opacity = 0;

    setTimeout(() => {
        banner.innerHTML = `
            <div class="w-12 h-12 rounded-[16px] bg-gray-50 border border-gray-100 flex items-center justify-center mb-6 shadow-inner">
                <span class="material-symbols-outlined text-[#ED5650] text-[24px]">${data.icon}</span>
            </div>
            <h3 class="font-headline text-[24px] text-[#333333] font-medium mb-4">${data.title}</h3>
            <p class="font-sans text-[14px] font-normal text-[#333333] mb-6 leading-relaxed">
                ${data.text}
            </p>
        `;
        banner.style.opacity = 1;
    }, 200);
}