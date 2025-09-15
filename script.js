document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const micButton = document.getElementById('micButton');
    const status = document.getElementById('status');
    const notesDisplay = document.getElementById('notesDisplay');
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    let recognition;
    let isRecording = false;
    let finalTranscript = '';
    
    // Check if browser supports the Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            isRecording = true;
            status.textContent = 'Listening... Speak now!';
            micButton.classList.add('recording');
            startBtn.disabled = true;
            stopBtn.disabled = false;
        };
        
        recognition.onresult = function(event) {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            notesDisplay.innerHTML = finalTranscript + '<i>' + interimTranscript + '</i>';
            
            // Highlight new text
            const textElements = notesDisplay.querySelectorAll('*');
            if (textElements.length > 0) {
                textElements[textElements.length - 1].classList.add('new-text');
            }
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            status.textContent = 'Error: ' + event.error;
            stopRecording();
        };
        
        recognition.onend = function() {
            stopRecording();
        };
        
    } else {
        // Browser doesn't support speech recognition
        status.textContent = 'Your browser does not support speech recognition. Try Chrome or Edge.';
        startBtn.disabled = true;
        micButton.disabled = true;
    }
    
    function startRecording() {
        if (recognition) {
            finalTranscript = '';
            recognition.start();
        }
    }
    
    function stopRecording() {
        if (recognition && isRecording) {
            recognition.stop();
            isRecording = false;
            status.textContent = 'Recording stopped';
            micButton.classList.remove('recording');
            startBtn.disabled = false;
            stopBtn.disabled = true;
            
            // Format the final transcript
            if (finalTranscript !== '') {
                notesDisplay.textContent = finalTranscript;
            }
        }
    }
    
    // Event listeners for buttons
    startBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
    micButton.addEventListener('click', function() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });
    
    saveBtn.addEventListener('click', function() {
        if (finalTranscript !== '') {
            const blob = new Blob([finalTranscript], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'notes.txt';
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
            status.textContent = 'Notes downloaded successfully!';
        } else {
            status.textContent = 'No notes to save. Record something first!';
        }
    });
    
    clearBtn.addEventListener('click', function() {
        finalTranscript = '';
        notesDisplay.textContent = 'Your transcribed notes will appear here...';
        status.textContent = 'Notes cleared. Press the microphone to start recording';
    });
});
