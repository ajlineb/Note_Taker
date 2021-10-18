const express = require('express');
const { clog } = require('./middleware/clog');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const data = require("./db/db.json");
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(clog);




//for reaching the notes page
app.get('/notes', (req, res) => {
    // Send a message to the client
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

//get request for api
app.get('/api/notes', (req, res) => {
    //for the database
    console.log("request recieved, type:", req.method);
    //info from the user
    //console.log("req headers:", req.rawHeaders);
    //data in the api database
    res.json(data);
})

app.get('/api/notes/:id', (req, res) => {
  if (req.params.id) {
    console.info(`${req.method} request received to get a single a review`);
    const noteID = req.params.id;
    for (let i = 0; i < data.length; i++) {
      const currentNote = data[i];
      if (currentNote.noteId === noteID) {
        res.status(200).json(currentNote);
        console.log(currentNote);
        return;
      }
    }
    res.status(404).send('Note not found');
  } else {
    res.status(400).send('Note ID not provided');
  }
});

//post request for api
app.post('/api/notes', (req, res) => {
    console.log('Request Body:', req.body);

    //res.json(`${req.method} request recieved, new note is: ${req.body.title}`);

    // Destructuring items in req.body
    const { title, text } = req.body;

    // If all the required properties are present
    if (title && text) {
        // Variable for the object we will save
        const newNote = {
        title,
        text,
        noteId: uuidv4(),
        };

        // Convert the data to a string so we can save it
        //const noteString = JSON.stringify(newNote);

        // Write the string to a file
        fs.readFile(`./db/db.json`, 'utf8', (err, data) => {
            if(err) {
              console.log(err);
            } else {

              const parsedNotes = JSON.parse(data); //array of existing notes

              console.log(parsedNotes);

              parsedNotes.push(newNote);    //adds new note to the parsedNotes array
          // Write the string to a file

            fs.writeFile(`./db/db.json`, JSON.stringify(parsedNotes, null, 2), (err) =>
            err
              ? console.error(err)
              : console.log(
                  `Note for "${newNote.title}" has been written to JSON file with id "${newNote.noteId}" !`
                )
          );
            };
          });

        const response = {
        status: 'success',
        body: newNote,
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting Note!');
    }
});

// app.delete('/api/notes/:id', (req, res) => {
//   if (req.params.id) {
//     const noteID = req.params.id;
//     console.log(noteID);
//     for (let i = 0; i < data.length; i++) {
//       const currentNote = data[i];
//       if (currentNote.noteId === noteID) {
        
//       }
//     }
//     res.status(404).send('Note not found');
//   } else {
//     res.status(400).send('Note ID not provided');
//   }
// })

//homepage/wildcard
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);


app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);