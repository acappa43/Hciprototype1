import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv

import base64
from io import BytesIO
from pypdf import PdfReader


load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)
MODEL = "gemini-2.0-flash"



def extract_text_from_pdf_dataurl(data_url: str) -> str:
    """
    Takes either:
    - a full data URL like 'data:application/pdf;base64,AAAA...'
    - or just a base64 string 'AAAA...'
    and returns extracted text.
    """
    try:
        if not data_url:
            return ""

        # If it's a data URL, split off the header
        if "," in data_url:
            _, b64_data = data_url.split(",", 1)
        else:
            b64_data = data_url

        pdf_bytes = base64.b64decode(b64_data)
        reader = PdfReader(BytesIO(pdf_bytes))

        pages = []
        for page in reader.pages:
            try:
                txt = page.extract_text() or ""
                pages.append(txt)
            except Exception:
                # Skip pages that error out instead of crashing everything
                continue

        return "\n".join(pages).strip()
    except Exception as e:
        print("PDF extract error:", e)
        return ""

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(force=True)
    template_id = data.get("templateId", "generic")
    sources = data.get("sources", [])


    docs_text = ""
    for s in sources:
        name = s.get("name")
        doc_type = s.get("type")
        filepath = (s.get("filepath") or "").lower()
        content = s.get("content") or ""
        raw_data = s.get("rawData") or s.get("raw_data")

        # Start with whatever plain content we have
        text = content

        # If we have rawData (from a PDF), try to extract text from it
        if raw_data:
            pdf_text = extract_text_from_pdf_dataurl(raw_data)
            if pdf_text:
                text = pdf_text

        docs_text += f"\n\n### {name} ({doc_type})\n{text}\n"


    if not docs_text.strip():
        return jsonify({
            "title": "No documents selected",
            "html": "<p>Please upload and select at least one document.</p>",
            "text": "Please upload and select at least one document."
        })

    template_key = (template_id or "").lower().strip()

    # Decide instructions based on template
    if "flashcard" in template_key:
        template_instructions = """
        Create Q/A flashcards:
        - Each card has a clear question on one line and the answer on the next line.
        - Group related cards together.
        - Keep wording simple and student-friendly.
        """
    elif template_key == "quiz-test-focus":
        template_instructions = """
        You are building a quiz- and test-focused study guide for this course.

        Use the documents labeled as Syllabus (or that contain sections like "Quiz Coverage",
        "Test Coverage", "Quiz Structure", or "Test Structure") as the authoritative source for:
        - which quizzes and tests exist,
        - which lessons/readings each assessment covers,
        - what question formats they use,
        - any notes about emphasis (e.g., vocabulary/recall, short answer vs. multi-correct MC).

        Use the documents labeled as Notes to pull the actual concepts, vocabulary, principles,
        and examples for those lessons.

        Structure your output like this (use ALL CAPS section headings):

        1. OVERVIEW
           - 1 short paragraph summarizing how many quizzes/tests there are and what parts
             of the course they cover overall.

        2. QUIZ-BY-QUIZ GUIDE
           For each quiz mentioned in the syllabus (Quiz 1, Quiz 2, etc.), create a sub-section with:

           QUIZ N: COVERAGE
           - Bullet list that copies or closely paraphrases the syllabus coverage
             (lesson numbers, units, and readings).

           QUIZ N: KEY CONCEPTS & VOCAB FROM NOTES
           - 6–12 bullets pulling the most important ideas, definitions, principles, and examples
             relevant to that coverage from the notes.
           - Use the course’s terminology (for example: principles, methods, applications, specific HCI
             concepts, views of the user, usefulness vs usability, etc.).

           QUIZ N: QUESTION STYLE & STRATEGY
           - 3–5 bullets summarizing the quiz structure and emphasis based on the syllabus
             (e.g., five open-ended short-answer questions focused on vocabulary and recall).
           - Include concrete study advice grounded in that description.

           QUIZ N: RAPID REVIEW CHECKLIST
           - 5–10 “Can you explain…?” prompts that a student could use as a last-minute checklist
             before taking that quiz.

        3. TEST-BY-TEST GUIDE
           For each test mentioned in the syllabus (Test 1, Test 2, etc.), create a similar structure:

           TEST N: COVERAGE
           - Bullet list of lesson ranges and readings as stated in the syllabus.

           TEST N: KEY CONCEPTS & VOCAB FROM NOTES
           - 8–15 bullets of the biggest ideas and terms for those lessons.

           TEST N: QUESTION STYLE & STRATEGY
           - 3–5 bullets summarizing the test format (for example, 30 five-answer multi-correct
             multiple-choice questions with partial credit, split between lectures and readings),
             plus how to prepare.

           TEST N: RAPID REVIEW CHECKLIST
           - 8–12 “Can you explain…?” prompts spanning both principles and methods.

        Important:
        - Do NOT invent quizzes or tests that the syllabus does not mention.
        - Do NOT change which lessons/readings belong to each quiz/test; those must come
          from the syllabus.
        - Use only information that can be reasonably inferred from the syllabus and notes.
          If something is not specified, briefly say that it is not specified or omit it.
        """
    elif "quiz" in template_key:
        template_instructions = """
        Create a short practice quiz:
        - 4–8 multiple-choice questions.
        - Each question has 4 options (A–D).
        - At the end, include a clearly labeled Answer Key with the correct option for each question.
        """
    elif template_key == "study-guide":
        # Special "General Study Guide" format (matches your HTML sample)
        template_instructions = """
        Create a detailed general study guide using this structure and ALL CAPS section headings:

        1. LESSON TITLE
           - A short, clear title summarizing the main topic.

        2. SOURCES
           - Brief bullets or a short paragraph listing key sources you can infer from the documents
             (author, year, title, etc.), if possible.

        3. LEARNING GOALS & OUTCOMES
           - 3–6 bullet points stating what the student should know or be able to do after studying.

        4. STUDY NOTES
           - 2–4 short paragraphs explaining the core ideas in plain language, like lecture notes.
           - Focus on the most important patterns, principles, or steps.

        5. DEFINITIONS & TERMS
           - Bullet list.
           - Each bullet starts with the term in **bold**, followed by a concise, document-grounded
             definition or explanation.

        6. CORE CONCEPTS TO KNOW
           - 3–6 bullets grouping related ideas (e.g., “views of the user”, “design principles”,
             “application areas”, etc.).
           - 2–4 subsections with short headings and supporting bullets or short paragraphs that
             connect ideas.
           - Emphasize trade-offs, relationships, and “why it matters” explanations.

        7. CHEAT SHEET (QUICK REFERENCE)
           - A compact, high-yield list of key points, formulas, heuristics, or rules of thumb.
           - Think of this as a one-glance summary for last-minute review.

        8. PRACTICE QUESTIONS
           - A mix of a few multiple-choice and short-answer/short-response questions.
           - At the very end, include a clearly labeled ANSWER KEY.

        Use clear headings and bullet points in a student-facing tone.
        """
    else:
        # Generic fallback if no specific template is matched
        template_instructions = """
        Create a helpful study resource (you choose the best structure) based ONLY on the documents.
        Focus on:
        - clear explanations,
        - important definitions,
        - relationships between ideas,
        - and a few practice questions at the end.
        """


    # Final prompt sent to Gemini
    prompt = f"""
    You are a helpful study assistant.

    TEMPLATE: {template_id}
    
    Important:
        - Do NOT make up or guess facts that are not clearly supported by the documents.
        - If the documents don’t specify something, leave it out or say that it is not specified.

    Based ONLY on the documents below, create a study resource that matches these instructions:

    {template_instructions}

    Return only the final student-facing content (plain text or markdown) with no extra explanation,
    no system messages, and no commentary about what you are doing.

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
    app.run(host="0.0.0.0", port=5001, debug=True)
