/**
 * Vector SVG representations for Chess Pieces
 * Enhanced Staunton vectors with high-contrast outlines for both dark and light squares.
 */

const PIECE_SVGS = {
  // White Pieces: Clean ivory/white with dark slate boundary
  P: `<svg viewBox="0 0 45 45" class="chess-piece-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
          class="piece-white" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,

  N: `<svg viewBox="0 0 45 45" class="chess-piece-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="m 22,10 c 10.5,1 16.5,8 16,29 L 15,39 C 15,30 11,26 8,16 c 8,0 10,-5 14,-6 z"
          class="piece-white" stroke="#1e293b" stroke-width="1.8"/>
    <path d="m 24,18 c 0.38,2.91 -5.55,7.37 -8,9 -3,2 -2.82,4.34 -5,4 -1.04,-0.94 -1.48,-4.91 1,-7 2,-1.7 8,-4 8,-6 z"
          class="piece-white" stroke="#1e293b" stroke-width="1.8"/>
    <circle cx="9.5" cy="25.5" r="1.2" fill="#1e293b"/>
    <circle cx="15" cy="15.5" r="1.5" fill="#1e293b"/>
  </svg>`,

  B: `<svg viewBox="0 0 45 45" class="chess-piece-svg" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path class="piece-white" d="m 9,36 c 3.39,-0.97 10.11,0.43 13.5,-2 3.39,2.43 10.11,1.03 13.5,2 0,0 1.65,.5 3,1 -0.5,2 -1.5,3 -2.5,3 l -28,0 c -1,0 -2,-1 -2.5,-3 1.35,-.5 3,-1 3,-1 z"/>
      <path class="piece-white" d="m 15,32 c 2.5,2.5 12.5,2.5 15,0 0.5,-1.5 0,-2 0,-2 0,-2.5 -2.5,-4 -2.5,-4 5.5,-1.5 6,-11.5 -5,-15.5 -11,4 -10.5,14 -5,15.5 0,0 -2.5,1.5 -2.5,4 0,0 -0.5,0.5 0,2 z"/>
      <path d="m 25,8 a 2.5,2.5 0 1 1 -5,0 2.5,2.5 0 1 1 5,0 z" fill="#fff" stroke="#1e293b"/>
      <path d="m 17.5,26 l 10,0 M 15,30 l 15,0 M 22.5,15.5 l 0,9 M 20,20 l 5,0"/>
    </g>
  </svg>`,

  R: `<svg viewBox="0 0 45 45" class="chess-piece-svg" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path class="piece-white" d="m 9,39 l 27,0 c 0,-3 -2,-4 -2,-4 l -23,0 c 0,0 -2,1 -2,4 z"/>
      <path class="piece-white" d="m 12,35 l 21,0 c 0,-3 -1,-5 -2,-5 l -17,0 c -1,0 -2,2 -2,5 z"/>
      <path class="piece-white" d="m 14,29.5 l 17,0 c 0,-6 -1,-13 -1,-13 l -15,0 c 0,0 -1,7 -1,13 z"/>
      <path class="piece-white" d="m 11,14 l 23,0 0,-5 -4,0 0,2 -3.5,0 0,-2 -4,0 0,2 -3.5,0 0,-2 -4,0 z"/>
      <path d="m 12,35.5 l 21,0 M 13,31.5 l 19,0 M 14,16.5 l 17,0"/>
    </g>
  </svg>`,

  Q: `<svg viewBox="0 0 45 45" class="chess-piece-svg" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path class="piece-white" d="m 9,26 c 8.5,-1.5 21,-1.5 27,0 l 2,-12 -7,11 -4,-15 -4.5,15 -4.5,-15 -4,15 -7,-11 2,12 z"/>
      <path class="piece-white" d="m 9,26 c 0,2 1.5,2 2.5,4 1,1.5 1,1 1.5,3.5 0.5,1.5 0.5,1.5 1,2.5 2,2.5 10,2.5 17,0 0.5,-1 0.5,-1 1,-2.5 0.5,-2.5 0.5,-2 1.5,-3.5 1,-2 2.5,-2 2.5,-4 -8.5,-1.5 -18.5,-1.5 -27,0 z"/>
      <path class="piece-white" d="m 11,38.5 a 35,35 1 0 0 23,0 c 0,-2.5 -2,-3.5 -2,-3.5 l -19,0 c 0,0 -2,1 -2,3.5 z"/>
      <circle cx="6" cy="12" r="2" fill="#fff" stroke="#1e293b"/>
      <circle cx="14" cy="9" r="2" fill="#fff" stroke="#1e293b"/>
      <circle cx="22.5" cy="8" r="2" fill="#fff" stroke="#1e293b"/>
      <circle cx="31" cy="9" r="2" fill="#fff" stroke="#1e293b"/>
      <circle cx="39" cy="12" r="2" fill="#fff" stroke="#1e293b"/>
    </g>
  </svg>`,

  K: `<svg viewBox="0 0 45 45" class="chess-piece-svg" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="m 22.5,11.5 l 0,-6 M 20,8 l 5,0"/>
      <path class="piece-white" d="m 22.5,25 c -4,-4 -7.5,-3 -10.5,-0.5 -3.5,3 -2.5,8 0,11 3,3.5 7.5,3.5 10.5,3.5 3,0 7.5,0 10.5,-3.5 2.5,-3 3.5,-8 0,-11 -3,-2.5 -6.5,-3.5 -10.5,0.5 z"/>
      <path class="piece-white" d="m 11.5,37 c 5.5,3.5 15.5,3.5 22,0 0,-2.5 -2,-3.5 -2,-3.5 l -18,0 c 0,0 -2,1 -2,3.5 z"/>
      <path class="piece-white" d="m 20,13 a 2.5,2.5 0 0 1 5,0 c 0,2.5 -2.5,4 -2.5,4 0,0 -2.5,-1.5 -2.5,-4 z"/>
      <path d="m 12.5,30 c 5.5,1.5 14.5,1.5 20,0 M 11.5,33.5 c 5.5,1.5 16.5,1.5 22,0"/>
    </g>
  </svg>`,

  // Black Pieces: Premium charcoal with luminous silver stroke (#f1f5f9)
  p: `<svg viewBox="0 0 45 45" class="chess-piece-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
          class="piece-black" stroke="#e2e8f0" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,

  n: `<svg viewBox="0 0 45 45" class="chess-piece-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="m 22,10 c 10.5,1 16.5,8 16,29 L 15,39 C 15,30 11,26 8,16 c 8,0 10,-5 14,-6 z"
          class="piece-black" stroke="#e2e8f0" stroke-width="1.8"/>
    <path d="m 24,18 c 0.38,2.91 -5.55,7.37 -8,9 -3,2 -2.82,4.34 -5,4 -1.04,-0.94 -1.48,-4.91 1,-7 2,-1.7 8,-4 8,-6 z"
          class="piece-black" stroke="#e2e8f0" stroke-width="1.8"/>
    <circle cx="9.5" cy="25.5" r="1.3" fill="#38bdf8"/>
    <circle cx="15" cy="15.5" r="1.5" fill="#e2e8f0"/>
  </svg>`,

  b: `<svg viewBox="0 0 45 45" class="chess-piece-svg" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#e2e8f0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path class="piece-black" d="m 9,36 c 3.39,-0.97 10.11,0.43 13.5,-2 3.39,2.43 10.11,1.03 13.5,2 0,0 1.65,.5 3,1 -0.5,2 -1.5,3 -2.5,3 l -28,0 c -1,0 -2,-1 -2.5,-3 1.35,-.5 3,-1 3,-1 z"/>
      <path class="piece-black" d="m 15,32 c 2.5,2.5 12.5,2.5 15,0 0.5,-1.5 0,-2 0,-2 0,-2.5 -2.5,-4 -2.5,-4 5.5,-1.5 6,-11.5 -5,-15.5 -11,4 -10.5,14 -5,15.5 0,0 -2.5,1.5 -2.5,4 0,0 -0.5,0.5 0,2 z"/>
      <path d="m 25,8 a 2.5,2.5 0 1 1 -5,0 2.5,2.5 0 1 1 5,0 z" fill="#20293a" stroke="#e2e8f0"/>
      <path d="m 17.5,26 l 10,0 M 15,30 l 15,0 M 22.5,15.5 l 0,9 M 20,20 l 5,0" stroke="#94a3b8"/>
    </g>
  </svg>`,

  r: `<svg viewBox="0 0 45 45" class="chess-piece-svg" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#e2e8f0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path class="piece-black" d="m 9,39 l 27,0 c 0,-3 -2,-4 -2,-4 l -23,0 c 0,0 -2,1 -2,4 z"/>
      <path class="piece-black" d="m 12,35 l 21,0 c 0,-3 -1,-5 -2,-5 l -17,0 c -1,0 -2,2 -2,5 z"/>
      <path class="piece-black" d="m 14,29.5 l 17,0 c 0,-6 -1,-13 -1,-13 l -15,0 c 0,0 -1,7 -1,13 z"/>
      <path class="piece-black" d="m 11,14 l 23,0 0,-5 -4,0 0,2 -3.5,0 0,-2 -4,0 0,2 -3.5,0 0,-2 -4,0 z"/>
      <path d="m 12,35.5 l 21,0 M 13,31.5 l 19,0 M 14,16.5 l 17,0" stroke="#94a3b8"/>
    </g>
  </svg>`,

  q: `<svg viewBox="0 0 45 45" class="chess-piece-svg" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#e2e8f0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path class="piece-black" d="m 9,26 c 8.5,-1.5 21,-1.5 27,0 l 2,-12 -7,11 -4,-15 -4.5,15 -4.5,-15 -4,15 -7,-11 2,12 z"/>
      <path class="piece-black" d="m 9,26 c 0,2 1.5,2 2.5,4 1,1.5 1,1 1.5,3.5 0.5,1.5 0.5,1.5 1,2.5 2,2.5 10,2.5 17,0 0.5,-1 0.5,-1 1,-2.5 0.5,-2.5 0.5,-2 1.5,-3.5 1,-2 2.5,-2 2.5,-4 -8.5,-1.5 -18.5,-1.5 -27,0 z"/>
      <path class="piece-black" d="m 11,38.5 a 35,35 1 0 0 23,0 c 0,-2.5 -2,-3.5 -2,-3.5 l -19,0 c 0,0 -2,1 -2,3.5 z"/>
      <circle cx="6" cy="12" r="2" fill="#20293a" stroke="#e2e8f0"/>
      <circle cx="14" cy="9" r="2" fill="#20293a" stroke="#e2e8f0"/>
      <circle cx="22.5" cy="8" r="2" fill="#20293a" stroke="#e2e8f0"/>
      <circle cx="31" cy="9" r="2" fill="#20293a" stroke="#e2e8f0"/>
      <circle cx="39" cy="12" r="2" fill="#20293a" stroke="#e2e8f0"/>
    </g>
  </svg>`,

  k: `<svg viewBox="0 0 45 45" class="chess-piece-svg" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#e2e8f0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="m 22.5,11.5 l 0,-6 M 20,8 l 5,0" stroke="#f8fafc"/>
      <path class="piece-black" d="m 22.5,25 c -4,-4 -7.5,-3 -10.5,-0.5 -3.5,3 -2.5,8 0,11 3,3.5 7.5,3.5 10.5,3.5 3,0 7.5,0 10.5,-3.5 2.5,-3 3.5,-8 0,-11 -3,-2.5 -6.5,-3.5 -10.5,0.5 z"/>
      <path class="piece-black" d="m 11.5,37 c 5.5,3.5 15.5,3.5 22,0 0,-2.5 -2,-3.5 -2,-3.5 l -18,0 c 0,0 -2,1 -2,3.5 z"/>
      <path class="piece-black" d="m 20,13 a 2.5,2.5 0 0 1 5,0 c 0,2.5 -2.5,4 -2.5,4 0,0 -2.5,-1.5 -2.5,-4 z"/>
      <path d="m 12.5,30 c 5.5,1.5 14.5,1.5 20,0 M 11.5,33.5 c 5.5,1.5 16.5,1.5 22,0" stroke="#94a3b8"/>
    </g>
  </svg>`
};

function getPieceSvg(pieceChar) {
  return PIECE_SVGS[pieceChar] || '';
}
