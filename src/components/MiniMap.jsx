import React from "react";

const MiniMap = ({ miniMap, scale, miniMapOffset, images, currentImg }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        width: "250px",
        height: "250px",
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: "3px",
      }}
    >
      <div
        ref={miniMap}
        style={{
          position: "relative",
          width: "auto",
          height: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "250px",
            height: "250px",
            border: scale > 1 ? `${scale}px solid red` : "none",
            boxSizing: "border-box",
            transform: `translate(${miniMapOffset.x - 125}px, ${
              miniMapOffset.y - 125
            }px) scale(${1 / scale})`,
          }}
        />
        <img
          style={{
            width: "100%",
          }}
          src={images[currentImg]}
          alt="tracker_image"
        />
      </div>
    </div>
  );
};
export default MiniMap;
