/**
 * Рассчитывает центральную точку прямоугольника
 * @param {number} bottomX - левая нижняя X координата
 * @param {number} bottomY - левая нижняя Y координата
 * @param {number} topX - правая верхняя X координата
 * @param {number} topY - правая верхняя Y координата
 * @returns {{ centerX: number, centerY: number }} объект с координатами центра
 */
export const calculateCenter = (
  bottomX: number,
  bottomY: number,
  topX: number,
  topY: number
): { centerX: number; centerY: number } => {
  return {
    centerX: (bottomX + topX) / 2,
    centerY: (bottomY + topY) / 2,
  };
};
