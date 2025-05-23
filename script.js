const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");

let userMessage = "";
let learningMode = false;
let lastUnknownQuestion = "";

const learnedResponses = JSON.parse(localStorage.getItem("learnedResponses")) || {};

const defaultResponses = {
    "hi": "Hello! How can I help you today?",
    "hello": "Hi there! 😊",
    "how are you?": "I'm doing great, thanks! How about you?",
    "bye": "Goodbye! Have a great day!",
    "thank you": "You're welcome!",
    "what is ai": "AI stands for Artificial Intelligence — machines that can learn and think!",
};

const allResponses = () => ({ ...defaultResponses, ...learnedResponses });

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    const chatContent = className === "outcoming"
        ? `<p>${message}</p>`
        : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
};

const findClosestMatch = (input, dataset) => {
    const inputWords = input.toLowerCase().split(" ");
    let bestMatch = null;
    let maxScore = 0;

    for (const key in dataset) {
        const keyWords = key.split(" ");
        const score = inputWords.filter(word => keyWords.includes(word)).length;
        if (score > maxScore) {
            maxScore = score;
            bestMatch = key;
        }
    }

    return maxScore > 0 ? dataset[bestMatch] : null;
};

const saveLearnedResponse = (question, answer) => {
    learnedResponses[question.toLowerCase()] = answer;
    localStorage.setItem("learnedResponses", JSON.stringify(learnedResponses));
};

const generateResponse = () => {
    let botMessage = "";
    const responses = allResponses();

    if (learningMode) {
        saveLearnedResponse(lastUnknownQuestion, userMessage);
        botMessage = "Thank you! I'll remember that for next time. 😊";
        learningMode = false;
        lastUnknownQuestion = "";
    } else {
        const exactMatch = responses[userMessage.toLowerCase()];
        if (exactMatch) {
            botMessage = exactMatch;
        } else {
            const fuzzy = findClosestMatch(userMessage, responses);
            if (fuzzy) {
                botMessage = fuzzy;
            } else {
                botMessage = `I don't know how to answer that. Would you like to teach me a response? (yes/no)`;
                lastUnknownQuestion = userMessage;
            }
        }

        if (userMessage.toLowerCase() === "yes" && lastUnknownQuestion) {
            botMessage = `What is the correct answer to : "${lastUnknownQuestion}" ?`;
            learningMode = true;
        } else if (userMessage.toLowerCase() === "non" && lastUnknownQuestion) {
            botMessage = "Alright, maybe another time. 😊";
            lastUnknownQuestion = "";
        }
    }

    const thinkingMsg = chatbox.querySelector(".incoming:last-child p");
    thinkingMsg.textContent = botMessage;
};

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatbox.append(createChatLi(userMessage, "outcoming"));
    chatInput.value = "";

    setTimeout(() => {
        chatbox.append(createChatLi("Thinking...", "incoming"));
        generateResponse();
        chatbox.scrollTop = chatbox.scrollHeight;
    }, 600);
};

sendChatBtn.addEventListener("click", handleChat);
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});

