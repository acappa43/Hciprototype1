import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)
MODEL = "gemini-2.0-flash"


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(force=True)
    template_id = data.get("templateId", "generic")
    sources = data.get("sources", [])

    docs_text = ""
    for s in sources:
        docs_text += f"\n\n### {s.get('name')} ({s.get('type')})\n{s.get('content')}\n"

    if not docs_text.strip():
        return jsonify({
            "title": "No documents selected",
            "html": "<p>Please upload and select at least one document.</p>",
            "text": "Please upload and select at least one document."
        })

    prompt = f"""
            You are a helpful study assistant.

            TEMPLATE: {template_id}

            Based ONLY on the documents below, create a study resource that matches the template:
            - If the template name contains "flashcard", make Q/A flashcards.
            - If it contains "quiz", make a short quiz plus answer key.
            - Otherwise, make a short structured study guide with headings and bullet points.

            Return just the final student-facing content, no extra explanation.

            DOCUMENTS:
            {docs_text}
    """

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
    )

    text = response.text or ""

    return jsonify({
        "title": f"{template_id} result",
        "html": f"<pre>{text}</pre>",
        "text": text,
    })


if __name__ == "__main__":
    app.run(port=5001, debug=True)