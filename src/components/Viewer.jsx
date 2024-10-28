import { useEffect, useRef, useState } from "react";
import img1 from "../test_images/newjeans-minji.jpg";
import img2 from "../test_images/won-young.jpg";
import useDrawRect from "../hooks/draws/useDrawRect";
import useMovements from "../hooks/movements/useMovements";
import useCanvas from "../hooks/draws/useCanvas";

const default_position = {
  x: 0,
  y: 0,
};

const default_size = {
  x: 0,
  y: 0,
};

const Viewer = ({ imgSizeW, imgSizeH }) => {
  const canvasRef = useRef(null); //canvas 접근
  const imageRef = useRef(new Image()); // image 객체 생성
  const images = [img1, img2]; // 가져올 이미지 배열, 추후 api data 활용
  const containerRef = useRef(null); // zoom, pan 기능 객체 접근
  const [translateValue, setTranslateValue] = useState(default_position); // 움직일 객체의 x, y 좌표
  const [currentImg, setCurrentImg] = useState(0); // 현재 보고 있는 이미지
  const [rotateValue, setRotateValue] = useState(0); // 로테이션 초기값
  const [scaleValue, setScaleValue] = useState(1); // 스케일 초기값
  const [svgSize, setSvgSize] = useState(default_size); // canvas 의 크기에 맞게 svg 크기 동일화
  const [isDrawRect, setIsDrawRect] = useState(false); // 그림 그리기 시작
  const [isMove, setIsMove] = useState(true); // 움직임 시작

  const { loadImage } = useCanvas({
    canvasCurrent: canvasRef,
    useImg: imageRef,
    images: images,
    currentImg: currentImg,
    rotate: rotateValue,
    scale: scaleValue,
    imgSizeW: imgSizeW,
    imgSizeH: imgSizeH,
    setSvgSize: setSvgSize,
  });

  const { drawStartRect, drawRect, drawEndRect, saveRect } = useDrawRect({
    canvasCurrent: canvasRef,
    useImg: imageRef,
    currentImg: currentImg,
    rotate: rotateValue,
    scale: scaleValue,
    setSvgSize: setSvgSize,
    imgSizeW: imgSizeW,
    imgSizeH: imgSizeH,
  });

  const {
    handleWheel,
    handleZoom,
    handleStartMove,
    handleMove,
    handleMoveStop,
    handleRotate,
    handleNext,
    handlePrev,
  } = useMovements({
    container: containerRef,
    images: images,
    currentImg: currentImg,
    setCurrentImg: setCurrentImg,
    scale: scaleValue,
    setScale: setScaleValue,
    setRotate: setRotateValue,
    moveOffset: translateValue,
    setMoveOffset: setTranslateValue,
  });

  useEffect(() => {
    loadImage();
  }, [rotateValue, currentImg]);

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          border: "2px solid magenta",
          width: "1920px",
          height: "1080px",
          overflow: "hidden",
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
            top: 0,
            left: 0,
            transform: `translate(${translateValue.x}px, ${translateValue.y}px) scale(${scaleValue})`,
            transformOrigin: "0 0",
          }}
        >
          <canvas
            ref={canvasRef}
            onWheel={(e) => {
              handleWheel(e);
            }}
            onMouseDown={(e) => {
              isDrawRect && drawStartRect(e);
              isMove && handleStartMove(e);
            }}
            onMouseMove={(e) => {
              isDrawRect && drawRect(e);
              isMove && handleMove(e);
            }}
            onMouseUp={(e) => {
              isDrawRect && drawEndRect(e);
              isMove && handleMoveStop(e);
            }}
          ></canvas>
          <svg
            width={svgSize.w}
            height={svgSize.h}
            style={{
              position: "absolute",
              pointerEvents: "none",
              transform: `rotate(${rotateValue}deg)`,
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
          style={{ fontSize: "20px", padding: "5px", boxSizing: "border-box" }}
          disabled={scaleValue >= 40}
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
        <button
          onClick={() => {
            handleRotate(30);
          }}
          style={{ fontSize: "20px" }}
        >
          +30&#186;
        </button>
        <button
          onClick={() => {
            handleRotate(-30);
          }}
          style={{ fontSize: "20px" }}
        >
          -30&#186;
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
        <button
          onClick={() => {
            setIsDrawRect(!isDrawRect);
            isDrawRect ? setIsMove(true) : setIsMove(false);
          }}
          style={{ fontSize: "20px" }}
        >
          {isDrawRect ? "Stop Rect" : "Start Rect"}
        </button>
      </div>
    </div>
  );
};
export default Viewer;
