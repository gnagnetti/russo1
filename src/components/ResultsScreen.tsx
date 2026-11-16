import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { GrammarTest, UserAnswer } from '../types';

interface ResultsScreenProps {
  test: GrammarTest;
  answers: UserAnswer[];
  onRestart: () => void;
  onGoHome: () => void;
  hasNextTest: boolean;
  onNextTest: () => void;
}

const PASSING_SCORE = 90;

export function ResultsScreen({
  test,
  answers,
  onRestart,
  onGoHome,
  hasNextTest,
  onNextTest,
}: ResultsScreenProps) {
  const [showMistakes, setShowMistakes] = useState(false);

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const answeredCount = answers.length;
  const totalCount = test.questions.length;
  const isFullTest = answeredCount === totalCount;
  const percentage =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const isPassed = percentage >= PASSING_SCORE;

  const mistakes = answers
    .filter((a) => !a.isCorrect)
    .map((answer) => {
      const question = test.questions.find((q) => q.id === answer.questionId);
      if (!question) return null;
      return {
        question,
        selectedText: question.options[answer.selectedOptionIndex],
        correctText: question.options[question.correctAnswerIndex],
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center"
      >
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          Результаты
        </h1>
        <p className="text-base text-gray-600 mt-1">
          {test.title} · {test.subtitle}
        </p>

        <div className="my-8">
          <div
            className={`text-7xl font-bold tabular-nums ${
              isPassed ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {percentage}%
          </div>
          <p className="text-gray-700 mt-2 tabular-nums">
            {correctCount} из {answeredCount} правильных ответов
          </p>
          {!isFullTest && (
            <p className="text-sm text-gray-500 mt-1 tabular-nums">
              Выполнено {answeredCount} из {totalCount} упражнений
            </p>
          )}
        </div>

        <p
          className={`text-lg sm:text-xl font-semibold mb-8 ${
            isPassed ? 'text-green-700' : 'text-amber-700'
          }`}
        >
          {isFullTest
            ? isPassed
              ? 'Отлично! Уровень пройден.'
              : 'Попробуйте еще раз. Нужно 90% для прохождения.'
            : isPassed
              ? 'Отличный результат по выбранным упражнениям.'
              : 'Попробуйте еще раз или выберите другие упражнения.'}
        </p>

        <div className="space-y-3">
          {hasNextTest && (
            <button
              type="button"
              onClick={onNextTest}
              className={`w-full font-semibold py-3.5 px-4 rounded-xl text-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isPassed
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Следующий тест
            </button>
          )}

          <button
            type="button"
            onClick={onRestart}
            className={`w-full font-semibold py-3.5 px-4 rounded-xl text-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              isPassed && hasNextTest
                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isPassed ? 'Пройти снова' : 'Попробовать еще раз'}
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="w-full bg-gray-200 text-gray-800 font-semibold py-3.5 px-4 rounded-xl text-lg hover:bg-gray-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            К списку тестов
          </button>
        </div>

        {mistakes.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 text-left">
            <button
              type="button"
              onClick={() => setShowMistakes((prev) => !prev)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-gray-900 py-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            >
              <span className="tabular-nums">
                Разбор ошибок ({mistakes.length})
              </span>
              {showMistakes ? (
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            {showMistakes && (
              <ul className="mt-4 space-y-4 max-h-72 overflow-y-auto pr-1">
                {mistakes.map(({ question, selectedText, correctText }) => (
                  <li
                    key={question.id}
                    className="text-sm border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                  >
                    <p className="font-medium text-gray-900 mb-1.5">
                      {question.id}. {question.text}
                    </p>
                    <p className="text-red-700">
                      Ваш ответ:{' '}
                      <span className="line-through">{selectedText}</span>
                    </p>
                    <p className="text-green-700 font-medium">
                      Правильно: {correctText}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
