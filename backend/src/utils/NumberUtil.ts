class NumberUtil {
  roundToTwo(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}

export default new NumberUtil();
