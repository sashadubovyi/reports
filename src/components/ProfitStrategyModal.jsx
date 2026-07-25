import {
  LuArrowUpRight,
  LuBell,
  LuCheck,
  LuClock,
  LuFileText,
  LuLightbulb,
  LuSettings,
  LuShieldCheck,
  LuTarget,
  LuTrendingUp,
} from 'react-icons/lu';
import Modal from './Modal.jsx';

function SectionHeading({ icon: Icon, children }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-50 text-brand flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </span>
      {children}
    </h3>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex gap-2 text-sm text-gray-700 leading-relaxed">
      <LuCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

// Horizontal step timeline of a single trade — makes the "narrow window"
// idea instantly readable. Wraps to two rows on very small screens.
function TradeTimeline() {
  const steps = [
    { icon: LuFileText, title: 'Выходит отчёт', note: 'Компания публикует результаты' },
    { icon: LuClock, title: 'Премаркет', note: 'Входим за 20–30 минут до открытия' },
    { icon: LuBell, title: 'Открытие биржи', note: 'Приходят крупные деньги' },
    { icon: LuCheck, title: 'Выходим', note: 'Через 5–15 минут' },
  ];
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-stretch justify-between gap-1">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 flex flex-col items-center text-center relative">
            {i < steps.length - 1 ? (
              <span className="hidden sm:block absolute top-4 left-1/2 w-full h-0.5 bg-blue-200" aria-hidden="true" />
            ) : null}
            <span className="relative z-10 w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center">
              <step.icon className="w-4 h-4" />
            </span>
            <p className="mt-1.5 text-[11px] font-semibold text-gray-800 leading-tight">{step.title}</p>
            <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{step.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple price-gap illustration: yesterday's close, the jump at open, and
// the slice we capture. Drawn inline so there are no external images.
function GapDiagram() {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <svg viewBox="0 0 300 130" className="w-full h-auto" role="img" aria-label="Схема ценового разрыва (гэпа)">
        {/* baseline: yesterday's close */}
        <line x1="10" y1="90" x2="140" y2="90" stroke="#94a3b8" strokeWidth="2.5" />
        <text x="10" y="105" fontSize="9" fill="#64748b">Закрытие вчера</text>

        {/* the gap jump */}
        <line x1="140" y1="90" x2="160" y2="40" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4 3" />

        {/* after-open move (the slice we take) */}
        <line x1="160" y1="40" x2="290" y2="25" stroke="#10b981" strokeWidth="2.5" />
        <text x="185" y="18" fontSize="9" fill="#059669" fontWeight="600">Наша прибыль</text>

        {/* gap bracket */}
        <text x="150" y="70" fontSize="9" fill="#059669" fontWeight="600" textAnchor="middle">Гэп</text>
        <circle cx="160" cy="40" r="3.5" fill="#10b981" />
        <text x="150" y="122" fontSize="9" fill="#64748b" textAnchor="middle">Открытие биржи ↑</text>
      </svg>
    </div>
  );
}

export default function ProfitStrategyModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-5 space-y-5">
        <div className="pr-8">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">Как формируется прибыль</h2>
          <p className="text-sm text-gray-500 mt-1">
            Мы не угадываем отчёты — мы зарабатываем на движении цены, которое уже произошло.
          </p>
        </div>

        <TradeTimeline />

        <div className="space-y-2">
          <SectionHeading icon={LuTrendingUp}>В чём суть</SectionHeading>
          <p className="text-sm text-gray-700 leading-relaxed">
            Каждый квартал компании публикуют отчёты о своих результатах. Сразу после выхода отчёта цена акции резко
            двигается — вверх или вниз. Этот скачок цены на открытии торгов называется «гэп». Именно на таких движениях
            мы и зарабатываем.
          </p>
        </div>

        <GapDiagram />

        <div className="space-y-2">
          <SectionHeading icon={LuLightbulb}>Почему это работает</SectionHeading>
          <p className="text-sm text-gray-700 leading-relaxed">
            Отчёты обычно выходят, когда основная биржа ещё закрыта — на премаркете. В это время торгует мало
            участников, поэтому цена реагирует медленно или слишком эмоционально. Когда через 20–30 минут открывается
            основная сессия и приходят крупные деньги, цена доходит до справедливого уровня. Мы входим до этого движения
            и забираем его.
          </p>
        </div>

        <div className="space-y-2">
          <SectionHeading icon={LuSettings}>Как проходит сделка</SectionHeading>
          <p className="text-sm text-gray-700 leading-relaxed">
            Мы не гадаем, каким будет отчёт. Мы ждём, пока он выйдет, смотрим на реакцию рынка и только потом входим — по
            факту, а не по прогнозу. Это убирает главный риск.
          </p>
          <ul className="space-y-2 mt-1">
            <Bullet>
              <span className="font-semibold text-gray-800">Когда входим:</span> на премаркете, за 20–30 минут до
              открытия биржи (NYSE/NASDAQ). Отчёт уже вышел, направление понятно.
            </Bullet>
            <Bullet>
              <span className="font-semibold text-gray-800">Чем торгуем:</span> CFD — можно зарабатывать и на росте, и на
              падении цены.
            </Bullet>
            <Bullet>
              <span className="font-semibold text-gray-800">Сколько держим:</span> от 5 до 15 минут после открытия.
              Быстро вошли — быстро вышли.
            </Bullet>
          </ul>
        </div>

        <div className="space-y-2">
          <SectionHeading icon={LuShieldCheck}>Управление рисками</SectionHeading>
          <p className="text-sm text-gray-700 leading-relaxed">
            Работаем по модели агрессивного роста на депозит от $10 000. Правила простые:
          </p>
          <ul className="space-y-2 mt-1">
            <Bullet>
              <span className="font-semibold text-gray-800">На одну сделку —</span> 20% депозита.
            </Bullet>
            <Bullet>
              <span className="font-semibold text-gray-800">Плечо 1:5.</span> Значит объём позиции в 5 раз больше
              вложенной в сделку суммы.
            </Bullet>
            <Bullet>
              <span className="font-semibold text-gray-800">Входим только после выхода отчёта —</span> никаких внезапных
              сюрпризов, направление уже известно.
            </Bullet>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-3 flex gap-2.5">
          <LuTarget className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Почему риск минимальный</p>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              В момент выхода отчёта у нас нет открытых позиций. Мы входим, только когда всё уже понятно, и держим сделку
              считанные минуты.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex items-center gap-2 text-gray-500">
          <LuArrowUpRight className="w-4 h-4 flex-shrink-0 text-brand" />
          <p className="text-xs">
            <span className="font-semibold text-gray-700">Группа стратегического управления портфелями.</span>{' '}
            Стратегия утверждена к реализации.
          </p>
        </div>
      </div>
    </Modal>
  );
}
