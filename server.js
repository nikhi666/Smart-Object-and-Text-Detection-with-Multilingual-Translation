const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Imports the Google Cloud client libraries
const vision = require('@google-cloud/vision');
const { Translate } = require('@google-cloud/translate').v2;

// Creates a vision client
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: 'apikey.json',
});

// Creates a translate client
const translateClient = new Translate({
  keyFilename: 'apikey.json',
});

const features = [
  { type: 'LABEL_DETECTION', maxResults: 10 },
  { type: 'TEXT_DETECTION' },
  { type: 'LANDMARK_DETECTION' },
  { type: 'OBJECT_LOCALIZATION' },
  // Add more feature types as needed
];

// image object detection
app.post('/detection', upload.single('image'), (req, res) => {
  const imageBuffer = req.file.buffer;

  const request = {
    image: { content: imageBuffer },
    features: features,
  };

  // Perform image annotation
  visionClient
    .annotateImage(request)
    .then((results) => {
      const annotations = results[0];
      res.json(annotations);
    })
    .catch((err) => {
      console.error('Error:', err);
      res.status(500).send('Image Annotation Error');
    });
});

// text translation
app.post('/translate', (req, res) => {
  const originalText = req.body.text;
  const targetLanguage = req.body.language; 

  translateClient
    .translate(originalText, targetLanguage)
    .then((translationResponse) => {
      const translation = translationResponse[0];
      res.json({ translation: translation });
    })
    .catch((err) => {
      console.error('Translation Error:', err);
      res.status(500).send('Translation Error');
    });
});
// supported languages
app.get('/supported-languages', (req, res) => {
  translateClient.getLanguages()
    .then(([languages]) => {
      const supportedLanguages = languages.map(language => ({
        code: language.code,
        name: language.name
      }));
      res.json({ languages: supportedLanguages });
    })
    .catch(err => {
      console.error('Error fetching supported languages:', err);
      res.status(500).send('Error fetching supported languages');
    });
});

app.listen(3000, () => {
  console.log('Server is running at port 3000');
});
