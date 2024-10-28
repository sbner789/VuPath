import { useRef, useState } from "react";
import useCanvas from "./useCanvas";

const defaultPosition = { x: 0, y: 0 };

const useDrawRect = ({
  canvasCurrent,
  useImg,
  currentImg,
  rotate,
  scale,
  setSvgSize,
  imgSizeW,
  imgSizeH,
}) => {
  const [saveRect, setSaveRect] = useState([]);
  const isDrawingRectRef = useRef(false);
  const rectPosRef = useRef(defaultPosition);
  const svgRectCoordRef = useRef(defaultPosition);

  const {
    getCanvasElements,
    getCanvasCoordinates,
    getSvgCoordinates,
    imageSetup,
  } = useCanvas({
    canvasCurrent: canvasCurrent,
    useImg: useImg,
    rotate: rotate,
    scale: scale,
    imgSizeW: imgSizeW,
    imgSizeH: imgSizeH,
    setSvgSize: setSvgSize,
  });

  // 도형의 첫 시작점 가져가기
  const drawStartRect = (e) => {
    const { context } = getCanvasElements();
    const { offsetX, offsetY } = getCanvasCoordinates(e);
    const { offsetSvgX, offsetSvgY } = getSvgCoordinates(e);

    isDrawingRectRef.current = true;
    rectPosRef.current = {
      x: offsetX,
      y: offsetY,
    };
    svgRectCoordRef.current = {
      x: offsetSvgX,
      y: offsetSvgY,
    };
    context.beginPath();
  };

  // 도형 그리기
  const drawRect = (e) => {
    if (!isDrawingRectRef.current) return;
    const { context } = getCanvasElements();
    const { offsetX, offsetY } = getCanvasCoordinates(e);

    requestAnimationFrame(() => {
      imageSetup();
      context.save();
      context.strokeStyle = "red";
      context.strokeRect(
        rectPosRef.current.x,
        rectPosRef.current.y,
        offsetX - rectPosRef.current.x,
        e.shiftKey // shift key 를 이용하여 정사각형 그리기
          ? offsetX - rectPosRef.current.x
          : offsetY - rectPosRef.current.y
      );
      context.restore();
    });
  };

  // 도형 그리기 끝, 도형 저장
  const drawEndRect = (e) => {
    isDrawingRectRef.current = false;
    drawConvertToSVG(e);
  };

  // 도형 svg 형태로 저장
  const drawConvertToSVG = (e) => {
    const { offsetX, offsetY } = getCanvasCoordinates(e);
    const svgPathX = rectPosRef.current.x;
    const svgPathY = rectPosRef.current.y;
    const svgRotatePathX = svgRectCoordRef.current.x;
    const svgRotatePathY = svgRectCoordRef.current.y;

    const rectX = svgRotatePathX;
    const rectY = svgRotatePathY;
    const rectWidth = offsetX - svgPathX;
    const rectHeight = e.shiftKey ? offsetX - svgPathX : offsetY - svgPathY; // shift key 를 이용하여 정사각형의 높이 구하기

    if (rectWidth > 0 && rectHeight > 0) {
      const newSvgRect = (
        <rect
          key={saveRect.length}
          x={rectX}
          y={rectY}
          width={Math.abs(rectWidth)}
          height={Math.abs(rectHeight)}
          stroke="red"
          strokeWidth="2"
          fill="none"
          transform={`rotate(${-rotate},${svgRotatePathX},${svgRotatePathY})`}
        />
      );
      setSaveRect((prev) => [
        ...prev,
        {
          img_id: currentImg,
          key: newSvgRect.key,
          type: newSvgRect.type,
          props: newSvgRect.props,
        },
      ]);
    }
  };

  return { drawStartRect, drawRect, drawEndRect, saveRect };
};
export default useDrawRect;
