//src/constants/frameImages.ts
// Import shape & frame images from your assets folder

import wayfarerImg from '../assets/frames/WAYFARER--1.jpg';
import catEyeImg from '../assets/frames/CATEYE--1.jpg';
import fullRimImg from '../assets/frames/FULL RIM.jpg';
import halfRimImg from '../assets/frames/HALF RIM.jpg';
import ovalImg from '../assets/frames/OVAL--1.jpg';
import pilotImg from '../assets/frames/PILOT--1.jpg';
import rectangleImg from '../assets/frames/RECTANGLE--1.png';
import roundImg from '../assets/frames/ROUND--1.jpg';
import squareImg from '../assets/frames/SQUARE--1.jpg';

export const FRAME_IMAGES: Record<string, string> = {
  // Popular Shapes
  Oval: ovalImg,
  Rectangle: rectangleImg,
  Browline: halfRimImg,
  Square: squareImg,
  Round: roundImg,
  Wayfarer: wayfarerImg,
  CatEye: catEyeImg,
  Pilot: pilotImg,

  // Popular Frame Types
  FullRim: fullRimImg,
  SemiRim: halfRimImg,
  Rimless: halfRimImg, // Fallback to halfRim or add rimless.jpg when available
};