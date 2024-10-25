import React, { useRef, useState } from "react";

const useDrawRect = ({
  drawCanvas,
  useImg,
  currentImg,
  scale,
  rotate,
  defaultOffset,
  imageSizeW,
  imageSizeH,
}) => {
  const [saveRect, setSaveRect] = useState([]);
  const isDrawingRectRef = useRef(false);
  const rectPosRef = useRef(defaultOffset);
  const svgRectCoordRef = useRef(defaultOffset);

  const getCanvasCoordinates = (e) => {
    const canvas = drawCanvas.current;
    const rect = canvas.getBoundingClientRect();

    const offsetX = (e.clientX - rect.left) / scale;
    const offsetY = (e.clientY - rect.top) / scale;

    return { offsetX, offsetY };
  };

  const rotatePoint = (x, y, angle, centerX, centerY) => {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const dx = x - centerX;
    const dy = y - centerY;

    return {
      x: dx * cos - dy * sin + centerX,
      y: dx * sin + dy * cos + centerY,
    };
  };

  const getSvgCoordinates = (e) => {
    const canvas = drawCanvas.current;
    const rect = canvas.getBoundingClientRect();

    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const { x: offsetSvgX, y: offsetSvgY } = rotatePoint(
      mouseX,
      mouseY,
      -rotate,
      centerX,
      centerY
    );

    return { offsetSvgX, offsetSvgY };
  };

  const drawStartRect = (e) => {
    const { offsetX, offsetY } = getCanvasCoordinates(e);
    const { offsetSvgX, offsetSvgY } = getSvgCoordinates(e);

    console.log({ offsetX }, { offsetY }, { offsetSvgX }, { offsetSvgY });

    isDrawingRectRef.current = true;
    rectPosRef.current = {
      x: offsetX,
      y: offsetY,
    };
    svgRectCoordRef.current = {
      x: offsetSvgX,
      y: offsetSvgY,
    };

    const canvas = drawCanvas.current;
    const context = canvas.getContext("2d");
    context.beginPath();
  };

  const drawRect = (e) => {
    if (!isDrawingRectRef.current) return;
    const { offsetX, offsetY } = getCanvasCoordinates(e);

    const imageWidth = imageSizeW;
    const imageHeight = imageSizeH;
    const canvas = drawCanvas.current;
    const context = canvas.getContext("2d");
    requestAnimationFrame(() => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate((rotate * Math.PI) / 180);
      context.drawImage(
        useImg.current,
        -imageWidth / 2,
        -imageHeight / 2,
        imageWidth,
        imageHeight
      );
      context.restore();
      context.save();
      context.strokeStyle = "red";
      context.strokeRect(
        rectPosRef.current.x,
        rectPosRef.current.y,
        offsetX - rectPosRef.current.x,
        e.shiftKey
          ? offsetX - rectPosRef.current.x
          : offsetY - rectPosRef.current.y
      );
      context.restore();
    });
  };

  const drawEndRect = (e) => {
    isDrawingRectRef.current = false;
    drawConvertToSVG(e);
  };

  const drawConvertToSVG = (e) => {
    const { offsetX, offsetY } = getCanvasCoordinates(e);
    const { offsetSvgX, offsetSvgY } = getSvgCoordinates(e);
    const svgPathX = rectPosRef.current.x;
    const svgPathY = rectPosRef.current.y;
    const svgRotatePathX = svgRectCoordRef.current.x;
    const svgRotatePathY = svgRectCoordRef.current.y;

    const rectX = svgRotatePathX;
    const rectY = svgRotatePathY;
    const rectWidth = offsetX - svgPathX;
    const rectHeight = e.shiftKey ? offsetX - svgPathX : offsetY - svgPathY;

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
