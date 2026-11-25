import type { PairResult } from "../../types/api";
import { Card, FormMessage } from "../ui";
import AnswerComparison from "./AnswerComparison";
import CategoryScores from "./CategoryScores";
import ScoreRing from "./ScoreRing";

interface PairViewProps {
  pair: PairResult;
  /** Column labels for the two students, e.g. "You" and "Dana". */
  label1?: string;
  label2?: string;
}

/** One pair in full: overall score, the five categories and both students' answers. */
export default function PairView({ pair, label1 = pair.student_1.full_name, label2 = pair.student_2.full_name }: PairViewProps) {
  return (
    <div className="flex flex-col gap-4">
      {!pair.complete && (
        <FormMessage tone="danger">
          Not every question is answered ({pair.missing_questions.join(", ")}). Missing answers count as 0, so this score
          is lower than it would be.
        </FormMessage>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card title={`${label1} & ${label2}`} description="Overall compatibility of this pair.">
          <ScoreRing score={pair.overall_score} level={pair.compatibility_level} className="py-2" />
          <p className="mt-4 text-center text-xs leading-relaxed text-muted">
            Sleep 25% · Noise 20% · Cleanliness 20% · Visitors 20% · Study 15%
          </p>
        </Card>
        <Card title="Five areas" description="How well your habits fit in each area. Open a row to see why.">
          <CategoryScores categories={pair.categories} />
        </Card>
      </div>
      {pair.answers && (
        <Card title="Answers side by side" description="The real questionnaire answers behind the score.">
          <AnswerComparison answers={pair.answers} categories={pair.categories} label1={label1} label2={label2} />
        </Card>
      )}
    </div>
  );
}
