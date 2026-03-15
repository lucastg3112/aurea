// app.js

// State Variables
const MAX_LIVES = 3;
let lives = MAX_LIVES;
let currentView = 'dashboard';
let isLocked = false;
const LIFE_REGEN_TIME = 30 * 60; // 30 minutos en segundos
let currentRegenTime = 0; 
let globalTimer = null;

// Quiz State
let currentQuizIndex = 0;
const quizQuestions = [
    { q: "Si inviertes $100,000 COP a un 10% anual, en 2 años tendrás...", opts: ["Exactamente $120,000 COP", "$121,000 COP (interés compuesto)", "$110,000 COP"], ans: 1 },
    { q: "¿Qué genera el efecto 'bola de nieve' en tus inversiones?", opts: ["Pagar impuestos temprano", "El interés compuesto", "La inflación"], ans: 1 },
    { q: "En la fórmula del interés compuesto, ¿qué factor tiene el mayor impacto exponencial al final?", opts: ["El capital inicial", "Las comisiones", "El tiempo que lo dejas crecer"], ans: 2 },
    { q: "Si empiezas a invertir a los 20 años en lugar de a los 30...", opts: ["Necesitas menos esfuerzo mensual para llegar a la misma meta", "Ganas lo mismo al final", "Solo pagas más cuotas de manejo"], ans: 0 },
    { q: "Para que el interés compuesto funcione, los dividendos generados deben:", opts: ["Gastarse inmediatamente para disfrutar", "Reinvertirse para generar más ganancias", "Ponerse debajo del colchón"], ans: 1 },
    { q: "La Regla del 72 sirve para calcular:", opts: ["Tus deducciones fiscales", "En cuántos años aproximadamente duplicas tu dinero", "Tu edad ideal de retiro"], ans: 1 },
    { q: "¿Qué enemigo ataca directamente al poder adquisitivo de tus inversiones?", opts: ["La diversificación de portafolio", "Los bonos del estado", "La inflación"], ans: 2 },
    { q: "El interés compuesto requiere de un ingrediente principal que pide mucha paciencia:", opts: ["Poder predecir el mercado a corto plazo", "Un horizonte de largo plazo", "Suerte en el Trading"], ans: 1 },
    { q: "¿Es seguro invertir todo tu dinero en una sola empresa para usar interés compuesto?", opts: ["No, siempre hay que diversificar el riesgo", "Sí, si la empresa es muy famosa", "Es lo recomendado por expertos financieros"], ans: 0 },
    { q: "En finanzas y según leyenda urbana, Albert Einstein definió al interés compuesto como:", opts: ["La octava maravilla del mundo", "Un esquema innecesario", "Algo solo para millonarios"], ans: 0 },
];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    updateLivesUI();
    startGlobalTimer();
    
    // Smooth scrolling for public nav
    document.querySelectorAll('.public-nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId.startsWith('#')) {
                const targetEl = document.querySelector(targetId);
                if(targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

// Auth Simulation (Landing vs Dashboard)
function login() {
    // Show Auth Modal
    document.getElementById('auth-modal').classList.add('active');
    document.getElementById('public-app').classList.add('blur-bg');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
    document.getElementById('public-app').classList.remove('blur-bg');
}

function switchAuthMode(mode) {
    if(mode === 'signup') {
        document.getElementById('auth-title').innerText = 'Crea tu Cuenta';
        document.getElementById('auth-subtitle').innerText = 'Inicia tu transformación financiera hoy.';
        document.getElementById('auth-password-group').style.display = 'flex';
    } else {
        document.getElementById('auth-title').innerText = 'Bienvenido a Aurea';
        document.getElementById('auth-subtitle').innerText = 'Ingresa para continuar tu viaje.';
    }
}

function executeLogin() {
    closeAuthModal();
    
    // Hide Public Landing, Show Private Dashboard
    setTimeout(() => {
        document.getElementById('public-app').style.display = 'none';
        
        const privateApp = document.getElementById('private-app');
        privateApp.style.display = 'flex';
        // Ensure fade-in animation
        privateApp.style.animation = 'fadeIn 0.5s ease-out forwards';
        
        // Reset to Home/Pathways view
        showView('pathways');
        document.querySelector('.nav-item[data-target="pathways"]').classList.add('active');
    }, 300);
}

function logout() {
    // Hide Private Dashboard, Show Public Landing
    document.getElementById('private-app').style.display = 'none';
    document.getElementById('public-app').style.display = 'flex';
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Reset private nav states
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
}

// Navigation Logic
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if(isLocked) return; // No navega si esta bloqueado por penalizacion
            
            // Remove active class
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding view
            const targetId = item.getAttribute('data-target');
            showView(targetId);
        });
    });
}

function showView(viewId) {
    if(isLocked) return;
    
    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show target
    const target = document.getElementById(viewId);
    if(target) {
        target.classList.add('active');
    }
    
    // Update top title based on view
    const titles = {
        'dashboard': 'Resumen Financiero',
        'pathways': 'Rutas de Aprendizaje',
        'simulator': 'Simulador de Vuelo',
        'achievements': 'Logros y Certificaciones',
        'class-view': 'Clase en Curso',
        'settings': 'Ajustes'
    };
    document.getElementById('top-title').innerText = titles[viewId] || 'Aurea';
}

function openClass(classId) {
    if(classId === 'presupuesto') {
        document.getElementById('class-title').innerText = 'Módulo 1: Presupuesto 50/30/20';
        document.getElementById('class-video').src = 'https://www.youtube.com/embed/EjA9xN40oXo?si=yPzW8xkq0gH0m_c_';
        
        document.getElementById('class-notes-content').innerHTML = `
            <p>El <strong>presupuesto 50/30/20</strong> divide tus ingresos en 3 grandes categorías: 50% necesidades, 30% gastos personales (lujos), y 20% ahorro e inversión.</p>
            <p style="margin-top: 12px;">Es la regla de oro para evitar fugas de capital y asegurar un futuro financiero sin estrés, dándole estructura a tu mente.</p>
        `;

        // Update playlist UI
        updatePlaylistActiveState('plist-mod1');

        // Hide Quiz card if completed
        document.getElementById('quiz-widget-card').style.display = 'none';

    } else if(classId === 'interes-compuesto') {
        document.getElementById('class-title').innerText = 'Módulo 2: La Magia del Interés Compuesto';
        document.getElementById('class-video').src = 'https://www.youtube.com/embed/n4pEdO6O5uU?si=2O1P0u_6kX-D4jT-';
        
        document.getElementById('class-notes-content').innerHTML = `
            <p>El <strong>interés compuesto</strong> funciona reinvirtiendo las ganancias (intereses) que generas, creando un efecto "bola de nieve" en tu patrimonio.</p>
            <p style="margin-top: 12px;">Fórmula clave: <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">A = P (1 + r/n)^(nt)</code><br>
            Lo importante no es la fórmula en sí, sino el factor <strong>tiempo (t)</strong>. Entre más pronto inviertas, el interés compuesto hará el trabajo pesado por ti.</p>
        `;

        // Update playlist UI
        updatePlaylistActiveState('plist-mod2');

        // Show Quiz card
        document.getElementById('quiz-widget-card').style.display = 'flex';
    }
    
    showView('class-view');
}

function updatePlaylistActiveState(activeId) {
    const defaultColor = '#fff';
    const activeColor = 'var(--accent-mint)';
    const completedColor = 'var(--text-secondary)';

    // Reset Mod 1
    const mod1Icon = document.getElementById('plist-mod1-icon');
    const mod1Status = document.getElementById('plist-mod1-status');
    const mod1Row = document.getElementById('plist-mod1');
    mod1Row.style.background = 'transparent';
    mod1Row.style.borderLeft = 'none';
    mod1Icon.style.background = 'var(--accent-mint)';
    mod1Icon.style.color = '#000';
    mod1Icon.innerHTML = '<i class="ph-bold ph-check"></i>';
    mod1Status.innerText = 'Completado';
    mod1Status.style.color = completedColor;
    mod1Row.querySelector('.flex-grow-1 > div:first-child') ? mod1Row.querySelector('.flex-grow-1 > div:first-child').style.color = defaultColor : null;

    // Reset Mod 2
    const mod2Icon = document.getElementById('plist-mod2-icon');
    const mod2Status = document.getElementById('plist-mod2-status');
    const mod2Row = document.getElementById('plist-mod2');
    mod2Row.style.background = 'transparent';
    mod2Row.style.borderLeft = 'none';
    mod2Icon.style.background = 'rgba(255,255,255,0.1)';
    mod2Icon.style.color = '#fff';
    mod2Icon.innerHTML = '<i class="ph-fill ph-play"></i>';
    mod2Status.innerText = 'Pendiente';
    mod2Status.style.color = completedColor;
    mod2Row.querySelector('.flex-grow-1 > div:first-child') ? mod2Row.querySelector('.flex-grow-1 > div:first-child').style.color = defaultColor : null;

    // Set Active State
    const activeRow = document.getElementById(activeId);
    if(activeRow) {
        activeRow.style.background = 'var(--bg-primary)';
        activeRow.style.borderLeft = '3px solid var(--accent-mint)';
        
        const activeIcon = document.getElementById(`${activeId}-icon`);
        activeIcon.style.background = 'var(--bg-accent)';
        activeIcon.style.color = 'var(--accent-mint)';
        activeIcon.innerHTML = '<i class="ph-fill ph-play"></i>';
        
        const activeStatus = document.getElementById(`${activeId}-status`);
        activeStatus.innerText = 'Viendo ahora';
        activeStatus.style.color = 'var(--accent-mint)';
        activeRow.children[1].children[0].style.color = 'var(--accent-mint)';
    }
}

// Gamification - Quiz Logic
function startQuiz() {
    currentQuizIndex = 0;
    renderQuizQuestion();
    document.getElementById('quiz-modal').classList.add('active');
}

function renderQuizQuestion() {
    const qData = quizQuestions[currentQuizIndex];
    document.querySelector('.quiz-question').innerText = `Pregunta ${currentQuizIndex + 1}/${quizQuestions.length}: ${qData.q}`;
    
    const optionsDiv = document.querySelector('.quiz-options');
    optionsDiv.innerHTML = '';
    
    qData.opts.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(idx, btn, qData.ans);
        optionsDiv.appendChild(btn);
    });
    
    // Ocultar botón "Siguiente"
    const footer = document.getElementById('quiz-footer');
    if(footer) footer.style.display = 'none';
}

function closeQuiz() {
    document.getElementById('quiz-modal').classList.remove('active');
}

function checkAnswer(selectedIdx, buttonEl, correctIdx) {
    const allBtns = document.querySelectorAll('.quiz-options .quiz-btn');
    // Disable all options
    allBtns.forEach(b => b.disabled = true);
    
    const footer = document.getElementById('quiz-footer');
    
    if(selectedIdx === correctIdx) {
        buttonEl.classList.add('correct');
        // Wait for user to click next
        if(footer) footer.style.display = 'block';
    } else {
        buttonEl.classList.add('wrong');
        // Highlight correct answer for learning
        allBtns[correctIdx].classList.add('correct');
        
        // Restar vida SIN salir del quiz
        loseLife();
        
        // Animacion violenta para feedback de error
        const quizLivesCtr = document.getElementById('quiz-lives-container');
        if(quizLivesCtr) {
            quizLivesCtr.style.transform = 'scale(1.2)';
            const modalEl = document.querySelector('.quiz-modal');
            modalEl.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.4)';
            
            setTimeout(() => {
                quizLivesCtr.style.transform = 'scale(1)';
                modalEl.style.boxShadow = '';
            }, 500);
        }
        
        // Mostrar boton siguiente solo si el user NO ha entrado a penalty overlay
        if(lives > 0 && footer) {
            footer.style.display = 'block';
        }
    }
}

function nextQuestion() {
    currentQuizIndex++;
    if(currentQuizIndex < quizQuestions.length) {
        renderQuizQuestion();
    } else {
        alert('¡Dominio Alcanzado! 🎉 Has pasado la Evaluación completando todas las preguntas.');
        closeQuiz();
        
        // Unlock the next module (Simulated MVP behavior)
        const lockedModule = document.querySelector('.module-card.locked');
        if(lockedModule) {
            lockedModule.classList.remove('locked');
            lockedModule.setAttribute('onclick', "alert('El Módulo 3 estaría disponible aquí.')");
            lockedModule.querySelector('i.ph-lock-key').className = 'ph-fill ph-check-circle';
            lockedModule.querySelector('i.ph-fill.ph-check-circle').parentElement.style.backgroundColor = 'var(--accent-mint-shadow)';
            lockedModule.querySelector('.module-info p').innerText = 'Desbloqueado';
        }
        showView('pathways');
    }
}

// Gamification - Lives & Global Timer
function updateLivesUI() {
    const container = document.getElementById('lives-container');
    const quizContainer = document.getElementById('quiz-lives-container');
    
    let htmlContent = '';
    for(let i = 0; i < MAX_LIVES; i++) {
        if(i < lives) {
            htmlContent += '<i class="ph-fill ph-heart lives" style="color: var(--danger);"></i>';
        } else {
            htmlContent += '<i class="ph ph-heart lives" style="color: var(--text-secondary);"></i>';
        }
    }
    
    if(container) container.innerHTML = htmlContent;
    if(quizContainer) quizContainer.innerHTML = htmlContent;
}

function loseLife() {
    if(lives > 0) {
        lives--;
        updateLivesUI();
        
        if(lives === 0) {
            closeQuiz();
            activatePenaltyLock();
        } else {
            addAIContextMessage(`Parece que te tropezaste. Te quedan ${lives} vidas ❤️. Recuerda que errar es parte del proceso.`);
            if(!document.getElementById('tutor-widget').classList.contains('open')) {
                document.getElementById('tutor-widget').classList.add('open');
            }
        }
        
        // Start regen timer sequence if this is the first life lost
        if(lives === MAX_LIVES - 1) {
            currentRegenTime = LIFE_REGEN_TIME;
        }
    }
}

function startGlobalTimer() {
    globalTimer = setInterval(() => {
        if(lives < MAX_LIVES) {
            if(currentRegenTime <= 0) {
                currentRegenTime = LIFE_REGEN_TIME;
            }
            currentRegenTime--;
            
            if(currentRegenTime <= 0) {
                lives++;
                updateLivesUI();
                if(lives < MAX_LIVES) {
                    // Carry over for next life
                    currentRegenTime = LIFE_REGEN_TIME;
                } else {
                    document.getElementById('life-timer').innerText = 'Max';
                }
            } else {
                updateTimerUIs();
            }
        } else {
            // Already Max lives
            const timerEl = document.getElementById('life-timer');
            if(timerEl) timerEl.innerText = 'Max';
            currentRegenTime = 0;
        }
        
        // Auto-unlock if penalty locked and a life was regenerated
        if(lives > 0 && isLocked) {
            isLocked = false;
            document.getElementById('lock-overlay').classList.remove('active');
        }
        
    }, 1000);
}

function updateTimerUIs() {
    const m = Math.floor(currentRegenTime / 60);
    const s = currentRegenTime % 60;
    const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    
    // Topbar timer
    const lifeTimerEl = document.getElementById('life-timer');
    if(lifeTimerEl) lifeTimerEl.innerText = `+1 en ${formatted}`;
    
    // Penalty Modal timer
    const penaltyTimer = document.getElementById('penalty-timer');
    if(penaltyTimer && lives === 0) {
        penaltyTimer.innerText = formatted;
    }
}

function activatePenaltyLock() {
    isLocked = true;
    currentRegenTime = LIFE_REGEN_TIME; // Next life in exactly 30 mins
    updateTimerUIs();
    document.getElementById('lock-overlay').classList.add('active');
}

// Para propósitos de testing/debug del MVP
function cheatReset() {
    lives = MAX_LIVES;
    currentRegenTime = 0;
    updateLivesUI();
    
    const timerEl = document.getElementById('life-timer');
    if(timerEl) timerEl.innerText = 'Max';
    
    document.getElementById('lock-overlay').classList.remove('active');
    isLocked = false;
}

// AI Tutor Chat Widget
function toggleTutor() {
    document.getElementById('tutor-widget').classList.toggle('open');
}

function handleChat(e) {
    if(e.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input-text');
    const msg = input.value.trim();
    if(msg !== '') {
        addMessage(msg, 'user');
        input.value = '';
        
        // Mock AI response
        setTimeout(() => {
            const responses = [
                `Como mentor financiero, te recuerdo que <strong>diversificar</strong> es como no poner todos tus huevos en la misma canasta. ¿Te gustaría que practiquemos este concepto?`,
                `La volatilidad no es tu enemiga, es el "peaje" que pagas en la bolsa para obtener mejores rendimientos a largo plazo.`,
                `¡Excelente pregunta! Déjame generar un pequeño examen rápido sobre eso para reforzar tu aprendizaje (pronto).`
            ];
            const randomRes = responses[Math.floor(Math.random() * responses.length)];
            addMessage(randomRes, 'ai');
            
            const tutorWidget = document.getElementById('tutor-widget');
            if(!tutorWidget.classList.contains('open')) {
                tutorWidget.classList.add('open');
            }
        }, 1000);
    }
}

function addMessage(text, type) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message msg-${type}`;
    div.innerHTML = text; // usando innerHTML para permitir etiquetas <strong> (MVP mode)
    container.appendChild(div);
    
    // Scroll a bottom
    container.scrollTop = container.scrollHeight;
}

function addAIContextMessage(text) {
    addMessage(text, 'ai');
}

// Pathway Filtering Logic
function filterPathways(category, buttonEl) {
    // Highlight active button
    const filterBtns = document.getElementById('pathway-filters').querySelectorAll('button');
    filterBtns.forEach(btn => btn.classList.remove('primary'));
    buttonEl.classList.add('primary');

    // Show/Hide pathways based on data attribute
    const pathways = document.querySelectorAll('.pathway-card');
    pathways.forEach(card => {
        if(category === 'all') {
            card.style.display = 'block';
        } else {
            if(card.getAttribute('data-category') === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// Premium Modal Logic
function showPremiumModal() {
    document.getElementById('premium-modal').classList.add('active');
}

function closePremiumModal() {
    document.getElementById('premium-modal').classList.remove('active');
}
