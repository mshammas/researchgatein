document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const loadingMessage = document.getElementById('loading-message');
    const clearChatButton = document.querySelector('.chat-options .icon-button');
    
    // Set up event listeners
    setupEventListeners();
    
    // Chat history storage
    let chatHistory = [];
    
    // Current research session
    let currentSession = {
        currentQuestionIndex: 0,
        answers: {},
        isCollectingAnswers: false
    };
    
    // Research questions to ask
    const researchQuestions = [
        "What is the main topic or question you want to research?",
        "What specific aspects or subtopics are you interested in? (e.g., trends, history, comparisons, implications)",
        "What is your goal or intended use for this research? (e.g., write a paper, make a decision, general understanding)",
        "Do you have a preferred time range for the information? (e.g., last 5 years, historical overview, upcoming developments)",
        "What level of depth are you looking for? (e.g., summary, in-depth analysis, expert-level)",
        "Are there any specific regions, industries, or demographics you'd like to focus on?",
        "What format do you prefer for the results? (e.g., structured report, comparison table, bullet points)",
        "Are there any sources you trust or want me to prioritize or avoid?",
        "What language should the results be in?",
        "Is there any additional information, context, or specific questions you'd like to include with your research request?"
    ];
    
    // Check for saved chat history in localStorage
    loadChatHistory();
    
    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Auto-resize textarea and toggle send button state
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            
            // Enable/disable send button based on input
            sendButton.disabled = !this.value.trim();
        });
        
        // Send message on Enter (but allow Shift+Enter for new line)
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!sendButton.disabled) {
                    sendMessage();
                }
            }
        });
        
        // Send button click handler
        sendButton.addEventListener('click', sendMessage);
        
        // Clear chat button
        if (clearChatButton) {
            clearChatButton.addEventListener('click', clearChat);
        }
    }
    
    /**
     * Process user input and move to next step of conversation
     */
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, 'user');
        
        // Save to chat history
        chatHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        
        // Save chat history to localStorage
        saveChatHistory();
        
        // Clear input and reset height
        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendButton.disabled = true;
        
        // Process the message based on current state
        processUserMessage(message);
    }
    
    /**
     * Process user message based on current conversation state
     * @param {string} message - The user's message
     */
    function processUserMessage(message) {
        // If currently collecting answers for research questions
        if (currentSession.isCollectingAnswers) {
            // Store the answer to the current question
            const questionKey = `question${currentSession.currentQuestionIndex}`;
            currentSession.answers[questionKey] = message;
            
            // Move to the next question or finish the questionnaire
            currentSession.currentQuestionIndex++;
            
            if (currentSession.currentQuestionIndex < researchQuestions.length) {
                // Ask the next question
                setTimeout(() => {
                    askResearchQuestion(currentSession.currentQuestionIndex);
                }, 500);
            } else {
                // All questions answered, now request email
                setTimeout(() => {
                    requestEmailAddress(currentSession.answers);
                }, 500);
                
                // Reset the question index but keep collecting flag true until email is provided
                currentSession.currentQuestionIndex = 0;
            }
        } else {
            // If not currently in a questionnaire, start a new one
            startNewResearchSession();
        }
    }
    
    /**
     * Start a new research questionnaire session
     */
    function startNewResearchSession() {
        // Reset the session data
        currentSession = {
            currentQuestionIndex: 0,
            answers: {},
            isCollectingAnswers: true
        };
        
        // Show welcome message and explanation
                    const welcomeMessage = `
            Thank you for choosing ResearchGate.in! To provide you with the most comprehensive and relevant research information, I'll ask you a series of 10 questions to understand your needs better.
            
            This structured approach helps us collect all necessary details to deliver high-quality research tailored to your specific requirements. After completing these questions, you'll be asked for your email address where we'll send our findings within 24-48 hours.
            
            Let's begin with the first question:
        `;
        
        addMessage(welcomeMessage, 'assistant');
        
        // Ask the first question after a short delay
        setTimeout(() => {
            askResearchQuestion(0);
        }, 1000);
    }
    
    /**
     * Ask a specific research question
     * @param {number} questionIndex - Index of the question to ask
     */
    function askResearchQuestion(questionIndex) {
        if (questionIndex < researchQuestions.length) {
            const questionNumber = questionIndex + 1;
            const questionMessage = `Question ${questionNumber}/10: ${researchQuestions[questionIndex]}`;
            addMessage(questionMessage, 'assistant');
        }
    }
    
    /**
     * Request email address from the user
     * @param {Object} researchData - Collected research question answers
     */
    function requestEmailAddress(researchData) {
        // Add the email request message
        const emailRequestMessage = `
            Thank you for providing all the information! To complete your research request, please provide your email address where we can send our comprehensive findings:
            <div class="email-collection-form" id="email-form">
                <input type="email" id="email-input" placeholder="Your email address" class="email-input">
                <button id="submit-email" class="submit-email-button">Submit</button>
            </div>
        `;
        
        addMessage(emailRequestMessage, 'assistant');
        
        // Set up email submission handler
        setTimeout(() => {
            const emailInput = document.getElementById('email-input');
            const submitEmailButton = document.getElementById('submit-email');
            
            if (emailInput && submitEmailButton) {
                emailInput.focus();
                
                submitEmailButton.addEventListener('click', () => {
                    submitResearchRequest(researchData, emailInput.value);
                });
                
                emailInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        submitResearchRequest(researchData, emailInput.value);
                    }
                });
            }
        }, 100);
    }
    
    /**
     * Submit the research request with email
     * @param {Object} researchData - Collected research question answers
     * @param {string} email - The user's email address
     */
    function submitResearchRequest(researchData, email) {
        if (!email || !email.includes('@') || !email.includes('.')) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Remove the email form
        const emailForm = document.getElementById('email-form');
        if (emailForm) {
            emailForm.remove();
        }
        
        // Show loading message
        addMessage("Submitting your research request...", "assistant");
        
        // Prepare the data for submission
        const submissionData = {
            email: email,
            timestamp: new Date().toISOString(),
            questions: researchQuestions,
            answers: researchData
        };
        
        // End the current research session
        currentSession.isCollectingAnswers = false;
        
        // Send data to backend
        sendQueryToBackend(submissionData)
            .then(() => {
                // Show confirmation message
                const confirmationMessage = `
                    Thank you! We've received your research request and will send our findings to ${email} within 24-48 hours.
                    
                    Here's a summary of your request:
                    - Main topic: ${researchData.question0}
                    - Intended use: ${researchData.question2}
                    - Depth level: ${researchData.question4}
                    
                    Feel free to submit another research query if you have additional questions!
                `;
                
                addMessage(confirmationMessage, 'assistant');
            })
            .catch(error => {
                console.error('Error submitting research request:', error);
                
                // Show error message
                addMessage(
                    'Sorry, we encountered an issue submitting your query. Please try again or contact support at info@researchgate.in',
                    'assistant'
                );
            });
    }
    
    /**
     * Send the query data to the backend
     * @param {Object} submissionData - The full research data to submit
     * @returns {Promise} - Promise resolving to the API response
     */
    async function sendQueryToBackend(submissionData) {
        try {
            // API endpoint - replace with your actual backend URL in production
            const apiUrl = 'https://researchgatein-backend.onrender.com/api/submit-query';
            
            // Send the request to the backend
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit query');
            }
            
            console.log('Research query submitted successfully:', data);
            
            // Store the queryId in localStorage for future reference
            const queryHistory = JSON.parse(localStorage.getItem('queryHistory') || '[]');
            queryHistory.push({
                id: data.queryId,
                mainQuery: submissionData.answers.question0,
                email: submissionData.email,
                timestamp: submissionData.timestamp
            });
            localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
            
            return data;
        } catch (error) {
            console.error('Error submitting research query:', error);
            throw error;
        }
    }
    
    /**
     * Add a message to the chat interface
     * @param {string} content - The message content
     * @param {string} sender - The message sender ('user' or 'assistant')
     */
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = sender === 'user' ? 'U' : 'R';
        
        const senderName = document.createElement('div');
        senderName.className = 'message-sender';
        senderName.textContent = sender === 'user' ? 'You' : 'Assistant';
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = formatTime(new Date());
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = `<p>${formatMessage(content)}</p>`;
        
        messageHeader.appendChild(avatar);
        messageHeader.appendChild(senderName);
        messageHeader.appendChild(messageTime);
        
        messageDiv.appendChild(messageHeader);
        messageDiv.appendChild(messageContent);
        
        // Remove welcome message if it exists
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        // Add message before the loading indicator
        if (loadingMessage.parentNode === chatMessages) {
            chatMessages.insertBefore(messageDiv, loadingMessage);
        } else {
            chatMessages.appendChild(messageDiv);
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Save to chat history if it's an assistant message
        if (sender === 'assistant') {
            chatHistory.push({
                role: 'assistant',
                content: content,
                timestamp: new Date().toISOString()
            });
            
            // Save chat history to localStorage
            saveChatHistory();
        }
    }
    
    /**
     * Format message text with basic markdown-like features
     * @param {string} text - The message text to format
     * @returns {string} - Formatted HTML
     */
    function formatMessage(text) {
        return text
            // Convert URLs to links
            .replace(/https?:\/\/[^\s]+/g, function(url) {
                return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
            })
            // Convert line breaks to <br>
            .replace(/\n/g, '<br>')
            // Bold text with **
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic text with *
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    /**
     * Format time for display
     * @param {Date} date - The date to format
     * @returns {string} - Formatted time string
     */
    function formatTime(date) {
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // difference in seconds
        
        if (diff < 60) {
            return 'Just now';
        } else if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diff < 86400 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
                   date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    
    /**
     * Clear the chat history
     */
    function clearChat() {
        // Remove all messages except the loading message
        const messages = chatMessages.querySelectorAll('.message:not(#loading-message)');
        messages.forEach(message => message.remove());
        
        // Add back the welcome message
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'welcome-message';
        welcomeMessage.innerHTML = `
            <div class="welcome-title">Welcome to ResearchGate.in</div>
            <p>Ask me any research question, and I'll help guide you through our research process to provide you with comprehensive information.</p>
            <p>Try asking about scientific topics, historical events, methodologies, or any other research area you're interested in.</p>
        `;
        
        chatMessages.insertBefore(welcomeMessage, loadingMessage);
        
        // Reset the current session
        currentSession = {
            currentQuestionIndex: 0,
            answers: {},
            isCollectingAnswers: false
        };
        
        // Clear chat history
        chatHistory = [];
        localStorage.removeItem('chatHistory');
    }
    
    /**
     * Save chat history to localStorage
     */
    function saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
    
    /**
     * Load chat history from localStorage
     */
    function loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        
        if (savedHistory) {
            try {
                chatHistory = JSON.parse(savedHistory);
                
                // Check if there are messages to display
                if (chatHistory.length > 0) {
                    // Remove welcome message
                    const welcomeMessage = document.querySelector('.welcome-message');
                    if (welcomeMessage) {
                        welcomeMessage.remove();
                    }
                    
                    // Display messages from history (limited to last 50 to prevent performance issues)
                    const recentMessages = chatHistory.slice(-50);
                    
                    recentMessages.forEach(msg => {
                        addMessage(msg.content, msg.role);
                    });
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
                // If there's an error, reset the chat history
                chatHistory = [];
                localStorage.removeItem('chatHistory');
            }
        }
    }
});
