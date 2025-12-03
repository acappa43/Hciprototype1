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
    # Decide instructions based on template
    if "flashcard" in template_key:
        template_instructions = """
        Create Q/A flashcards:
        - Each card has a clear question on one line and the answer on the next line.
        - Group related cards together.
        - Keep wording simple and student-friendly.
        """

    # NEW: quiz / test-focused study guide (uses syllabus + notes)
    elif "quiz-test" in template_key or "quiz_test" in template_key:
        template_instructions = """
        Create a QUIZ / TEST FOCUSED STUDY GUIDE using ONLY information from the documents.

        1. QUIZ / TEST OVERVIEW
           - List each quiz/test you can identify in the syllabus (name, approximate date, percentage if given).
           - For each, restate the coverage in your own words
             (e.g., "Lectures 3–5: Heuristic evaluation and cognitive walkthroughs").

        2. WHAT TO KNOW FOR THE NEXT QUIZ / TEST
           - For the first upcoming quiz/test you see, list 5–12 must-know concepts, definitions, or procedures.
           - Group them under small headings (for example: "Heuristics", "Walkthrough Steps", "Types of Evaluation").

        3. HIGH-YIELD CONNECTIONS & PITFALLS
           - Short bullets that connect ideas and point out common confusions or tricky distinctions.

        4. QUICK PRACTICE
           - 3–5 practice questions that match the styles mentioned in the syllabus (MC, short answer, etc. if described).
           - At the very end, include a clearly labeled ANSWER KEY.

        Pay special attention to phrases like "Quiz", "Test", "Exam", "coverage", and "learning objectives"
        in syllabus-type documents when deciding what belongs.
        """

    # NEW: exam preview / practice exam
    elif "exam-preview" in template_key:
        template_instructions = """
        Create an EXAM PREVIEW that feels like a realistic practice exam.

        - Start with one line describing what this exam preview targets
          (for example: "Practice exam for Quiz 3: Needfinding & Interviews").

        SECTION A: MULTIPLE CHOICE (4–6 questions)
        - Each question has options A–D.
        - Some questions may have MORE THAN ONE correct answer.
          When that happens, clearly say "Select all that apply."

        SECTION B: SHORT ANSWER (2–3 questions)
        - Open-ended questions that require a 2–5 sentence response.

        SECTION C: MINI ESSAY (1 question)
        - Ask for a paragraph-length explanation applying concepts to a realistic scenario.

        At the end, include:

        ANSWER KEY
        - For MC questions: list the correct letter(s) and 1–2 short justification bullets.
        - For short answer / essay: list what a good answer MUST include (not word-for-word).

        Keep all content tightly tied to the actual documents.
        Do not introduce outside topics.
        """

    # NEW: after-action review / feedback
    elif "after-action" in template_key or "afteraction" in template_key:
        template_instructions = """
        Create an AFTER-ACTION REVIEW guide for a student who just took a quiz or test.

        1. BIG PICTURE SUMMARY
           - A short paragraph reminding the student what this quiz/test mainly tried to assess.

        2. KEY QUESTIONS WITH MODEL ANSWERS
           - 3–5 especially important questions (mix of MC stems, short answers, or conceptual prompts).
           - After each question, provide:
             - "MODEL ANSWER:" followed by a clear ideal answer.
             - 2–3 bullets under "WHY THIS IS CORRECT".

        3. SELF-CHECK PROMPTS
           - After each model answer, add bullets like:
             - "If you missed this..."
             - "To fix this next time..."
           - Make the advice concrete and actionable (e.g., "re-watch Lecture 3 up through the Gulf of Execution example").

        4. SOURCE HINTS
           - For each question, add a final line starting with "Source hint:"
             and point back to where in the documents the idea came from
             (for example, a heading or phrase like "Lecture: Gulf of Execution",
              "Syllabus: Quiz 3 coverage", or "HCI Notes — section on heuristic evaluation").

        This guide is NOT grading any specific student's answer; it is a reflection worksheet
        that lets a student compare their own answers to the model.
        """

    # NEW: pacing planner
    elif "pacing" in template_key or "study-pacing" in template_key:
        template_instructions = """
        Create a STUDY PACING PLAN that turns syllabus deadlines into an actual time plan.

        1. CONTEXT
           - Name the quiz/test this plan is for and its date if visible.
             If no date is given, just say "upcoming quiz/test" and describe the coverage.

        2. TIME BUDGET
           - Suggest a realistic total amount of time to spend (for example: "about 3–4 hours").
           - Break it into small chunks (e.g., "3 × 25-minute blocks" or "4 sessions of 30 minutes").

        3. SESSION-BY-SESSION PLAN
           - Use a bullet list or simple table where each row is a study session:
             - Session #
             - Focus topics
             - Suggested minutes
             - Suggested strategy (flashcards, outlining, practice questions, etc.).
           - Start with fundamentals first, then move into practice/review in later sessions.

        4. CHECKPOINTS
           - 2–3 self-check prompts or mini tasks (for example, "Explain the Gulf of Execution in your own words"
             or "Write down the steps of a cognitive walkthrough from memory").

        If there is no explicit date, still create a generic 3–5 session plan based on how much material there is.
        """

    # NEW: course overview / dashboard style
    elif "dashboard" in template_key or "course-overview" in template_key:
        template_instructions = """
        Create a COURSE OVERVIEW / DASHBOARD style summary.

        1. COURSE SNAPSHOT
           - Course title (if visible) and a one-sentence description.
           - List major assessment types (quizzes, tests, projects) with their weights
             if the syllabus includes them.

        2. TOPIC MAP
           - A bullet list or simple table of Units/Topics and which assessments they feed into.
           - For each topic, label emphasis as High / Medium / Light based on:
             - how often it appears in the notes/syllabus
             - whether it is explicitly named in learning objectives or test coverage.

        3. ASSESSMENT TIMELINE
           - Ordered list of quizzes/tests with approximate dates and covered topics.

        4. RUBRIC & EXPECTATIONS HIGHLIGHTS
           - 4–8 bullets summarising what "good work" looks like in this course
             (e.g., completeness, clear justification, human-centered reasoning).

        5. KEY TERMS TO TRACK
           - Short bullet list of especially important vocabulary to watch for through the course.

        All labels and emphasis must be inferred from the documents.
        Do NOT invent new grading rules or topics that are not mentioned.
        """

    # Existing quiz template (generic practice quiz)
    elif "quiz" in template_key:
        template_instructions = """
        Create a short practice quiz:
        - 4–8 multiple-choice questions.
        - Each question has 4 options (A–D).
        - At the end, include a clearly labeled Answer Key with the correct option for each question.
        """

    # Existing general study guide
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
           - Each bullet starts with the term in **bold**, followed by a concise definition.

        6. CORE CONCEPTS TO KNOW
           - 2–4 subsections with short headings and supporting bullets or short paragraphs that connect ideas.
           - Emphasize trade-offs, relationships, and "why it matters" explanations.

        7. CHEAT SHEET (QUICK REFERENCE)
           - A compact, high-yield list of key points, formulas, heuristics, or rules of thumb.
           - Think of this as a one-glance summary for last-minute review.

        8. PRACTICE QUESTIONS
           - A mix of a few multiple-choice and short-answer/short-response questions.
           - At the very end, include a clearly labeled ANSWER KEY.

        Use clear headings and bullet points in a student-facing tone.
        """

    else:
        # Generic study guide fallback
        template_instructions = """
        Create a structured study guide with:
        - A title.
        - A few bullet-point learning goals.
        - Explanatory notes in short paragraphs.
        - A short list of key terms with brief definitions.
        - 3–5 practice questions at the end with answers.
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
