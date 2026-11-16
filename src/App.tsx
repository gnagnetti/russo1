import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { GRAMMAR_TESTS } from './data/tests';
import { LevelSelect } from './components/LevelSelect';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import type { AppView, UserAnswer } from './types';

const STORAGE_SCORES_KEY = 'russo_completed_levels_v1';

function loadCompletedLevels(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_SCORES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors and fall back to empty progress.
  }
  return {};
}

export default function App() {
  const [view, setView] = useState<AppView>('level-select');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [completedLevels, setCompletedLevels] = useState<Record<string, number>>(
    loadCompletedLevels,
  );
  const [attemptKey, setAttemptKey] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SCORES_KEY, JSON.stringify(completedLevels));
    } catch {
      // Ignore storage quota or private-mode errors.
    }
  }, [completedLevels]);

  const selectedTestIndex = useMemo(
    () => GRAMMAR_TESTS.findIndex((t) => t.id === selectedTestId),
    [selectedTestId],
  );

  const selectedTest =
    selectedTestIndex >= 0 ? GRAMMAR_TESTS[selectedTestIndex] : null;

  const nextTest =
    selectedTestIndex >= 0 && selectedTestIndex + 1 < GRAMMAR_TESTS.length
      ? GRAMMAR_TESTS[selectedTestIndex + 1]
      : null;

  const handleSelectTest = useCallback((testId: string) => {
    setSelectedTestId(testId);
    setAnswers([]);
    setAttemptKey((prev) => prev + 1);
    setView('quiz');
  }, []);

  const handleQuizComplete = useCallback(
    (quizAnswers: UserAnswer[]) => {
      setAnswers(quizAnswers);

      if (selectedTest && quizAnswers.length > 0) {
        const isFullTest = quizAnswers.length === selectedTest.questions.length;
        if (isFullTest) {
          const correctCount = quizAnswers.filter((a) => a.isCorrect).length;
          const score = Math.round(
            (correctCount / selectedTest.questions.length) * 100,
          );

          setCompletedLevels((prev) => ({
            ...prev,
            [selectedTest.id]: Math.max(prev[selectedTest.id] ?? 0, score),
          }));
        }
      }

      setView('results');
    },
    [selectedTest],
  );

  const handleRestart = useCallback(() => {
    setAnswers([]);
    setAttemptKey((prev) => prev + 1);
    setView('quiz');
  }, []);

  const handleNextTest = useCallback(() => {
    if (!nextTest) return;
    setSelectedTestId(nextTest.id);
    setAnswers([]);
    setAttemptKey((prev) => prev + 1);
    setView('quiz');
  }, [nextTest]);

  const handleGoHome = useCallback(() => {
    setSelectedTestId(null);
    setAnswers([]);
    setView('level-select');
  }, []);

  const handleResetProgress = useCallback(() => {
    setCompletedLevels({});
  }, []);

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <AnimatePresence mode="wait">
        {view === 'quiz' && selectedTest ? (
          <QuizScreen
            key={`quiz-${selectedTest.id}-${attemptKey}`}
            test={selectedTest}
            onQuizComplete={handleQuizComplete}
            onGoHome={handleGoHome}
          />
        ) : view === 'results' && selectedTest ? (
          <ResultsScreen
            key={`results-${selectedTest.id}-${attemptKey}`}
            test={selectedTest}
            answers={answers}
            onRestart={handleRestart}
            onGoHome={handleGoHome}
            hasNextTest={Boolean(nextTest)}
            onNextTest={handleNextTest}
          />
        ) : (
          <LevelSelect
            key="level-select"
            tests={GRAMMAR_TESTS}
            completedLevels={completedLevels}
            onSelectTest={handleSelectTest}
            onResetProgress={handleResetProgress}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
