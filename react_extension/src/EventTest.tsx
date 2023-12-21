import React, { useCallback, useEffect } from "react";
import ScriptTag from "react-script-tag";

interface EventTestProps {
}

const EventTest: React.FC<EventTestProps> = () => {

    // setTimeout(()=>{
    //     console.log("added rec")
    //     // const es = new ReconnectingEventSource('/events/');

    //     // es.addEventListener('message', function (e) {
    //     //     console.log(e.data);
    //     // }, false);

    //     const eventSource = new EventSource('http://127.0.0.1/events/1234');
    //     eventSource.onmessage = (event) => {
    //         console.log(event);
    //     };
    
    //     // es.addEventListener('stream-reset', function (e) {
    //     //     // ... client fell behind, reinitialize ...
    //     // }, false);
    // }, 200)
    useEffect(()=>{
        const chatSocket = new WebSocket('wss://rs-kubuntu.local/ws/test/');
      
        chatSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            console.log(data);
        };
        
        chatSocket.onclose = function(e) {
          console.error('The socket closed unexpectedly');
        };
  
        document.querySelector('#chat-message-submit').onclick = function(e) {
            const messageInputDom = document.querySelector('#chat-message-input');
            const message = messageInputDom.value;
        
            chatSocket.send(JSON.stringify({
            'message': message,
            'username': "jochen",
            'room': "test"
            }));
        
            messageInputDom.value = '';
        };
    }, [])
    

    return (
    <>
        <section className="section">
      <div className="container">
        <div className="columns is-multiline">
            <div className="column is-6 is-offset-3">
              <section className="hero is-primary">
                <div className="hero-body">
                  <p className="title">Chatty</p>
                  <p className="subtitle">A simple chat built with Django, Channels and Redis</p>
                </div>
              </section>
            </div>

            <div className="column is-6 is-offset-3">
              <div className="box">     
                <div id="chat-messages">
                </div>
              </div>

              <div className="field">
                <div className="control">
                  <input className="input" type="text" placeholder="Message" id="chat-message-input"/>
                </div>
              </div>

              <div className="field">
                <div className="control">
                  <a className="button is-info" id="chat-message-submit">Submit</a>
                </div>
              </div>

              <small className="has-text-grey-light">Your username: Jochen</small>
            </div>
          </div>
       </div>
    </section>
    </>
    )
}

export default EventTest;