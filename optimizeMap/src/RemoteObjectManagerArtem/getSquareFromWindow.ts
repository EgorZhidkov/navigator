import { calculateCenter } from './calculateCenter';
import { IRectangleСorners } from './mockData/types/IRectangleСorners';

/**
 * Разделяет прямоугольную область на четыре равные части
 * @param leftBottomX - X-координата левого нижнего угла исходного прямоугольника
 * @param leftBottomY - Y-координата левого нижнего угла исходного прямоугольника
 * @param rightTopX - X-координата правого верхнего угла исходного прямоугольника
 * @param rightTopY - Y-координата правого верхнего угла исходного прямоугольника
 * @returns Массив из четырех прямоугольников, представляющих разбиение исходного прямоугольника
 */
export const getSquarefromWindow = ({
  leftBottomX,
  leftBottomY,
  rightTopX,
  rightTopY,
}: IRectangleСorners): IRectangleСorners[] => {
  // Вычисляем центральную точку исходного прямоугольника
  const center = calculateCenter(
    leftBottomX,
    leftBottomY,
    rightTopX,
    rightTopY
  );

  // Создаем левый верхний квадрат
  const leftTopSquare = {
    leftBottomX,
    leftBottomY: center.centerY,
    rightTopX: center.centerX,
    rightTopY,
  };

  // Создаем правый верхний квадрат
  const rightTopSquare = {
    leftBottomX: center.centerX,
    leftBottomY: center.centerY,
    rightTopX,
    rightTopY,
  };

  // Создаем правый нижний квадрат
  const rightBottomSquare = {
    leftBottomX: center.centerX,
    leftBottomY,
    rightTopX,
    rightTopY: center.centerY,
  };

  // Создаем левый нижний квадрат
  const leftBottomSquare = {
    leftBottomX,
    leftBottomY,
    rightTopX: center.centerX,
    rightTopY: center.centerY,
  };

  // Возвращаем массив из четырех квадратов
  return [leftTopSquare, rightTopSquare, leftBottomSquare, rightBottomSquare];
};
