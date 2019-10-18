import React from "react";
import ReactDOM from "react-dom";
import { triangulate } from "delaunay-fast";

import "./styles.css";

const colors = [
  "#0f050f",
  "#1e0a1e",
  "#2e102d",
  "#3d153b",
  "#4c1a4a",
  "#5b1f59",
  "#6a2468",
  "#7a2a77",
  "#892f86",
  "#983495",
  "#a739a4",
  "#b63eb2",
  "#c149bd",
  "#c658c2",
  "#cb67c8",
  "#d076cd",
  "#d585d3",
  "#db95d8",
  "#e0a4de",
  "#e5b3e3",
  "#eac2e9",
  "#efd1ee",
  "#f5e1f4",
  "#faf0f9",
  "#ffffff"
];

const useAnimationFrame = callback => {
  const requestRef = React.useRef();
  const previousTimeRef = React.useRef();

  const animate = time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);
};

const dist = ([x1, y1], [x2, y2]) => {
  let xs = x2 - x1;
  let ys = y2 - y1;

  xs *= xs;
  ys *= ys;

  return Math.sqrt(xs + ys);
};

const getArea = (pta, ptb, ptc) => {
  //find length of sides of triangle
  const lenA = dist(ptb, pta);
  const lenB = dist(ptc, ptb);
  const lenC = dist(pta, ptb);

  const sp = (lenA + lenB + lenC) / 2;

  const area = Math.sqrt(
    Math.abs(sp * (sp - lenA) * (sp - lenB) * (sp - lenC))
  );
  if (isNaN(area)) console.log({ pta, ptb, ptc, lenA, lenB, lenC, sp, area });
  return area;
};

function App() {
  return (
    <div className="App">
      <meta
        name="viewport"
        content="width=device-width,height=device-height,user-scalable=no,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0"
      />
      <Gem w={window.innerWidth} h={window.innerHeight} />
    </div>
  );
}

function Gem({ w = 200, h = 200 }) {
  const canvasRef = React.useRef(null);
  const pRef = React.useRef(0);

  const [points, setPoints] = React.useState(
    Array.from({ length: 30 }).map(i => [
      ~~(Math.random() * w),
      ~~(Math.random() * h),
      0.5 - Math.random() * 1,
      0.5 - Math.random() * 1
    ])
  );

  useAnimationFrame(deltaTime => {
    // Pass on a function to the setter of the state
    // to make sure we always have the latest state
    // setPoints(points.map(([x,y]) =>  [x+ 0.1, y+0.1] ))

    pRef.current = (pRef.current + 1) % points.length;
    if (pRef.current % 2 === 1) {
      setPoints(oldpoints =>
        oldpoints.map(([x, y, dx, dy]) => {
          let nx = x + dx;
          if (nx > w) {
            dx = -dx;
            nx = w;
          }
          if (nx < 0) {
            dx = -dx;
            nx = 0;
          }
          let ny = y + dy;
          if (ny > h) {
            dy = -dy;
            ny = h;
          }
          if (ny < 0) {
            dy = -dy;
            ny = 0;
          }
          return [nx, ny, dx, dy];
        })
      );
    }
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    // points.forEach(p => ctx.fillRect(p[0], p[1], 10, 10));
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.font = "bold 24px serif";
    // points.forEach((p, i) => ctx.fillText(`${i}`, p[0], p[1]));
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // ctx.clearRect(0, 0, window.innerHeight, window.innerWidth);
    const triangle = triangulate(points);

    for (let index = 0; index < triangle.length; index += 3) {
      const [pa, pb, pc] = [
        points[triangle[index]],
        points[triangle[index + 1]],
        points[triangle[index + 2]]
      ];

      ctx.beginPath();
      // const op = 100 - ~~(dist(pa, pb) / 2);
      const op = ~~Math.log(getArea(pa, pb, pc)) * 2;
      // console.log(~~op);
      ctx.fillStyle = colors[op]; //`hsla(144, 80%, ${op}%, 0.25)`;
      ctx.strokeStyle = `hsla(${op}, 90%, 60%, 0.05)`;
      ctx.lineWidth = 1;
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.lineTo(pc[0], pc[1]);
      ctx.lineTo(pa[0], pa[1]);
      ctx.stroke();
      ctx.fill();
    }
  }, [points]);

  const onTouchMove = e => {
    e.preventDefault();
    const curX = e.targetTouches[0].clientX;
    const curY = e.targetTouches[0].clientY;
    setPoints([...points, [curX, curY, Math.random(), Math.random()]]);
  };

  const onMouseMove = e => {
    e.preventDefault();
    const curX = e.clientX;
    const curY = e.clientY;
    setPoints([...points, [curX, curY, Math.random(), Math.random()]]);
  };

  return (
    <canvas
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      ref={canvasRef}
      width={w}
      height={h}
    />
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
