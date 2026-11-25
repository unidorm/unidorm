# UniDorm matching algorithm (Phase 3)

Code: `backend/app/services/matching_service.py`. Tests: `backend/tests/test_matching_service.py`.
The algorithm does not depend on the API or the website. It is deterministic: the same answers
always give the same scores, and ties are broken by student id.

## 1. Answers as steps

Every question has four ordered answers a–d (Week 3 F1 questionnaire). Answer a = step 1 … d = step 4.
For "need vs habit" rules a step is turned into a level from 0 to 1: a = 0, b = 0.33, c = 0.67, d = 1.

## 2. Two kinds of rule

**Closeness**: the two answers should be similar. Score by how many steps apart they are:

| Steps apart | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Score | 100 | 70 | 30 | 0 |

The drop grows with the distance (−30, −40, −30 from 100 to 0), so "a little different" is still fine
and "very different" is clearly bad.

**Clash**: one student's need against the other student's habit, checked in both directions, and the
worse direction counts:

    clash score = 100 × (1 − max(0, need + habit − 1))

A clash starts only when the need and the habit are both strong. Example (noise):
- "completely quiet" (need 1.0) and "usually with speakers" (habit 1.0) → 0
- "completely quiet" (1.0) and "sometimes with speakers" (0.67) → 33
- "mostly quiet" (0.67) and "usually with headphones" (0.33) → 100, no conflict

This reads the meaning of the answers, not only whether they are equal.

## 3. Rules per category

| Category (weight) | Rule | Share | Questions | How |
|---|---|---|---|---|
| **Sleep (25%)** | Bedtime | 40% | Q1 | closeness |
| | Wake-up time | 40% | Q2 | closeness |
| | Light sleeper vs different schedule | 20% | Q1, Q2, Q3 | 100 × (1 − sensitivity × gap); gap = steps apart in Q1 + Q2 out of 6; sensitivity of the more sensitive student (very = 1 … not at all = 0) |
| **Noise (20%)** | How quiet the room should be | 35% | Q4 | closeness |
| | Need for quiet vs music on speakers | 35% | Q4 ↔ Q5 | clash: need = quiet preference, habit = speaker use |
| | Daytime noise comfort | 30% | Q6 | closeness |
| **Cleanliness (20%)** | How important cleanliness is | 35% | Q7 | closeness |
| | How often to clean | 35% | Q8 | closeness |
| | Items left around vs tidiness | 30% | Q9 ↔ Q7 | clash: need = not comfortable with items around, habit = cleanliness not important |
| **Visitors (20%)** | Visitors vs comfort with visitors | 40% | Q12 ↔ Q10 | clash: need = not comfortable with visitors, habit = has visitors often |
| | Notice before inviting someone | 30% | Q11 | closeness |
| | Comfort with daytime visitors | 30% | Q12 | closeness |
| **Study (15%)** | Study environment | 40% | Q14 | closeness |
| | Studying in the room, and how much it matters | 35% | Q13, Q15 | 100 − (100 − closeness(Q13)) × (0.5 + 0.5 × importance); importance (Q15) of whoever cares more |
| | Studying in silence vs music on speakers | 25% | Q14, Q13 ↔ Q5 | clash: need = wants silence × studies in the room often, habit = speaker use |

Category score = the shares × rule scores (0–100). All 15 questions are used.

## 4. Overall score of a pair

    Overall = Sleep × 0.25 + Noise × 0.20 + Cleanliness × 0.20 + Visitors × 0.20 + Study × 0.15

Rounded half-up to a whole number (82.5 → 83). Levels: **High 80–100, Medium 60–79, Low 0–59.**

Worked example (tested in `test_one_step_difference_is_scored_by_hand`): two students answer "b" to
everything, except that one goes to sleep a step later (Q1 = c).
Sleep = 0.4 × 70 + 0.4 × 100 + 0.2 × 88.9 = 85.8; the other categories are 100.
Overall = 0.25 × 85.8 + 0.75 × 100 = 96.4 → **96, High**.

## 5. Missing answers

A rule that needs an unanswered question scores **0** (never "compatible by default"), and the result
is marked incomplete with the list of missing questions. Matching runs only use students who submitted
the questionnaire, and submitting needs every question answered, so this only shows up in the manager's
Compare tool.

## 6. Rooms of 3 and 4

Every unique pair is scored once (3 students → 3 pairs, 4 students → 6 pairs). Then:

    RoomScore = 0.6 × AveragePairs + 0.4 × WorstPair

Example: pairs 88, 84, 68 → average 80, worst 68 → 0.6 × 80 + 0.4 × 68 = 75.2 → **75, Medium**,
although the average alone would say High. One bad pair pulls the room down. A room of 2 has one pair,
so its RoomScore is that pair's score. The same function handles 2, 3 and 4 students.

## 7. Building the rooms (Run matching)

For each room type (2, 3, 4 people) separately, using only students who asked for that type:

1. **Greedy:** start a room with the best remaining pair, then add whoever raises the RoomScore most,
   until the room is full. Repeat.
2. **Improve:** try swapping students between rooms, and with students left over; keep the swap that raises
   the total RoomScore most; repeat until nothing improves (at most 20 passes).
3. If the number of students does not divide by the room size, the rest stay "without a group" until the
   next run.

The result is only a **proposal**. A housing manager approves or rejects each group. Students see their
roommates only after approval. A new run replaces open proposals, keeps approved rooms, and matches the
students from rejected groups again.
