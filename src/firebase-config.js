// Firebase configuration for RNDM Development
export const firebaseConfig = {
  apiKey: "AIzaSyA7Y2ppKIFumXd5aa7Lwj-263p-p1jiK7M",
  authDomain: "rndmform-56a7b.firebaseapp.com",
  databaseURL: "https://rndmform-56a7b-default-rtdb.firebaseio.com",
  projectId: "rndmform-56a7b",
  storageBucket: "rndmform-56a7b.appspot.com",
  messagingSenderId: "592358469137",
  appId: "1:592358469137:web:b2d18e70a70c4c42958bb0",
  measurementId: "G-FB38H9S3QC"
};

// reCAPTCHA configuration
export const recaptchaConfig = {
  // Get your site key from https://www.google.com/recaptcha/admin/create
  siteKey: "6LeNB4krAAAAAIOFTqggAVkez-r-QvyNCvoZh9mU", // Replace with your actual reCAPTCHA site key
  // Minimum score threshold (0.0 to 1.0, where 1.0 = very likely human)
  minimumScore: 0.5,
  // Enable/disable reCAPTCHA
  enabled: true
};