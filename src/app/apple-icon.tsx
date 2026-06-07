import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#010100",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            color: "#FFFFFF",
            fontSize: 108,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          M
          <span
            style={{
              display: "flex",
              fontSize: 44,
              fontWeight: 600,
              marginTop: 6,
              marginLeft: 2,
            }}
          >
            1
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
