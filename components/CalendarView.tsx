import React, { useState, useEffect } from 'react';
import { AppData } from '../types';
import { formatCurrency } from '../constants';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, Plus, Circle, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface CalendarViewProps {
  data: AppData;
  onOpenSidebar: () => void;
  onAddTransaction?: (date: string) => void;
}

type ViewMode = 'day' | 'week' | 'month' | 'year';

export const CalendarView: React.FC<CalendarViewProps> = ({ data, onOpenSidebar, onAddTransaction }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date()); // For the mini calendar selection

  // Helper: Get data for a specific day
  const getDayData = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const day = date.getDate();
    
    // Transactions
    const dayTrans = data.transactions.filter(t => t.date === dateStr);
    
    // Fixed Expenses
    const fixed = data.fixedExpenses.filter(f => f.day === day).map(f => ({
        id: `fixed-${f.id}`,
        title: f.title,
        amount: f.amount,
        type: 'expense',
        isFixed: true,
        category: f.category
    }));

    // Debts
    const debts = data.debts.filter(d => d.dueDate === day && d.installmentsPaid < d.installmentsTotal).map(d => ({
        id: `debt-${d.id}`,
        title: d.name,
        amount: d.installmentValue || (d.totalValue / d.installmentsTotal),
        type: 'expense',
        isDebt: true,
        category: 'debt'
    }));

    const allEvents = [...dayTrans, ...fixed, ...debts];
    const income = allEvents.filter(e => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
    const expense = allEvents.filter(e => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);

    return { events: allEvents, income, expense };
  };

  // Navigation Handlers
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    if (viewMode === 'week') newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    if (viewMode === 'year') newDate.setFullYear(currentDate.getFullYear() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      if (viewMode === 'month' || viewMode === 'year') {
          // In year view, clicking a month opens that month
          // In month view, clicking a day selects it (could open day view or just select)
          setCurrentDate(date);
      }
  };

  const handleAddEvent = (e: React.MouseEvent, date: Date) => {
      e.stopPropagation();
      if (onAddTransaction) {
          onAddTransaction(date.toISOString().split('T')[0]);
      }
  };

  // --- SUB-COMPONENTS ---

  const MiniCalendar = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const prevMonthDays = new Date(year, month, 0).getDate();
      const days = [];

      // Prev Month Padding
      for (let i = 0; i < firstDay; i++) {
          days.push(<div key={`prev-${i}`} className="h-8 w-8 flex items-center justify-center text-xs text-gray-300 pointer-events-none">{prevMonthDays - firstDay + i + 1}</div>);
      }
      
      // Current Month
      for (let i = 1; i <= daysInMonth; i++) {
          const d = new Date(year, month, i);
          const isSelected = d.toDateString() === selectedDate.toDateString();
          const isToday = d.toDateString() === new Date().toDateString();
          
          days.push(
              <button 
                key={i} 
                onClick={() => { setSelectedDate(d); setCurrentDate(d); }}
                className={`h-8 w-8 flex items-center justify-center text-xs rounded-full transition-all 
                    ${isSelected ? 'bg-[#13312A] text-[#C69A72] font-bold' : isToday ? 'bg-[#C69A72]/20 text-[#13312A] font-bold' : 'text-gray-600 hover:bg-gray-100'}
                `}
              >
                  {i}
              </button>
          );
      }

      return (
          <div className="p-4 bg-white rounded-3xl shadow-sm border border-[#13312A]/5 mb-6">
              <div className="flex justify-between items-center mb-4 px-2">
                  <span className="font-bold text-[#13312A] text-sm font-serif">{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                  <div className="flex gap-1">
                      <button onClick={() => navigate('prev')} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={14} /></button>
                      <button onClick={() => navigate('next')} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={14} /></button>
                  </div>
              </div>
              <div className="grid grid-cols-7 mb-2">
                  {['D','S','T','Q','Q','S','S'].map(d => <div key={d} className="h-8 w-8 flex items-center justify-center text-[10px] font-bold text-gray-400">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                  {days}
              </div>
          </div>
      );
  };

  const UpcomingEvents = () => {
      // Logic to find next 5 events from today
      const today = new Date();
      const events = [];
      // Quick scan of next 30 days
      for(let i=0; i<30; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const { events: dayEvents } = getDayData(d);
          if (dayEvents.length > 0) {
              dayEvents.forEach(ev => events.push({ ...ev, date: d }));
          }
          if (events.length >= 5) break;
      }

      return (
          <div className="flex-1 overflow-y-auto no-scrollbar">
              <h3 className="text-xs font-bold text-[#13312A] uppercase tracking-wider mb-3 px-1">Próximos Eventos</h3>
              <div className="space-y-3">
                  {events.length === 0 && <p className="text-xs text-gray-400 px-1">Nada previsto para os próximos 30 dias.</p>}
                  {events.slice(0, 5).map((ev, idx) => (
                      <div key={`${ev.id}-${idx}`} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all">
                          <div className={`w-1 h-8 rounded-full ${ev.type === 'income' ? 'bg-emerald-500' : 'bg-[#9F3E34]'}`}></div>
                          <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#13312A] truncate">{ev.title || 'Sem título'}</p>
                              <p className="text-[10px] text-gray-400">{ev.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                          </div>
                          <span className={`text-xs font-bold ${ev.type === 'income' ? 'text-emerald-600' : 'text-[#13312A]'}`}>
                              {formatCurrency(ev.amount)}
                          </span>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  // --- MAIN VIEWS ---

  const MonthView = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const grid = [];

      // Empty slots
      for (let i = 0; i < firstDay; i++) grid.push(<div key={`empty-${i}`} className="bg-gray-50/30 border-b border-r border-[#13312A]/10 min-h-[100px]"></div>);

      // Days
      for (let i = 1; i <= daysInMonth; i++) {
          const d = new Date(year, month, i);
          const isToday = d.toDateString() === new Date().toDateString();
          const { income, expense, events } = getDayData(d);

          grid.push(
              <div 
                key={i} 
                className={`group border-b border-r border-[#13312A]/10 p-2 min-h-[120px] relative transition-colors hover:bg-[#FFFDF5] flex flex-col justify-between cursor-pointer ${isToday ? 'bg-[#FFFDF5]' : 'bg-white'}`}
                onClick={() => handleDateClick(d)}
              >
                  <div className="flex justify-between items-start">
                      <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[#13312A] text-white' : 'text-gray-500'}`}>{i}</span>
                      <button onClick={(e) => handleAddEvent(e, d)} className="opacity-0 group-hover:opacity-100 p-1 bg-[#13312A] text-white rounded-full transition-opacity shadow-sm"><Plus size={12} /></button>
                  </div>
                  
                  <div className="space-y-1 mt-1">
                      {events.slice(0, 3).map((ev, idx) => (
                          <div key={idx} className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${ev.type === 'income' ? 'bg-emerald-50 text-emerald-700' : ev.isFixed ? 'bg-blue-50 text-blue-700' : 'bg-[#F6E9CA] text-[#13312A]'}`}>
                              {ev.title}
                          </div>
                      ))}
                      {events.length > 3 && <div className="text-[9px] text-gray-400 pl-1">+{events.length - 3} mais</div>}
                  </div>

                  <div className="flex justify-between items-end mt-2">
                        <div className="flex flex-col">
                            {income > 0 && <span className="text-[10px] text-emerald-600 font-bold">+{Math.round(income)}</span>}
                            {expense > 0 && <span className="text-[10px] text-[#9F3E34] font-bold">-{Math.round(expense)}</span>}
                        </div>
                  </div>
              </div>
          );
      }

      return (
          <div className="flex flex-col h-full bg-white rounded-3xl border border-[#13312A]/10 overflow-hidden shadow-sm">
              <div className="grid grid-cols-7 border-b border-[#13312A]/10 bg-gray-50">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                      <div key={d} className="py-3 text-center text-xs font-bold text-gray-400 uppercase border-r border-[#13312A]/5 last:border-r-0">{d}</div>
                  ))}
              </div>
              <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
                  {grid}
              </div>
          </div>
      );
  };

  const WeekView = () => {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday
      
      const weekDays = [];
      for(let i=0; i<7; i++) {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          const isToday = d.toDateString() === new Date().toDateString();
          const { events, income, expense } = getDayData(d);

          weekDays.push(
              <div key={i} className="flex-1 flex flex-col border-r border-[#13312A]/10 last:border-r-0 min-w-[140px]">
                  <div className={`p-3 border-b border-[#13312A]/10 text-center ${isToday ? 'bg-[#FFFDF5]' : 'bg-white'}`}>
                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                      <div className={`text-xl font-bold font-serif inline-flex items-center justify-center w-8 h-8 rounded-full ${isToday ? 'bg-[#13312A] text-white' : 'text-[#13312A]'}`}>
                          {d.getDate()}
                      </div>
                      {(income > 0 || expense > 0) && (
                          <div className="flex justify-center gap-2 mt-1 text-[10px]">
                              {income > 0 && <span className="text-emerald-600">+{Math.round(income)}</span>}
                              {expense > 0 && <span className="text-[#9F3E34]">{Math.round(expense)}</span>}
                          </div>
                      )}
                  </div>
                  <div className="flex-1 p-2 bg-gray-50/30 overflow-y-auto space-y-2" onClick={() => handleDateClick(d)}>
                      <button onClick={(e) => handleAddEvent(e, d)} className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-400 text-xs hover:bg-white hover:border-[#13312A] hover:text-[#13312A] transition-all">
                          + Adicionar
                      </button>
                      {events.map((ev, idx) => (
                          <div key={idx} className={`p-3 rounded-xl border shadow-sm text-left relative group ${ev.type === 'income' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100'}`}>
                              <p className="font-bold text-xs text-[#13312A] mb-1 line-clamp-2">{ev.title}</p>
                              <p className={`text-xs font-mono font-bold ${ev.type === 'income' ? 'text-emerald-600' : 'text-[#13312A]'}`}>{formatCurrency(ev.amount)}</p>
                              <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${ev.isFixed ? 'bg-blue-400' : ev.isDebt ? 'bg-[#9F3E34]' : 'bg-gray-200'}`}></div>
                          </div>
                      ))}
                  </div>
              </div>
          );
      }

      return (
          <div className="flex h-full bg-white rounded-3xl border border-[#13312A]/10 overflow-x-auto shadow-sm">
              {weekDays}
          </div>
      );
  };

  const YearView = () => {
      const year = currentDate.getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i);

      return (
          <div className="grid grid-cols-4 gap-4 h-full overflow-y-auto pr-2">
              {months.map(month => {
                  const date = new Date(year, month, 1);
                  const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;
                  
                  // Mini summary
                  let totalMonthIncome = 0;
                  let totalMonthExpense = 0;
                  // Quick aggregation (mock visual only for performance or real calc)
                  data.transactions.forEach(t => {
                      const tDate = new Date(t.date);
                      if (tDate.getFullYear() === year && tDate.getMonth() === month) {
                          if(t.type === 'income') totalMonthIncome += t.amount;
                          else totalMonthExpense += t.amount;
                      }
                  });

                  return (
                      <div 
                        key={month} 
                        onClick={() => { setCurrentDate(date); setViewMode('month'); }}
                        className={`bg-white p-4 rounded-3xl border hover:border-[#C69A72] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-40 ${isCurrentMonth ? 'border-[#13312A] ring-1 ring-[#13312A]/10' : 'border-gray-200'}`}
                      >
                          <div>
                              <h4 className={`font-bold text-lg mb-1 font-serif ${isCurrentMonth ? 'text-[#C69A72]' : 'text-[#13312A]'}`}>
                                  {date.toLocaleDateString('pt-BR', { month: 'long' })}
                              </h4>
                              {isCurrentMonth && <span className="text-[10px] bg-[#13312A] text-white px-2 py-0.5 rounded-full">Atual</span>}
                          </div>
                          
                          <div className="space-y-1">
                              {totalMonthIncome > 0 && (
                                  <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Entradas</span>
                                      <span className="font-bold text-emerald-600">{formatCurrency(totalMonthIncome)}</span>
                                  </div>
                              )}
                              {totalMonthExpense > 0 && (
                                  <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Saídas</span>
                                      <span className="font-bold text-[#9F3E34]">{formatCurrency(totalMonthExpense)}</span>
                                  </div>
                              )}
                              {totalMonthIncome === 0 && totalMonthExpense === 0 && (
                                  <div className="text-center text-xs text-gray-300 mt-2">-</div>
                              )}
                          </div>
                      </div>
                  );
              })}
          </div>
      );
  };

  const DayView = () => {
      const { events, income, expense } = getDayData(currentDate);
      
      return (
          <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-100 bg-[#FFFDF5]">
                  <h2 className="text-2xl font-bold text-[#13312A] font-serif mb-1">{currentDate.toLocaleDateString('pt-BR', { weekday: 'long' })}</h2>
                  <p className="text-gray-500">{currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  
                  <div className="flex gap-4 mt-4">
                      <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                          <p className="text-xs text-emerald-600 font-bold uppercase">Entradas</p>
                          <p className="text-xl font-bold text-emerald-700">{formatCurrency(income)}</p>
                      </div>
                      <div className="bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                          <p className="text-xs text-rose-600 font-bold uppercase">Saídas</p>
                          <p className="text-xl font-bold text-rose-700">{formatCurrency(expense)}</p>
                      </div>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-[#13312A]">Timeline</h3>
                      <button onClick={(e) => handleAddEvent(e, currentDate)} className="text-sm font-bold text-[#C69A72] hover:underline">+ Adicionar Item</button>
                  </div>
                  
                  {events.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">Dia livre de registros.</div>
                  ) : (
                      events.map((ev, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-all group">
                              <div className={`p-3 rounded-full ${ev.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-[#F6E9CA] text-[#13312A]'}`}>
                                  {ev.type === 'income' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                              </div>
                              <div className="flex-1">
                                  <p className="font-bold text-[#13312A]">{ev.title}</p>
                                  <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400 capitalize">{ev.category || 'Geral'}</span>
                                      {ev.isFixed && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded">Fixo</span>}
                                      {ev.isDebt && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded">Dívida</span>}
                                  </div>
                              </div>
                              <span className={`font-bold font-serif ${ev.type === 'income' ? 'text-emerald-600' : 'text-[#13312A]'}`}>
                                  {ev.type === 'income' ? '+' : '-'} {formatCurrency(ev.amount)}
                              </span>
                          </div>
                      ))
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
        
        {/* --- LEFT SIDEBAR (Desktop) --- */}
        <div className="hidden md:flex flex-col w-72 shrink-0 h-full">
            <button onClick={onAddTransaction ? () => onAddTransaction(new Date().toISOString().split('T')[0]) : undefined} className="w-full bg-[#13312A] text-white py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mb-6">
                <Plus size={20} /> Novo Evento
            </button>
            
            <MiniCalendar />
            <UpcomingEvents />
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Header / Navigation Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 shrink-0 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onOpenSidebar} className="md:hidden p-2 bg-white rounded-full shadow-sm"><Circle size={20} /></button>
                    <h2 className="text-3xl font-bold text-[#13312A] font-serif">
                        {viewMode === 'year' ? currentDate.getFullYear() : currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                        <button onClick={() => navigate('prev')} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18} /></button>
                        <button onClick={goToToday} className="px-3 py-1.5 text-xs font-bold text-[#13312A] hover:bg-gray-100 rounded-lg">Hoje</button>
                        <button onClick={() => navigate('next')} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight size={18} /></button>
                    </div>
                </div>

                <div className="flex bg-[#FFFDF5] p-1 rounded-xl border border-[#13312A]/5 self-end md:self-auto">
                    {(['day', 'week', 'month', 'year'] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                                viewMode === mode 
                                    ? 'bg-[#13312A] text-white shadow-md' 
                                    : 'text-[#155446] hover:bg-[#13312A]/5'
                            }`}
                        >
                            {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : mode === 'month' ? 'Mês' : 'Ano'}
                        </button>
                    ))}
                </div>
            </div>

            {/* View Container */}
            <div className="flex-1 overflow-hidden">
                {viewMode === 'month' && <MonthView />}
                {viewMode === 'week' && <WeekView />}
                {viewMode === 'day' && <DayView />}
                {viewMode === 'year' && <YearView />}
            </div>

        </div>
    </div>
  );
};