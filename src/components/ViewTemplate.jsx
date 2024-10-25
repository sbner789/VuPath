import { useEffect, useRef, useState } from "react";
import img1 from "../test_images/newjeans-minji.jpg";
import img2 from "../test_images/won-young.jpg";
import useMovements from "../hooks/movements/useMovements";
import useDrawRect from "../hooks/draws/useDrawRect";

const defaultPosition = { x: 0, y: 0 };

const ViewTemplate = ({ imgSizeW, imgSizeH }) => {
  const canvasRef = useRef(null);
  const imgRef = useRef(new Image());
  const containerRef = useRef(null);
  const images = [img1, img2];
  const [translateValue, setTranslateValue] = useState(defaultPosition);
  const [transCoord, setTransCoord] = useState(defaultPosition);
  const [scaleValue, setScaleValue] = useState(1);
  const [rotateValue, setRotateValue] = useState(0);
  const [currentImg, setCurrentImg] = useState(0);
  const [isMove, setIsMove] = useState(true);
  const [isDrawRect, setIsDrawRect] = useState(false);

  const {
    handleWheel,
    handleZoom,
    handleStartMove,
    handleMove,
    handleMoveStop,
    handleRotate,
  } = useMovements({
    container: containerRef,
    useImg: imgRef,
    scale: scaleValue,
    setScale: setScaleValue,
    setRotate: setRotateValue,
    moveOffset: translateValue,
    setMoveOffset: setTranslateValue,
    defaultOffset: defaultPosition,
    setTransCoord: setTransCoord,
  });

  const { drawStartRect, drawRect, drawEndRect, saveRect } = useDrawRect({
    drawCanvas: canvasRef,
    useImg: imgRef,
    currentImg: currentImg,
    scale: scaleValue,
    rotate: rotateValue,
    defaultOffset: defaultPosition,
    imageSizeW: imgSizeW,
    imageSizeH: imgSizeH,
    setTransCoord: setTransCoord,
  });

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

  const loadImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const angle = (rotateValue * Math.PI) / 180;
    const rotatedWidth =
      Math.abs(imgSizeW * Math.cos(angle)) +
      Math.abs(imgSizeH * Math.sin(angle));
    const rotatedHeight =
      Math.abs(imgSizeW * Math.sin(angle)) +
      Math.abs(imgSizeH * Math.cos(angle));

    // canvas 크기 설정
    canvas.width = rotatedWidth;
    canvas.height = rotatedHeight;

    const imageWidth = imgSizeW;
    const imageHeight = imgSizeH;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((rotateValue * Math.PI) / 180);
    context.drawImage(
      imgRef.current,
      -imageWidth / 2,
      -imageHeight / 2,
      imageWidth,
      imageHeight
    );
    context.restore();
  };

  useEffect(() => {
    imgRef.current.src = images[currentImg];
    imgRef.current.onload = () => {
      loadImage();
    };
  }, [currentImg, rotateValue]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        overflow: "hidden",
        border: "2px solid magenta",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `translate(${translateValue.x}px, ${translateValue.y}px) scale(${scaleValue})`,
          transformOrigin: "0 0",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            border: "1px solid black",
          }}
          onWheel={(e) => {
            handleWheel(e);
          }}
          onMouseDown={(e) => {
            isMove && handleStartMove(e);
            isDrawRect && drawStartRect(e);
          }}
          onMouseMove={(e) => {
            isMove && handleMove(e);
            isDrawRect && drawRect(e);
          }}
          onMouseUp={(e) => {
            isMove && handleMoveStop(e);
            isDrawRect && drawEndRect(e);
          }}
        ></canvas>
        <svg
          width={imgSizeW}
          height={imgSizeH}
          style={{
            position: "absolute",
            pointerEvents: "none",
            border: "1px solid blue",
            transform: `rotate(${rotateValue}deg`,
          }}
        >
          {saveRect.map((el) => {
            if (el.img_id === currentImg)
              return (
                <rect
                  key={el.key}
                  width={el.props.width}
                  height={el.props.height}
                  x={el.props.x}
                  y={el.props.y}
                  stroke={el.props.stroke}
                  strokeWidth={el.props.strokeWidth}
                  fill={el.props.fill}
                  transform={el.props.transform}
                />
              );
          })}
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={() => handleZoom("in")}
          style={{ fontSize: "20px" }}
          disabled={scaleValue >= 10}
        >
          +
        </button>
        <button
          onClick={() => handleZoom("out")}
          style={{ fontSize: "20px" }}
          disabled={scaleValue <= 1}
        >
          -
        </button>
        <button onClick={() => handleRotate(30)} style={{ fontSize: "20px" }}>
          +30&#186;
        </button>
        <button onClick={() => handleRotate(-30)} style={{ fontSize: "20px" }}>
          -30&#186;
        </button>
        <button
          onClick={() => {
            setIsDrawRect(!isDrawRect);
            isDrawRect ? setIsMove(true) : setIsMove(false);
          }}
          style={{ fontSize: "20px" }}
        >
          {isDrawRect ? "Stop Rect" : "Start Rect"}
        </button>
        <button
          onClick={handlePrev}
          style={{ fontSize: "20px" }}
          disabled={currentImg < 1}
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          style={{ fontSize: "20px" }}
          disabled={images.length - 1 == currentImg}
        >
          Next
        </button>
      </div>
    </div>
  );
};
export default ViewTemplate;
