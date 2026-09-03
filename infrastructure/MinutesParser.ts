export const MinutesParser = {
  /**
   * "<1 мин." or "X мин." or "-" or "приб."
   */
  parse(minutes: string): number | null {
    if (minutes === "-") {
      return null;
    }

    const match = minutes.match(/^<?(\d+)\s*мин\.$/);

    if (!match || !match[1]) {
      return null;
    }

    const result = parseInt(match[1], 10);
    return result > 0 ? result : null;
  },
};
