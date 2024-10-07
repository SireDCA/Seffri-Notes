//calls in the ipc renderer file
let {ipcRenderer} = require('electron')

let title = document.getElementById('title')
let note = document.getElementById('new-note')
let submit = document.getElementById('submit')
let list = document.getElementById('list')

//variable to store notes after fetching from the backend
let notes = [];

function loadNotes() {
    list.innerHTML = "";
    notes.forEach((note) => {
      list.innerHTML += `
              <div class="note">
                  <h1>${note.title} </h1>
                  <p> ${note.note} </p>
              </div>
          `;
    });
  }

//returns a value from the backend after the window loads
window.onload = async () => {
    notes = await ipcRenderer.invoke("get_data");
    //once notes have been retrieved
    loadNotes();

};

// saves note when submit button is clicked
submit.onclick = () => {
    if(title !== "" && note !=="") {
        //create note object
        let _note = {
            note : note.value,
            title : title.value,
        };

        notes.push(_note);
        loadNotes();

        //triggers an event in the main process
        ipcRenderer.send("save_note", _note);

        //clear fields
        title.value = "";
        note.value = "";
    } else {
        window.alert("please fill out your title and make a note")
    }
};
