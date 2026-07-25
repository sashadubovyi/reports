import Modal from './Modal.jsx';

function Section({ title, subtitle, children }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-bold text-gray-900">
        {title}
        {subtitle ? <span className="block text-xs font-normal text-gray-500">{subtitle}</span> : null}
      </h3>
      {children}
    </div>
  );
}

function Bullet({ label, children }) {
  return (
    <li className="flex gap-2 text-sm text-gray-700 leading-relaxed">
      <span className="text-brand flex-shrink-0 mt-0.5">❖</span>
      <span>
        <span className="font-semibold text-gray-800">{label}: </span>
        {children}
      </span>
    </li>
  );
}

export default function ProfitStrategyModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-5 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight pr-8">Investment Strategy: Earnings Gap Capture</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Инвестиционная стратегия: захват ценовых разрывов в период отчетности
          </p>
        </div>

        <Section title="Executive Summary" subtitle="Краткий обзор стратегии">
          <p className="text-sm text-gray-700 leading-relaxed">
            Настоящая стратегия ориентирована на генерацию избыточной доходности (альфы) за счет монетизации
            краткосрочных ценовых дисбалансов, возникающих в период раскрытия квартальной финансовой отчетности.
          </p>
        </Section>

        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-gray-900">Методология и рыночные неэффективности</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            В основе подхода лежит использование временного лага и дефицита ликвидности в ходе премаркет-сессии
            (Pre-market). В момент публикации финансовых результатов рынок зачастую демонстрирует инертность или
            избыточную эмоциональную реакцию. Поскольку основной объем институциональной ликвидности активируется лишь
            с открытием регулярной торговой сессии, возникает возможность для арбитража ценовых разрывов (гэпов).
          </p>
        </div>

        <Section title="Methodology & Execution" subtitle="Механика исполнения">
          <p className="text-sm text-gray-700 leading-relaxed">
            Стратегия базируется на принципе «входа на свершившемся факте» (Post-Event Entry), что радикально снижает
            рыночные риски по сравнению с направленными ставками «до события». Вместо прогнозирования результатов
            отчетности, мы работаем с фактической реакцией рынка на уже опубликованные данные.
          </p>
          <ul className="space-y-2 mt-2">
            <Bullet label="Entry Point (Точка входа)">
              Сессия премаркета, за 20–30 минут до открытия NYSE/NASDAQ. В этот момент данные отчета (EPS, Revenue,
              Guidance) уже публичны и вектор движения определен.
            </Bullet>
            <Bullet label="Asset Class (Класс активов)">
              CFD (Contract for Difference) — обеспечивает исполнение в обоих направлениях (Long/Short) и эффективное
              использование капитала.
            </Bullet>
            <Bullet label="Holding Period (Срок экспозиции)">
              Low-latency exposure. Закрытие позиции в течение первых 5–15 минут регулярной сессии.
            </Bullet>
          </ul>
        </Section>

        <Section title="Risk Management & Capital Allocation" subtitle="Управление рисками и распределение капитала">
          <p className="text-sm text-gray-700 leading-relaxed">
            В рамках модели «Aggressive Growth» (Агрессивный рост) мы применяем следующие параметры риск-менеджмента,
            адаптированные под целевой депозит в $10,000. Данные лимиты направлены на максимизацию оборачиваемости
            капитала при строгом контроле кумулятивной просадки.
          </p>
          <ul className="space-y-2 mt-2">
            <Bullet label="Allocation per Event (Объем инвестиций на одну сделку)">
              20% от текущего AUM (Assets Under Management).
            </Bullet>
            <Bullet label="Leverage (LTV) (Кредитное плечо)">1:5 (Кредитное плечо).</Bullet>
            <Bullet label="Effective Position Size (Эффективный размер позиции)">
              Объем позиции в рынке эквивалентен 200% от текущего баланса.
            </Bullet>
            <Bullet label="Risk Mitigation (Снижение рисков)">
              Вход после публикации отчета гарантирует защиту от внезапных негативных сюрпризов, так как мы работаем с
              уже подтвержденным импульсом.
            </Bullet>
          </ul>
        </Section>

        <Section title="Analyst Conclusion" subtitle="Заключение">
          <p className="text-sm text-gray-700 leading-relaxed">
            Представленная модель демонстрирует потенциал экспоненциального роста капитала при сохранении строгого
            регламента по времени экспозиции активов. Использование торгового окна за 20–30 минут до открытия
            регулярной сессии трансформирует стратегию из спекулятивной деятельности в высокотехнологичную процедуру
            извлечения прибыли.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mt-2">
            Ключевым фактором устойчивости является исключение «прогнозирования» как такового: мы входим в рынок только
            тогда, когда фундаментальный драйвер уже подтвержден фактами и цифрами отчетности.
          </p>
        </Section>

        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Уровень риска (Risk Level): Минимальный</span>
            <span className="block text-xs text-gray-600 mt-0.5">
              обусловлено отсутствием позиций в момент публикации отчета и жестким тайм-менеджментом.
            </span>
          </p>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-700">Approved for Implementation. Strategic Portfolio Management Team</p>
          <p className="text-xs text-gray-500">Утверждено к реализации. Группа стратегического управления портфелями</p>
        </div>
      </div>
    </Modal>
  );
}
