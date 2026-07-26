import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export class DateUtil {
    static toDate(date: Date): string {
        return dayjs(date)
            .tz("Asia/Seoul")
            .format("YYYY-MM-DD");
    }

    static toDateTime(date: Date): string {
        return dayjs(date)
            .tz("Asia/Seoul")
            .format("YYYY-MM-DD HH:mm:ss");
    }

    static getDayName(date: Date): string {
        const days = [
            "SUN",
            "MON",
            "TUE",
            "WED",
            "THU",
            "FRI",
            "SAT",
        ];

        return days[
            dayjs(date)
                .tz("Asia/Seoul")
                .day()
        ];
    }

    static formatDate(date: Date): string {
        return dayjs(date)
            .tz("Asia/Seoul")
            .format("YYYY-MM-DD");
    }

    static getMonthRange(
        year: number,
        month: number,
    ) {
        return {
            startDate: dayjs
                .tz(`${year}-${String(month).padStart(2, "0")}-01`, "Asia/Seoul")
                .toDate(),

            endDate: dayjs
                .tz(`${year}-${String(month + 1).padStart(2, "0")}-01`, "Asia/Seoul")
                .toDate(),
        };
    }
}