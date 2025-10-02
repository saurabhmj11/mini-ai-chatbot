import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from thefuzz import process

# Initialize the Flask app
app = Flask(__name__)

# FIX: Updated CORS configuration for production deployment
# This explicitly allows requests from any domain (*) to the /ask endpoint.
CORS(app, resources={r"/ask": {"origins": "*"}})

# --- KNOWLEDGE BASE ---
def load_knowledge_base(file_path='knowledge_base.json'):
    """Loads the knowledge base from a JSON file."""
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data['questions']

# Load the questions and prepare them for fuzzy matching
knowledge_base = load_knowledge_base()
questions_list = [q['question'] for q in knowledge_base]

# --- CHAT HISTORY ---
# Note: On free hosting services like Render, the file system is ephemeral.
# This means chat_history.json will be reset whenever the server restarts or sleeps.
def load_chat_history(file_path='chat_history.json'):
    """Loads chat history or creates the file if it doesn't exist."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_chat_history(data, file_path='chat_history.json'):
    """Saves the updated chat history to the file."""
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

# --- API ENDPOINT ---
@app.route('/ask', methods=['POST'])
def ask():
    """
    API endpoint that accepts a question and returns the best answer.
    """
    user_question = request.json.get('question')

    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    best_match = process.extractOne(user_question, questions_list)

    answer = "I'm sorry, I don't have an answer to that. Please try asking another question."
    
    if best_match and best_match[1] > 80:
        matched_question_str = best_match[0]
        for q_pair in knowledge_base:
            if q_pair['question'] == matched_question_str:
                answer = q_pair['answer']
                break
    
    # [cite_start]Save the conversation to chat history [cite: 17]
    chat_history = load_chat_history()
    chat_history.append({"question": user_question, "answer": answer})
    save_chat_history(chat_history)

    response = {
        "question": user_question,
        "answer": answer
    }
    
    return jsonify(response)

# --- MAIN EXECUTION ---
if __name__ == '__main__':
    # This part is for local development only
    app.run(debug=True, port=5000)