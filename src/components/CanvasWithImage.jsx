import React, { useRef, useEffect } from "react";
import img1 from "../test_images/newjeans-minji.jpg";

const CanvasWithImage = () => {
  const canvasRef = useRef(null);
  const imageRef = useRef(new Image());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // const imageSize =

    // 이미지 로드
    imageRef.current.src = img1;

    imageRef.current.onload = () => {
      const imageSizeX = imageRef.current.width;
      const imageSizeY = imageRef.current.height;
      console.log({ imageSizeX }, { imageSizeY });
      const originalWidth = imageSizeX;
      const originalHeight = imageSizeY;
      const canvasWidth = canvas.clientWidth;
      const scale = canvasWidth / originalWidth;

      // 비율에 맞춘 새로운 높이 계산
      const newHeight = originalHeight * scale;

      // 캔버스에 이미지 그리기
      ctx.drawImage(imageRef.current, 0, 0, canvasWidth, newHeight);
    };
  }, []);

  return <canvas ref={canvasRef} width={1920} height={1080} />;
};

export default CanvasWithImage;
