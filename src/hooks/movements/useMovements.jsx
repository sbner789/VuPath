import React, { useEffect, useRef, useState } from "react";

const default_position = {
  x: 0,
  y: 0,
};

const useMovements = ({
  container,
  images,
  currentImg,
  setCurrentImg,
  scale,
  setScale,
  setRotate,
  moveOffset,
  setMoveOffset,
}) => {
  const panningRef = useRef(false);
  const lastMousePosRef = useRef(default_position);
  const [startPos, setStartPos] = useState(default_position);

  const zoomIntensity = 0.25;
  const maxScale = 40;
  const minScale = 1;

  const zoomAble = (direction, mouseX, mouseY) => {
    const newScale =
      // direction === "in" ? scale + zoomIntensity : scale - zoomIntensity;
      direction === "in"
        ? scale + zoomIntensity
        : direction === "+5"
        ? scale + 5
        : direction === "-5"
        ? scale - 5
        : scale - zoomIntensity;
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

  const handleClickZoom = (e) => {
    if (e.shiftKey) {
      const rect = container.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      lastMousePosRef.current = {
        x: mouseX,
        y: mouseY,
      };
      zoomAble("in", mouseX, mouseY);
    }
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

  const handleNext = () => {
    if (images.length - 1 > currentImg) {
      setCurrentImg((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentImg > 0) {
      setCurrentImg((prev) => prev - 1);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (container.current.requestFullscreen)
        return container.current.requestFullscreen();
      if (container.current.webkitRequestFullscreen)
        return container.current.webkitRequestFullscreen();
      if (container.current.mozRequestFullScreen)
        return container.current.mozRequestFullScreen();
      if (container.current.msRequestFullscreen)
        return container.current.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) return document.exitFullscreen();
      if (document.webkitCancelFullscreen)
        return document.webkitCancelFullscreen();
      if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
      if (document.msExitFullscreen) return document.msExitFullscreen();
    }
  };

  return {
    handleWheel,
    handleZoom,
    handleClickZoom,
    handleStartMove,
    handleMove,
    handleMoveStop,
    handleRotate,
    handleNext,
    handlePrev,
    handleFullscreen,
  };
};
export default useMovements;
