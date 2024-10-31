import React, { useRef, useState } from "react";

const default_position = {
  x: 0,
  y: 0,
};

const useMiniMap = ({ rotate }) => {
  const trackerRef = useRef(null);
  const miniMapRef = useRef(null);
  const [miniMapPosition, setMiniMapPosition] = useState(default_position);

  const offsetTracker = (e) => {
    //DOM 객체 접근
    const rect = trackerRef.current.getBoundingClientRect();
    const miniMapRect = miniMapRef.current.getBoundingClientRect();

    //비율
    const widthRatio = miniMapRect.width / rect.width;
    const heightRatio = miniMapRect.height / rect.height;

    //중심
    const centerX = (rect.width / 2) * widthRatio;
    const centerY = (rect.height / 2) * heightRatio;

    //좌표
    const offsetTrackerX = (e.clientX - rect.left) * widthRatio;
    const offsetTrackerY = (e.clientY - rect.top) * heightRatio;

    //각도
    const radians = (rotate * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    //보정
    const deltaX = offsetTrackerX - centerX;
    const deltaY = offsetTrackerY - centerY;

    const rotatedX = cos * deltaX + sin * deltaY + centerX;
    const rotatedY = -sin * deltaX + cos * deltaY + centerY;

    setMiniMapPosition({
      x: rotatedX,
      y: rotatedY,
    });
  };

  return { offsetTracker, miniMapRef, trackerRef, miniMapPosition };
};
export default useMiniMap;
