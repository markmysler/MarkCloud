const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        let fileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
        cb(null, fileName);
    }
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/files', (req, res) => {
    fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error reading files' });
        } else {
            res.json(files);
        }
    });
});


app.post('/upload', upload.single('image'), (req, res) => {
    res.redirect('/');
});

app.get('/:file(*)', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.file);
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.write('File not found');
            res.end();
        } else {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.write(content);
            res.end();
        }
    });
});

app.delete('/delete', (req, res) => {
    let data = "";
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        data = JSON.parse(data);
        fs.unlink(path.join(__dirname, '/uploads/', data.path), (err) => {
            if (err) {
                console.log(err)
                res.status(500).json({ error: 'Error deleting image' });
            } else {
                res.status(200).json({ message: 'Image deleted' });
            }
        });
    });
});


app.listen(3000, () => {
    console.log('Server listening on port 3000');
});