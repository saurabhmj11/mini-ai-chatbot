# Mini AI Chatbot

This project is a simple, web-based AI chatbot built with a React frontend and a Python (Flask) backend. The chatbot is designed to answer professional questions based on a predefined knowledge base.

## Features

-   **Simple Chat Interface:** A clean and intuitive UI to ask questions and view responses.
-   **Full-Stack Architecture:** A clear separation between the React frontend and the Flask backend API.
-   **Fuzzy Logic Matching:** The backend uses fuzzy string matching to find the best answer from the knowledge base, even if the user's question isn't an exact match.
-   **Chat History:** The backend saves the conversation history to a local `chat_history.json` file.

## Tech Stack

-   **Frontend:** React, Axios
-   **Backend:** Python, Flask, Flask-Cors
-   **AI/ML Logic:** thefuzz (for fuzzy string matching)

## Setup and Installation

### Prerequisites

-   Node.js and npm/yarn installed
-   Python 3.x and pip installed

### Instructions

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd mini-ai-chatbot
    ```

2.  **Set up the Backend:**
    ```bash
    # Navigate to the backend folder
    cd backend

    # Install the required Python packages
    pip install -r requirements.txt
    ```

3.  **Set up the Frontend:**
    ```bash
    # Navigate to the frontend folder from the root directory
    cd frontend

    # Install the required npm packages
    yarn install
    ```

## Running the Application

You will need to run the backend and frontend servers in two separate terminals.

1.  **Start the Backend Server:**
    -   Navigate to the `backend` folder.
    -   Run the Flask application.
    ```bash
    cd backend
    python app.py
    ```
    The backend will be running on `http://127.0.0.1:5000`.

2.  **Start the Frontend Server:**
    -   Navigate to the `frontend` folder.
    -   Run the React application.
    ```bash
    cd frontend
    yarn start
    ```
    The frontend will open in your browser at `http://localhost:3000`.

## Assumptions Made

-   The AI/ML logic was implemented using `thefuzz` library for fuzzy string matching to provide a lightweight and effective solution without requiring a large language model or complex machine learning pipeline.
-   Chat history is stored in a simple JSON file for persistence, assuming a single-user, local environment.