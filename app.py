from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import requests
import uuid
import logging
import os

# Flask-App initialisieren
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

RASA_SERVER_URL = os.getenv("RASA_SERVER_URL", "http://localhost:5005/webhooks/rest/webhook")


@app.route("/chat", methods=["POST"])
def chat():
    # Nachricht vom Benutzer abrufen
    user_message = request.json.get("message")
    session_id = request.cookies.get("session_id", str(uuid.uuid4()))  # Eindeutige ID für den Benutzer
    
    # Eingabevalidierung
    if not user_message:
        return jsonify([{"text": "Nachricht darf nicht leer sein."}]), 400
    
    # Nachricht an Rasa-Server senden
    try:
        logging.info(f"Benutzer-ID: {session_id}, Nachricht: {user_message}")
        response = requests.post(
            RASA_SERVER_URL,
            json={"sender": session_id, "message": user_message},
        )
        response.raise_for_status()
        bot_response = response.json()

        if bot_response:
            logging.info(f"Antwort von Rasa: {bot_response}")
            # Antwort an den Benutzer zurückgeben, mit Session-ID im Cookie
            res = make_response(jsonify(bot_response))
            res.set_cookie("session_id", session_id)
            return res
        else:
            return jsonify([{"text": "Ich konnte keine Antwort generieren."}])
    except requests.exceptions.RequestException as e:
        logging.error(f"Fehler bei der Verbindung zum Rasa-Server: {e}")
        return jsonify([{"text": "Der Chatbot ist momentan nicht verfügbar."}]), 503

# App starten
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
