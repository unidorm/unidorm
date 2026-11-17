"""The habits questionnaire (F1), as approved in the Week 3 deliverables:
5 areas, 3 questions each, answers a-d. English wording from that document.

`seed_survey` inserts what is missing and updates wording that changed, matching by
category id, question code and option position. Answers already given stay valid.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.survey import AnswerType, SurveyCategory, SurveyOption, SurveyQuestion

# (id, title, description, weight %, [(code, question, [a, b, c, d])])
SURVEY: list[tuple[str, str, str, int, list[tuple[str, str, list[str]]]]] = [
    ("sleep", "Sleep", "When you sleep and how easily you wake up.", 25, [
        ("Q1", "What time do you usually go to sleep?", ["Before 10 PM", "10 PM–12 AM", "12–2 AM", "After 2 AM"]),
        ("Q2", "What time do you usually wake up?", ["Before 7 AM", "7–9 AM", "9–11 AM", "After 11 AM"]),
        ("Q3", "How sensitive are you to light or movement while sleeping?",
         ["Very sensitive", "Somewhat sensitive", "Not very sensitive", "Not sensitive at all"]),
    ]),
    ("noise", "Noise", "How quiet you like the room to be.", 20, [
        ("Q4", "How quiet do you prefer your room to be?",
         ["Completely quiet", "Mostly quiet", "Some background noise is okay", "Noise does not bother me"]),
        ("Q5", "How do you usually listen to music or watch videos in your room?",
         ["Always with headphones", "Usually with headphones", "Sometimes with speakers", "Usually with speakers"]),
        ("Q6", "How comfortable are you with normal daytime noise in the room?",
         ["Not comfortable at all", "Slightly comfortable", "Comfortable", "Very comfortable"]),
    ]),
    ("cleanliness", "Cleanliness", "How tidy you keep the shared space.", 20, [
        ("Q7", "How important is room cleanliness to you?",
         ["Very important", "Important", "Somewhat important", "Not very important"]),
        ("Q8", "How often do you prefer to clean the room?",
         ["Every day", "Several times a week", "Once a week", "When necessary"]),
        ("Q9", "How comfortable are you with some personal items being left around the room?",
         ["Not comfortable at all", "Slightly comfortable", "Comfortable", "Very comfortable"]),
    ]),
    ("visitors", "Visitors", "Guests in the room and how much notice you want.", 20, [
        ("Q10", "How often do you expect to have daytime visitors in your room?",
         ["Never", "Rarely", "Sometimes", "Often"]),
        ("Q11", "How much notice should your roommate give before inviting a visitor?",
         ["Always ask me first", "Tell me in advance", "A short notice is enough", "No notice is necessary"]),
        ("Q12", "How comfortable are you with having friends visit the room during the day?",
         ["Not comfortable at all", "Slightly comfortable", "Comfortable", "Very comfortable"]),
    ]),
    ("study", "Study habits", "Where and how you study.", 15, [
        ("Q13", "How often do you study in your room?",
         ["Almost every day", "Several times a week", "Sometimes", "Rarely"]),
        ("Q14", "What study environment do you prefer?",
         ["Complete silence", "Mostly quiet", "Some background noise is okay", "Noise does not bother me"]),
        ("Q15", "How important is it for your roommate to have a similar study schedule?",
         ["Very important", "Important", "Somewhat important", "Not important"]),
    ]),
]


def seed_survey(db: Session) -> int:
    """Creates or updates the questionnaire. Returns the number of questions."""
    categories = {c.id: c for c in db.scalars(select(SurveyCategory))}
    questions = {q.code: q for q in db.scalars(select(SurveyQuestion))}

    for c_pos, (cat_id, title, description, weight, items) in enumerate(SURVEY, start=1):
        category = categories.get(cat_id) or SurveyCategory(id=cat_id)
        category.title, category.description, category.weight, category.position = title, description, weight, c_pos
        db.add(category)

        for q_pos, (code, text, labels) in enumerate(items, start=1):
            question = questions.get(code) or SurveyQuestion(code=code, answer_type=AnswerType.SINGLE_CHOICE)
            question.category = category
            question.position, question.text, question.is_required = q_pos, text, True
            db.add(question)

            existing = {o.position: o for o in question.options}
            for o_pos, label in enumerate(labels, start=1):
                option = existing.get(o_pos) or SurveyOption(position=o_pos)
                option.label, option.value = label, o_pos
                if option not in question.options:
                    question.options.append(option)

    db.commit()
    return sum(len(items) for *_, items in SURVEY)
