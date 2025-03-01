window.addEventListener('DOMContentLoaded', () => {


const toggle = document.querySelector(".menu-toggle");
const topBar = toggle.querySelector(".top");
const bottom = toggle.querySelector(".bottom");
const nav = document.querySelector(".links");

const links = document.querySelectorAll(
  "  .header-container .header-menu .links li a "
);



console.log(links);
toggle.addEventListener("click", () => {
  nav.classList.toggle("active-nav");
  topBar.classList.toggle("transform-top");
  bottom.classList.toggle("transform-bottom");
});

links.forEach((link) => {
  console.log(link);
  link.addEventListener("click", () => {
    nav.classList.remove("active-nav");
    topBar.classList.remove("transform-top");
    bottom.classList.remove("transform-bottom");
  });
});
});

function validate() {
  const fileInput = document.getElementById('imageInput');
  const file = fileInput.files[0];

  if (file) {
    const fileSize = file.size; // File size in bytes
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes

    if (fileSize > maxSize) {
      alert('Please select a file smaller than 4MB.');
      return;
    }
    document.getElementById('translationResult').textContent = ' '
    detection()
    // CSS styles
const cssStyles = `
.fileoutput {
  margin-top: 20px;
  padding-left: 100px;
  padding-right: 100px;
  
}

#object,
#landmark,
#fulltext,
#translationResult {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

#object {
  background-color: #f0f0f0;
}

#landmark {
  background-color: #e0e0e0;
}


#translationResult {
  background-color: #fcfcfc;
}

#extractedtext br,
#translationResult br {
  display: none;
}
`;

// Create a <style> element
const styleElement = document.createElement('style');
styleElement.type = 'text/css';
styleElement.appendChild(document.createTextNode(cssStyles));

// Append the <style> element to the <head> of the document
document.head.appendChild(styleElement);

  }
}

// object detection
function detection() {
  const fileInput = document.getElementById('imageInput');
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('image', file);

  axios.post('http://localhost:3000/detection', formData)
    .then(response => {
      const annotations = response.data;
      const objectnames = annotations.localizedObjectAnnotations;
      const text_in = annotations.fullTextAnnotation;
      const landmark = annotations.landmarkAnnotations;
      const annotationNames1 = objectnames.map(annotation => annotation.name);
      const annotationNames3 = landmark.map(annotation => annotation.description);
      
      // For objects
      var objectElement = document.getElementById('object');
      objectElement.innerHTML = ""; // Clear the contents
      
      if (annotationNames1.length > 0) {
        objectElement.innerHTML = "<h3>Objects:</h3>"; // Add heading for objects
        annotationNames1.forEach(function(word) {
          var lineBreak = document.createElement('br');
          objectElement.appendChild(document.createTextNode(word));
          objectElement.appendChild(lineBreak);
        });
      } else {
        objectElement.textContent = "No objects found";
      }
      
      // For landmarks
      var landmarkElement = document.getElementById('landmark');
      landmarkElement.innerHTML = ""; // Clear the contents
      if (annotationNames3.length > 0) {
        landmarkElement.innerHTML = "<h3>Landmarks:</h3>"; // Add heading for landmarks
        annotationNames3.forEach(function(word) {
          var lineBreak = document.createElement('br');
          landmarkElement.appendChild(document.createTextNode(word));
          landmarkElement.appendChild(lineBreak);
        });
      } else {
        landmarkElement.textContent = "No landmarks found";
      }
      
      // For extracted text
      var textbox = document.getElementById('extractedtext');
      textbox.innerHTML = ""; // Clear the contents
      if (text_in && text_in.text) {
        var heading = document.createElement('h3');
        heading.textContent = 'Extracted Text:';
        textbox.appendChild(heading);
        textbox.appendChild(document.createTextNode(text_in.text));
      } else {
        textbox.textContent = 'No text found';
      }

      var select = document.getElementById('language');
      var button = document.getElementById('translateButton');

      if (!select) {
        // Create the select element
        select = document.createElement("select");
        select.id = "language";
        select.name = "language";
        document.getElementById("fulltext").appendChild(select);
        getlanguages();
      }

      if (!button) {
        // Create a button element
        button = document.createElement("button");
        button.id = "translateButton";
        button.innerHTML = "Translate";
        button.value = "Translate";
        button.addEventListener("click", function() {
          var objecttext = document.getElementById('extractedtext').textContent;
          translateText(objecttext);
        });
        document.getElementById("fulltext").appendChild(button);
      }
    })
    .catch(error => console.error(error));
}


  function getlanguages(){
      axios.get('http://localhost:3000/supported-languages')
      .then(response => response.data)
      .then(data1 => {
        const languageDropdown = document.getElementById('language');
        data1.languages.forEach(language => {
          const option = document.createElement('option');
          option.value = language.code;
          option.text = language.name;
          languageDropdown.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Error fetching supported languages:', error);
      });
    }
    function translateText(inputtext) {
      const text = inputtext.replace('Extracted Text:', '').trim();
      console.log(inputtext)
      const language = document.getElementById('language').value;
    
      const translationRequest = {
        text: text,
        language: language
      };
    
      axios.post('http://localhost:3000/translate', translationRequest, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          // Extract the translation from the response data
          const translation = response.data.translation;
    
          // Display the translation in the 'translationResult' element
          document.getElementById('translationResult').textContent = 'Translation: ' + translation;
        })
        .catch(error => {
          console.error('Translation Error:', error);
          document.getElementById('translationResult').textContent = 'Translation Error';
        });
    }
    

