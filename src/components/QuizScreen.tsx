import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LayoutGrid,
  X,
  XCircle,
} from 'lucide-react';
import type { GrammarTest, UserAnswer } from '../types';

interface QuizScreenProps {
  test: GrammarTest;
  onQuizComplete: (answers: UserAnswer[]) => void;
  onGoHome: () => void;
}

const OPTION_LETTERS = ['А', 'Б', 'В', 'Г'] as const;

export function QuizScreen({
  test,
  onQuizComplete,
  onGoHome,
}: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersById, setAnswersById] = useState<Record<number, UserAnswer>>({});
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const currentQuestion = test.questions[currentIndex];
  const totalQuestions = test.questions.length;
  const currentAnswer = answersById[currentQuestion.id];
  const isAnswered = currentAnswer !== undefined;
  const answeredCount = Object.keys(answersById).length;

  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (isAnswered) return;
      const isCorrect = optionIndex === currentQuestion.correctAnswerIndex;
      setAnswersById((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          selectedOptionIndex: optionIndex,
          isCorrect,
        },
      }));
    },
    [currentQuestion, isAnswered],
  );

  const handleFinish = useCallback(() => {
    const orderedAnswers = test.questions
      .map((q) => answersById[q.id])
      .filter((a): a is UserAnswer => a !== undefined);
    onQuizComplete(orderedAnswers);
  }, [answersById, onQuizComplete, test.questions]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (answeredCount > 0) {
      handleFinish();
    }
  }, [answeredCount, currentIndex, handleFinish, totalQuestions]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isPickerOpen) {
        if (event.key === 'Escape') {
          setIsPickerOpen(false);
        }
        return;
      }

      if (!isAnswered) {
        const keyNum = Number(event.key);
        if (
          Number.isInteger(keyNum) &&
          keyNum >= 1 &&
          keyNum <= currentQuestion.options.length
        ) {
          event.preventDefault();
          handleSelectOption(keyNum - 1);
          return;
        }
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else if (isAnswered) {
          handleFinish();
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === 'Enter' && isAnswered) {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    currentIndex,
    currentQuestion.options.length,
    handleFinish,
    handleNext,
    handlePrev,
    handleSelectOption,
    isAnswered,
    isPickerOpen,
    totalQuestions,
  ]);

  const progressPercent = (answeredCount / totalQuestions) * 100;

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <header className="p-4 sm:px-6 border-b border-gray-200">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-1.5 px-2 -ml-2 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap shrink-0"
              aria-label="Вернуться к списку тестов"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">К списку</span>
            </button>

            <h1 className="text-lg sm:text-2xl font-serif font-bold text-center text-gray-900 truncate">
              {test.title}: {test.subtitle}
            </h1>

            <button
              type="button"
              onClick={() => setIsPickerOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors tabular-nums whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-expanded={isPickerOpen}
              aria-label="Выбрать упражнение"
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
              <span>
                {currentIndex + 1} / {totalQuestions}
              </span>
            </button>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
            <motion.div
              className="bg-blue-600 h-2.5 rounded-full"
              initial={false}
              animate={{
                width: `${Math.max(progressPercent, ((currentIndex + 1) / totalQuestions) * 100)}%`,
              }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>

          <AnimatePresence>
            {isPickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
                className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-800">
                    Выбор упражнения ({answeredCount} из {totalQuestions}{' '}
                    отвечено)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(false)}
                    className="p-1 text-gray-500 hover:text-gray-900 rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    aria-label="Закрыть список упражнений"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {test.questions.map((q, idx) => {
                    const ans = answersById[q.id];
                    const isCurrent = idx === currentIndex;

                    let cellStyle =
                      'bg-white border-gray-300 text-gray-700 hover:bg-gray-100';
                    if (ans) {
                      cellStyle = ans.isCorrect
                        ? 'bg-green-100 border-green-500 text-green-900'
                        : 'bg-red-100 border-red-500 text-red-900';
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setCurrentIndex(idx);
                          setIsPickerOpen(false);
                        }}
                        className={`h-9 rounded-lg border text-sm font-semibold tabular-nums transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${cellStyle} ${
                          isCurrent ? 'ring-2 ring-blue-600 ring-offset-1' : ''
                        }`}
                        aria-label={`Упражнение ${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl mx-auto"
          >
            <p className="text-center text-base sm:text-lg text-gray-500 mb-4 tabular-nums">
              Вопрос {currentIndex + 1} из {totalQuestions}
            </p>

            <p className="text-center text-2xl sm:text-3xl font-semibold text-gray-900 mb-10 min-h-[5rem] flex items-center justify-center text-balance leading-snug">
              {currentQuestion.text}
            </p>

            <div className="space-y-3.5">
              {currentQuestion.options.map((option, idx) => {
                const isCorrectOption =
                  idx === currentQuestion.correctAnswerIndex;
                const isSelected = currentAnswer?.selectedOptionIndex === idx;

                let buttonStyle =
                  'bg-white hover:bg-gray-50 border-gray-300 text-gray-900';

                if (isAnswered) {
                  if (isCorrectOption) {
                    buttonStyle =
                      'bg-green-100 border-green-500 text-green-900';
                  } else if (isSelected) {
                    buttonStyle = 'bg-red-100 border-red-500 text-red-900';
                  } else {
                    buttonStyle =
                      'bg-gray-100 border-gray-300 text-gray-600 opacity-70';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`w-full flex items-center p-4 rounded-xl border-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${buttonStyle} ${
                      isAnswered ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <span className="shrink-0 flex items-center justify-center w-8 h-8 mr-4 text-sm font-bold rounded-full border-2 border-current">
                      {OPTION_LETTERS[idx] ?? idx + 1}
                    </span>
                    <span className="text-lg flex-grow">{option}</span>
                    {isAnswered && isCorrectOption && (
                      <CheckCircle2
                        className="w-6 h-6 ml-3 shrink-0 text-green-600"
                        aria-label="Правильный ответ"
                      />
                    )}
                    {isAnswered && isSelected && !isCorrectOption && (
                      <XCircle
                        className="w-6 h-6 ml-3 shrink-0 text-red-600"
                        aria-label="Неправильный ответ"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="p-4 sm:p-6 border-t border-gray-200">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Назад</span>
          </button>

          {answeredCount > 0 && currentIndex < totalQuestions - 1 && (
            <button
              type="button"
              onClick={handleFinish}
              className="px-4 py-3.5 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap shrink-0"
            >
              Завершить ({answeredCount})
            </button>
          )}

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap shrink-0 ${
                isAnswered
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <span>{isAnswered ? 'Следующий' : 'Пропустить'}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={answeredCount === 0}
              className="px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap shrink-0"
            >
              Завершить
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
