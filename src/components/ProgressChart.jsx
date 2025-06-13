import React from 'react';

const ProgressChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-gray-500">Pas encore de données pour cette semaine</p>
      </div>
    );
  }

  // Process data for the last 7 days
  const last7Days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayData = data.find(d => d.date === dateStr) || {
      date: dateStr,
      total_proteins: 0,
      daily_protein_goal: data[0]?.daily_protein_goal || 100,
      progress_percent: 0
    };
    
    last7Days.push({
      ...dayData,
      dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      dayNumber: date.getDate()
    });
  }

  const maxValue = Math.max(...last7Days.map(d => d.daily_protein_goal));
  const barHeight = 150;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between space-x-2 mb-4" style={{ height: barHeight + 40 }}>
        {last7Days.map((day, index) => {
          const proteinHeight = (day.total_proteins / maxValue) * barHeight;
          const goalHeight = (day.daily_protein_goal / maxValue) * barHeight;
          const isToday = day.date === today.toISOString().split('T')[0];
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-full max-w-12 mb-2" style={{ height: barHeight }}>
                {/* Goal line */}
                <div 
                  className="absolute w-full border-t-2 border-dashed border-gray-300"
                  style={{ bottom: goalHeight }}
                />
                
                {/* Progress bar */}
                <div 
                  className={`absolute bottom-0 w-full rounded-t transition-all duration-500 ${
                    isToday ? 'bg-blue-500' : 
                    day.progress_percent >= 100 ? 'bg-green-500' :
                    day.progress_percent >= 75 ? 'bg-blue-400' :
                    day.progress_percent >= 50 ? 'bg-yellow-500' : 'bg-red-400'
                  }`}
                  style={{ height: proteinHeight }}
                />
                
                {/* Value label */}
                {day.total_proteins > 0 && (
                  <div 
                    className="absolute w-full text-center text-xs font-semibold text-white"
                    style={{ bottom: proteinHeight + 5 }}
                  >
                    {Math.round(day.total_proteins)}g
                  </div>
                )}
              </div>
              
              {/* Day label */}
              <div className={`text-center ${isToday ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                <div className="text-xs">{day.dayName}</div>
                <div className="text-xs">{day.dayNumber}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
          <span>Aujourd'hui</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
          <span>Objectif atteint</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-1 border-t-2 border-dashed border-gray-300 mr-1"></div>
          <span>Objectif quotidien</span>
        </div>
      </div>
      
      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-semibold text-gray-900">
            {Math.round(last7Days.reduce((sum, day) => sum + day.total_proteins, 0) / 7)}g
          </div>
          <div className="text-gray-600">Moyenne/jour</div>
        </div>
        <div>
          <div className="font-semibold text-gray-900">
            {last7Days.filter(day => day.progress_percent >= 100).length}/7
          </div>
          <div className="text-gray-600">Objectifs atteints</div>
        </div>
        <div>
          <div className="font-semibold text-gray-900">
            {Math.round(last7Days.reduce((sum, day) => sum + day.progress_percent, 0) / 7)}%
          </div>
          <div className="text-gray-600">Progression moyenne</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;