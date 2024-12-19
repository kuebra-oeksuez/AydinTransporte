document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("chatbot-toggle");
    const chatbotContainer = document.getElementById("chatbot-container");
    const closeButton = document.getElementById("close-chatbot");
    const chatMessages = document.getElementById("chatbot-messages");
    const userMessageInput = document.getElementById("chatbot-input");

    // Toggle-Button: Ein-/Ausblenden des Chatbots
    toggleButton.addEventListener("click", () => {
        chatbotContainer.classList.toggle("hidden");
    });

    // Schließen des Chatbots durch Klick auf das Schließen-Symbol
    closeButton.addEventListener("click", () => {
        chatbotContainer.classList.add("hidden");
    });

    // Nachricht senden
    async function sendMessage() {
        const userMessage = userMessageInput.value.trim();

        if (!userMessage) {
            alert("Bitte geben Sie eine Nachricht ein.");
            return;
        }

        try {
            console.log("Nachricht wird gesendet:", userMessage);

            const response = await fetch("http://127.0.0.1:8000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) {
                throw new Error(`Serverfehler: ${response.status}`);
            }

            const data = await response.json();

            // Benutzer-Nachricht hinzufügen
            addMessage("user", "Sie", userMessage);

            // Bot-Antworten hinzufügen
            if (Array.isArray(data) && data.length > 0) {
                data.forEach((message) => {
                    if (message.text) {
                        addMessage("bot", "Bot", message.text);
                    }
                });
            } else {
                addMessage("bot", "Bot", "Ich konnte keine Antwort generieren.");
            }

            // Eingabefeld leeren und Scrollen aktualisieren
            userMessageInput.value = "";
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error("Fehler beim Senden der Nachricht:", error);
            alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
        }
    }

    // Nachricht im Chat anzeigen
    function addMessage(type, label, text) {
        const messageWrapper = document.createElement("div");
        const messageLabel = document.createElement("div");
        const messageText = document.createElement("div");

        messageLabel.className = "message-label";
        messageLabel.textContent = `${label}:`;

        messageText.className = type === "user" ? "user-message" : "bot-message";
        messageText.textContent = text;

        messageWrapper.appendChild(messageLabel);
        messageWrapper.appendChild(messageText);
        chatMessages.appendChild(messageWrapper);
    }

    // Klick auf Senden-Button
    document.getElementById("chatbot-send").addEventListener("click", sendMessage);

    // Eingabe mit Enter-Taste senden
    userMessageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
});
