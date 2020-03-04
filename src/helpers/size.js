import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const vh = height / 100;
const vw = width / 100;

const guidelineBaseWidth = 375; // based on iphone 5's width
const guidelineBaseHeight = 667; // based on iphone 8's height

export const sizeW = size => {
  return size * vw;
};

export const sizeH = size => {
  return size * vh;
};

// if phone, base on 5's with of UIKit Size (Points)
// if tablet, based on iphone 6's height of UIKit Size (Points)
export const normalize = size => {
  if (width < 375) {
    return (size * width) / guidelineBaseWidth;
  }
  if (width >= 375 && width <= 768) {
    return size;
  }
  return (size * height) / guidelineBaseHeight;
};
