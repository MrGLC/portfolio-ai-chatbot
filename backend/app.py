from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    message = data.get('message', '')
    # Here you would add your LangChain implementation
    response = {"reply": f"Echo: {message}"}
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)
