# app.py
#test not used repo 
from flask import Flask, jsonify, request
from flask_cors import CORS
from controllers.pdfloader import prepare_pipeline, get_summary, get_key_points, generate_quiz, answer_question
import threading

app = Flask(__name__)
CORS(app)  
_chain = None

def init_chain():
    global _chain
    _chain = prepare_pipeline()

threading.Thread(target=init_chain, daemon=True).start()

@app.get("/health")
def health():
    ready = _chain is not None
    return jsonify({"status": "ok", "ready": ready})

@app.get("/summary")
def summary():
    if _chain is None:
        return jsonify({"error": "pipeline not ready"}), 503
    short = request.args.get("short", "false").lower() == "true"
    text = get_summary(_chain, short=short)
    return jsonify({"summary": text})

@app.get("/keypoints")
def keypoints():
    if _chain is None:
        return jsonify({"error": "pipeline not ready"}), 503
    count = int(request.args.get("count", 8))
    points = get_key_points(_chain, count=count)
    return jsonify({"keypoints": points})

@app.get("/quiz")
def quiz():
    if _chain is None:
        return jsonify({"error": "pipeline not ready"}), 503
    n = int(request.args.get("n", 5))
    quiz = generate_quiz(_chain, n_questions=n)
    return jsonify({"quiz": quiz})

@app.post("/qa")
def qa():
    if _chain is None:
        return jsonify({"error": "pipeline not ready"}), 503
    payload = request.json or {}
    q = payload.get("question", "")
    if not q:
        return jsonify({"error":"question missing"}), 400
    ans = answer_question(_chain, q)
    return jsonify({"answer": ans})

if __name__ == "__main__":
    app.run(port=8080, debug=True)
