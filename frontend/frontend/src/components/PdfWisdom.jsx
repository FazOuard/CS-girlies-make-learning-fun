import React, { useState } from 'react';

export default function PdfWisdom({ onClose }) {
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [showKeyPoints, setShowKeyPoints] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const API_BASE = 'http://localhost:8080';

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        setStep('mode');
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const waitForReady = async (session_id) => {
  let ready = false;
  while (!ready) {
    try {
      const res = await fetch(`${API_BASE}/status/${session_id}`);
      const data = await res.json();
      if (data.ready) {
        ready = true;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        await new Promise(r => setTimeout(r, 1000)); // attendre 1s
      }
    } catch (err) {
      console.error("Status check failed:", err);
      await new Promise(r => setTimeout(r, 2000)); // retry plus tard
    }
  }
};

const handleGetSummary = async () => {
  if (!sessionId) return;
  setLoading(true);
  try {
    // attendre que le pipeline soit prêt
    await waitForReady(sessionId);

    const res = await fetch(`${API_BASE}/summary/${sessionId}?short=false`);
    const data = await res.json();
    if (data.summary) {
      setContent(data.summary);
      setStep('summary');

      const kpRes = await fetch(`${API_BASE}/keypoints/${sessionId}?count=8`);
      const kpData = await kpRes.json();
      setKeyPoints(kpData.keypoints || []);
    }
  } catch (err) {
    console.error(err);
    alert('Error fetching summary');
  } finally {
    setLoading(false);
  }
};

  const handleGetQuiz = async () => {
  if (!sessionId) return;
  setLoading(true);
  try {
    // Wait until the quiz is ready
    await waitForReady(sessionId);

    const res = await fetch(`${API_BASE}/quiz/${sessionId}?n=5`);
    const data = await res.json();
    if (data.quiz) {
      setQuiz(data.quiz);
      setStep('quiz');
      setQuizSubmitted(false);
      setQuizAnswers({});
    } else {
      alert('Quiz is empty or not available');
    }
  } catch (err) {
    console.error(err);
    alert('Error fetching quiz');
  } finally {
    setLoading(false);
  }
};

  const handleQuizAnswer = (qIndex, optionIndex) => {
    if (!quizSubmitted) {
      setQuizAnswers({ ...quizAnswers, [qIndex]: optionIndex });
    }
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) score++;
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/qa/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (data.answer) {
        setAnswer(data.answer);
      }
    } catch (err) {
      console.error(err);
      alert('Error getting answer');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('upload');
    setFile(null);
    setSessionId(null);
    setContent('');
    setQuiz([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuestion('');
    setAnswer('');
    setKeyPoints([]);
    setShowKeyPoints(false);
  };

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.3) 0%, rgba(186, 85, 211, 0.3) 100%)',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: 620,
        background: '#C9A876',
        borderRadius: 0,
        padding: 16,
        boxShadow: '0 0 0 8px #8B5A3C, 0 0 0 12px #5a5a5a',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '4px solid #5a5a5a',
        position: 'relative',
        fontFamily: '"Press Start 2P", monospace',
        imageRendering: 'pixelated',
      }}>
        
        

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          input[type="file"]::file-selector-button {
            background: linear-gradient(135deg, #A0826D 0%, #8a705dff 100%);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(255, 20, 147, 0.3);
          }
        `}</style>

       
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '4px solid #8B5A3C',
        }}>
          <div>
            <h1 style={{
              fontSize: 24,
              margin: '0 0 4px 0',
              color: '#8B3A3A',
              fontFamily: '"Press Start 2P", pixel fonts, monospace'
              
            }}>
              Wisdom Tree
            </h1>
          </div>
          <button onClick={onClose} style={{
            border: '4px solid #5a5a5a',
            background: '#A0826D',
            color: '#2a2a2a',
            fontSize: 20,
            cursor: 'pointer',
            borderRadius: 0,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.2), inset -2px -2px 0px rgba(255,255,255,0.3)',
            fontFamily: '"Press Start 2P", monospace',
          }}>X</button>
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div>
            <p style={{ marginBottom: 20, color: '#A0826D', fontSize: 15, fontWeight: 500 }}> Drop your scroll here to gain knowledge!</p>
            <div style={{
              background: 'rgba(255, 192, 203, 0.3)',
              border: '2px dashed #A0826D',
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              marginBottom: 16,
            }}>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFile}
                style={{ display: 'block', marginBottom: 12 }}
              />
              {file && <p style={{ fontSize: 13, color: '#A0826D', fontWeight: 'bold' }}> {file.name}</p>}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: loading ? '#c5a086ff' : 'linear-gradient(135deg, #A0826D, #826b5aff)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 25,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 14,
                  boxShadow: '0 6px 20px rgba(255, 20, 147, 0.3)',
                  opacity: !file || loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Uploading...' : 'Begin Quest!'}
              </button>
              
            </div>
          </div>
        )}

        {/* Mode Selection Step */}
        {step === 'mode' && (
          <div>
            <p style={{ marginBottom: 24, color: '#A0826D', fontSize: 15, fontWeight: 500 }}> Choose your path, traveler!</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button
                onClick={handleGetSummary}
                disabled={loading}
                style={{
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, #ffc0cb, #ffb6d9)',
                  color: '#957864ff',
                  border: '2px solid #A0826D',
                  borderRadius: 16,
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1,
                  boxShadow: '0 6px 20px rgba(255, 105, 180, 0.2)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)')}
              >
                Summary & Key Points
              </button>
              <button
                onClick={handleGetQuiz}
                disabled={loading}
                style={{
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, #A0826D, #927764ff)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1,
                  boxShadow: '0 6px 20px rgba(255, 20, 147, 0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)')}
              >
                Quiz Challenge
              </button>
            </div>
            <button
              onClick={reset}
              style={{
                marginTop: 16,
                padding: '10px 14px',
                background: '#ffe0f0',
                border: '2px solid #A0826D',
                borderRadius: 20,
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#7c6757ff',
                fontSize: 13,
                width: '100%',
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Summary Step */}
        {step === 'summary' && (
          <div>
            <h3 style={{ marginBottom: 14, color: '#856d5cff', fontSize: 18, fontWeight: 'bold' }}>📖 Your Summary</h3>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 192, 203, 0.5), rgba(255, 220, 230, 0.5))',
              padding: 16,
              borderRadius: 14,
              marginBottom: 16,
              maxHeight: 280,
              overflow: 'auto',
              fontSize: 13,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              border: '2px solid rgba(255, 105, 180, 0.2)',
              color: '#333',
            }}>
              {content}
            </div>

            <button
              onClick={() => setShowKeyPoints(!showKeyPoints)}
              style={{
                marginBottom: 14,
                padding: '10px 14px',
                background: showKeyPoints ? 'linear-gradient(135deg, #ffc0cb, #ffb6d9)' : '#ffe0f0',
                border: '2px solid #A0826D',
                borderRadius: 20,
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#746052ff',
                fontSize: 13,
                width: '100%',
              }}
            >
              {showKeyPoints ? '▼ Hide Key Points' : '▶ Key Points'}
            </button>

            {showKeyPoints && (
              <div style={{
                background: 'linear-gradient(135deg, #fffacd, #ffffe0)',
                padding: 14,
                borderRadius: 14,
                marginBottom: 16,
                fontSize: 13,
                lineHeight: 1.8,
                border: '2px solid #ffd700',
              }}>
                <strong style={{ color: '#d4a800' }}>Key Points:</strong>
                <ul style={{ marginTop: 10, color: '#333' }}>
                  {keyPoints.map((kp, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}> {kp}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{
              background: 'rgba(255, 192, 203, 0.2)',
              border: '2px solid #ffb6d9',
              padding: 14,
              borderRadius: 14,
              marginBottom: 16,
            }}>
              <p style={{ marginBottom: 10, fontSize: 13, fontWeight: 'bold', color: '#836b5bff' }}> Ask the Tree</p>
              <input
                type="text"
                placeholder="Ask something... "
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '2px solid #7c6758ff',
                  marginBottom: 8,
                  boxSizing: 'border-box',
                  fontSize: 13,
                  background: 'rgba(255, 255, 255, 0.8)',
                }}
              />
              <button
                onClick={handleAskQuestion}
                disabled={loading || !question.trim()}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: loading || !question.trim() ? '#ffb6d9' : 'linear-gradient(135deg, #A0826D, #7c6656ff)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 13,
                  opacity: loading || !question.trim() ? 0.6 : 1,
                }}
              >
                {loading ? 'Searching...' : 'Get Answer'}
              </button>
              {answer && (
                <div style={{
                  marginTop: 12,
                  padding: 12,
                  background: 'linear-gradient(135deg, #e7f3ff, #f0e5ff)',
                  borderRadius: 10,
                  fontSize: 12,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  border: '2px solid #b6d9ff',
                  color: '#333',
                }}>
                  <strong style={{ color: '#1976d2' }}> Tree Says:</strong> {answer}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep('mode')} style={{
                flex: 1,
                padding: '10px 12px',
                background: '#ffe0f0',
                border: '2px solid #ff69b4',
                borderRadius: 10,
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#ff1493',
                fontSize: 13,
              }}>
                ← Back
              </button>
              <button onClick={onClose} style={{
                flex: 1,
                padding: '10px 12px',
                background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#fff',
                fontSize: 13,
              }}>
                Exit
              </button>
            </div>
          </div>
        )}

        {/* Quiz Step */}
        {step === 'quiz' && (
          <div>
            <h3 style={{ marginBottom: 16, color: '#ff1493', fontSize: 18, fontWeight: 'bold' }}>
              Quiz Challenge {quizSubmitted && `(Score: ${quizScore}/${quiz.length})`}
            </h3>
            {quiz.map((q, qIdx) => (
              <div key={qIdx} style={{
                marginBottom: 18,
                padding: 14,
                background: 'linear-gradient(135deg, rgba(255, 192, 203, 0.4), rgba(255, 220, 230, 0.4))',
                borderRadius: 14,
                border: '2px solid rgba(255, 105, 180, 0.3)',
              }}>
                <p style={{ marginBottom: 12, fontWeight: 'bold', fontSize: 14, color: '#d91e63' }}>
                  Q{qIdx + 1}: {q.q}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.options.map((opt, oIdx) => (
                    <label key={oIdx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: quizSubmitted ? 'default' : 'pointer',
                      padding: '10px 12px',
                      borderRadius: 10,
                      background:
                        quizSubmitted && quizAnswers[qIdx] === oIdx
                          ? oIdx === q.answer
                            ? 'linear-gradient(135deg, #d4edda, #c3e6cb)'
                            : 'linear-gradient(135deg, #f8d7da, #f5c6cb)'
                          : quizSubmitted && oIdx === q.answer
                          ? 'linear-gradient(135deg, #d4edda, #c3e6cb)'
                          : 'rgba(255, 255, 255, 0.6)',
                      border: '2px solid' + (
                        quizSubmitted && oIdx === q.answer ? ' #28a745' : ' rgba(255, 105, 180, 0.2)'
                      ),
                    }}>
                      <input
                        type="radio"
                        name={`q${qIdx}`}
                        checked={quizAnswers[qIdx] === oIdx}
                        onChange={() => handleQuizAnswer(qIdx, oIdx)}
                        disabled={quizSubmitted}
                        style={{ cursor: 'pointer', accentColor: '#ff1493' }}
                      />
                      <span style={{
                        fontSize: 13,
                        color: quizSubmitted && oIdx === q.answer ? '#155724' : quizSubmitted && quizAnswers[qIdx] === oIdx ? '#721c24' : '#333',
                        fontWeight: quizSubmitted && oIdx === q.answer ? 'bold' : 'normal',
                      }}>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
                {quizSubmitted && (
                  <p style={{
                    marginTop: 12,
                    fontSize: 12,
                    color: '#d946a6',
                    fontStyle: 'italic',
                    background: 'rgba(255, 192, 203, 0.3)',
                    padding: '8px 10px',
                    borderRadius: 8,
                  }}>
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 14,
                    boxShadow: '0 6px 20px rgba(255, 20, 147, 0.3)',
                  }}
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => {
                    setStep('mode');
                    setQuiz([]);
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #ffc0cb, #ffb6d9)',
                    color: '#d91e63',
                    border: '2px solid #ff69b4',
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                >
                  Try Another
                </button>
              )}
              <button onClick={() => setStep('mode')} style={{
                flex: 1,
                padding: '12px 16px',
                background: '#ffe0f0',
                border: '2px solid #ff69b4',
                borderRadius: 20,
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#ff1493',
                fontSize: 14,
              }}>
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}