"use strict";

function compose(functions, point) {
  return functions
    .reverse()
    .reduce((acc, item) => item(acc), point);
}

function rotateFromO(angle, { x, y }) {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

function translate({ a, b }, { x, y }) {
  return { x: x + a, y: y + b };
}

function symY0({ x, y }) {
  return { x, y: -y };
}

const swaggerColors = {
  post: "#49cc90",
  get: "#61affe",
  put: "#fca130",
  delete: "#f93e3e",
  head: "#9012fe",
  patch: "#50e3c2",
  disabled: "#ebebeb",
  options: "#0d5aa7",
};

const camembert = (r, a) => {
  // const center = { x: r, y: r };

  // Référentiel initial x = 0, y = 0
  // On fera la translation du tout après

  // Angle du camembert: 60° = 2 * Pi / 6

  /*  point b : intersection de la ligne horizontale en y = apertureOffset
        cercle = { (x, y) | x² + y² = r² }
        droite = { (x, y) | y = a }

        intersection = { (x, y) | x² + a² = r² && y = a }
                     = { (x, y) | (x = sqrt(r² - a²) || x = -sqrt(r² - a²)) && y = a }
        on ne prend que celui de droite i.e x > 0, soit (x, y) = (sqrt(r² - a²), a)

        point c: intersection de la droite qui passe par a et qui forme un angle de 60° = g avec l'horizontale
        avec le cercle
        droite = { (x, y) | }
    */

  // premier camembert
  // On applique des corrections empiriques sur les Y : -10 pour A et B et + 2.3 pour C
  // TODO: corriger, il doit y avoir une erreur de calcul quelque part
  const A = { x: a / Math.sqrt(3), y: a - 10 };
  const Ap = { x: a * (1 / 2 + 1 / Math.sqrt(3)), y: 0 };
  const B = { x: Math.sqrt(r * r - a * a), y: a - 10 };
  const delta = 20 * r * r - 4 * a * a * (1 + 2 / Math.sqrt(3));

  if (delta <= 0) {
    throw new Error("Invalid params. a too large in comparison with r");
  }
  const xC = (4 * a * (1 + 2 / Math.sqrt(3)) +
    Math.sqrt(20 * r * r - 4 * a * a * Math.pow(1 + 2 / Math.sqrt(3), 2))) /
    10;
  //const yC = Math.sqrt(r * r - xC * xC);
  const yC = -Math.sqrt(r * r - xC * xC);
  const C = { x: xC, y: yC + 3.14 };

  return [A, B, C, Ap];

  // const camembert = `
  // M ${A.x + r} ${A.y + r}
  // H ${B.x + r}
  // A ${r} ${r} 0 0 1 ${C.x + r} ${C.y + r}
  // Z
  // `;

  // return `
  // <svg width="${2 * r}" height="${2 * r}" xmlns="http://www.w3.org/2000/svg">
  //   <path d="${camembert}"
  //         fill="blue"
  //         style="stroke: white; XXstroke-width: 5;"
  //     />
  //     <circle cx="${r}" cy="${r}" r="${r}" fill="none" style="stroke: black; stroke-width: 1;"/>
  //     <circle cx="${A.x + r}" cy="${A.y + r}" r="2" fill="red"/>
  //     <circle cx="${Ap.x + r}" cy="${Ap.y + r}" r="2" fill="green"/>
  //     <circle cx="${B.x + r}" cy="${B.y + r}" r="2" fill="blue"/>
  //     <circle cx="${C.x + r}" cy="${C.y + r}" r="2" fill="black"/>
  // </svg>
  // `
};

const camSvg = (c, r, color, border) => `
    <path d="
            M ${c[0].x} ${c[0].y}
            L ${c[1].x} ${c[1].y}
            A ${r} ${r} 0 0 1 ${c[2].x} ${c[2].y}
            Z
        "
        fill="${color}"
        style="stroke: white; stroke-width: ${border};"
    />
`;

const camPoints = (c, color) => `
    <circle cx="${c[0].x}" cy="${c[0].y}" r="2" fill="${color}"/>
    <circle cx="${c[1].x}" cy="${c[1].y}" r="4" fill="${color}"/>
    <circle cx="${c[2].x}" cy="${c[2].y}" r="6" fill="${color}"/>
    <circle cx="${c[3].x}" cy="${c[3].y}" r="8" fill="${color}"/>
`;

const draw = (r, a, b) => {
  const camOne = camembert(r, a);
  const cams = [...Array(6).keys()]
    .map((i) =>
      camOne
        .map((point) => rotateFromO(i * Math.PI / 3, point))
        .map((point) => translate({ a: r + b / 2, b: r + b / 2 }, symY0(point)))
    ).reverse();
  // const colors = ["red", "green", "blue", "yellow", "grey", "fuschia"]
  const colors = [
    swaggerColors.head,
    swaggerColors.get,
    swaggerColors.post,
    swaggerColors.patch,
    swaggerColors.put,
    swaggerColors.delete,
  ];
  const paths = cams.map((c, i) => camSvg(c, r, colors[i], b));
  //    <svg width="${2 * r}" height="${2 * r}" xmlns="http://www.w3.org/2000/svg" style="background: black;">
  return `
        <svg viewbox="0 0 ${2 * r} ${
    2 * r
  }" xmlns="http://www.w3.org/2000/svg" style="background: black;">
        <circle cx="${r}" cy="${r}" r="${
    r / 3
  }" fill="white" style="stroke-width: 0;"/>
        ${paths.join("\n")}
        <text x="${r / 10 - 5 + b / 10}" y="${
    3 + r / 10 - 1 + +b / 10
  }" transform="scale(10,10)">{}</text>
        ${false && cams.map((c, i) => camPoints(c, colors[i])).join("\n")}
        </svg>
    `;

  // return `
  //     <svg width="${2 * r}" height="${2 * r}" xmlns="http://www.w3.org/2000/svg">
  //     <path d="
  //         M ${c[0].x} ${c[0].y}
  //         H ${c[1].x}
  //         A ${r} ${r} 0 0 1 ${c[2].x} ${c[2].y}
  //         Z
  //     "
  //             fill="blue"
  //             style="stroke: white; XXstroke-width: 5;"
  //         />
  //         <circle cx="${r}" cy="${r}" r="${r}" fill="none" style="stroke: black; stroke-width: 1;"/>
  //         <circle cx="${c[0].x}" cy="${c[0].y}" r="2" fill="red"/>
  //         <circle cx="${c[1].x}" cy="${c[1].y}" r="2" fill="blue"/>
  //         <circle cx="${c[2].x}" cy="${c[2].y}" r="2" fill="black"/>
  //     </svg>
  // `
};

// console.log(draw(400, 80, 20))
const svg = draw(400, 100, 30);
await Deno.writeTextFileSync("utils/icon.svg", svg);
