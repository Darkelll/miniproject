//The toggling animations for main page

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementsByClassName("chat-input")[0]; //input element

  const header = document.getElementsByClassName("header")[0]; //header element
  const logo = header.querySelector("img"); //img element inside the header
  const text = header.querySelector("h1"); //the text element inside the header
  const content = document.getElementById("content"); //<div> element for messages secion
  const content_answer = content.querySelectorAll("section"); // for all the <section> inside content div
  const page = document.querySelector(".page"); //for bulp in the background
  //Prompt-suggestion
  const prompt = document.getElementById("prompt-suggestion");
  const prompt_boxes = document.getElementById("prompt-suggestion-boxes");
  const prompt_txt = document.getElementById("prompt-suggestion-txt");

  const mobileQuery = window.matchMedia("(max-width: 550px)"); //For specifically using in Mobile Devices

  //Adds Function when pressed does animation wihtout manipulating with classnames and etc.
  input.addEventListener("focus", () => {
    header.style.height = "0vh";
    logo.style.opacity = "0";
    text.style.opacity = "0";
    content.style.height = "100%";
    content_answer.forEach((element) => {
      // Does the effect for each element, a.k.a <section> in the <div>
      element.style.opacity = "1";
    });
    page.style.setProperty("--bg-size", "0%");
    page.style.setProperty("--bg-opacity", "0");
    prompt_txt.style.opacity = "1";
  });

  function handleChange(e) {
    if (e.matches) {
      prompt_boxes.addEventListener("click", () => {
        prompt.style.height = "30px";
        prompt_boxes.style.opacity = "0";
      });

      prompt_txt.addEventListener("click", () => {
        prompt_boxes.style.opacity = "1";
        prompt.style.height = "35%";
      });

      content.addEventListener("click", () => {
        prompt.style.height = "30px";
        prompt_boxes.style.opacity = "0";
      });
    } else {
      prompt_boxes.addEventListener("click", () => {
        prompt.style.height = "30px";
        prompt_boxes.style.opacity = "0";
      });

      prompt_txt.addEventListener("click", () => {
        prompt_boxes.style.opacity = "1";
        prompt.style.height = "15%";
      });

      content.addEventListener("click", () => {
        prompt.style.height = "30px";
        prompt_boxes.style.opacity = "0";
      });
    }
  }

  // Listen to changes
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", handleChange);
  } else {
    mobileQuery.addListener(handleChange);
  }

  // Trigger once on load
  handleChange(mobileQuery);
});


const API_KEY =
  "2b64e4a91ac5670c794d4b6ea0086964cfcc71e973df1704765c6b5ddd1a4c46";
  // "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";
  // "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";
  // "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";

const sendButton = document.getElementById("sendButton");
const chatInput = document.getElementById("chatInput");
const button = document.getElementsByClassName("prompt-box")[0];

let isAnswerLoading = false;
let answerSectionId = 0;

let messageHistory = [
  {
    role: "system",
    content:
      "You are MindX AI, an advanced, helpful, and engaging AI designed to assist students in their academic studies. Your primary goal is to support users by providing accurate, detailed, and easy-to-understand explanations, resources, and guidance...",
  },
];

function handleSendMessage(messageText = null) {
  // Use messageText if provided, otherwise use what's typed in the input box
  if (messageText) {
    question = messageText.trim();
  } else {
    question = chatInput.value.trim();
  }

  if (question === "" || isAnswerLoading) {
    return;
  }

  // Disable UI send button
  sendButton.classList.add("send-button-nonactive");

  // Send the message (however your addQuestonSection handles it)
  addQuestonSection(question);

  // Clear input field if the message was typed manually
  if (!messageText) {
    chatInput.value = "";
  }
}

document.querySelectorAll(".prompt-box").forEach((button) => {
  button.addEventListener("click", () => handleSendMessage(button.textContent));
});

sendButton.addEventListener("click", () => handleSendMessage());
chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    handleSendMessage();
  }
});

//https://openrouter.ai/api/v1/chat/completions

function getAnswer(question) {
  messageHistory.push({ role: "user", content: question });

  const fetchData = fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // model: "meta-llama/llama-3-8b-instruct",
      model: "meta-llama/Llama-3-8b-chat-hf",
      messages: messageHistory,
    }),
    "max-tokens": 300
  });

  fetchData
    .then((response) => response.json())
    .then((data) => {
      if (!data.choices || !data.choices[0]) {
        console.error("OpenRouter API Error:", data);
        throw new Error(
          "AI response error: " + (data.error?.message || "Unknown error")
        );
      }
      const resultData = data.choices[0].message.content;
      const rawText = resultData;
      const formattedHTML = formatAIResponse(rawText);
      messageHistory.push({ role: "assistant", content: resultData });
      isAnswerLoading = false;
      addAnswerSection(resultData);

      // Select the LAST appended answer-section-m element
      const sections = document.getElementsByClassName("answer-section-m");
      const responseElement = sections[sections.length - 1]; // last one appended

      // Start typing animation from 0 index (start of text)

      // typeText(responseElement, rawText, formattedHTML, 1);
    })
    .finally(() => {
      scrollToButtom();
      sendButton.classList.remove("send-button-nonactive");
    });
}

function addQuestonSection(message) {
  isAnswerLoading = true;
  const sectionElement = document.createElement("section");
  sectionElement.className = "question-section";
  sectionElement.textContent = message;
  sectionElement.style.opacity = "1";

  content.appendChild(sectionElement);
  addAnswerSection(message);
  scrollToButtom();
}

function addAnswerSection(message) {
  if (isAnswerLoading) {
    answerSectionId++;
    const sectionElement = document.createElement("section");
    sectionElement.className = "answer-section-m";
    sectionElement.innerHTML = getLoadingSvg();
    sectionElement.id = answerSectionId;
    sectionElement.style.opacity = "1";

    content.appendChild(sectionElement);
    getAnswer(message);
  } else {
    const answerSectionElement = document.getElementById(answerSectionId);
    answerSectionElement.textContent = message;
    answerSectionElement.innerHTML = formatAIResponse(message);
  }
}

function getLoadingSvg() {
  return '<svg style = "height: 25px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#4F6BFE" stroke="#4F6BFE" stroke-width="15" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#4F6BFE" stroke="#4F6BFE" stroke-width="15" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#4F6BFE" stroke="#4F6BFE" stroke-width="15" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>';
}

function scrollToButtom() {
  content.scrollTo({
    top: content.scrollHeight,
    behavior: "smooth",
  });
}

function typeText(element, rawText, formattedHTML, speed = 1) {
  let index = 0;
  element.textContent = ""; // Clear before typing

  const interval = setInterval(() => {
    if (index < rawText.length) {
      element.textContent += rawText.charAt(index);
      index++;
    } else {
      clearInterval(interval);
      element.innerHTML = formattedHTML; // Final formatting shown here
    }
  }, speed);
}

function formatAIResponse(text) {
  // Escape HTML tags
  text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Bold (**text**)
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italics (*text*)
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Replace newlines with <br> to preserve formatting
  text = text
    .replace(/\n{2,}/g, "</p><p>") // double newlines = paragraph
    .replace(/\n/g, "<br>"); // single newline = line break

  // Replace numbered lists
  text = text.replace(/(\d+\.\s.*?)(?=<br>|\n|$)/g, "<li>$1</li>");
  text = text.replace(/(<li>.*<\/li>)/g, "<ol>$1</ol>");

  // Wrap final result in <p>
  return text;
}
