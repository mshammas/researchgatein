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
     * Send a message to the assistant
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
        
        // Check if this is the first message - if so, we'll request email after this
        const isFirstMessage = chatHistory.filter(msg => msg.role === 'user').length === 1;
        
        if (isFirstMessage) {
            // Show email collection prompt after a short delay
            setTimeout(() => {
                requestEmailAddress(message);
            }, 1000);
        } else {
            // For subsequent messages, use the existing flow
            // Show loading indicator
            loadingMessage.style.display = 'flex';
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Make API request to get response
            fetchAssistantResponse(message);
        }
    }
    
    /**
     * Fetch a response from the assistant API
     * @param {string} message - The user's message
     */
    async function fetchAssistantResponse(message) {
        try {
            // In production, replace this with actual API call to ChatGPT
            // This is a simulated API call for demonstration
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Get simulated response
            const response = getSimulatedResponse(message);
            
            // Hide loading indicator
            loadingMessage.style.display = 'none';
            
            // Add assistant response to chat
            addMessage(response, 'assistant');
            
            // Save to chat history
            chatHistory.push({
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            });
            
            // Save chat history to localStorage
            saveChatHistory();
            
        } catch (error) {
            console.error('Error fetching assistant response:', error);
            
            // Hide loading indicator
            loadingMessage.style.display = 'none';
            
            // Show error message
            addMessage('Sorry, I encountered an error processing your request. Please try again.', 'assistant');
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
     * Request email address from the user
     * @param {string} query - The research query submitted
     */
    function requestEmailAddress(query) {
        // Add the email request message
        const emailRequestMessage = `
            Thank you for your research query. To provide you with a thorough response, our team will need some time to research this topic. 
            Please provide your email address so we can send you our comprehensive findings:
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
                    submitResearchRequest(query, emailInput.value);
                });
                
                emailInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        submitResearchRequest(query, emailInput.value);
                    }
                });
            }
        }, 100);
    }
    
    /**
     * Submit the research request with email
     * @param {string} query - The research query
     * @param {string} email - The user's email address
     */
    function submitResearchRequest(query, email) {
        if (!email || !email.includes('@') || !email.includes('.')) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Remove the email form
        const emailForm = document.getElementById('email-form');
        if (emailForm) {
            emailForm.remove();
        }
        
        // Show confirmation message
        const confirmationMessage = `
            Thank you! We've received your research query and will send our findings to ${email} within 24-48 hours. 
            Feel free to submit additional questions or details that might help with our research.
        `;
        
        addMessage(confirmationMessage, 'assistant');
        
        // Here you would send the query and email to your backend
        sendQueryToBackend(query, email);
    }
    
    /**
     * Send the query and email to the backend
     * @param {string} query - The research query
     * @param {string} email - The user's email address
     */
    async function sendQueryToBackend(query, email) {
        try {
            // API endpoint - replace with your actual backend URL in production
            // const apiUrl = 'http://localhost:3000/api/submit-query'; // For local testing
            const apiUrl = 'https://researchgatein-backend.onrender.com/api/submit-query' // render.com web service
            // const apiUrl = 'https://api.researchgate.in/api/submit-query'; // For production
            
            // Send the request to the backend
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query, email })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit query');
            }
            
            console.log('Research query submitted successfully:', data);
            
            // You can store the queryId in localStorage for future reference if needed
            const queryHistory = JSON.parse(localStorage.getItem('queryHistory') || '[]');
            queryHistory.push({
                id: data.queryId,
                query,
                email,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
            
        } catch (error) {
            console.error('Error submitting research query:', error);
            
            // Show error message to user
            addMessage(
                'Sorry, we encountered an issue submitting your query. Please try again or contact support.',
                'assistant'
            );
        }
    }
    
    /**
     * Get a simulated response
     * @param {string} message - The user's message
     * @returns {string} - A simulated response
     */
    function getSimulatedResponse(message) {
        // This is just a simple simulation for demonstration
        // In production, this would be replaced with a real API call
        
        const lowerMessage = message.toLowerCase();
        
        // Check for specific keywords to provide more relevant responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! I'm your research assistant. How can I help with your research today?";
        }
        
        if (lowerMessage.includes('help')) {
            return "I'd be happy to help! I can assist with research questions, literature reviews, methodology explanations, data analysis insights, and more. What specific area are you researching?";
        }
        
        // Default responses
        const responses = [
            "Based on recent research, this topic has shown significant developments in the field. Several studies have highlighted the importance of considering multiple perspectives when examining this subject.",
            "According to academic literature, there are various approaches to this question. Some researchers argue for one perspective, while others present alternative viewpoints. The consensus seems to be evolving as more data becomes available.",
            "This is an interesting research question! The literature suggests that there are multiple factors to consider. Would you like me to focus on any specific aspect of this topic?",
            "From a research perspective, this question touches on several disciplines. The interdisciplinary nature of this topic makes it particularly rich for exploration. Would you like me to elaborate on any particular area?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
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
            <p>Ask me any research question, and I'll provide you with accurate, well-structured information.</p>
            <p>Try questions about scientific topics, historical events, literature reviews, methodologies, or any other research area you're interested in.</p>
        `;
        
        chatMessages.insertBefore(welcomeMessage, loadingMessage);
        
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
