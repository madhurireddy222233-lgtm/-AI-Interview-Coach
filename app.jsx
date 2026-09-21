import { useEffect, useRef, useState } from "react";
import {
  Brain,
  Camera,
  CheckCircle,
  ChevronRight,
  FileText,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Upload,
  User,
  Volume2,
  XCircle,
} from "lucide-react";

import "./App.css";

const questions = [
  {
    id: 1,
    question:
      "Tell me about yourself and explain why you are interested in this role.",
    category: "HR",
    difficulty: "Easy",
  },
  {
    id: 2,
    question:
      "Explain the difference between REST and SOAP APIs with an example.",
    category: "Technical",
    difficulty: "Medium",
  },
  {
    id: 3,
    question:
      "Describe a difficult technical problem you solved and how you approached it.",
    category: "Behavioral",
    difficulty: "Medium",
  },
];

function App() {
  const [page, setPage] = useState("dashboard");

  const [jobRole, setJobRole] = useState("Software Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionIndex, setQuestionIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [answerMode, setAnswerMode] = useState("typing");

  const [listening, setListening] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState([]);

  const [resumeName, setResumeName] = useState("");

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  const currentQuestion = questions[questionIndex];

  // -----------------------------
  // Resume upload
  // -----------------------------

  const uploadResume = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setResumeName(file.name);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("user_id", "1");

      const response = await fetch(
        "http://127.0.0.1:5000/api/resumes/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Resume upload failed");
        return;
      }

      alert("Resume uploaded successfully!");
    } catch (error) {
      console.error(error);

      alert(
        "Could not connect to Flask backend. Make sure python app.py is running."
      );
    }
  };

  // -----------------------------
  // Voice recognition
  // -----------------------------

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported by this browser. Try Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setAnswer((previous) => {
        const cleanPrevious = previous.trim();

        if (!cleanPrevious) {
          return transcript;
        }

        return `${cleanPrevious} ${transcript}`;
      });
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setListening(false);
  };

  // -----------------------------
  // Camera
  // -----------------------------

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);

      // Basic camera/face-presence placeholder.
      // A real face detector can be added later using MediaPipe.
      setFaceDetected(true);
    } catch (error) {
      console.error(error);

      alert(
        "Camera permission was denied or the camera is unavailable."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setFaceDetected(false);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // -----------------------------
  // Interview
  // -----------------------------

  const startInterview = () => {
    setQuestionIndex(0);
    setAnswer("");
    setScore(null);
    setFeedback([]);

    setPage("interview");
  };

  const submitAnswer = () => {
    if (!answer.trim()) {
      alert("Please provide an answer first.");
      return;
    }

    /*
      Temporary frontend scoring.

      Later we will replace this with:
      Flask -> NLP evaluator -> relevance
                         -> keyword score
                         -> clarity
                         -> semantic similarity
                         -> final score
    */

    const words = answer.trim().split(/\s+/).length;

    let calculatedScore = 55;

    if (words >= 15) calculatedScore += 10;
    if (words >= 30) calculatedScore += 10;
    if (words >= 50) calculatedScore += 10;

    calculatedScore = Math.min(calculatedScore, 95);

    setScore(calculatedScore);

    setFeedback([
      "Your answer was submitted successfully.",
      "Try to include a concrete example.",
      "Structure your answer with a clear beginning, middle and conclusion.",
    ]);

    setPage("results");
  };

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((previous) => previous + 1);
      setAnswer("");
      setScore(null);
      setFeedback([]);
    } else {
      setPage("results");
    }
  };

  const resetInterview = () => {
    setQuestionIndex(0);
    setAnswer("");
    setScore(null);
    setFeedback([]);

    stopCamera();

    setPage("dashboard");
  };

  // -----------------------------
  // Dashboard
  // -----------------------------

  const Dashboard = () => (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <div className="badge">
            <Sparkles size={16} />
            AI Powered Interview Practice
          </div>

          <h1>
            Ace Your Next
            <span> Interview</span>
          </h1>

          <p>
            Practice realistic interviews with AI-powered questions,
            voice answers, camera support and personalized feedback.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-button"
              onClick={() => setPage("setup")}
            >
              <Play size={18} />
              Start Interview
            </button>

            <button
              className="secondary-button"
              onClick={() => setPage("resume")}
            >
              <Upload size={18} />
              Upload Resume
            </button>
          </div>
        </div>

        <div className="hero-card">
          <Brain size={80} />

          <h3>AI Interview Coach</h3>

          <p>
            Improve your confidence, communication and technical
            interview performance.
          </p>

          <div className="floating-score">
            <Target size={18} />
            <strong>82%</strong>
            <span>Average Score</span>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card purple">
          <FileText />
          <div>
            <small>Resume</small>
            <strong>{resumeName || "Not uploaded"}</strong>
          </div>
        </div>

        <div className="stat-card blue">
          <Target />
          <div>
            <small>Interviews</small>
            <strong>12 Completed</strong>
          </div>
        </div>

        <div className="stat-card green">
          <CheckCircle />
          <div>
            <small>Average Score</small>
            <strong>82%</strong>
          </div>
        </div>

        <div className="stat-card orange">
          <Sparkles />
          <div>
            <small>Improvement</small>
            <strong>+18%</strong>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div>
          <span className="section-label">FEATURES</span>
          <h2>Practice like a real interview</h2>
          <p>
            Choose how you want to answer and receive structured
            feedback after every response.
          </p>
        </div>

        <div className="feature-grid">
          <FeatureCard
            icon={<KeyboardIcon />}
            title="Typing"
            text="Type your answer naturally."
          />

          <FeatureCard
            icon={<Mic />}
            title="Voice"
            text="Answer questions using your microphone."
          />

          <FeatureCard
            icon={<Camera />}
            title="Camera"
            text="Practice with your webcam enabled."
          />

          <FeatureCard
            icon={<Brain />}
            title="NLP Evaluation"
            text="Analyze relevance, keywords and clarity."
          />
        </div>
      </section>
    </div>
  );

  // -----------------------------
  // Resume
  // -----------------------------

  const ResumePage = () => (
    <div className="center-page">
      <div className="glass-card upload-card">
        <div className="big-icon">
          <FileText />
        </div>

        <h2>Upload Your Resume</h2>

        <p>
          Upload a PDF resume so the AI can extract your skills and
          generate role-specific questions.
        </p>

        <label className="upload-box">
          <Upload size={32} />

          <strong>Choose PDF Resume</strong>

          <span>Click to browse your computer</span>

          <input
            type="file"
            accept=".pdf"
            onChange={uploadResume}
          />
        </label>

        {resumeName && (
          <div className="uploaded-file">
            <CheckCircle />
            <span>{resumeName}</span>
          </div>
        )}

        <button
          className="primary-button full"
          onClick={() => setPage("setup")}
        >
          Continue to Interview Setup
          <ChevronRight />
        </button>
      </div>
    </div>
  );

  // -----------------------------
  // Setup
  // -----------------------------

  const SetupPage = () => (
    <div className="center-page">
      <div className="glass-card setup-card">
        <span className="section-label">INTERVIEW SETUP</span>

        <h2>Create Your Interview</h2>

        <div className="form-group">
          <label>Job Role</label>

          <input
            value={jobRole}
            onChange={(event) => setJobRole(event.target.value)}
            placeholder="Example: Software Developer"
          />
        </div>

        <div className="form-group">
          <label>Difficulty</label>

          <div className="choice-grid">
            {["Easy", "Medium", "Hard"].map((item) => (
              <button
                key={item}
                className={
                  difficulty === item
                    ? "choice active"
                    : "choice"
                }
                onClick={() => setDifficulty(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="interview-info">
          <div>
            <Brain />
            <span>AI Questions</span>
            <strong>10</strong>
          </div>

          <div>
            <Mic />
            <span>Voice</span>
            <strong>Enabled</strong>
          </div>

          <div>
            <Camera />
            <span>Camera</span>
            <strong>Optional</strong>
          </div>
        </div>

        <button className="primary-button full" onClick={startInterview}>
          <Play />
          Start Interview
        </button>
      </div>
    </div>
  );

  // -----------------------------
  // Interview
  // -----------------------------

  const InterviewPage = () => (
    <div className="interview-page">
      <div className="interview-header">
        <div>
          <span className="section-label">LIVE INTERVIEW</span>
          <h2>AI Interviewer</h2>
        </div>

        <div className="progress-pill">
          Question {questionIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="interview-layout">
        <main className="question-panel">
          <div className="question-number">
            QUESTION {String(questionIndex + 1).padStart(2, "0")}
          </div>

          <h1>{currentQuestion.question}</h1>

          <div className="question-tags">
            <span>{currentQuestion.category}</span>
            <span>{currentQuestion.difficulty}</span>
          </div>

          <div className="answer-mode-tabs">
            <button
              className={
                answerMode === "typing" ? "mode active" : "mode"
              }
              onClick={() => setAnswerMode("typing")}
            >
              <KeyboardIcon />
              Typing
            </button>

            <button
              className={
                answerMode === "voice" ? "mode active" : "mode"
              }
              onClick={() => setAnswerMode("voice")}
            >
              <Mic />
              Voice
            </button>
          </div>

          <div className="answer-box">
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder={
                answerMode === "voice"
                  ? "Your spoken answer will appear here..."
                  : "Type your answer here..."
              }
            />

            <div className="answer-toolbar">
              <span>{answer.trim().split(/\s+/).filter(Boolean).length} words</span>

              {answerMode === "voice" && (
                <button
                  className={
                    listening ? "voice-button listening" : "voice-button"
                  }
                  onClick={
                    listening ? stopVoiceInput : startVoiceInput
                  }
                >
                  {listening ? <MicOff /> : <Mic />}
                  {listening ? "Stop Listening" : "Start Speaking"}
                </button>
              )}
            </div>
          </div>

          <div className="interview-actions">
            <button
              className="secondary-button"
              onClick={() => setAnswer("")}
            >
              <RotateCcw />
              Clear
            </button>

            <button className="primary-button" onClick={submitAnswer}>
              Submit Answer
              <Send />
            </button>
          </div>
        </main>

        <aside className="camera-panel">
          <div className="camera-header">
            <span>Camera</span>

            <span
              className={
                cameraOn ? "camera-status on" : "camera-status"
              }
            >
              ● {cameraOn ? "LIVE" : "OFF"}
            </span>
          </div>

          <div className="camera-preview">
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
              />
            ) : (
              <div className="camera-placeholder">
                <Camera size={50} />
                <span>Camera is off</span>
              </div>
            )}
          </div>

          <button
            className={
              cameraOn
                ? "camera-control stop"
                : "camera-control"
            }
            onClick={cameraOn ? stopCamera : startCamera}
          >
            {cameraOn ? <XCircle /> : <Camera />}

            {cameraOn ? "Turn Camera Off" : "Turn Camera On"}
          </button>

          <div className="face-status">
            {faceDetected ? (
              <>
                <CheckCircle />
                Face detected
              </>
            ) : (
              <>
                <User />
                Camera ready
              </>
            )}
          </div>

          <div className="privacy-note">
            🔒 Camera is processed locally by the browser in this
            demo. No facial identity is stored.
          </div>
        </aside>
      </div>
    </div>
  );

  // -----------------------------
  // Results
  // -----------------------------

  const ResultsPage = () => (
    <div className="center-page">
      <div className="results-card glass-card">
        <div className="success-icon">
          <CheckCircle />
        </div>

        <span className="section-label">INTERVIEW COMPLETED</span>

        <h1>Great job! 🎉</h1>

        <div className="score-circle">
          <strong>{score || 82}%</strong>
          <span>Overall Score</span>
        </div>

        <div className="score-grid">
          <ScoreCard label="Relevance" value="85%" />
          <ScoreCard label="Keywords" value="78%" />
          <ScoreCard label="Clarity" value="88%" />
          <ScoreCard label="Semantic" value="80%" />
        </div>

        <div className="feedback-box">
          <h3>
            <Sparkles />
            AI Feedback
          </h3>

          {feedback.length ? (
            feedback.map((item, index) => (
              <div className="feedback-item" key={index}>
                <CheckCircle />
                {item}
              </div>
            ))
          ) : (
            <>
              <div className="feedback-item">
                <CheckCircle />
                Good understanding of the topic.
              </div>

              <div className="feedback-item">
                <CheckCircle />
                Try to include practical examples.
              </div>
            </>
          )}
        </div>

        <div className="results-actions">
          <button
            className="secondary-button"
            onClick={resetInterview}
          >
            Dashboard
          </button>

          <button
            className="primary-button"
            onClick={startInterview}
          >
            <Play />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar page={page} setPage={setPage} />

      {page === "dashboard" && <Dashboard />}
      {page === "resume" && <ResumePage />}
      {page === "setup" && <SetupPage />}
      {page === "interview" && <InterviewPage />}
      {page === "results" && <ResultsPage />}
    </>
  );
}

// -----------------------------
// Components
// -----------------------------

function Navbar({ page, setPage }) {
  return (
    <nav className="navbar">
      <button
        className="brand"
        onClick={() => setPage("dashboard")}
      >
        <div className="brand-icon">
          <Brain />
        </div>

        <div>
          <strong>AI Interview</strong>
          <span>Coach</span>
        </div>
      </button>

      <div className="nav-links">
        <button
          className={page === "dashboard" ? "nav-active" : ""}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button onClick={() => setPage("setup")}>
          Practice
        </button>

        <button onClick={() => setPage("resume")}>
          Resume
        </button>
      </div>

      <div className="profile">
        <div className="avatar">
          <User size={18} />
        </div>
        <span>Candidate</span>
      </div>
    </nav>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ScoreCard({ label, value }) {
  return (
    <div className="score-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function KeyboardIcon() {
  return (
    <span className="keyboard-icon">
      ⌨️
    </span>
  );
}

export default App;