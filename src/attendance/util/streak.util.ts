// 연속 출석 일수 계산
export class StreakUtil {
  static calculateMaxStreak(attendanceDates: string[]): number {
    let currentStreak = 0;
    let maxStreak = 0;
    const sortedDates = [...attendanceDates].sort();
    let prevDate: Date | null = null;

    for (const dateString of sortedDates) {
      const currentDate = new Date(dateString);

      if (!prevDate) {
        currentStreak = 1;
      } else {
        const diffDays =
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) currentStreak++;
        else currentStreak = 1;
      }

      maxStreak = Math.max(maxStreak, currentStreak);
      prevDate = currentDate;
    }

    return maxStreak;
  }
}
