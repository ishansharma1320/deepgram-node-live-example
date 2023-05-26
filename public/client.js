navigator.mediaDevices
.getUserMedia({ audio: true })
.then(stream => {

  const mediaRecorder = new MediaRecorder(stream);
  const socket = new WebSocket('wss://api.deepgram.com/v1/listen?model=nova&punctuate=true', ['token', 'Your API Key']);

  socket.onopen = () => {
    console.log({ event: 'onopen' })
    document.getElementById('connection-status').innerHTML = 'Connection Status: Connected';
    mediaRecorder.addEventListener('dataavailable', event => {
      if (event.data.size > 0 && socket.readyState == 1) {
        socket.send(event.data)
      }
      else if (socket.readyState == 1) {
        // Close the socket
        socket.send(Uint8Array(0))
      }
    })
    // here's the second start that is necessary
    mediaRecorder.start(250);
  }

  socket.onmessage = (message) => {
    console.log({ event: 'onmessage', message })
    const received = JSON.parse(message.data)
    const transcript = received.channel.alternatives[0].transcript
    if (transcript && received.is_final) {
      document.getElementById("message-body").innerHTML += `<div class="message-custom-utterance">
      <p> ${transcript} </p>
      </div>`;
    }
  }

  socket.onclose = function (event) {
    console.log('WebSocket connection closed: ', event);
  };

  socket.onerror = (error) => {
    console.log({ event: 'onerror', error })
  }

});