import React, { useRef, useState } from "react";

const useMovements = ({
  container,
  scale,
  setScale,
  setRotate,
  moveOffset,
  setMoveOffset,
  defaultOffset,
}) => {
  const panningRef = useRef(false);
  const lastMousePosRef = useRef(defaultOffset);
  const [startPos, setStartPos] = useState(defaultOffset);

  const zoomIntensity = 0.25;
  const maxScale = 10;
  const minScale = 1;

  const zoomAble = (direction, mouseX, mouseY) => {
    const newScale =
      direction === "in" ? scale + zoomIntensity : scale - zoomIntensity;
    const clampedScale = Math.min(Math.max(newScale, minScale), maxScale);

    const scaleRatio = clampedScale / scale;

    const newTranslateX =
      moveOffset.x - (mouseX - moveOffset.x) * (scaleRatio - 1);
    const newTranslateY =
      moveOffset.y - (mouseY - moveOffset.y) * (scaleRatio - 1);

    setScale(clampedScale);
    setMoveOffset({
      x: newTranslateX,
      y: newTranslateY,
    });
  };

  const handleWheel = (e) => {
    const rect = container.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    lastMousePosRef.current = {
      x: mouseX,
      y: mouseY,
    };

    zoomAble(e.deltaY < 0 ? "in" : "out", mouseX, mouseY);
  };

  const handleZoom = (direction) => {
    const rect = container.current.getBoundingClientRect();
    const mouseX = lastMousePosRef.current.x || rect.width / 2;
    const mouseY = lastMousePosRef.current.y || rect.height / 2;
    zoomAble(direction, mouseX, mouseY);
  };

  const handleStartMove = (e) => {
    setStartPos({
      x: e.clientX - moveOffset.x,
      y: e.clientY - moveOffset.y,
    });
    panningRef.current = true;
  };

  const handleMove = (e) => {
    if (!panningRef.current) return;
    setMoveOffset({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  const handleMoveStop = (e) => {
    panningRef.current = false;
  };

  const handleRotate = (rot) => {
    setRotate((prev) => prev + rot);
  };

  return {
    handleWheel,
    handleZoom,
    handleStartMove,
    handleMove,
    handleMoveStop,
    handleRotate,
  };
};
export default useMovements;
