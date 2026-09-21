import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Camera,
  CameraOff,
  Check,
  Clock,
  History,
  Home,
  MessageSquare,
  Mic,
  MicOff,
  Play,
  Sparkles,
  Video,
  X,
} from "lucide-react";

import "./index.css";

/* =========================================================
   INTERVIEW QUESTIONS
========================================================= */

const QUESTIONS = [
  "Tell me about yourself and your experience as a developer.",
  "What is the difference between let, const, and var in JavaScript?",
  "What is React and why would you use it?",
  "Explain the concept of component state in React.",
  "What is the difference between props and state?",
  "How do you improve the performance of a React application?",
  "What is an API and how have you used APIs in your projects?",
  "Tell me about a challenging project you worked on.",
  "How do you debug a problem in a web application?",
  "Why should we hire you for this position?",
];

/* =========================================================
   QUESTION-SPECIFIC EVALUATION
========================================================= */

const RUBRICS = [
  {
    keywords: [
      "experience",
      "developer",
      "project",
      "skill",
      "javascript",
      "react",
      "frontend",
      "backend",
    ],
    feedback:
      "Introduce your background, key technical skills, relevant projects, and the type of developer role you are targeting.",
  },
  {
    keywords: [
      "let",
      "const",
      "var",
      "scope",
      "block",
      "function",
      "reassign",
      "redeclar",
      "hoist",
    ],
    feedback:
      "Explain scope, redeclaration, reassignment, and hoisting/temporal dead zone differences between let, const, and var.",
  },
  {
    keywords: [
      "react",
      "component",
      "ui",
      "state",
      "props",
      "declarative",
      "virtual dom",
      "reusable",
    ],
    feedback:
      "Explain that React is a library for building user interfaces using reusable components and describe why its component-based approach is useful.",
  },
  {
    keywords: [
      "state",
      "component",
      "setstate",
      "usestate",
      "update",
      "rerender",
      "data",
    ],
    feedback:
      "Explain that state represents data managed by a component and that updating state causes React to render the relevant UI again.",
  },
  {
    keywords: [
      "props",
      "state",
      "parent",
      "child",
      "readonly",
      "component",
      "update",
    ],
    feedback:
      "Clearly distinguish props passed from a parent from state owned and updated by a component.",
  },
  {
    keywords: [
      "performance",
      "memo",
      "usememo",
      "usecallback",
      "lazy",
      "code splitting",
      "virtualization",
      "profil",
      "render",
    ],
    feedback:
      "Mention practical optimization techniques such as profiling, avoiding unnecessary renders, code splitting, lazy loading, and appropriate memoization.",
  },
  {
    keywords: [
      "api",
      "http",
      "rest",
      "json",
      "fetch",
      "axios",
      "get",
      "post",
      "request",
      "response",
    ],
    feedback:
      "Explain what an API does and describe how you send requests, process responses, and handle loading or error states.",
  },
  {
    keywords: [
      "project",
      "challenge",
      "problem",
      "solution",
      "action",
      "result",
      "team",
      "experience",
    ],
    feedback:
      "Use a clear situation/problem, action, and result structure. Explain what you personally did and what you learned.",
  },
  {
    keywords: [
      "debug",
      "console",
      "devtools",
      "network",
      "error",
      "reproduce",
      "test",
      "logs",
      "inspect",
      "isolate",
    ],
    feedback:
      "Describe a systematic debugging process: reproduce the issue, isolate it, inspect errors/logs/network activity, fix it, and verify the fix.",
  },
  {
    keywords: [
      "skill",
      "experience",
      "project",
      "team",
      "learn",
      "contribute",
      "javascript",
      "react",
      "frontend",
    ],
    feedback:
      "Connect your skills and project experience to the role and explain what you can contribute to the team.",
  },
];

/* =========================================================
   EVALUATOR
========================================================= */

function evaluateAnswer(questionIndex, answer) {
  const text = (answer || "").trim();

  if (!text) {
    return {
      score: 0,
      communication: 0,
      relevance: 0,
      technical: 0,
      feedback:
        "No answer was provided. Answer the question directly and include an explanation or example.",
      strengths: [],
      improvements: [
        "Provide an answer",
        "Explain the main idea",
        "Give a practical example",
      ],
    };
  }

  const lower = text.toLowerCase();

  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const rubric = RUBRICS[questionIndex] || RUBRICS[0];

  const matchedKeywords = rubric.keywords.filter((keyword) =>
    lower.includes(keyword)
  );

  const keywordCoverage =
    matchedKeywords.length / Math.max(rubric.keywords.length, 1);

  const structureWords = [
    "because",
    "for example",
    "first",
    "second",
    "then",
    "finally",
    "however",
    "therefore",
    "result",
    "experience",
    "problem",
    "solution",
    "also",
  ];

  const structureCount = structureWords.filter((word) =>
    lower.includes(word)
  ).length;

  const hasExample =
    lower.includes("for example") ||
    lower.includes("example") ||
    lower.includes("project") ||
    lower.includes("experience");

  let score = 25;

  /* Answer length */
  if (wordCount >= 20) score += 10;
  if (wordCount >= 40) score += 10;
  if (wordCount >= 70) score += 10;
  if (wordCount >= 100) score += 5;

  /* Question relevance */
  score += Math.round(keywordCoverage * 25);

  /* Structure */
  score += Math.min(structureCount * 2, 10);

  /* Example */
  if (hasExample) score += 5;

  score = Math.min(Math.max(Math.round(score), 0), 100);

  const communication = Math.min(
    100,
    Math.round(
      45 +
        Math.min(wordCount, 100) * 0.35 +
        Math.min(structureCount * 4, 20)
    )
  );

  const relevance = Math.min(
    100,
    Math.round(40 + keywordCoverage * 50 + (hasExample ? 10 : 0))
  );

  const technical = Math.min(
    100,
    Math.round(35 + keywordCoverage * 60)
  );

  const strengths = [];
  const improvements = [];

  if (wordCount >= 40) {
    strengths.push("Provided a reasonably detailed answer");
  }

  if (matchedKeywords.length >= 2) {
    strengths.push("Addressed important concepts from the question");
  }

  if (structureCount >= 2) {
    strengths.push("Used some structure while explaining the answer");
  }

  if (hasExample) {
    strengths.push("Included an example or practical context");
  }

  if (strengths.length === 0) {
    strengths.push("Attempted to answer the interview question");
  }

  if (wordCount < 30) {
    improvements.push("Give a more complete explanation");
  }

  if (matchedKeywords.length < 2) {
    improvements.push("Cover more of the key concepts in the question");
  }

  if (structureCount < 2) {
    improvements.push("Use a clearer beginning, explanation, and conclusion");
  }

  if (!hasExample) {
    improvements.push("Add a practical example");
  }

  if (improvements.length === 0) {
    improvements.push("Add a specific real-world example or project detail");
  }

  let feedback;

  if (score >= 85) {
    feedback =
      "Strong answer. You covered relevant concepts with reasonable detail. Keep the explanation structured and support it with specific examples.";
  } else if (score >= 70) {
    feedback =
      "Good answer. You addressed several relevant points, but adding more specific details and examples would make it stronger.";
  } else if (score >= 50) {
    feedback =
      "Partially satisfactory answer. Focus on the key concepts in the question and explain them more clearly with an example.";
  } else {
    feedback =
      rubric.feedback ||
      "The answer needs more development. Focus on directly answering the question and explaining the important concepts.";
  }

  return {
    score,
    communication,
    relevance,
    technical,
    feedback,
    strengths,
    improvements,
  };
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [page, setPage] = useState("home");

  const [questionIndex, setQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState({});

  const [cameraEnabled, setCameraEnabled] = useState(false);

  const [listening, setListening] = useState(false);

  const [speechSupported, setSpeechSupported] = useState(true);

  const [transcript, setTranscript] = useState("");

  const [timeLeft, setTimeLeft] = useState(20 * 60);

  const [evaluationResults, setEvaluationResults] = useState([]);

  const [overallScore, setOverallScore] = useState(0);

  const [history, setHistory] = useState([]);

  const videoRef = useRef(null);

  const streamRef = useRef(null);

  const recognitionRef = useRef(null);

  const shouldListenRef = useRef(false);

  /* =======================================================
     CAMERA
  ======================================================= */

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera access is not supported by this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraEnabled(true);
    } catch (error) {
      console.error("Camera error:", error);

      if (error.name === "NotAllowedError") {
        alert(
          "Camera permission was denied. Please allow camera access in Chrome."
        );
      } else if (error.name === "NotFoundError") {
        alert("No camera was found on this device.");
      } else {
        alert("Unable to start the camera. Check your camera permissions.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraEnabled(false);
  };

  const toggleCamera = async () => {
    if (cameraEnabled) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  /* =======================================================
     SPEECH RECOGNITION
  ======================================================= */

  const createSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return null;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        const spokenText = result[0].transcript;

        if (result.isFinal) {
          finalText += spokenText + " ";
        }
      }

      if (finalText.trim()) {
        setTranscript((previous) => {
          const combined = `${previous} ${finalText}`.trim();

          setAnswers((answersPrevious) => ({
            ...answersPrevious,
            [questionIndex]: combined,
          }));

          return combined;
        });
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      if (event.error === "not-allowed") {
        shouldListenRef.current = false;
        setListening(false);

        alert(
          "Microphone permission was denied. Please allow microphone access in Chrome."
        );
      }

      if (event.error === "audio-capture") {
        shouldListenRef.current = false;
        setListening(false);

        alert("No microphone was found.");
      }
    };

    recognition.onend = () => {
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.log("Recognition restart:", error);
        }
      } else {
        setListening(false);
      }
    };

    return recognition;
  };

  const startSpeechRecognition = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);

      alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );

      return;
    }

    try {
      const microphone = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      microphone.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Microphone permission:", error);

      alert(
        "Please allow microphone access in Chrome and try again."
      );

      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = createSpeechRecognition();
    }

    if (!recognitionRef.current) {
      return;
    }

    shouldListenRef.current = true;

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.log("Recognition already running:", error);
    }
  };

  const stopSpeechRecognition = () => {
    shouldListenRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(error);
      }
    }

    setListening(false);
  };

  /* =======================================================
     QUESTION / ANSWER
  ======================================================= */

  useEffect(() => {
    setTranscript(answers[questionIndex] || "");
  }, [questionIndex]);

  const updateAnswer = (value) => {
    setTranscript(value);

    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: value,
    }));
  };

  /* =======================================================
     START INTERVIEW
  ======================================================= */

  const startInterview = async () => {
    stopSpeechRecognition();

    setPage("interview");

    setQuestionIndex(0);

    setAnswers({});

    setTranscript("");

    setTimeLeft(20 * 60);

    setEvaluationResults([]);

    setOverallScore(0);

    await startCamera();
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const nextQuestion = () => {
    stopSpeechRecognition();

    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((previous) => previous + 1);
    }
  };

  const previousQuestion = () => {
    stopSpeechRecognition();

    if (questionIndex > 0) {
      setQuestionIndex((previous) => previous - 1);
    }
  };

  /* =======================================================
     FINISH INTERVIEW
  ======================================================= */

  const finishInterview = () => {
    stopSpeechRecognition();

    stopCamera();

    const results = QUESTIONS.map((question, index) => {
      const answer = answers[index] || "";

      return {
        question,
        answer,
        ...evaluateAnswer(index, answer),
      };
    });

    const total = results.reduce(
      (sum, result) => sum + result.score,
      0
    );

    const average = results.length
      ? Math.round(total / results.length)
      : 0;

    setEvaluationResults(results);

    setOverallScore(average);

    const historyItem = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      score: average,
      answered: results.filter((item) => item.answer.trim()).length,
    };

    setHistory((previous) => [historyItem, ...previous]);

    setPage("results");
  };

  /* =======================================================
     TIMER
  ======================================================= */

  useEffect(() => {
    if (page !== "interview") {
      return;
    }

    if (timeLeft <= 0) {
      finishInterview();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [page]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);

    const seconds = timeLeft % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      shouldListenRef.current = false;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log(error);
        }
      }
    };
  }, []);

  /* =======================================================
     HOME
  ======================================================= */

  if (page === "home") {
    return (
      <div className="app">
        <Navbar
          page={page}
          setPage={setPage}
          startInterview={startInterview}
        />

        <main className="home-page">
          <section className="hero">
            <div className="hero-content">
              <div className="hero-badge">
                <Sparkles size={16} />
                AI-Powered Interview Coach
              </div>

              <h1>
                Practice interviews.
                <br />
                <span>Get better.</span>
              </h1>

              <p>
                Practice realistic interviews with speech recognition,
                webcam support, and detailed feedback for every answer.
              </p>

              <button
                className="primary-button"
                onClick={startInterview}
              >
                <Play size={18} />
                Start Interview
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="hero-visual">
              <div className="floating-card">
                <Check size={18} />
                Interview Ready!
              </div>

              <div className="hero-person">
                <div className="hero-hair"></div>

                <div className="hero-face">
                  <span></span>
                  <span></span>
                </div>

                <div className="hero-body"></div>
              </div>

              <div className="hero-laptop">
                <Sparkles />
              </div>
            </div>
          </section>

          <section className="feature-grid">
            <Feature
              icon={<Mic />}
              title="Speech Recognition"
              text="Speak naturally and convert your answer into text automatically."
              className="pink"
            />

            <Feature
              icon={<Video />}
              title="Live Camera"
              text="Practice face-to-face interview communication using your webcam."
              className="blue"
            />

            <Feature
              icon={<Sparkles />}
              title="Interview Feedback"
              text="Receive scores and detailed feedback for every answer."
              className="green"
            />
          </section>
        </main>
      </div>
    );
  }

  /* =======================================================
     INTERVIEW
  ======================================================= */

  if (page === "interview") {
    const currentAnswer = answers[questionIndex] || transcript;

    return (
      <div className="app">
        <Navbar
          page={page}
          setPage={setPage}
          startInterview={startInterview}
        />

        <main className="interview-page">
          <div className="interview-header">
            <div>
              <div className="small-label">AI INTERVIEW</div>

              <h2>Frontend Developer Interview</h2>

              <p>
                Answer each question naturally as you would in a real
                interview.
              </p>
            </div>

            <div className="timer">
              <Clock size={18} />
              {formatTime()}
            </div>
          </div>

          <div className="progress-wrapper">
            <div className="progress-info">
              <span>
                Question {questionIndex + 1} of {QUESTIONS.length}
              </span>

              <span>
                {Math.round(
                  ((questionIndex + 1) / QUESTIONS.length) * 100
                )}
                %
              </span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    ((questionIndex + 1) / QUESTIONS.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="interview-grid">
            {/* CAMERA */}

            <section className="camera-card">
              <div className="camera-header">
                <div>
                  <strong>Interview Camera</strong>

                  <span>
                    {cameraEnabled
                      ? "Camera is active"
                      : "Camera is off"}
                  </span>
                </div>

                <div
                  className={
                    cameraEnabled
                      ? "camera-status active"
                      : "camera-status"
                  }
                >
                  <span></span>
                  {cameraEnabled ? "LIVE" : "OFF"}
                </div>
              </div>

              <div className="video-container">
                {cameraEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                  ></video>
                ) : (
                  <div className="camera-placeholder">
                    <Camera size={48} />
                    <strong>Camera is off</strong>
                    <span>
                      Turn on your camera to practice face-to-face.
                    </span>
                  </div>
                )}
              </div>

              <button
                className={
                  cameraEnabled
                    ? "camera-button off"
                    : "camera-button"
                }
                onClick={toggleCamera}
              >
                {cameraEnabled ? (
                  <>
                    <CameraOff size={18} />
                    Turn Camera Off
                  </>
                ) : (
                  <>
                    <Camera size={18} />
                    Turn Camera On
                  </>
                )}
              </button>
            </section>

            {/* QUESTION / ANSWER */}

            <section className="question-card">
              <div className="question-number">
                Question {questionIndex + 1}
              </div>

              <h1>{QUESTIONS[questionIndex]}</h1>

              <div className="answer-label">
                <MessageSquare size={17} />
                Your Answer
              </div>

              <textarea
                value={currentAnswer}
                onChange={(event) =>
                  updateAnswer(event.target.value)
                }
                placeholder="Type your answer here or use the microphone..."
              ></textarea>

              <div className="answer-controls">
                <button
                  className={
                    listening
                      ? "mic-button listening"
                      : "mic-button"
                  }
                  onClick={
                    listening
                      ? stopSpeechRecognition
                      : startSpeechRecognition
                  }
                >
                  {listening ? (
                    <>
                      <MicOff size={18} />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic size={18} />
                      Start Speaking
                    </>
                  )}
                </button>

                {speechSupported ? (
                  <span className="speech-info">
                    <Mic size={14} />
                    Speech recognition available
                  </span>
                ) : (
                  <span className="speech-info warning">
                    Speech recognition unavailable
                  </span>
                )}
              </div>

              <div className="question-navigation">
                <button
                  className="secondary-button"
                  onClick={previousQuestion}
                  disabled={questionIndex === 0}
                >
                  <ArrowLeft size={17} />
                  Previous
                </button>

                {questionIndex === QUESTIONS.length - 1 ? (
                  <button
                    className="finish-button"
                    onClick={finishInterview}
                  >
                    <Check size={17} />
                    Finish Interview
                  </button>
                ) : (
                  <button
                    className="primary-button"
                    onClick={nextQuestion}
                  >
                    Next Question
                    <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     RESULTS
  ======================================================= */

  if (page === "results") {
    const averageCommunication = evaluationResults.length
      ? Math.round(
          evaluationResults.reduce(
            (sum, item) => sum + item.communication,
            0
          ) / evaluationResults.length
        )
      : 0;

    const averageRelevance = evaluationResults.length
      ? Math.round(
          evaluationResults.reduce(
            (sum, item) => sum + item.relevance,
            0
          ) / evaluationResults.length
        )
      : 0;

    const averageTechnical = evaluationResults.length
      ? Math.round(
          evaluationResults.reduce(
            (sum, item) => sum + item.technical,
            0
          ) / evaluationResults.length
        )
      : 0;

    return (
      <div className="app">
        <Navbar
          page={page}
          setPage={setPage}
          startInterview={startInterview}
        />

        <main className="results-page">
          <div className="success-icon">
            <Check size={35} />
          </div>

          <h1>Interview Results</h1>

          <p>
            Your performance has been evaluated based on your answers.
          </p>

          <div className="score">
            <div className="score-circle">
              <strong>{overallScore}%</strong>
              <span>Overall Score</span>
            </div>
          </div>

          <div className="result-grid">
            <Result
              icon={<MessageSquare />}
              title="Communication"
              value={`${averageCommunication}%`}
            />

            <Result
              icon={<Sparkles />}
              title="Relevance"
              value={`${averageRelevance}%`}
            />

            <Result
              icon={<BarChart3 />}
              title="Technical"
              value={`${averageTechnical}%`}
            />
          </div>

          <div className="feedback">
            <h3>
              <Sparkles size={18} />
              Interview Feedback
            </h3>

            <p>
              {overallScore >= 85
                ? "Your answers were detailed and covered many relevant concepts. Continue practicing concise, structured explanations."
                : overallScore >= 70
                ? "Your answers addressed many of the questions. Improve further by adding specific technical details and practical examples."
                : overallScore >= 50
                ? "Your answers show a basic understanding. Focus on explaining key concepts clearly and supporting them with examples."
                : "Your answers need more development. Practice answering each question directly and explaining the important concepts."}
            </p>
          </div>

          <div className="question-results">
            <h2>Question-by-Question Feedback</h2>

            {evaluationResults.map((result, index) => (
              <div className="question-result" key={index}>
                <div className="question-result-header">
                  <div>
                    <span className="result-question-number">
                      Question {index + 1}
                    </span>

                    <h3>{result.question}</h3>
                  </div>

                  <div
                    className={
                      result.score >= 80
                        ? "score-badge good"
                        : result.score >= 60
                        ? "score-badge average"
                        : "score-badge needs-work"
                    }
                  >
                    {result.score}%
                  </div>
                </div>

                <div className="your-answer">
                  <strong>Your Answer</strong>

                  <p>
                    {result.answer || "No answer provided."}
                  </p>
                </div>

                <div className="feedback-box">
                  <strong>Feedback</strong>

                  <p>{result.feedback}</p>
                </div>

                <div className="feedback-columns">
                  <div>
                    <strong className="strength-title">
                      ✓ Strengths
                    </strong>

                    <ul>
                      {result.strengths.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <strong className="improvement-title">
                      → Improve
                    </strong>

                    <ul>
                      {result.improvements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button
              className="secondary-button"
              onClick={() => setPage("history")}
            >
              <History size={17} />
              View History
            </button>

            <button
              className="primary-button"
              onClick={startInterview}
            >
              <Play size={17} />
              Practice Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     HISTORY
  ======================================================= */

  if (page === "history") {
    return (
      <div className="app">
        <Navbar
          page={page}
          setPage={setPage}
          startInterview={startInterview}
        />

        <main className="history-page">
          <div className="history-title">
            <div className="history-icon">
              <History size={30} />
            </div>

            <h1>Interview History</h1>

            <p>Review your previous practice sessions.</p>
          </div>

          {history.length === 0 ? (
            <div className="empty-history">
              <History size={50} />

              <h2>No interviews yet</h2>

              <p>
                Complete your first interview to see your
                performance history here.
              </p>

              <button
                className="primary-button"
                onClick={startInterview}
              >
                <Play size={17} />
                Start Interview
              </button>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div className="history-card" key={item.id}>
                  <div className="history-card-icon">
                    <BarChart3 />
                  </div>

                  <div className="history-card-info">
                    <strong>Frontend Developer Interview</strong>

                    <span>{item.date}</span>

                    <small>
                      {item.answered} of {QUESTIONS.length} questions
                      answered
                    </small>
                  </div>

                  <div className="history-score">
                    <strong>{item.score}%</strong>
                    <span>Score</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            className="back-home-button"
            onClick={() => setPage("home")}
          >
            <Home size={17} />
            Back to Home
          </button>
        </main>
      </div>
    );
  }

  return null;
}

/* =========================================================
   NAVBAR
========================================================= */

function Navbar({ page, setPage, startInterview }) {
  return (
    <header className="navbar">
      <button
        className="logo"
        onClick={() => setPage("home")}
      >
        <div className="logo-icon">
          <Sparkles size={20} />
        </div>

        <span>InterviewAI</span>
      </button>

      <nav>
        <button
          className={page === "home" ? "nav-active" : ""}
          onClick={() => setPage("home")}
        >
          <Home size={16} />
          Home
        </button>

        <button
          className={page === "history" ? "nav-active" : ""}
          onClick={() => setPage("history")}
        >
          <History size={16} />
          History
        </button>

        {page !== "interview" && (
          <button
            className="nav-start"
            onClick={startInterview}
          >
            <Play size={15} />
            Start Interview
          </button>
        )}
      </nav>
    </header>
  );
}

/* =========================================================
   FEATURE
========================================================= */

function Feature({ icon, title, text, className }) {
  return (
    <div className={`feature-card ${className}`}>
      <div className="feature-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{text}</p>
    </div>
  );
}

/* =========================================================
   RESULT
========================================================= */

function Result({ icon, title, value }) {
  return (
    <div className="result-card">
      <div className="result-icon">{icon}</div>

      <div>
        <span>{title}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default App;