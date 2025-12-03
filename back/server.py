import os
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv

import base64
from io import BytesIO
from pypdf import PdfReader

import markdown
import json

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


def build_prompt(template_id: str, docs_text: str) -> str:
    """Build the template-specific prompt for Gemini."""
    template_key = (template_id or "").lower().strip()

    if "flashcard" in template_key:
        template_instructions = """
        Create Q/A flashcards:
        - Each card has a clear question on one line and the answer on the next line.
        - Group related cards together.
        - Keep wording simple and student-friendly.
        """
    elif "quiz-test" in template_key or "quiz_test" in template_key or template_id == "quiz-test-focus":
        template_instructions = """
        Create a QUIZ / TEST FOCUSED STUDY GUIDE using ONLY information from the documents.

        Treat the documents as three roles:
        - Syllabus-type documents: overall coverage, dates, and percentage weights.
        - Rubric-type documents: per-question or per-section info (what each question is about, how many points or what percentage it is worth, and how it will be graded).
        - Notes / readings: detailed explanations and examples.

        IMPORTANT:
        - If a document name or heading contains words like "Rubric" or "Grading", treat it as a Rubric.
        - Do NOT make up questions or weights that are not clearly implied by the rubric or syllabus.
        - Do NOT merge multiple rubric questions into one; keep each rubric question separate when possible.

        Your output MUST be structured with these exact sections and headings:

        ## QUIZ / TEST FOCUSED STUDY GUIDE

        ### 1. ASSESSMENT CATALOG
        - List each quiz / test / exam you can identify, in order.
        - For each, give:
        - Name (e.g., "Quiz 1", "Test 1", "Final Exam")
        - Type (quiz, test, exam)
        - Weight or points (from the syllabus, if available)
        - Short one-line description of coverage in your own words
            (for example: "Lessons 2.1â€“2.3 on needfinding and interviews").

        ### 2. PER-ASSESSMENT GUIDE (ONE SUBSECTION PER QUIZ/TEST)

        For EACH assessment you found in Section 1, create a subsection like:

        #### [Assessment Name] â€” [Weight or Points] â€” [Coverage]

        1. **Format Overview**
        - Describe the format based on the rubric and syllabus:
            - question types (MC, multi-correct, short answer, essay, etc.)
            - how many of each type, if stated
            - any special rules (partial credit, "select all that apply", etc.).

        2. **Question-by-Question / Section Breakdown**
        - If the rubric lists individual questions or parts (e.g., "Q1: Mental models (10 pts)"):
            - Create a list where EACH bullet corresponds to a rubric question or question group:
            - Question label (e.g., "Q1", "Q2aâ€“Q2c", "Section A MC #1â€“10").
            - Topic or skill (what this question is about).
            - Points or percentage weight.
            - The most relevant lessons/readings or course topics that support this question.
        - If the rubric does NOT list questions individually:
            - Group by rubric sections (e.g., "Short Answer Section", "Application Questions") and give topic + approximate weight.

        3. **What to Know for This Assessment**
        - 5â€“12 bullet points of must-know ideas for THIS specific quiz/test.
        - Organize them into small themed groups (e.g., "Core Definitions", "Process Steps", "Distinctions to Remember").
        - For each idea, briefly say which rubric question(s) or section it supports.

        ### 3. SAMPLE QUESTIONS BY ASSESSMENT

        For EACH quiz/test again (separate clearly):

        #### Sample Questions for [Assessment Name]

        - Create 2â€“4 sample questions that match the actual rubric:
        - If rubric emphasizes MC / multi-correct, make mostly MC / multi-correct.
        - If rubric emphasizes short answer, make short answer prompts that match the topics.
        - Under each sample question, add a short line:
        - "Aligned rubric topic: [rubric topic or question label]"
        - At the end of this section, include a short ANSWER KEY:
        - For MC / multi-correct: which options are correct + one-line justification.
        - For short answer: what a good answer MUST include (key concepts or phrases).

        ### 4. POSSIBLE EXAM CONTENTS & FOCUS AREAS

        For EACH assessment:

        #### Likely Focus for [Assessment Name]

        - 4â€“8 bullet points of likely focus areas, based only on the syllabus + rubric:
        - Key concepts that appear multiple times in learning objectives or rubric rows.
        - Skills that are explicitly named in rubric criteria (e.g., "justify", "compare", "apply").
        - Phrase them as "likely focus" (e.g., "Likely focus: being able to compare X vs Y") to avoid pretending to know exact questions.

        ### 5. STUDY CHECKLIST

        - A short checklist the student can literally tick off while studying, for all quizzes/tests combined.
        - Each item should be concrete and observable (e.g., "I can explain the difference between usefulness and usability with my own example", not just "Understand usefulness").

        Pay special attention to:
        - Any rubric that describes each question or section: always connect your guide back to those questions and weights.
        - The syllabus for which units/readings are attached to each quiz/test.
        - The notes for the actual explanations and examples.

        Do NOT invent new grading rules, topics, or question types that are not clearly suggested by the documents.
        """
    elif "exam-preview" in template_key:
        template_instructions = """
        Create an EXAM PREVIEW that feels like a realistic practice exam.

        SECTION A: MULTIPLE CHOICE (4–6 questions)
        - Each question has options A–D.

        SECTION B: SHORT ANSWER (2–3 questions)
        - Open-ended questions that require a 2–5 sentence response.

        SECTION C: MINI ESSAY (1 question)
        - Ask for a paragraph-length explanation applying concepts to a realistic scenario.

        At the end, include ANSWER KEY with correct letters and 1–2 justification bullets.
        """
    elif "after-action" in template_key or "afteraction" in template_key:
        template_instructions = """
        Create an AFTER-ACTION REVIEW guide for a student who just took a quiz or test.

        1. BIG PICTURE SUMMARY
           - A short paragraph reminding the student what this quiz/test mainly tried to assess.

        2. KEY QUESTIONS WITH MODEL ANSWERS
           - 3–5 especially important questions.
           - For each, provide: "MODEL ANSWER:" followed by the ideal answer, then WHY THIS IS CORRECT bullets.

        3. SELF-CHECK PROMPTS
           - After each model answer, add bullets like: "If you missed this...", "To fix this next time..."

        4. SOURCE HINTS
           - For each question, add a line starting with "Source hint:" and point back to document section.
        """
    elif "pacing" in template_key or "study-pacing" in template_key:
        template_instructions = """
        Create a STUDY PACING PLAN that turns syllabus deadlines into an actual time plan.

        1. CONTEXT
           - Name the quiz/test this plan is for and its date if visible.

        2. TIME BUDGET
           - Suggest a realistic total amount of time (e.g., "about 3–4 hours").
           - Break it into small chunks (e.g., "3 × 25-minute blocks").

        3. SESSION-BY-SESSION PLAN
           - Use a bullet list where each row is a study session: Session #, Focus topics, Suggested minutes, Strategy.

        4. CHECKPOINTS
           - 2–3 self-check prompts or mini tasks.
        """
    elif "dashboard" in template_key or "course-overview" in template_key:
        template_instructions = """
        Create a COURSE OVERVIEW / DASHBOARD style summary.

        1. COURSE SNAPSHOT
           - Course title and a one-sentence description.
           - List major assessment types (quizzes, tests, projects) with their weights if available.

        2. TOPIC MAP
           - A bullet list or simple table of Units/Topics and which assessments they feed into.
           - Label emphasis as High / Medium / Light based on documents.

        3. ASSESSMENT TIMELINE
           - Ordered list of quizzes/tests with approximate dates and covered topics.

        4. RUBRIC & EXPECTATIONS HIGHLIGHTS
           - 4–8 bullets summarising what "good work" looks like in this course.

        5. KEY TERMS TO TRACK
           - Short bullet list of especially important vocabulary.
        """
    elif "quiz" in template_key:
        template_instructions = """
        Create a short practice quiz:
        - 4–8 multiple-choice questions.
        - Each question has 4 options (A–D).
        - At the end, include a clearly labeled Answer Key with the correct option for each question.
        """
    elif template_key == "study-guide":
        template_instructions = """
        Create a detailed general study guide using this structure and ALL CAPS section headings:

        1. LESSON TITLE - A short, clear title summarizing the main topic.
        2. SOURCES - Brief bullets listing key sources you can infer from the documents.
        3. LEARNING GOALS & OUTCOMES - 3–6 bullet points.
        4. STUDY NOTES - 2–4 short paragraphs explaining core ideas in plain language.
        5. DEFINITIONS & TERMS - Bullet list with term in **bold** and concise definition.
        6. CORE CONCEPTS TO KNOW - 2–4 subsections with supporting bullets.
        7. CHEAT SHEET (QUICK REFERENCE) - Compact, high-yield list of key points.
        8. PRACTICE QUESTIONS - Mix of multiple-choice and short-answer questions with ANSWER KEY.
        """
    else:
        template_instructions = """
        Create a structured study guide with:
        - A title.
        - A few bullet-point learning goals.
        - Explanatory notes in short paragraphs.
        - A short list of key terms with brief definitions.
        - 3–5 practice questions at the end with answers.
        """

    prompt = f"""
    You are a helpful study assistant.

    TEMPLATE: {template_id}
    
    Important:
        - Do NOT make up or guess facts that are not clearly supported by the documents.
        - If the documents don't specify something, leave it out or say that it is not specified.
        - Use proper markdown formatting with blank lines between sections and list items.
        - Use a single blank line between paragraphs or list items for proper spacing.

    Based ONLY on the documents below, create a study resource that matches these instructions:

    {template_instructions}

    Return only the final student-facing content in markdown format with proper spacing.
    Use blank lines between sections and list items.
    Do not add extra blank lines or excessive spacing.

    DOCUMENTS:
    {docs_text}
    """
    return prompt


@app.route("/generate_stream", methods=["POST"])
def generate_stream():
    """Stream generation endpoint that yields NDJSON."""
    try:
        data = request.get_json(force=True)
        template_id = data.get("templateId", "generic")
        sources = data.get("sources", [])

        docs_text = ""
        for s in sources:
            name = s.get("name")
            doc_type = s.get("type")
            content = s.get("content") or ""
            raw_data = s.get("rawData") or s.get("raw_data")

            text = content
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

        prompt = build_prompt(template_id, docs_text)

        def stream_gen():
            try:
                response = client.models.generate_content_stream(
                    model=MODEL,
                    contents=prompt,
                )
                for chunk in response:
                    if hasattr(chunk, 'text') and chunk.text:
                        text_chunk = chunk.text
                        payload = {"text": text_chunk}
                        yield json.dumps(payload) + "\n"
            except Exception as e:
                print(f"Stream generation error: {e}")
                err = {"error": str(e)}
                yield json.dumps(err) + "\n"

        return Response(stream_with_context(stream_gen()), content_type='application/x-ndjson')
    except Exception as e:
        print(f"Route error: {e}")
        return jsonify({"title": "Generation failed", "html": "", "text": "", "error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
