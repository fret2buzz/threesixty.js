// var host = 'https://vr201-c9912.firebaseapp.com/';
var host = '';
var threesixty = new ThreeSixty(document.getElementById('threesixty'), {
  image: host + 'images/montage-mozjpeg.jpg',
  aspectRatio: 1,
  count: 35,
  perRow: 4,
  speed: 100,
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
  inverted: true
});

// threesixty.play();

