 // All the socket code in JS -->>
        
        // Initialize connection to server-->>
        const socket = io.connect('http://localhost:3000');

        // Recieve username from the client-->>
        const username = prompt('Enter your name');
        // Sending username to server-->>
        socket.emit('join',username);

        // Implemmenting client side Logic -->>

          // Get the elements-->>
          const messageInput = document.getElementById("message-input")
          const messageList = document.getElementById("message-list")
          const welcomeElement = document.getElementById("welcome")
          const typingElement = document.getElementById("typing")
          const sendButton = document.getElementById("send-message")
          const usersList = document.getElementById("users");

          // Add event listeners-->>

          // Display previous messages(sent by server) on UI-->>
          socket.on('load-messages',(messages)=>{
                messages.forEach(message => {
                    const messageElement = document.createElement("div");
                    messageElement.classList.add('left');
                    messageElement.classList.add('message');
                    messageElement.innerText = new Date(message.timestamp).toLocaleString() + "-" + message.username + ":" + message.text;
                   // Use insertBefore....to append at first position instead of last,,,
                   // To control the order of apparence of previous messages.
                    messageList.insertBefore(messageElement , messageList.firstChild);
                    
                });
          })

           // Welcome message to User
        socket.on('message', (message) => {
            // messageElement.innerHTML = `<strong>${message.username ? message.username + ":" : ""}</strong> ${message.text}`;
            // const welcomeElement = document.createElement('div');
            welcomeElement.innerHTML = message.text;
        });

        socket.on('typing-message', (message) => {
            // messageElement.innerHTML = `<strong>${message.username ? message.username + ":" : ""}</strong> ${message.text}`;
            // const welcomeElement = document.createElement('div');
            typingElement.innerHTML = message.text;
        });
        socket.on('not-typing-message', (message) => {
            // messageElement.innerHTML = `<strong>${message.username ? message.username + ":" : ""}</strong> ${message.text}`;
            // const welcomeElement = document.createElement('div');
            typingElement.innerHTML = "";
        });
          
          // Sending the message to the server when user clicks send button-->>
          sendButton.addEventListener("click" , ()=>{
                // Read input message from clienty and send it to server
                const message = messageInput.value;
                console.log(message);
                if(message){
                    // Emmitting the 'new-message' event that is to be listen by server to get the message 
                    socket.emit('new-message' , message);

                    // Adding message to List 
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('right');
                    messageElement.classList.add('message');
                    messageElement.innerText = new Date().toLocaleString() + "-" + username + ':' +  message;
                    messageList.appendChild(messageElement);
                    messageInput.value = ""; // Reset value of text box to empty. 
                }
          })

          // All other clients recieving the message broadcasted by server-->>  
          socket.on('broadcast-message',(userMessage)=>{
                // Add the recieved message to the message list 
                let ding = new Audio('./files/ping.mp3');
                ding.play();
                const messageElement = document.createElement('div');
                messageElement.classList.add('left');
                messageElement.classList.add('message');
                messageElement.innerText = new Date(userMessage.timestamp).toLocaleString() + "-" + userMessage.username + ':' + userMessage.text;
                messageList.appendChild(messageElement);
          })

          // User joined message-->>
          socket.on('user-joined',(msg)=>{
                // Add the recieved message to the message list 

                let ding = new Audio('./files/ping.mp3');
                ding.play();
                const messageElement = document.createElement('div');
                messageElement.classList.add('left');
                messageElement.classList.add('join-message');
                messageElement.innerText = msg.text;
                messageList.appendChild(messageElement);

                // const userElement = document.createElement('div');
                // userElement.classList.add('join-message');
                // userElement.innerText = msg.username;
                // usersList.appendChild(userElement);
          })

          socket.on('user-left',(msg)=>{
                // Add the recieved message to the message list 
                let ding = new Audio('./files/ping.mp3');
                ding.play();
                const messageElement = document.createElement('div');
                messageElement.classList.add('left');
                messageElement.classList.add('join-message');
                messageElement.innerText = msg.text;
                messageList.appendChild(messageElement);

          })

          socket.on('add-users',(users)=>{
            // Add the user to list 
            let count=0;
            usersList.innerHTML="";
            users.forEach((user)=>{
                const userElement = document.createElement('div');
                userElement.classList.add('message-notify');
                userElement.innerText = user.username;
                usersList.appendChild(userElement);
                count++;
            })
            const countElement = document.getElementById('cnt');
            countElement.innerText = count;
         })

         function typingFunc(){
            socket.emit('typing' , username);
         }
         function typingFunc2(){
            socket.emit('not-typing' , username);
         }


