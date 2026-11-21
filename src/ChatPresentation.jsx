
import { useState, useEffect, useRef } from "react";
import { visualPolicy } from "./data/policyData.js";
import "./ChatPresentation.css";

// Free conversational privacy policy assistant.
// Uses only the policy content already in this project.

const categories = visualPolicy?.categories || [];

const questionGroups = [
  {
    topic: "overview",
    questions: [
      "Tell me about Spotify's privacy policy.",
      "Can you summarize this privacy policy?",
      "What are the most important things I should know?",
      "What does this policy mean for me?",
    ],
    phrases: [
      "tell me about",
      "summarize",
      "summary",
      "overview",
      "explain the policy",
      "about this policy",
      "what is this policy",
      "what does this policy mean",
      "important things",
      "main points",
      "whole policy",
      "privacy policy",
    ],
    hints: [],
  },
  {
    topic: "collection",
    questions: [
      "What personal information does Spotify collect?",
      "What does Spotify know about me?",
      "Does Spotify collect information automatically?",
      "Why does Spotify need my information?",
    ],
    phrases: [
      "collect",
      "collection",
      "gather",
      "what data",
      "what information",
      "know about me",
      "personal information",
      "personal data",
      "information automatically",
      "data spotify has",
    ],
    hints: ["collect", "information", "personal data"],
  },
  {
    topic: "listening",
    questions: [
      "How does Spotify use my listening activity?",
      "Can Spotify see what songs I listen to?",
      "Does Spotify save my listening history?",
      "How is my music activity used?",
    ],
    phrases: [
      "listening",
      "listen to",
      "songs",
      "music activity",
      "listening history",
      "playlists",
      "streaming activity",
      "music history",
    ],
    hints: ["listening", "usage", "activity", "music"],
  },
  {
    topic: "sharing",
    questions: [
      "Does Spotify share my personal information?",
      "Who receives my data?",
      "Does Spotify share data with advertisers?",
      "Why does Spotify share information?",
    ],
    phrases: [
      "share",
      "sharing",
      "third party",
      "third parties",
      "advertisers",
      "partners",
      "other companies",
      "receives my data",
      "sell my data",
    ],
    hints: ["share", "third", "partner", "disclose"],
  },
  {
    topic: "rights",
    questions: [
      "What privacy rights do I have?",
      "Can I access my personal data?",
      "Can I correct my information?",
      "How can I control my privacy?",
    ],
    phrases: [
      "rights",
      "my choices",
      "privacy choices",
      "control my",
      "access my data",
      "correct my",
      "change my information",
      "privacy settings",
      "opt out",
      "opt-out",
    ],
    hints: ["right", "choice", "control", "access"],
  },
  {
    topic: "deletion",
    questions: [
      "Can I delete my personal data?",
      "How do I request data deletion?",
      "What happens if I close my account?",
      "Can I ask Spotify to erase my information?",
    ],
    phrases: [
      "delete",
      "deletion",
      "erase",
      "remove my data",
      "forget me",
      "close my account",
      "account closure",
    ],
    hints: ["delet", "eras", "remov", "account closure"],
  },
  {
    topic: "location",
    questions: [
      "Does Spotify collect location information?",
      "Can Spotify track my location?",
      "Why does Spotify use location data?",
      "Can I control location sharing?",
    ],
    phrases: [
      "location",
      "where i am",
      "where i live",
      "gps",
      "geolocation",
    ],
    hints: ["location", "geograph"],
  },
  {
    topic: "advertising",
    questions: [
      "How does Spotify use my data for advertising?",
      "Does Spotify show personalized ads?",
      "Can I control advertising preferences?",
      "Does Spotify share information with advertisers?",
    ],
    phrases: [
      "advertising",
      "advertisement",
      "advertiser",
      "ads",
      "marketing",
      "personalized ads",
      "targeted ads",
    ],
    hints: ["advertis", "marketing", "personaliz"],
  },
  {
    topic: "cookies",
    questions: [
      "Does Spotify use cookies?",
      "How does Spotify track website activity?",
      "What are cookies used for?",
      "Can I control tracking?",
    ],
    phrases: [
      "cookie",
      "cookies",
      "tracking",
      "track website",
      "website activity",
    ],
    hints: ["cookie", "tracking"],
  },
  {
    topic: "security",
    questions: [
      "How does Spotify protect my data?",
      "Is my personal information secure?",
      "What does the policy say about data security?",
      "How does Spotify keep information safe?",
    ],
    phrases: [
      "security",
      "secure",
      "protect",
      "protection",
      "safe",
      "data breach",
    ],
    hints: ["secur", "protect", "safety"],
  },
  {
    topic: "retention",
    questions: [
      "How long does Spotify keep my data?",
      "When does Spotify delete stored information?",
      "Does Spotify retain data after account closure?",
      "Why does Spotify store personal information?",
    ],
    phrases: [
      "how long",
      "keep my data",
      "retention",
      "retain",
      "stored information",
      "store my",
    ],
    hints: ["retain", "retention", "stor", "keep"],
  },
];

const welcomeMessage = {
  role: "assistant",
  content:
    "Hi! Welcome to the Spotify Privacy Policy Explorer. I can explain what Spotify's privacy policy says, summarize important sections, and help you explore topics like data collection, listening activity, sharing, and privacy choices. What would you like to know?",
};

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCategoryText(category) {
  return [
    category.title,
    category.summary,
    category.details,
    ...(Array.isArray(category.bullets)
      ? category.bullets
      : []),
    category.sourceSection,
  ]
    .filter(Boolean)
    .map(String)
    .join(" ");
}

function detectTopic(question) {
  const text = normalize(question);

  // Broad policy questions should receive an overview.
  const overviewPhrases = [
    "tell me about this policy",
    "tell me about the policy",
    "tell me about spotify",
    "summarize this policy",
    "summarize the policy",
    "summarize spotify",
    "explain this policy",
    "explain the policy",
    "what is this policy about",
    "what is spotify privacy policy",
    "what does this policy say",
    "give me an overview",
    "main points",
    "important things",
    "whole policy",
  ];

  if (overviewPhrases.some((phrase) => text.includes(phrase))) {
    return "overview";
  }

  let bestTopic = null;
  let bestScore = 0;

  for (const group of questionGroups) {
    if (group.topic === "overview") continue;

    let score = 0;

    for (const phrase of group.phrases) {
      if (text.includes(normalize(phrase))) {
        score += phrase.includes(" ") ? 5 : 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestTopic = group.topic;
    }
  }

  return bestScore > 0 ? bestTopic : null;
}

function scoreCategory(category, topic, question) {
  const title = normalize(category.title);
  const content = normalize(getCategoryText(category));

  let score = 0;

  const group = questionGroups.find(
    (item) => item.topic === topic
  );

  if (group) {
    for (const hint of group.hints) {
      if (title.includes(hint)) score += 15;
      else if (content.includes(hint)) score += 3;
    }
  }

  const stopWords = new Set([
    "what", "does", "spotify", "about", "this",
    "that", "with", "from", "your", "have",
    "tell", "please", "could", "would", "policy",
    "privacy", "information", "explain",
  ]);

  const words = normalize(question)
    .split(" ")
    .filter((word) => word.length > 3 && !stopWords.has(word));

  for (const word of words) {
    if (title.includes(word)) score += 4;
    else if (content.includes(word)) score += 1;
  }

  return score;
}

function findCategory(topic, question) {
  const ranked = categories
    .map((category) => ({
      category,
      score: scoreCategory(category, topic, question),
    }))
    .sort((a, b) => b.score - a.score);

  if (!ranked.length || ranked[0].score < 3) {
    return null;
  }

  return ranked[0].category;
}

function formatCategoryAnswer(category) {
  if (!category) return "";

  const paragraphs = [];

  if (category.summary) {
    paragraphs.push(String(category.summary));
  }

  if (
    category.details &&
    normalize(category.details) !== normalize(category.summary)
  ) {
    paragraphs.push(String(category.details));
  }

  if (Array.isArray(category.bullets) && category.bullets.length) {
    const bullets = category.bullets
      .filter(Boolean)
      .slice(0, 4);

    if (bullets.length) {
      paragraphs.push(
        bullets.map((item) => "• " + item).join("\n")
      );
    }
  }

  if (category.sourceSection) {
    paragraphs.push(
      "Source section: " + category.sourceSection
    );
  }

  return paragraphs.join("\n\n");
}

function buildOverview() {
  if (!categories.length) {
    return "The policy reference is currently unavailable.";
  }

  const introductoryText =
    "Spotify's privacy policy explains how personal information is collected, used, shared, and managed when people use its services. The policy information included in this research website covers the following topics:";

  const topics = categories
    .slice(0, 10)
    .map((category) => {
      const summary = String(category.summary || "").trim();
      return `• ${category.title}${
        summary ? ": " + summary : ""
      }`;
    });

  return (
    introductoryText +
    "\n\n" +
    topics.join("\n\n") +
    "\n\nYou can ask me about any of these topics for a more detailed explanation."
  );
}

function generateAnswer(question, previousTopic) {
  const normalized = normalize(question);

  if (!categories.length) {
    return {
      topic: "overview",
      answer:
        "The privacy policy reference is unavailable right now.",
    };
  }

  if (
    normalized === "hi" ||
    normalized === "hello" ||
    normalized === "hey"
  ) {
    return {
      topic: "overview",
      answer:
        "Hello! I can explain Spotify's privacy policy. You can ask for an overview or explore a specific topic, such as listening history, data sharing, or privacy choices.",
    };
  }

  if (
    normalized.includes("thank you") ||
    normalized === "thanks"
  ) {
    return {
      topic: previousTopic || "overview",
      answer:
        "You're welcome! Feel free to explore another part of Spotify's privacy policy.",
    };
  }

  const detected = detectTopic(question);

  const followUpWords = [
    "tell me more",
    "explain more",
    "more details",
    "can you explain",
    "what about that",
    "why is that",
  ];

  const topic =
    detected ||
    (followUpWords.some((phrase) => normalized.includes(phrase))
      ? previousTopic
      : null);

  if (topic === "overview") {
    return {
      topic: "overview",
      answer: buildOverview(),
    };
  }

  if (topic) {
    const category = findCategory(topic, question);

    if (category) {
      const explanation = formatCategoryAnswer(category);

      return {
        topic,
        answer:
          `Here's what the policy says about ${category.title.toLowerCase()}:\n\n` +
          explanation +
          "\n\nYou can ask a follow-up question or explore another topic.",
      };
    }

    return {
      topic,
      answer:
        "I couldn't find enough information about that specific topic in the policy reference included in this website. You can explore another section or ask for an overview.",
    };
  }

  // If the question closely matches a policy section,
  // answer it even without a predefined topic.
  const category = findCategory(null, question);

  if (category) {
    return {
      topic: "overview",
      answer:
        `The policy section on ${category.title.toLowerCase()} explains:\n\n` +
        formatCategoryAnswer(category) +
        "\n\nWould you like to explore another privacy topic?",
    };
  }

  return {
    topic: "overview",
    answer:
      "Spotify's privacy policy covers how information is collected, used, shared, and managed. I can explain the main policy topics or answer questions about specific sections. Try asking, 'Tell me about Spotify's privacy policy' to get started.",
  };
}

function getSuggestions(topic, messages) {
  const currentGroup = questionGroups.find(
    (group) => group.topic === topic
  );

  const usedQuestions = new Set(
    messages
      .filter((message) => message.role === "user")
      .map((message) => normalize(message.content))
  );

  const suggestions = [];

  // First offer relevant follow-up questions.
  if (currentGroup) {
    suggestions.push(...currentGroup.questions);
  }

  // Then offer questions from other policy topics.
  for (const group of questionGroups) {
    if (group.topic !== topic) {
      suggestions.push(...group.questions.slice(0, 2));
    }
  }

  const unused = suggestions.filter(
    (question, index) =>
      !usedQuestions.has(normalize(question)) &&
      suggestions.indexOf(question) === index
  );

  // Always keep questions available.
  if (unused.length < 5) {
    return [
      ...unused,
      ...questionGroups.flatMap((group) => group.questions),
    ].slice(0, 8);
  }

  return unused.slice(0, 8);
}

function ChatPresentation() {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [question, setQuestion] = useState("");
  const [currentTopic, setCurrentTopic] = useState("overview");

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages]);

  function sendMessage(text) {
    const cleaned = String(text || "").trim();
    if (!cleaned) return;

    const result = generateAnswer(cleaned, currentTopic);

    setMessages((previous) => [
      ...previous,
      { role: "user", content: cleaned },
      { role: "assistant", content: result.answer },
    ]);

    setCurrentTopic(result.topic);
    setQuestion("");
  }

  function resetChat() {
    setMessages([welcomeMessage]);
    setQuestion("");
    setCurrentTopic("overview");
  }

  const suggestedQuestions = getSuggestions(
    currentTopic,
    messages
  );

  return (
    <section
      className="chat-experience"
      aria-label="Spotify privacy policy chatbot"
    >
      <div className="chat-header">
        <div>
          <p className="chat-eyebrow">
            INTERACTIVE POLICY EXPLANATION
          </p>

          <h1>Spotify Privacy Policy</h1>

          <p>
            Ask about your privacy and explore Spotify's privacy practices through
            an interactive conversation.
          </p>
        </div>

        <button
          type="button"
          className="chat-reset"
          onClick={resetChat}
        >
          New chat
        </button>
      </div>

      <div className="chat-notice">
        This assistant explains the Spotify privacy policy
        information included in this research website.
        Answers are selected from existing policy content,
        not generated by AI. Please don't enter personal
        or sensitive information.
      </div>

      <div
        className="chat-messages"
        role="log"
        aria-label="Chat conversation"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              "chat-message " +
              (message.role === "user"
                ? "chat-message-user"
                : "chat-message-assistant")
            }
          >
            <div className="chat-message-label">
              {message.role === "user"
                ? "You"
                : "Privacy Assistant"}
            </div>

            <p style={{ whiteSpace: "pre-wrap" }}>
              {message.content}
            </p>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="chat-suggestions">
        <h3>Explore more questions</h3>

        <div className="chat-suggestion-list">
          {suggestedQuestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>


    </section>
  );
}

export default ChatPresentation;
