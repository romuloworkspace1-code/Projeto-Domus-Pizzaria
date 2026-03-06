/* ========================================================================= */
/* --- ARQUIVO SCRIPT.JS COMPLETO E CONSOLIDADO (VERSÃO FINAL CORRIGIDA) --- */
/* ========================================================================= */

// 1. PONTO DE PARTIDA PRINCIPAL
document.addEventListener('DOMContentLoaded', () => {

    /* --- FUNÇÕES DE INICIALIZAÇÃO --- */
    // Cada função é responsável por uma única parte do site.

    /**
     * [INICIALIZAÇÃO 1] Ativa o Dark Mode.
     */
    function initDarkMode() {
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;

        if (localStorage.getItem('theme') === 'dark') {
            body.classList.add('dark-mode');
            if (themeToggle) { themeToggle.checked = true; }
        }

        if (themeToggle) {
            themeToggle.addEventListener('change', () => {
                if (themeToggle.checked) {
                    body.classList.add('dark-mode');
                    localStorage.setItem('theme', 'dark');
                } else {
                    body.classList.remove('dark-mode');
                    localStorage.setItem('theme', 'light');
                }
            });
        }
    }

    /**
     * [INICIALIZAÇÃO 2] Adiciona o alerta simples ao "Adicionar ao Carrinho".
     */
    function initAddToCartAlerts() {
        const botoesAdicionar = document.querySelectorAll('.add-to-cart');
        botoesAdicionar.forEach(botao => {
            botao.addEventListener('click', () => {
                alert('Item adicionado ao carrinho!');
            });
        });
    }

    /**
     * [INICIALIZAÇÃO 3] Ativa o popup de cupom (30% OFF) na intenção de saída.
     */
    function initExitIntentPopup() {
        const popupOverlay = document.getElementById('exit-intent-overlay');
        const closePopupButton = document.getElementById('close-exit-popup');
        let mouseHasMovedInside = false; // Trava contra o disparo no carregamento

        // 1. Trava de segurança: só permite se o mouse se moveu
        document.body.addEventListener('mousemove', () => {
            mouseHasMovedInside = true;
        }, { once: true }); 

        function showExitPopup() {
            if (popupOverlay && !sessionStorage.getItem('exitPopupShown')) {
                popupOverlay.classList.add('visible');
                sessionStorage.setItem('exitPopupShown', 'true');
            }
        }

        function hideExitPopup() {
            if (popupOverlay) {
                popupOverlay.classList.remove('visible');
            }
        }

        // 2. GATILHO: Mouse saindo do topo da página
        if (document.documentElement) {
            document.documentElement.addEventListener('mouseout', (e) => {
                if (e.clientY <= 0 && mouseHasMovedInside) {
                    showExitPopup();
                }
            });
        }

        // 3. Eventos para fechar
        if (closePopupButton) { closePopupButton.addEventListener('click', hideExitPopup); }
        if (popupOverlay) {
            popupOverlay.addEventListener('click', (e) => {
                if (e.target === popupOverlay) { hideExitPopup(); }
            });
        }
    }

    /**
     * [INICIALIZAÇÃO 4] Ativa a animação da logo como transição de página.
     */
    function initPageTransition() {
        const logoLink = document.querySelector('.logo-link');
        const navLinks = document.querySelectorAll('.nav-links a');
        const cartIconLink = document.querySelector('.cta-carrinho'); 

        const allClickableLinks = [...navLinks];
        if (logoLink) { allClickableLinks.push(logoLink); }
        if (cartIconLink) { allClickableLinks.push(cartIconLink); }

        allClickableLinks.forEach(link => {
            // Filtro para não animar o Dark Mode
            if (!link.closest('.theme-switch-container')) { 
                link.addEventListener('click', function(event) {
                    event.preventDefault(); 
                    const targetUrl = this.href; 

                    if (logoLink) {
                        logoLink.classList.add('is-animating'); 
                    }

                    const animationDuration = 500; 

                    setTimeout(() => {
                        if (logoLink) {
                            logoLink.classList.remove('is-animating');
                        }
                        window.location.href = targetUrl; 
                    }, animationDuration);
                });
            }
        });
    }

    /**
     * [INICIALIZAÇÃO 5] - (CÓDIGO DO CADASTRO 1)
     * Controla o Modal de Login/Cadastro (Abrir, Fechar e Alternar Abas).
     */
    function initAuthModal() {
        const openModalButton = document.getElementById('open-login-modal');
        const modalOverlay = document.getElementById('auth-modal');
        
        // Elementos das Abas
        const showLoginBtn = document.getElementById('show-login');
        const showRegisterBtn = document.getElementById('show-register');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        // Abre o Modal ao clicar no ícone
        if (openModalButton && modalOverlay) {
            openModalButton.addEventListener('click', (e) => {
                e.preventDefault();
                modalOverlay.classList.add('visible');
            });
        }

        // Fecha o Modal ao clicar no fundo (overlay)
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.classList.remove('visible');
                }
            });
        }
        
        // Alterna entre abas (Login e Cadastro)
        if (showLoginBtn && showRegisterBtn) {
            showLoginBtn.addEventListener('click', () => {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
                showLoginBtn.classList.add('active');
                showRegisterBtn.classList.remove('active');
            });

            showRegisterBtn.addEventListener('click', () => {
                loginForm.classList.remove('active');
                registerForm.classList.add('active');
                showLoginBtn.classList.remove('active');
                showRegisterBtn.classList.add('active');
            });
        }
    }

    /**
     * [INICIALIZAÇÃO 6] - (CÓDIGO DO CADASTRO 2)
     * Ativa o preenchimento automático de CEP (funciona no Modal ou na Página de Cadastro).
     * Nota: Esta função usa os IDs: 'cep', 'address', 'neighborhood', 'city', 'state', 'complement'.
     */
    function initCEPAutofill() {
        const cepInput = document.getElementById('cep');
        
        // Se o campo CEP não existir (por exemplo, em páginas que não são de cadastro), a função retorna.
        if (!cepInput) {
            return; 
        }

        cepInput.addEventListener('blur', () => {
            const cep = cepInput.value.replace(/\D/g, ''); // Limpa e padroniza o CEP (apenas números)

            if (cep.length === 8) {
                // Requisição à API ViaCEP
                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                    .then(response => response.json())
                    .then(data => {
                        if (!data.erro) {
                            // Preenche os campos com os dados recebidos
                            document.getElementById('address').value = data.logradouro || '';
                            document.getElementById('neighborhood').value = data.bairro || '';
                            document.getElementById('city').value = data.localidade || '';
                            document.getElementById('state').value = data.uf || '';
                            // Nota: 'complement' pode ser opcional ou vazio.
                            document.getElementById('complement').value = data.complemento || ''; 
                        } else {
                            alert('CEP não encontrado. Por favor, preencha o endereço manualmente.');
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao buscar CEP:', error);
                        alert('Ocorreu um erro ao buscar o CEP.');
                    });
            }
        });
    }


    /**
     * [INICIALIZAÇÃO 7]
     * Monitora a digitação no campo de senha e exibe o nível de força.
     */
    function initPasswordStrengthChecker() {
        const passwordInput = document.getElementById('password');
        const indicator = document.getElementById('password-strength-indicator');

        if (!passwordInput || !indicator) {
            return;
        }

        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            let strength = 0;
            let message = '';
            let color = '';

            // Regras para determinar a força
            if (password.length > 7) strength++; // Pelo menos 8 caracteres
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++; // Letras maiúsculas e minúsculas
            if (password.match(/\d/)) strength++; // Números
            if (password.match(/[^a-zA-Z\d\s]/)) strength++; // Caracteres especiais

            // Define a mensagem e a cor
            if (password.length === 0) {
                message = '';
                color = '';
            } else if (strength <= 1) {
                message = 'Senha Fraca';
                color = '#ff6b6b'; // Vermelho
            } else if (strength === 2) {
                message = 'Senha Média';
                color = '#ffa500'; // Laranja
            } else if (strength >= 3) {
                message = 'Senha Forte';
                color = '#4caf50'; // Verde
            }

            // Atualiza o indicador no HTML
            indicator.textContent = message;
            indicator.style.color = color;
            indicator.style.fontWeight = 'bold';
            indicator.style.fontSize = '0.75rem';
            indicator.style.marginTop = '5px';
        });
    }


    /* ========================================================================= */
    /* --- EXECUÇÃO DAS INICIALIZAÇÕES --- */
    /* ========================================================================= */
    
    console.log('Site DomusPizza carregado e pronto!');
    
    initDarkMode();
    initAddToCartAlerts();
    initExitIntentPopup();
    initPageTransition();
    initAuthModal();
    initCEPAutofill();
    initPasswordStrengthChecker();

}); // Fim do ÚNICO document.addEventListener('DOMContentLoaded')