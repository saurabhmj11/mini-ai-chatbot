import json
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from thefuzz import process

# Initialize the Flask app
app = Flask(__name__)

# FIX: Updated CORS configuration for production deployment
CORS(app, resources={r"/ask": {"origins": "*"}})

# --- KNOWLEDGE BASE ---
def load_knowledge_base(file_path='knowledge_base.json'):
    """Loads the knowledge base from a JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data['questions']
    except FileNotFoundError:
        # IMPROVEMENT: Gracefully handle if the KB file is missing
        sys.stderr.write(f"Error: Knowledge base file not found at {file_path}\n")
        return []
    except json.JSONDecodeError:
        # IMPROVEMENT: Gracefully handle if the KB file is not valid JSON
        sys.stderr.write(f"Error: Could not decode JSON from {file_path}\n")
        return []

# --- DATA LOADING AND PREPARATION ---
# IMPROVEMENT: Load data at startup and prepare for efficient lookups
knowledge_base = load_knowledge_base()
if knowledge_base:
    questions_list = [q['question'] for q in knowledge_base]
    # IMPROVEMENT: Create a dictionary for instant answer lookups (more efficient)
    question_to_answer_map = {q['question']: q['answer'] for q in knowledge_base}
else:
    questions_list = []
    question_to_answer_map = {}
    sys.stderr.write("Warning: Knowledge base is empty. Chatbot will not be able to answer questions.\n")


# --- API ENDPOINT ---
@app.route('/ask', methods=['POST'])
def ask():
    """
    API endpoint that accepts a question and returns the best answer.
    """
    user_question = request.json.get('question')

    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    # Default answer if no good match is found or KB is empty
    answer = "I'm sorry, I don't have an answer to that. Please try asking another question."
    
    # IMPROVEMENT: Check if questions_list is not empty before processing
    if questions_list:
        best_match = process.extractOne(user_question, questions_list)
        
        if best_match and best_match[1] > 80:
            matched_question_str = best_match[0]
            # IMPROVEMENT: Use the dictionary for a fast, direct lookup
            answer = question_to_answer_map.get(matched_question_str, answer)
    
    # The file-based chat history has been removed as it's not suitable for a deployed environment.

    response = {
        "question": user_question,
        "answer": answer
    }
    
    return jsonify(response)

# --- MAIN EXECUTION ---
if __name__ == '__main__':
    # This part is for local development only
    app.run(debug=True, port=5000)