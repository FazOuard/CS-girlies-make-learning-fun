# -*- coding: utf-8 -*-
# controllers/pdfloader.py
import os
import torch
from typing import List, Dict, Any
import pypdf
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_community.llms import LlamaCpp
import json
import logging

logger = logging.getLogger(__name__)

# ---------- Config ----------
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Try to find the model - either locally or download from HuggingFace
def get_model_path():
    """Get or download the GGUF model"""
    # Check if it's in the root directory
    local_path = r"./mistral-7b-openorca.Q4_0.gguf"
    if os.path.exists(local_path):
        logger.info(f"Found model at: {local_path}")
        return local_path
    
    # Try to download from HuggingFace
    try:
        from huggingface_hub import hf_hub_download
        logger.info("Downloading model from HuggingFace...")
        model_path = hf_hub_download(
            repo_id="TheBloke/Mistral-7B-OpenOrca-GGUF",
            filename="mistral-7b-openorca.Q4_0.gguf"
        )
        logger.info(f"Model downloaded to: {model_path}")
        return model_path
    except Exception as e:
        logger.error(f"Failed to download model: {e}")
        return None

MODEL_PATH = get_model_path()
# ----------------------------

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info(f"Using device: {device}")


class SimpleChain:
    """Simple Q&A chain for PDF"""
    def __init__(self, llm, retriever):
        self.llm = llm
        self.retriever = retriever
        self.chat_history = []
        logger.info("✅ SimpleChain initialized")
    
    def run(self, query_dict):
        try:
            question = query_dict.get("question", "")
            logger.info(f"Processing query: {question[:50]}...")
            
            # Retrieve relevant documents
            docs = self.retriever.invoke(question)
            context = "\n".join([doc.page_content for doc in docs])
            
            # Build prompt
            prompt = f"""Based on the following context from the PDF, answer the question.

Context:
{context[:2000]}

Question: {question}

Answer:"""
            
            logger.info("Invoking LLM...")
            # Get response from LLM
            response = self.llm.invoke(prompt)
            logger.info(f"LLM response received: {len(str(response))} chars")
            
            # Store in chat history
            self.chat_history.append({
                "question": question,
                "answer": response
            })
            
            return str(response)
        except Exception as e:
            logger.error(f"Error in SimpleChain.run: {e}", exc_info=True)
            raise


def load_and_chunk(pdf_path: str, chunk_size: int = 10000, chunk_overlap: int = 200):
    """Load PDF and split into chunks using pypdf"""
    try:
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF not found: {pdf_path}")
        
        logger.info(f"📄 Loading PDF: {pdf_path}")
        
        # Load PDF with pypdf
        pdf_reader = pypdf.PdfReader(pdf_path)
        
        if len(pdf_reader.pages) == 0:
            raise ValueError(f"No pages found in PDF: {pdf_path}")
        
        logger.info(f"📖 Found {len(pdf_reader.pages)} pages")
        
        # Extract text from all pages
        full_text = ""
        for page_num, page in enumerate(pdf_reader.pages):
            text = page.extract_text()
            if text:
                full_text += text + "\n"
            logger.debug(f"Extracted page {page_num + 1}")
        
        if not full_text.strip():
            logger.warning("PDF text extraction returned empty content")
            full_text = "PDF content could not be extracted"
        
        # Create a Document object for langchain compatibility
        docs = [Document(page_content=full_text, metadata={"source": pdf_path})]
        
        # Split into chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, 
            chunk_overlap=chunk_overlap
        )
        chunks = splitter.split_documents(docs)
        
        logger.info(f"✂️ Created {len(chunks)} chunks")
        
        return chunks
    except Exception as e:
        logger.error(f"Error in load_and_chunk: {e}", exc_info=True)
        raise


def build_vectorstore(docs, persist_dir: str = None):
    """Build Chroma vector store from documents"""
    try:
        logger.info("🔨 Building vector store...")
        
        embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={"device": device}
        )
        logger.info("✅ Embeddings model loaded")
        
        if persist_dir:
            os.makedirs(persist_dir, exist_ok=True)
            logger.info(f"Creating persistent store at: {persist_dir}")
            vect = Chroma.from_documents(
                documents=docs,
                embedding=embeddings,
                persist_directory=persist_dir
            )
        else:
            logger.info("Creating in-memory vector store")
            vect = Chroma.from_documents(documents=docs, embedding=embeddings)
        
        logger.info("✅ Vector store built successfully")
        
        return vect
    except Exception as e:
        logger.error(f"Error in build_vectorstore: {e}", exc_info=True)
        raise


def create_llm():
    """Initialize LLM using LlamaCpp (local GGUF)"""
    
    try:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        
        logger.info(f"🤖 Loading GGUF model from: {MODEL_PATH}")
        
        llm = LlamaCpp(
            model_path=MODEL_PATH,
            temperature=0.75,
            top_p=1,
            top_k=40,
            f16_kv=True,
            verbose=False,
            n_ctx=4096,
            n_threads=8,  # Adjust based on your CPU
            n_gpu_layers=32  # Adjust if you have GPU
        )
        
        logger.info("✅ GGUF model loaded successfully")
        return llm
    except FileNotFoundError as e:
        logger.error(f"❌ Model file error: {e}")
        raise RuntimeError(f"Model not found. Download mistral-7b-openorca.Q4_0.gguf and place it in root directory")
    except Exception as e:
        logger.error(f"❌ LlamaCpp error: {e}")
        raise RuntimeError(f"Failed to load GGUF model: {str(e)}")


def create_conversational_chain(llm, vector_store):
    """Create Q&A chain"""
    try:
        logger.info("🔗 Creating Q&A chain...")
        
        chain = SimpleChain(llm, vector_store.as_retriever())
        
        logger.info("✅ Chain created successfully")
        return chain
    except Exception as e:
        logger.error(f"Error creating chain: {e}", exc_info=True)
        raise


# ---------- High-level operations ----------

def get_summary(chain: SimpleChain, short: bool = False) -> str:
    """Generate summary from document"""
    try:
        if short:
            question = "Provide a short (3-4 sentence) summary of this PDF."
        else:
            question = (
            "Summarize the content of this PDF as if it were a fantasy story. "
            "Include the main events, characters, or important ideas, "
            "but present them in a magical, storytelling style."
        )
            
        res = chain.run({"question": question})
        return str(res)
    except Exception as e:
        logger.error(f"Error in get_summary: {e}")
        return f"Error generating summary: {str(e)}"


def get_key_points(chain: SimpleChain, count: int = 8) -> List[str]:
    """Extract key points from document"""
    try:
        prompt = (
            f"Extract the {count} most important key points from this PDF as numbered list. "
            "Return each point as a single line starting with the number."
        )
        res = chain.run({"question": prompt})
        res_str = str(res)
        points = [p.strip() for p in res_str.splitlines() if p.strip() and len(p.strip()) > 2]
        return points if len(points) >= 1 else [res_str]
    except Exception as e:
        logger.error(f"Error in get_key_points: {e}")
        return [f"Error extracting key points: {str(e)}"]


import re

def generate_quiz(chain: SimpleChain, n_questions: int = 5) -> list:
    """Generate multiple-choice quiz from document"""
    try:
        # More explicit prompt with clear examples
        prompt = f"""Based on the PDF content, create exactly {n_questions} multiple-choice questions.

IMPORTANT: Return ONLY a valid JSON object, no extra text before or after.

Format EXACTLY like this example:
{{
  "quiz": [
    {{
      "q": "What is the main concept discussed in the document?",
      "options": [
        "Machine learning algorithms",
        "Data preprocessing techniques", 
        "Neural network architectures",
        "Statistical analysis methods"
      ],
      "answer": 2,
      "explanation": "The document focuses primarily on neural network architectures."
    }},
    {{
      "q": "Which method is recommended for data cleaning?",
      "options": [
        "Remove all null values",
        "Fill with mean values",
        "Use forward fill",
        "Apply interpolation"
      ],
      "answer": 1,
      "explanation": "The document recommends filling null values with mean values."
    }}
  ]
}}

Rules:
- Each question must have exactly 4 options
- The 'answer' field is the index (0-3) of the correct option
- Options must be specific content from the PDF, not generic labels
- Questions should test actual comprehension of the document

Generate {n_questions} questions now in the exact JSON format shown above."""

        logger.info(f"Generating {n_questions} quiz questions...")
        res = chain.run({"question": prompt})
        res_str = str(res).strip()
        
        logger.info(f"Raw LLM response: {res_str[:200]}...")
        
        # Try multiple extraction strategies
        quiz = None
        
        # Strategy 1: Direct JSON parse
        try:
            parsed = json.loads(res_str)
            quiz = parsed.get("quiz", [])
            if quiz:
                logger.info(f"✅ Parsed {len(quiz)} questions via direct parse")
        except json.JSONDecodeError:
            logger.warning("Direct JSON parse failed, trying regex extraction")
        
        # Strategy 2: Extract JSON with regex
        if not quiz:
            match = re.search(r'\{[^{}]*"quiz"\s*:\s*\[.*?\]\s*\}', res_str, re.DOTALL)
            if match:
                try:
                    parsed = json.loads(match.group())
                    quiz = parsed.get("quiz", [])
                    if quiz:
                        logger.info(f"✅ Parsed {len(quiz)} questions via regex")
                except json.JSONDecodeError:
                    logger.warning("Regex extracted JSON is invalid")
        
        # Strategy 3: Find any JSON array
        if not quiz:
            match = re.search(r'\[(?:[^[\]]|\[[^\]]*\])*\]', res_str, re.DOTALL)
            if match:
                try:
                    quiz = json.loads(match.group())
                    if isinstance(quiz, list) and quiz:
                        logger.info(f"✅ Parsed {len(quiz)} questions from array")
                except json.JSONDecodeError:
                    logger.warning("Array extraction failed")
        
        # Validate and fix quiz structure
        if quiz and isinstance(quiz, list):
            validated_quiz = []
            for i, item in enumerate(quiz):
                # Ensure each question has required fields
                if not isinstance(item, dict):
                    continue
                
                q_text = item.get("q") or item.get("question") or f"Question {i+1}"
                options = item.get("options") or item.get("choices") or []
                answer = item.get("answer")
                explanation = item.get("explanation") or "Check the document for details."
                
                # Validate options
                if not isinstance(options, list) or len(options) < 2:
                    continue
                
                # Ensure we have 4 options
                while len(options) < 4:
                    options.append(f"Additional option {len(options) + 1}")
                options = options[:4]
                
                # Validate answer index
                if answer is None:
                    answer = 0
                elif isinstance(answer, str):
                    # Try to convert letter to index (A->0, B->1, etc)
                    letter_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
                    answer = letter_map.get(answer.upper(), 0)
                else:
                    answer = int(answer) if 0 <= int(answer) < len(options) else 0
                
                validated_quiz.append({
                    "q": str(q_text),
                    "options": [str(opt) for opt in options],
                    "answer": answer,
                    "explanation": str(explanation)
                })
            
            if validated_quiz:
                logger.info(f"✅ Returning {len(validated_quiz)} validated questions")
                return validated_quiz
        
        # If all strategies failed, return enhanced fallback
        logger.warning("All parsing strategies failed, using fallback quiz")
        raise ValueError("Could not parse quiz from LLM response")
        
    except Exception as e:
        logger.error(f"Quiz generation error: {e}")
        # Enhanced fallback quiz based on document
        try:
            # Try to get at least some context from the document
            context_prompt = "What are the 4 main topics or concepts discussed in this PDF? List them briefly."
            context_res = chain.run({"question": context_prompt})
            context_str = str(context_res)
            
            # Extract topics
            topics = [line.strip() for line in context_str.split('\n') if line.strip()][:4]
            
            if len(topics) >= 2:
                return [
                    {
                        "q": "What is one of the main topics discussed in the document?",
                        "options": topics[:4] if len(topics) >= 4 else topics + ["Not discussed"] * (4 - len(topics)),
                        "answer": 0,
                        "explanation": "This topic is covered in the document."
                    }
                ]
        except:
            pass
        
        # Final fallback
        return [
            {
                "q": "Based on the document, what would you say is the primary focus?",
                "options": [
                    "Theoretical concepts and frameworks",
                    "Practical applications and examples", 
                    "Historical background and context",
                    "Future trends and predictions"
                ],
                "answer": 0,
                "explanation": "Review the document to determine the primary focus."
            }
        ]

def answer_question(chain: SimpleChain, question: str) -> str:
    """Answer a user question based on document"""
    try:
        return chain.run({"question": question})
    except Exception as e:
        logger.error(f"Error in answer_question: {e}")
        return f"Error answering question: {str(e)}"


# ---------- Main pipeline ----------

def prepare_pipeline(pdf_path: str, persist_dir: str = None):
    """Build complete pipeline: load PDF, chunk, embed, create chain"""
    try:
        logger.info(f"🚀 Starting pipeline for: {pdf_path}")
        
        docs = load_and_chunk(pdf_path)
        logger.info(f"✂️ Created {len(docs)} chunks")
        
        vect = build_vectorstore(docs, persist_dir=persist_dir)
        logger.info("✅ Vector store ready")
        
        logger.info("⚙️ Initializing LLM (this may take a moment)...")
        llm = create_llm()
        
        logger.info("🔗 Creating Q&A chain...")
        chain = create_conversational_chain(llm, vect)
        
        logger.info("✅ Pipeline ready!")
        return chain
    except Exception as e:
        logger.error(f"❌ Pipeline error: {e}", exc_info=True)
        raise