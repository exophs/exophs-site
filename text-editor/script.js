// Cache DOM elements for performance
const editor = document.getElementById('editor');
const charCountDisplay = document.getElementById('charCount');
const wordCountDisplay = document.getElementById('wordCount');
const filenameInput = document.getElementById('filename');
const uploadedFileDisplay = document.getElementById('uploadedFileDisplay');
const searchTextInput = document.getElementById('searchText');
const replaceTextInput = document.getElementById('replaceText');
const undoButton = document.getElementById('undoButton');

// Listen for input events on the editor to save content and update counts
editor.addEventListener('input', () => {
    localStorage.setItem('editorContent', editor.innerHTML);
    updateCounts();
});

// Load saved content and theme when the window is loaded
window.onload = function() {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
    }
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.toggle('light-mode', savedTheme === 'light');
    }
    updateCounts();
};

// Automatically save editor content to localStorage every 30 seconds
setInterval(() => {
    localStorage.setItem('editorContent', editor.innerHTML);
}, 30000);

// Detect file type based on content
function detectFileType(content) {
    if (/<body.*?>/.test(content)) {
        return 'html';
    } else if (/function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=/.test(content)) {
        return 'js';
    } else if (/body\s*{/i.test(content) || /^\s*([a-zA-Z-]+)\s*{/i.test(content)) {
        return 'css';
    }
    return 'txt';
}

// Download the editor content as a file
function downloadFile() {
    const text = editor.innerHTML; // Get the content from the editor
    const fileType = detectFileType(text); // Detect the file type based on content
    const filename = filenameInput.value.trim() || 'your_file'; // Get filename input, default to 'your_file'

    // Determine the correct MIME type and file extension
    let mimeType = 'text/plain'; // Default MIME type
    let extension = 'txt'; // Default extension
    if (fileType === 'html') {
        mimeType = 'text/html'; // Set MIME type for HTML
        extension = 'html'; // Set extension to html
    } else if (fileType === 'js') {
        mimeType = 'text/javascript'; // Set MIME type for JavaScript
        extension = 'js'; // Set extension to js
    } else if (fileType === 'css') {
        mimeType = 'text/css'; // Set MIME type for CSS
        extension = 'css'; // Set extension to css
    }

    // Create the Blob with the correct MIME type
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob); // Create a URL for the Blob

    const a = document.createElement('a'); // Create an anchor element
    a.href = url; // Set the URL as the href
    a.download = `${filename}.${extension}`; // Set the download attribute

    document.body.appendChild(a); // Append the anchor to the body
    a.click(); // Simulate a click to trigger the download
    document.body.removeChild(a); // Remove the anchor from the DOM
    URL.revokeObjectURL(url); // Release the Blob URL
}

// Handle file upload
function uploadFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        editor.innerHTML = e.target.result;
        displayUploadedFile(file.name, e.target.result);
        updateCounts();
    };
    reader.readAsText(file);
    filenameInput.value = file.name;
}

// Display uploaded file information
function displayUploadedFile(fileName, fileContent) {
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent);
    link.target = '_blank';
    link.textContent = `Uploaded File: ${fileName}`;
    
    uploadedFileDisplay.innerHTML = ''; // Clear previous content
    uploadedFileDisplay.appendChild(link);
}

// Clear the editor and reset state
function clearEditor() {
    editor.innerHTML = '';
    filenameInput.value = '';
    uploadedFileDisplay.innerHTML = '';
    localStorage.removeItem('editorContent');
    updateCounts();
}

// Update character and word count display
function updateCounts() {
    const text = editor.innerText;
    const charCount = text.length;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    charCountDisplay.textContent = `Character Count: ${charCount}`;
    wordCountDisplay.textContent = `Word Count: ${wordCount}`;
}

// Format selected text in the editor
function formatText(command) {
    document.execCommand(command, false, null);
}

// Clear formatting of selected text
function clearFormatting() {
    document.execCommand('removeFormat', false, null);
}

// Toggle between dark and light mode
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

// Strobe effect for dark/light mode toggling
let strobeInterval;

function toggleStrobeEffect() {
    if (strobeInterval) {
        clearInterval(strobeInterval);
        strobeInterval = null;
    } else {
        strobeInterval = setInterval(() => {
            toggleTheme();
        }, 200); // Speed increased to 200ms
    }
}

// Rainbow background effect
function applyRainbowEffect() {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
    let index = 0;

    const changeColor = () => {
        document.body.style.backgroundColor = colors[index];
        index = (index + 1) % colors.length;
    };

    // Change color every 300 milliseconds
    setInterval(changeColor, 300);
}

// Add an event listener to detect the Enter key
editor.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const text = editor.innerText.trim();
        if (text === "strobe") {
            alert("Warning: 'strobe' detected! Toggling dark/light mode.");
            toggleStrobeEffect();
            event.preventDefault(); // Prevent default Enter key behavior
        } else if (text === "rainbow") {
            applyRainbowEffect();
            event.preventDefault(); // Prevent default Enter key behavior
        }
    }
});

// Execute search and replace functionality
function executeSearchAndReplace() {
    const searchText = searchTextInput.value.trim();
    const replaceText = replaceTextInput.value;

    if (!searchText) {
        alert('Please enter text to search for.');
        return;
    }

    undoStack.push(editor.innerHTML);
    searchAndReplace(searchText, replaceText);
    searchTextInput.value = '';
    replaceTextInput.value = '';
    updateCounts();
}

// Perform the actual search and replace operation
function searchAndReplace(searchText, replaceText) {
    const regex = new RegExp(searchText, 'gi');
    editor.innerHTML = editor.innerHTML.replace(regex, replaceText);
}

// Undo the last search and replace action
let undoStack = [];
function undoSearchAndReplace() {
    if (undoStack.length > 0) {
        editor.innerHTML = undoStack.pop();
        updateCounts();
    }
}

// Add event listener to the undo button
undoButton.addEventListener('click', undoSearchAndReplace);
