import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import type { GrammarTest } from '../types';

interface LevelSelectProps {
  tests: GrammarTest[];
  completedLevels: Record<string, number>;
  onSelectTest: (testId: string) => void;
  onResetProgress: () => void;
}

type TopicFilter = 'all' | 'verbs' | 'cases' | 'participles' | 'mixed';

const PASSING_SCORE = 90;

const TOPIC_FILTERS: { id: TopicFilter; label: string }[] = [
  { id: 'all', label: 'Все тесты' },
  { id: 'verbs', label: 'Глаголы' },
  { id: 'cases', label: 'Падежи' },
  { id: 'participles', label: 'Причастия и деепричастия' },
  { id: 'mixed', label: 'Разное' },
];

function matchesTopic(test: GrammarTest, filter: TopicFilter): boolean {
  if (filter === 'all') return true;
  const sub = test.subtitle.toLowerCase();
  if (filter === 'verbs') {
    return (
      sub.includes('глагол') ||
      sub.includes('вид') ||
      sub.includes('движен') ||
      sub.includes('пристав')
    );
  }
  if (filter === 'cases') {
    return sub.includes('падеж') || sub.includes('управлен');
  }
  if (filter === 'participles') {
    return sub.includes('причасти') || sub.includes('деепричасти');
  }
  return sub.includes('разное');
}

export function LevelSelect({
  tests,
  completedLevels,
  onSelectTest,
  onResetProgress,
}: LevelSelectProps) {
  const [topicFilter, setTopicFilter] = useState<TopicFilter>('all');

  const hasProgress = Object.keys(completedLevels).length > 0;
  const passedCount = tests.filter(
    (test) => (completedLevels[test.id] ?? 0) >= PASSING_SCORE,
  ).length;

  const filteredTests = useMemo(
    () => tests.filter((test) => matchesTopic(test, topicFilter)),
    [tests, topicFilter],
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 tracking-tight text-balance">
            Тесты, тесты, тесты...
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-3 tracking-wide">
            II СЕРТИФИКАЦИОННЫЙ УРОВЕНЬ
          </p>
          {hasProgress && (
            <div className="mt-3 flex items-center justify-center gap-3 text-sm text-gray-500 tabular-nums">
              <span>
                Пройдено {passedCount} из {tests.length}
              </span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onResetProgress}
                className="text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
              >
                Сбросить прогресс
              </button>
            </div>
          )}
        </header>

        <div
          className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-gray-200/70 rounded-xl mb-6"
          role="tablist"
          aria-label="Фильтр по темам"
        >
          {TOPIC_FILTERS.map((filter) => {
            const isActive = topicFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTopicFilter(filter.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <main className="space-y-4">
          {filteredTests.map((test) => {
            const bestScore = completedLevels[test.id];
            const isPassed = bestScore !== undefined && bestScore >= PASSING_SCORE;

            return (
              <button
                key={test.id}
                type="button"
                onClick={() => onSelectTest(test.id)}
                className="w-full flex items-center justify-between gap-4 p-4 sm:p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <div className="flex-grow min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                    {test.title}
                  </h2>
                  <p className="text-sm sm:text-base mt-0.5 text-gray-600">
                    <span>{test.subtitle}</span>
                    <span className="mx-2" aria-hidden="true">
                      ·
                    </span>
                    <span className="tabular-nums">
                      {test.questions.length} вопросов
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {bestScore !== undefined && (
                    <span
                      className={`font-semibold text-lg tabular-nums ${
                        isPassed ? 'text-green-700' : 'text-amber-700'
                      }`}
                    >
                      {bestScore}%
                    </span>
                  )}
                  {isPassed ? (
                    <CheckCircle2
                      className="w-7 h-7 text-green-600"
                      aria-label="Уровень пройден"
                    />
                  ) : (
                    <ChevronRight
                      className="w-6 h-6 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </main>
      </div>
    </div>
  );
}
