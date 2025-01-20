import { Prisma } from "@prisma/client";

type Status = {
  nama: string;
  nilai: boolean;
  tanggal?: Date;
};

export interface StatusTemplate {
  nama: string;
  count: number;
}

export type { RegistrationStats, StatusStats, };

interface RegistrationStats {
  totalPeserta: number;
  totalCrew: number;
  ticketBreakdown: {
    peserta: {
      [key: string]: number;
    };
    crew: {
      [key: string]: number;
    };
  };
  equipmentCount: {
    ski: number;
    snowboard: number;
  };
  optionalItems: {
    peserta: {
      [key: string]: number;
    };
    crew: {
      [key: string]: number;
    };
  };
  sizeStats: {
    baju: { [size: string]: number };
    sepatu: { [size: string]: number };
  };
}

interface StatusStats {
  completionRates: {
    [key: string]: {
      completed: number;
      percentage: number;
    };
  };
  byBus: {
    [key: string]: {
      [status: string]: number;
    };
  };
  recentCompletions: {
    [key: string]: {
      last24h: number;
      last7d: number;
    };
  };
}

export function calculateRegistrationStats(peserta: any[]): RegistrationStats {
  const totalPeserta = peserta.filter(p => p.role === 'PESERTA').length;
  const totalCrew = peserta.filter(p => p.role === 'CREW').length;
  
  const stats: RegistrationStats = {
    totalPeserta,
    totalCrew,
    ticketBreakdown: {
      peserta: {},
      crew: {}
    },
    equipmentCount: {
      ski: 0,
      snowboard: 0
    },
    optionalItems: {
      peserta: {},
      crew: {}
    },
    sizeStats: {
      baju: {},
      sepatu: {}
    }
  };

  peserta.forEach(p => {
    // Equipment count
    if (p.tipeAlat === 'ski') stats.equipmentCount.ski++;
    if (p.tipeAlat === 'snowboard') stats.equipmentCount.snowboard++;

    // Ticket breakdown by role
    if (p.registration?.ticketType) {
      if (p.role === 'PESERTA') {
        stats.ticketBreakdown.peserta[p.registration.ticketType] = 
          (stats.ticketBreakdown.peserta[p.registration.ticketType] || 0) + 1;
      } else if (p.role === 'CREW') {
        stats.ticketBreakdown.crew[p.registration.ticketType] = 
          (stats.ticketBreakdown.crew[p.registration.ticketType] || 0) + 1;
      }
    }

    // Count optional items by role
    p.optionalItems.forEach((item: { namaItem: string }) => {
      if (p.role === 'PESERTA') {
        stats.optionalItems.peserta[item.namaItem] = 
          (stats.optionalItems.peserta[item.namaItem] || 0) + 1;
      } else if (p.role === 'CREW') {
        stats.optionalItems.crew[item.namaItem] = 
          (stats.optionalItems.crew[item.namaItem] || 0) + 1;
      }
    });

    // Count clothing and shoe sizes
    if (p.ukuranBaju) {
      stats.sizeStats.baju[p.ukuranBaju] = 
        (stats.sizeStats.baju[p.ukuranBaju] || 0) + 1;
    }
    if (p.ukuranSepatu) {
      stats.sizeStats.sepatu[p.ukuranSepatu] = 
        (stats.sizeStats.sepatu[p.ukuranSepatu] || 0) + 1;
    }
  });

  return stats;
}

export function calculateStatusStats(peserta: any[]): StatusStats {
  const totalParticipants = peserta.length; // Total of both PESERTA and CREW
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const stats: StatusStats = {
    completionRates: {},
    byBus: {},
    recentCompletions: {}
  };

  peserta.forEach(p => {
    (p.status as Status[]).forEach(s => {
      // Completion rates
      if (!stats.completionRates[s.nama]) {
        stats.completionRates[s.nama] = { completed: 0, percentage: 0 };
      }
      if (s.nilai) {
        stats.completionRates[s.nama].completed++;
      }

      // Bus breakdown
      if (p.bus?.namaBus) {
        if (!stats.byBus[p.bus.namaBus]) {
          stats.byBus[p.bus.namaBus] = {};
        }
        if (!stats.byBus[p.bus.namaBus][s.nama]) {
          stats.byBus[p.bus.namaBus][s.nama] = 0;
        }
        if (s.nilai) {
          stats.byBus[p.bus.namaBus][s.nama]++;
        }
      }

      // Recent completions
      if (!stats.recentCompletions[s.nama]) {
        stats.recentCompletions[s.nama] = { last24h: 0, last7d: 0 };
      }
      if (s.nilai && s.tanggal) {
        const completionDate = new Date(s.tanggal);
        if (completionDate >= oneDayAgo) {
          stats.recentCompletions[s.nama].last24h++;
        }
        if (completionDate >= sevenDaysAgo) {
          stats.recentCompletions[s.nama].last7d++;
        }
      }
    });
  });

  // Calculate percentages
  Object.keys(stats.completionRates).forEach(status => {
    stats.completionRates[status].percentage = 
      (stats.completionRates[status].completed / totalParticipants) * 100;
  });

  return stats;
}
