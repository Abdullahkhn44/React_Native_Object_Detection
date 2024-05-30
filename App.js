import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { RNCamera } from 'react-native-camera'
import LottieView from 'lottie-react-native';

const classLabels = [
  "Head",
  "Face",
  "Hair",
  "Ear",
  "Eye",
  "Nose",
  "Mouth",
  "Body",
  "Hand",
  "Arm",
  "Leg",
  "Foot",
  "Chest",
  "Body",
  "Hand",
  "Arm",
  "Food",
  "Fruits",
  "Mango",
  "Apple",
  "Orange",
  "Banana",
  "Vegetables",
  "Broccoli",
  "Carrot",
  "Meat",
  "Hot Dog",
  "Pizza",
  "Donut",
  "Cake",
  "Clothing",
  "Tie",
  "Suitcase",
  "Handbag",
  "Transportation",
  "Car",
  "Bicycle",
  "Motorcycle",
  "Airplane",
  "Bus",
  "Train",
  "Truck",
  "Boat",
  "Toy",
  "Ball",
  "Kite",
  "Bat",
  "Glove",
  "Skateboard",
  "Surfboard",
  "Tennis",
  "Racket",
  "Furniture",
  "Chair",
  "Couch",
  "Plant",
  "Bed",
  "Dining Table",
  "Bathroom",
  "Microwave",
  "Oven",
  "Toaster",
  "Sink",
  "Refrigerator",
  "Electronics",
  "TV",
  "Laptop",
  "Mouse",
  "Remote",
  "Keyboard",
  "Phone",
  "Book",
  "Pen",
  "Paper",
  "Stapler",
  "Clock",
  "Calendar",
  "Tools",
  "Scissors",
  "Other",
  "Teddy Bear",
  "Toothbrush",
  "bottle",


];


const App = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [img, setImg] = useState();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState();
  const [inferenceResult, setInferenceResult] = useState('');



  const cameraRef = useRef(null);







  const requestCameraPermission = async () => {
    const cameraPermission = await RNCamera.requestCameraPermission();
    setHasPermission(cameraPermission.status === 'granted');
    console.log(setHasPermission)
    console.log(hasPermission)
  };

  const openCamera = () => {
    setOpen(!false)
    setImg('')
    setInferenceResult('')

  }

  const closeCamera = () => {
    setOpen(false)

  }


  const handleText = async () => {
    try {
      const upload = await fetch('http://192.168.100.64:5000/changeText',
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        })

      const result = await upload.json();

      console.log(result.message, 'good');


    }
    catch (error) {
      console.error('error Posting data', error)

    }


  }


  const takePicture = async () => {
    if (cameraRef) {
      const options = { quality: 1 };
      const data = await cameraRef.current.takePictureAsync(options);
      console.log('Photo taken:', data.uri);
      setImg(data.uri);
      setOpen(false)

      const formData = new FormData();

      formData.append('image', {
        uri: Platform.OS === 'android' ? data.uri : data.uri.replace('file://', ''),
        type: 'image/jpeg', // Set the appropriate image type
        name: 'photo.jpg', // You can set any filename here
      });
      console.log(formData)
      await sendImageToServer(formData);
    }

  };

  const sendImageToServer = async (formData) => {
    try {
      const response = await fetch('http://192.168.100.64:5000/upload_image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      displayInferenceResult(result.inference);
    } catch (error) {
      console.error('Error sending image:', error);
    }
  };
  const displayInferenceResult = (inference) => {
    setInferenceResult(inference);
  };

  if (hasPermission === null) {
    requestCameraPermission();
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  const renderBoundingBoxes = () => {
    if (!inferenceResult || !inferenceResult.boxes) return null;

    const { boxes, classes, scores } = inferenceResult;

    const topN = 3; // Number of top detections to display

    // Get the top N scores and their indices
    const sortedIndices = scores[0]
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map(item => item.index);

      const topScores = sortedIndices.map(index => scores[0][index].toFixed(2));
    return sortedIndices.map((index) => {
      const box = boxes[0][index];
      const [ymin, xmin, ymax, xmax] = box;
      const classIndex = classes[0][index];
      const score = scores[0][index].toFixed(2);
      const classLabel = classLabels[classIndex] || 'Unknown';
    
      const boxStyle = {
        position: 'absolute',
        top: ymin * 300,
        left: xmin * 300,
        width: (xmax - xmin) * 300,
        height: (ymax - ymin) * 300,
        borderWidth: 2,
        borderColor: 'green',
      };

      return (
        <View key={index} style={boxStyle}>
          <Text style={{ color: 'green', fontSize: 12, fontWeight: 'bold' }}>
            {` Score: ${score}`}
          </Text>
        </View>
      );
    });
  };


  return (
    <View style={styles.MainStyle}>

      <View style={open ? styles.inactive : styles.bannerStyle}>
        <Image source={require('./assets/images/one.png')} style={img ? styles.inactive : styles.imageStyle} />
        <Text style={inferenceResult ? styles.inactive : styles.heading}> AI</Text>
        <Text style={inferenceResult ? styles.inactive : styles.heading}>Object Detection</Text>

      </View>


      {open && (

        <View style={styles.CameraView}>

          <RNCamera
            ref={cameraRef}
            style={styles.camera}
            androidCameraPermissionOptions={{
              title: 'Camera Permission',
              message: 'This app needs access to the camera.',
              buttonPositive: 'Grant Permission',
              buttonNegative: 'Cancel',
            }}
          >
            <View style={styles.CameraButtonView} >
              <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>

                <Image source={require('./assets/images/cap.png')} style={{ width: 85, height: 85 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={closeCamera} style={styles.closeButton}>

                <Image source={require('./assets/images/back.png')} style={{ width: 40, height: 40 }} />
              </TouchableOpacity>
            </View>
          </RNCamera>
        </View>
      )}

      {img && (
        <View style={styles.imageView} >
          <View style={{ position: 'relative', width: 300, height: 300, bottom: 100 }}>
            <Image source={{ uri: img }} style={{ width: 300, height: 300 }} />
            {renderBoundingBoxes()}
          </View>
        </View>
      )}


      <View style={open ? styles.inactive : styles.ButtonView}>

        <TouchableOpacity style={styles.openButton} onPress={openCamera}>
          <Text style={{ fontSize: 19, color: "white", textAlign: 'center', fontWeight: '500' }}>Start Detecting</Text>
        </TouchableOpacity>

      </View>

      {inferenceResult && (
        <View style={styles.result}>
          <Text>Inference Result:</Text>
          <Text style={{ fontSize: 17, textAlign: 'center', fontWeight: '500' }}>Number of Detections: 3</Text>
          <Text style={{ fontSize: 15, textAlign: 'center', fontWeight: '500' }}>Highest Score:  {JSON.stringify(inferenceResult.scores[0][0])} </Text>
        </View>
      )}



    </View>
  )
}

export default App

const styles = StyleSheet.create({
  MainStyle: {
    flex: 1,
    backgroundColor: 'rgb(23, 28, 58)',

  },

  CameraView: {
    flex: 1,


  },
  camera: {
    flex: 1,

  },
  captureBtn: {
    justifyContent: 'center',
    alignItems: 'center', left: 60,

  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    left: 50,
  },
  ButtonView: {
    flex: 1,
    backgroundColor: 'white',
    borderTopRightRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',


  },
  inactive: {
    display: 'none'
  },
  openButton: {
    width: 175,
    height: 40,
    backgroundColor: 'rgb(23, 28, 58)',
    borderRadius: 10,
    justifyContent: 'center',
    top: 50,
  },
  CameraButtonView: {
    flexDirection: 'row-reverse',
    top: 525,
    justifyContent: 'space-evenly'

  },
  imageView: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    top: 20,
  },
  imageStyle: {
    width: 330, height: 220,
  },
  heading: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '600',
    color: 'white',
  },
  bannerStyle: {
    flex: 1,
    backgroundColor: 'rgb(23, 28, 58)',
    justifyContent: 'center',
    alignItems: 'center',

  },
  result: {
    flex: 1,
    backgroundColor: 'white', justifyContent: 'center',
    alignItems: 'center',


  },
})