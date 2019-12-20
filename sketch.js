console.log('ml5 version:', ml5.version);

// makes background change when you resize the window
window.addEventListener("resize", reload);
function reload() {
  location.reload();
}

const BG_IMAGE_WIDTH = 1500;
const BG_IMAGE_HEIGHT = 900;

const CAM_WIDTH = 640;
const CAM_HEIGHT = 480;

const INTERVAL_MAX = 20;

const TRANSITION_SPEED = 0.8;
// change the image dimentions, 15:9

let video;
let barWidth = 1600;

// array for background images
let bgImage = [];
let imageIndex;
let imagePrev;
let imageCurr;
let imageAlpha = 255;
let interval = 0;

// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
let featureExtractor;

//control the opacity of the real pose images
let img1Alpha = 0;
let img2Alpha = 0;
let img3Alpha = 0;
let img4Alpha = 0;
let img5Alpha = 0;
let img6Alpha = 0;

//control opacity of the "what pose" text

//bodpix variables
let bodypix;
let segmentation;
let img;

const options = {
  outputStride: 32, // 8, 16, or 32, default is 16
  segmentationThreshold: 0.5, // 0 - 1, defaults to 0.5
}

function preload(){
  bgImage[0] = loadImage('images/catbg.jpg');
  bgImage[1] = loadImage('images/dogbg.jpg'); //d
  bgImage[2] = loadImage('images/chairbg.jpg'); //good
  bgImage[3] = loadImage('images/corpsebg.jpg'); //good
  bgImage[4] = loadImage('images/cobrabg.jpg'); //good
  bgImage[5] = loadImage('images/treebg.jpg'); //good
}

function setup() {
  // Create a featureExtractor that can extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  createCanvas(windowWidth, windowHeight);
  // Create a video element
  video = createCapture(video);
  video.size(CAM_WIDTH, CAM_HEIGHT);
  video.hide();
  //controls blocked out background
  img = createImage(CAM_WIDTH, CAM_HEIGHT);

  bodypix = ml5.bodyPix(video, modelReady);

  // Creates the UI buttons
  createButtons();

  imageIndex = floor( random(bgImage.length) );  // randon(5, 10); 5 to 9.9999....
  console.log('random test: ' + imageIndex);
  imagePrev = createImage(1,1);
  imageCurr = createImage(1,1);
}

function draw() {
  background(100);

  //shows background images and controls transitions of backgrounds
  image(imagePrev, 0, 0, width, height);
  imageCurr = bgImage[imageIndex];
  push();
  if (imageAlpha < 255) {
    imageAlpha += 15; //changes speed of background transitions
  } else {
    imageAlpha = 255;
  }
  tint(255, 255, 255, imageAlpha);
  image(imageCurr, 0, 0, width, height); // keep the ratio between w and h
  pop();
  // image(bgImage[5], 0, 0, width, height);

  // SHOW POSE NAME IF BACKGROUND IS __
  let treeName = document.getElementById("treetext");
  let cobraName = document.getElementById("cobratext");
  let corpseName = document.getElementById("corpsetext");
  let dogName = document.getElementById("dogtext");
  let chairName = document.getElementById("chairtext");
  let catName = document.getElementById("cattext");

  if (imageIndex == 0) {
    catName.style.opacity = 1;

    dogName.style.opacity = 0;
    chairName.style.opacity = 0;
    corpseName.style.opacity = 0;
    cobraName.style.opacity = 0;
    treeName.style.opacity = 0;
  }
  else if (imageIndex == 1) {
    dogName.style.opacity = 1;

    catName.style.opacity = 0;
    chairName.style.opacity = 0;
    corpseName.style.opacity = 0;
    cobraName.style.opacity = 0;
    treeName.style.opacity = 0;
  }
  else if (imageIndex == 2) {
    chairName.style.opacity = 1;

    treeName.style.opacity = 0;
    catName.style.opacity = 0;
    dogName.style.opacity = 0;
    corpseName.style.opacity = 0;
    cobraName.style.opacity = 0;
  }
  else if (imageIndex == 3) {
    corpseName.style.opacity = 1;

    catName.style.opacity = 0;
    dogName.style.opacity = 0;
    chairName.style.opacity = 0;
    cobraName.style.opacity = 0;
    treeName.style.opacity = 0;
  }
  else if (imageIndex == 4) {
    cobraName.style.opacity = 1;

    catName.style.opacity = 0;
    dogName.style.opacity = 0;
    chairName.style.opacity = 0;
    corpseName.style.opacity = 0;
    treeName.style.opacity = 0;
  }
  else if (imageIndex == 5) {
    treeName.style.opacity = 1;

    catName.style.opacity = 0;
    dogName.style.opacity = 0;
    chairName.style.opacity = 0;
    corpseName.style.opacity = 0;
    cobraName.style.opacity = 0;
  }
  else {
    chairName.style.opacity = 0;
    catName.style.opacity = 0;
    dogName.style.opacity = 0;
    treeName.style.opacity = 0;
    corpseName.style.opacity = 0;
    cobraName.style.opacity = 0;
  }

  //controls bodypix segmentation
  if (segmentation !== undefined) {
    let w = segmentation.raw.width;
    let h = segmentation.raw.height;
    let data = segmentation.raw.data;

    video.loadPixels();
    img.loadPixels();

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let index = x + y*w; // ***

        if ( data[index] >= 0 ) {
          //show body if detected
          img.pixels[index*4 + 0] = video.pixels[index*4 + 0];
          img.pixels[index*4 + 1] = video.pixels[index*4 + 1];
          img.pixels[index*4 + 2] = video.pixels[index*4 + 2];
          img.pixels[index*4 + 3] = 255;
        } else {
          // background of video feed
          img.pixels[index*4 + 0] = 255;
          img.pixels[index*4 + 1] = 0;
          img.pixels[index*4 + 2] = 0;
          img.pixels[index*4 + 3] = 0;
        }
      }
    }
    img.updatePixels();
  }
  //draws camera feed
  image( img, 0, 0, width-250, height );

  //CREATES PROGRESS BAR (the canvas is mirrored)
  push();
  noStroke();
  if (barWidth == 1600) {
    fill(50,205,50,0);
  } else {
    fill(50,205,50, 180);

  }
  rect(0, 198, barWidth, 10);

  pop();
}

function modelReady(){
  select('#status').html('FeatureExtractor(mobileNet model) Loaded')
  console.log('Model Ready!');
  bodypix.segmentWithParts(gotResultsBody, options);
}

// Add the current frame from the video to the classifier
function addExample(label) {
  // Get the features of the input video
  const features = featureExtractor.infer(video);

  // Add an example with a label to the classifier
  knnClassifier.addExample(features, label);
  updateCounts();
}

// Predict the current frame.
function classify() {
  // Get the total number of labels from knnClassifier
  const numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  // Get the features of the input video
  const features = featureExtractor.infer(video);

  // Use knnClassifier to classify which label do these features belong to
  knnClassifier.classify(features, gotResults);
}

// A util function to create UI buttons
function createButtons() {
  //when addclass button is clicked, add sample
  buttonA = select('#addClassDog');
  buttonA.mousePressed(function() {
    addExample('Dog');
  });

  buttonB = select('#addClassTree');
  buttonB.mousePressed(function() {
    addExample('Tree');
  });

  buttonC = select('#addClassCat');
  buttonC.mousePressed(function() {
    addExample('Cat');
  });

  buttonD = select('#addClassCobra');
  buttonD.mousePressed(function() {
    addExample('Cobra');
  });

  buttonE = select('#addClassCorpse');
  buttonE.mousePressed(function() {
    addExample('Corpse');
  });

  buttonF = select('#addClassChair');
  buttonF.mousePressed(function() {
    addExample('Chair');
  });

  buttonG = select('#addClassEmpty');
  buttonG.mousePressed(function() {
    addExample('Empty');
  });

  // Reset buttons
  resetBtnA = select('#resetDog');
  resetBtnA.mousePressed(function() {
    clearLabel('Dog');
  });

  resetBtnB = select('#resetTree');
  resetBtnB.mousePressed(function() {
    clearLabel('Tree');
  });

  resetBtnC = select('#resetCat');
  resetBtnC.mousePressed(function() {
    clearLabel('Cat');
  });

  resetBtnD = select('#resetCobra');
  resetBtnD.mousePressed(function() {
    clearLabel('Cobra');
  });

  resetBtnE = select('#resetCorpse');
  resetBtnE.mousePressed(function() {
    clearLabel('Corpse');
  });

  resetBtnF = select('#resetChair');
  resetBtnF.mousePressed(function() {
    clearLabel('Chair');
  });

  resetBtnG = select('#resetEmpty');
  resetBtnG.mousePressed(function() {
    clearLabel('Empty');
  });

  // Predict button
  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(classify);

  // Clear all classes button
  buttonClearAll = select('#clearAll');
  buttonClearAll.mousePressed(clearAllLabels);

  // Load saved classifier dataset
  buttonSetData = select('#load');
  buttonSetData.mousePressed(loadMyKNN);

  // Get classifier dataset
  buttonGetData = select('#save');
  buttonGetData.mousePressed(saveMyKNN);
}

//show results of bodypix
function gotResultsBody(error, bodyResult) {
  if (error) {
    console.error(error);
    return;
  }
  segmentation = bodyResult;
  // bodypix.segment(gotResultsBody, options); // 0, 1
  bodypix.segmentWithParts(gotResultsBody, options);
}

// Show the results of the KNNclassifier
function gotResults(err, result) {
  // Display any error
  if (err) {
    console.error(err);
  }

  if (result.confidencesByLabel) {
    const confidences = result.confidencesByLabel;
    // result.label is the label that has the highest confidence
    if (result.label) {
      select('#result').html(result.label);
      select('#confidence').html(`${nf(confidences[result.label] * 100, 1, 2)} %`);
    }

    select('#confidenceDog').html(`${confidences['Dog'] ? nf(confidences['Dog'] * 100, 1, 2) : 0} %`);
    select('#confidenceTree').html(`${confidences['Tree'] ? nf(confidences['Tree'] * 100, 1, 2) : 0} %`);
    select('#confidenceCat').html(`${confidences['Cat'] ? nf(confidences['Cat'] * 100, 1, 2) : 0} %`);
    select('#confidenceCobra').html(`${confidences['Cobra'] ? nf(confidences['Cobra'] * 100, 1, 2) : 0} %`);
    select('#confidenceCorpse').html(`${confidences['Corpse'] ? nf(confidences['Corpse'] * 100, 1, 2) : 0} %`);
    select('#confidenceChair').html(`${confidences['Chair'] ? nf(confidences['Chair'] * 100, 1, 2) : 0} %`);
    select('#confidenceEmpty').html(`${confidences['Empty'] ? nf(confidences['Empty'] * 100, 1, 2) : 0} %`);

    // CONTROLS DISPLAYING IMAGE AND OPACITY
    let tree = document.getElementById("realtree");
    let cobra = document.getElementById("realcobra");
    let corpse = document.getElementById("realcorpse");
    let dog = document.getElementById("realdog");
    let chair = document.getElementById("realchair");
    let cat = document.getElementById("realcat");

    // tree
    if (confidences['Tree'] == 1){
      img1Alpha = lerp(img1Alpha, 1.0, TRANSITION_SPEED);
    } else {
      img1Alpha = lerp(img1Alpha, 0.0, TRANSITION_SPEED);
    }
    img1Alpha = Number( nf(img1Alpha, 1, 3) ); // 0.000 // nf(value, 3, 2) 000.00
    tree.style.opacity = img1Alpha;

    // cobra
    if (confidences['Cobra'] == 1){
      img2Alpha = lerp(img2Alpha, 1.0, TRANSITION_SPEED);
    } else {
      img2Alpha = lerp(img2Alpha, 0.0, TRANSITION_SPEED);
    }
    img2Alpha = Number( nf(img2Alpha, 1, 3) );
    cobra.style.opacity = img2Alpha;

    // corpse
    if (confidences['Corpse'] == 1){
      img3Alpha = lerp(img3Alpha, 1.0, TRANSITION_SPEED);
    } else {
      img3Alpha = lerp(img3Alpha, 0.0, TRANSITION_SPEED);
    }
    img3Alpha = Number( nf(img3Alpha, 1, 3) );
    corpse.style.opacity = img3Alpha;

    // dog
    if (confidences['Dog'] == 1){
      //dog.style.display = "block";
      img4Alpha = lerp(img4Alpha, 1.0, TRANSITION_SPEED);
    } else {
      //dog.style.display = "none";
      img4Alpha = lerp(img4Alpha, 0.0, TRANSITION_SPEED);
    }
    img4Alpha = Number( nf(img4Alpha, 1, 3) );
    dog.style.opacity = img4Alpha;

    // chair
    if (confidences['Chair'] == 1){
      img5Alpha = lerp(img5Alpha, 1.0, TRANSITION_SPEED);
    } else {
      img5Alpha = lerp(img5Alpha, 0.0, TRANSITION_SPEED);
    }
    img5Alpha = Number( nf(img5Alpha, 1, 3) );
    chair.style.opacity = img5Alpha;

    // cat
    if (confidences['Cat'] == 1){
      img6Alpha = lerp(img6Alpha, 1.0, TRANSITION_SPEED);
    } else {
      img6Alpha = lerp(img6Alpha, 0.0, TRANSITION_SPEED);
    }
    img6Alpha = Number( nf(img6Alpha, 1, 3) );
    cat.style.opacity = img6Alpha;

    // CHANGES BACKGROUND IF BG & IMAGE MATCHEs
    if (imageIndex == 0 && confidences['Cat'] == 1) {
      if ( interval > INTERVAL_MAX ) {
        imageIndex = floor( random(bgImage.length) );
        imagePrev = imageCurr.get();
        imageAlpha = 0;
        interval = 0;
        barWidth = 1600;
      } else {
        interval++;
        barWidth = map(interval, 0, 20, width, 0);
      }
    }
    else if (imageIndex == 1 && confidences['Dog'] == 1) {
      if ( interval > INTERVAL_MAX ) {
        imageIndex = floor( random(bgImage.length) );
        imagePrev = imageCurr.get();
        imageAlpha = 0;
        interval = 0;
        barWidth = 1600;
      } else {
        interval++;
        barWidth = map(interval, 0, 20, width, 0);
      }
    }
    else if (imageIndex == 2 && confidences['Chair'] == 1) {
      if ( interval > INTERVAL_MAX ) {
        imageIndex = floor( random(bgImage.length) );
        imagePrev = imageCurr.get();
        imageAlpha = 0;
        interval = 0;
        barWidth = 1600;
      } else {
        interval++;
        barWidth = map(interval, 0, 20, width, 0);
      }
    }
    else if (imageIndex == 3 && confidences['Corpse'] == 1) {
      if ( interval > INTERVAL_MAX ) {
        imageIndex = floor( random(bgImage.length) );
        imagePrev = imageCurr.get();
        imageAlpha = 0;
        interval = 0;
        barWidth = 1600;
      } else {
        interval++;
        barWidth = map(interval, 0, 20, width, 0);
      }
    }
    else if (imageIndex == 4 && confidences['Cobra'] == 1) {
      if ( interval > INTERVAL_MAX ) {
        imageIndex = floor( random(bgImage.length) );
        imagePrev = imageCurr.get();
        imageAlpha = 0;
        interval = 0;
        barWidth = 1600;
      } else {
        interval++;
        barWidth = map(interval, 0, 20, width, 0);
      }
    }
    else if (imageIndex == 5 && confidences['Tree'] == 1) {
      if ( interval > INTERVAL_MAX ) {
        imageIndex = floor( random(bgImage.length) );
        imagePrev = imageCurr.get();
        imageAlpha = 0;
        barWidth = 1600;
      } else {
        interval++;
        barWidth = map(interval, 0, 20, width, 0);
      }
    }
  }
  classify();
}

// Update the example count for each label
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();

  select('#exampleDog').html(counts['Dog'] || 0);
  select('#exampleTree').html(counts['Tree'] || 0);
  select('#exampleCat').html(counts['Cat'] || 0);
  select('#exampleCobra').html(counts['Cobra'] || 0);
  select('#exampleCorpse').html(counts['Corpse'] || 0);
  select('#exampleChair').html(counts['Chair'] || 0);
  select('#exampleEmpty').html(counts['Empty'] || 0);
}

// Clear the examples in one label
function clearLabel(label) {
  knnClassifier.clearLabel(label);
  updateCounts();
}

// Clear all the examples in all labels
function clearAllLabels() {
  knnClassifier.clearAllLabels();
  updateCounts();
}

// Save dataset as myKNNDataset.json
function saveMyKNN() {
  knnClassifier.save('myKNNDataset');
}

// Load dataset to the classifier
function loadMyKNN() {
  // knnClassifier.load('./myKNNDataset 824.json', updateCounts);
  knnClassifier.load('./myKNNDataset ima show.json', updateCounts);
}
