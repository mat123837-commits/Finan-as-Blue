import React, { useState, useEffect, useRef } from 'react';
import { AppData } from '../types';
import { formatCurrency } from '../constants';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, CreditCard, Landmark, Home, LayoutGrid, List, Menu } from 'lucide-react';

interface CalendarViewProps {
  data: AppData;
  onOpenSidebar: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ data, onOpenSidebar }) => {
  // State for the currently selected date (for daily details)
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // State for the month being viewed (for the calendar grid/strip)
  const [viewDate, setViewDate] = useState(new Date());
  
  // View mode: 'week' (strip) or 'month' (grid)
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');

  const scrollRef = useRef<HTMLDivElement>(null);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun, 1=Mon...

  // Week Days Header
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Helper to check if a specific day has events
  const getEventsForDay = (day: number, month: number, year: number) => {
    const events = [];

    // Credit Card Due Date
    if (data.creditCard.dueDate === day) {
        // Approximate amount based on context or use 0 placeholder
        events.push({
            id: 'cc-due',
            title: 'Fatura do Cartão',
            amount: 0, 
            type: 'card',
            icon: CreditCard,
            color: 'bg-indigo-100 text-indigo-600'
        });
    }

    // Loans
    data.debts.forEach(debt => {
        // Check if debt is active (installmentsRemaining > 0)
        // Ideally we check if this specific month/year is within the debt period.
        // For simplicity in this view, we assume recurring if active.
        if (debt.dueDate === day && debt.installmentsPaid < debt.installmentsTotal) {
             // FIX: Use explicit installment value if available, fallback to calc
             const realInstallmentValue = debt.installmentValue || (debt.totalValue / debt.installmentsTotal);
             
             events.push({
                id: `debt-${debt.id}`,
                title: debt.name,
                amount: realInstallmentValue,
                type: 'debt',
                icon: Landmark,
                color: 'bg-slate-100 text-slate-600'
            });
        }
    });

    // Fixed House Costs (Mock logic for demo)
    if (day === 5) {
        events.push({ id: 'rent', title: 'Aluguel / Cond.', amount: data.house.rentAmount, type: 'house', icon: Home, color: 'bg-emerald-100 text-emerald-600' });
    }
    if (day === 15) {
        events.push({ id: 'internet', title: 'Internet', amount: data.house.internetAmount, type: 'house', icon: Home, color: 'bg-blue-100 text-blue-600' });
    }

    return events;
  };

  const selectedEvents = getEventsForDay(selectedDate.getDate(), selectedDate.getMonth(), selectedDate.getFullYear());

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };

  // Scroll to selected day in Week view
  useEffect(() => {
    if (viewMode === 'week' && scrollRef.current) {
        // Simple logic to scroll to the selected day button
        // This assumes the buttons are roughly 60px wide + margin
        // A better way is to use id or refs, but simple math works for this demo.
        const day = selectedDate.getDate();
        if (selectedDate.getMonth() === currentMonth) {
            const scrollPos = (day - 1) * 60; // Approx width
            scrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
    }
  }, [viewMode, currentMonth]); // Only on mode switch or month change to avoid annoying jumps on every click if user scrolled manually

  return (
    <div className="pb-32 animate-in slide-in-from-right duration-300">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-6 pt-4">
            <div className="flex items-center gap-3">
                <button onClick={onOpenSidebar} className="p-2 bg-white rounded-full shadow-sm text-[#162660] active:scale-95 transition-transform">
                    <Menu size={20} />
                </button>
                <h2 className="text-2xl font-bold text-[#162660] flex items-center gap-2">
                    Agenda
                </h2>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                    onClick={() => setViewMode('week')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'week' ? 'bg-white text-[#162660] shadow-sm' : 'text-gray-400'}`}
                >
                    <List size={20} />
                </button>
                <button 
                    onClick={() => setViewMode('month')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'month' ? 'bg-white text-[#162660] shadow-sm' : 'text-gray-400'}`}
                >
                    <LayoutGrid size={20} />
                </button>
            </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
             <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-full text-gray-500">
                <ChevronLeft size={20} />
             </button>
             <span className="font-bold text-[#162660] capitalize">
                {viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
             </span>
             <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-full text-gray-500">
                <ChevronRight size={20} />
             </button>
        </div>

        {/* View Content */}
        <div className="mb-8">
            {viewMode === 'week' ? (
                // WEEK / STRIP VIEW
                <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 snap-x"
                >
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(currentYear, currentMonth, day);
                        const isSelected = day === selectedDate.getDate() && currentMonth === selectedDate.getMonth();
                        const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth();
                        const hasEv = getEventsForDay(day, currentMonth, currentYear).length > 0;

                        return (
                            <button 
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-2xl mr-2 transition-all flex-shrink-0 snap-center border ${
                                    isSelected 
                                    ? 'bg-[#162660] text-white shadow-lg shadow-blue-900/20 scale-105 border-[#162660]' 
                                    : isToday 
                                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                                        : 'bg-white text-gray-400 border-gray-100'
                                }`}
                            >
                                <span className="text-[10px] font-medium opacity-80 uppercase">
                                    {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                                </span>
                                <span className="text-lg font-bold relative">
                                    {day}
                                    {hasEv && !isSelected && (
                                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full"></span>
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                // MONTH / GRID VIEW
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-50">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {weekDays.map((wd, i) => (
                            <div key={i} className="text-[10px] font-bold text-gray-300 uppercase py-1">
                                {wd}
                            </div>
                        ))}
                    </div>
                    
                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                        {/* Empty slots for previous month */}
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-10"></div>
                        ))}

                        {/* Days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isSelected = day === selectedDate.getDate() && currentMonth === selectedDate.getMonth();
                             const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                            const hasEv = getEventsForDay(day, currentMonth, currentYear).length > 0;

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    className={`h-10 rounded-xl flex items-center justify-center relative transition-all ${
                                        isSelected
                                            ? 'bg-[#162660] text-white shadow-md font-bold'
                                            : isToday
                                                ? 'bg-blue-50 text-blue-600 font-bold'
                                                : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {day}
                                    {hasEv && !isSelected && (
                                        <div className="absolute bottom-1 w-1 h-1 bg-rose-500 rounded-full"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>

        {/* Daily Details View */}
        <div className="space-y-4">
            <h3 className="text-[#162660] font-bold text-lg px-2 flex items-center gap-2">
                {selectedDate.getDate() === new Date().getDate() && selectedDate.getMonth() === new Date().getMonth() 
                    ? 'Hoje' 
                    : selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                <span className="text-xs font-normal text-gray-400 capitalize">
                    - {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                </span>
            </h3>

            {selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
                    <CheckCircle2 size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">Dia livre de contas.</p>
                </div>
            ) : (
                selectedEvents.map((ev) => (
                    <div key={ev.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-4 animate-in slide-in-from-bottom-2">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ev.color}`}>
                            <ev.icon size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-[#162660]">{ev.title}</p>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                                {ev.type === 'debt' ? 'Empréstimo' : ev.type === 'card' ? 'Cartão' : 'Fixo'}
                            </p>
                        </div>
                        <div className="text-right">
                            {ev.amount > 0 ? (
                                <p className="font-bold text-rose-500">{formatCurrency(ev.amount)}</p>
                            ) : (
                                <p className="text-xs text-gray-400 italic">Ver fatura</p>
                            )}
                            <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                <span className="text-[10px] text-gray-400">Pendente</span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};