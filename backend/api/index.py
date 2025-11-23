# -*- coding: utf-8 -*-
# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from controllers.pdfloader import (
    prepare_pipeline,
    get_summary,
    get_key_points,
    generate_quiz,
    answer_question
)
import threading
import os
import logging
import shutil
import hashlib
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
@app.route("/")
def index():
    return "Hello from Flask!"

# Configuration CORS
CORS(app, resources={
    r"/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configuration
UPLOAD_FOLDER = "./uploads"
CHROMA_DB_FOLDER = "./chroma_dbs"
ALLOWED_EXTENSIONS = {'pdf'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CHROMA_DB_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Store active chains per session/document
_chains = {}  # {session_id: chain}
_processing = {}  # {session_id: bool}
_errors = {}  # {session_id: error_message}


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def init_chain_for_file(session_id: str, pdf_path: str):
    """Initialize chain in background thread"""
    try:
        logger.info(f"🔄 Processing {session_id}...")
        _processing[session_id] = True
        
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF not found: {pdf_path}")
        
        db_path = os.path.join(CHROMA_DB_FOLDER, session_id)
        chain = prepare_pipeline(pdf_path=pdf_path, persist_dir=db_path)
        
        _chains[session_id] = chain
        _processing[session_id] = False
        logger.info(f"✅ {session_id} ready!")
        
    except Exception as e:
        _processing[session_id] = False
        error_msg = str(e)
        _errors[session_id] = error_msg
        logger.error(f"❌ Error {session_id}: {error_msg}", exc_info=True)


@app.post("/upload")
def upload_pdf():
    """Upload a PDF and get a session ID"""
    try:
        if 'file' not in request.files:
            logger.warning("Upload attempt without file")
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            logger.warning("Upload attempt with empty filename")
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            logger.warning(f"Upload attempt with invalid file type: {file.filename}")
            return jsonify({"error": "Only PDF files are allowed"}), 400
        
        logger.info(f"📥 Uploading: {file.filename}")
        
        # Generate unique session ID
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_hash = hashlib.md5(file.filename.encode()).hexdigest()[:8]
        session_id = f"{timestamp}_{file_hash}"
        
        # Save file
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}.pdf")
        file.save(pdf_path)
        logger.info(f"💾 Saved to: {pdf_path}")
        
        # Verify file was saved
        if not os.path.exists(pdf_path):
            logger.error(f"File was not saved: {pdf_path}")
            return jsonify({"error": "Failed to save file"}), 500
        
        file_size = os.path.getsize(pdf_path)
        logger.info(f"✅ File saved successfully ({file_size} bytes)")
        
        # Initialize chain in background thread
        threading.Thread(
            target=init_chain_for_file,
            args=(session_id, pdf_path),
            daemon=True
        ).start()
        
        return jsonify({
            "session_id": session_id,
            "message": "PDF uploaded. Processing started...",
            "filename": file.filename
        }), 202
    
    except Exception as e:
        logger.error(f"Upload error: {str(e)}", exc_info=True)
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500


@app.get("/status/<session_id>")
def status(session_id):
    """Check if a document is ready"""
    try:
        if session_id not in _chains and session_id not in _processing and session_id not in _errors:
            logger.warning(f"Status check for unknown session: {session_id}")
            return jsonify({"error": "Session not found"}), 404
        
        is_ready = session_id in _chains and not isinstance(_chains[session_id], dict)
        is_processing = _processing.get(session_id, False)
        has_error = session_id in _errors
        
        response = {
            "session_id": session_id,
            "ready": is_ready,
            "processing": is_processing,
            "error": _errors.get(session_id) if has_error else None
        }
        
        logger.debug(f"Status check {session_id}: ready={is_ready}, processing={is_processing}")
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Status error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.get("/health")
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "API is running"})


@app.get("/summary/<session_id>")
def summary(session_id):
    """Get document summary"""
    if session_id not in _chains:
        logger.warning(f"Summary requested for unavailable session: {session_id}")
        return jsonify({"error": "Document not ready or session not found"}), 503
    
    try:
        chain = _chains[session_id]
        short = request.args.get("short", "false").lower() == "true"
        logger.info(f"Generating {'short' if short else 'full'} summary for {session_id}")
        text = get_summary(chain, short=short)
        return jsonify({"summary": text})
    except Exception as e:
        logger.error(f"Summary error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.get("/keypoints/<session_id>")
def keypoints(session_id):
    """Get key points from document"""
    if session_id not in _chains:
        logger.warning(f"Keypoints requested for unavailable session: {session_id}")
        return jsonify({"error": "Document not ready or session not found"}), 503
    
    try:
        chain = _chains[session_id]
        count = int(request.args.get("count", 8))
        logger.info(f"Extracting {count} keypoints for {session_id}")
        points = get_key_points(chain, count=count)
        return jsonify({"keypoints": points})
    except Exception as e:
        logger.error(f"Keypoints error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.get("/quiz/<session_id>")
def quiz(session_id):
    """Generate quiz from document"""
    if session_id not in _chains:
        logger.warning(f"Quiz requested for unavailable session: {session_id}")
        return jsonify({"error": "Document not ready or session not found"}), 503
    
    try:
        chain = _chains[session_id]
        n = int(request.args.get("n", 5))
        logger.info(f"Generating {n} quiz questions for {session_id}")
        quiz_data = generate_quiz(chain, n_questions=n)
        return jsonify({"quiz": quiz_data})
    except Exception as e:
        logger.error(f"Quiz error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.post("/qa/<session_id>")
def qa(session_id):
    """Answer a question about the document"""
    if session_id not in _chains:
        logger.warning(f"QA requested for unavailable session: {session_id}")
        return jsonify({"error": "Document not ready or session not found"}), 503
    
    try:
        chain = _chains[session_id]
        payload = request.json or {}
        q = payload.get("question", "")
        
        if not q:
            logger.warning(f"QA request without question for {session_id}")
            return jsonify({"error": "question missing"}), 400
        
        logger.info(f"Answering question for {session_id}: {q[:50]}...")
        ans = answer_question(chain, q)
        return jsonify({"answer": ans})
    except Exception as e:
        logger.error(f"QA error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.delete("/session/<session_id>")
def delete_session(session_id):
    """Clean up a session and free resources"""
    try:
        logger.info(f"Deleting session: {session_id}")
        
        if session_id in _chains:
            del _chains[session_id]
        if session_id in _processing:
            del _processing[session_id]
        if session_id in _errors:
            del _errors[session_id]
        
        # Delete uploaded file
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}.pdf")
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
            logger.info(f"Deleted file: {pdf_path}")
        
        # Delete chroma db
        db_path = os.path.join(CHROMA_DB_FOLDER, session_id)
        if os.path.exists(db_path):
            shutil.rmtree(db_path)
            logger.info(f"Deleted DB: {db_path}")
        
        return jsonify({"message": f"Session {session_id} deleted"})
    
    except Exception as e:
        logger.error(f"Delete error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    logger.info("=" * 50)
    logger.info("🚀 Starting Flask app on port 8080...")
    logger.info("=" * 50)
    app.run(port=8080, debug=True)
