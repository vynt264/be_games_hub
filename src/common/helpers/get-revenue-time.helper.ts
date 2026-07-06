import { TYPE_EVENT } from "src/components/admin/mini-game-config/constants/terms.constant";
import { format } from "date-fns";

export function getRevenueTime(
  eventStart: string,
  eventEnd: string,
  typeEvent: number,
) {
  const isTurnEvent = typeEvent === TYPE_EVENT.EVENT_TURN;

  if (isTurnEvent) {
    return {
      startOfDay: eventStart,
      endOfDay: eventEnd,
    };
  }

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  return { startOfDay, endOfDay };
}

export function getRevenueTimeForThirdParty(
  eventStart: string,
  eventEnd: string,
  typeEvent: number,
) {
  const isTurnEvent = typeEvent === TYPE_EVENT.EVENT_TURN;
  const baseDate = new Date();

  return {
    startOfDay: format(isTurnEvent ? eventStart : baseDate, "yyyyMMdd"),
    endOfDay: format(isTurnEvent ? eventEnd : baseDate, "yyyyMMdd"),
  };
}
