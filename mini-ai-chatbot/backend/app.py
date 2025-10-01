import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from thefuzz import process

# Initialize the Flask app
app = Flask(__name__)
# Enable CORS to allow communication from the frontend
CORS(app)

# --- KNOWLEDGE BASE ---
def load_knowledge_base(file_path='knowledge_base.json'):
    """Loads the knowledge base from a JSON file."""
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data['questions']

# Load the questions and prepare them for fuzzy matching
knowledge_base = load_knowledge_base()
# We create a list of just the questions for the matching algorithm
questions_list = [q['question'] for q in knowledge_base]

# --- CHAT HISTORY (Optional but Recommended) ---
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
    # Get the user's question from the POST request body
    user_question = request.json.get('question')

    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    # Find the best match from our knowledge base using fuzzy matching
    # process.extractOne returns a tuple: (matched_question, score)
    best_match = process.extractOne(user_question, questions_list)

    answer = "I'm sorry, I don't have an answer to that. Please try asking another question."
    
    # We use a threshold of 80 for the match score. You can adjust this.
    if best_match and best_match[1] > 80:
        matched_question_str = best_match[0]
        # Find the full Q&A pair from the knowledge_base
        for q_pair in knowledge_base:
            if q_pair['question'] == matched_question_str:
                answer = q_pair['answer']
                break
    
    # (Optional) Save the conversation to chat history [cite: 17]
    chat_history = load_chat_history()
    chat_history.append({"question": user_question, "answer": answer})
    save_chat_history(chat_history)

    # Return the response as JSON
    response = {
        "question": user_question,
        "answer": answer
    }
    
    return jsonify(response)

# --- MAIN EXECUTION ---
if __name__ == '__main__':
    # Runs the Flask app on port 5000
    app.run(debug=True, port=5000)