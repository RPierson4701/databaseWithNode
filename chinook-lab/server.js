const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./Chinook_Sqlite.sqlite");
const app = express();
app.use(express.json());
// Test route: list all tables in the database
app.get('/tables', (req, res) => {
const stmt = db.prepare(
"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
);
res.json(stmt.all());
});

//Artist Return
app.get('/artists', (req, res) => {
const stmt = db.prepare(
"SELECT name FROM Artist"
);
res.json(stmt.all());
});

//Long Track Return
app.get('/tracks/long', (req, res) => {
const stmt = db.prepare(
'SELECT Track.name AS "Track Name", Album.Title AS "Album Name", Track.Milliseconds/1000 AS "Track Length In Seconds" FROM Track JOIN Album on Album.AlbumId = Track.AlbumId WHERE Milliseconds > 300000'
);
res.json(stmt.all());
});

//Artists albums
app.get('/artists/:id/albums', (req, res) => {
const stmt = db.prepare(
"SELECT Title FROM Album Where ArtistId=?"
);
res.json(stmt.all(req.params.id));
});

//Genre Stats
app.get('/genres/:id/stats', (req, res) => {
const stmt = db.prepare(
"SELECT Genre.Name AS 'Genre Name', COUNT(Track.TrackId) AS 'Number of Tracks', Avg(Track.Milliseconds)/1000 AS 'Average Track Length (Sec)' FROM Track JOIN Genre ON Genre.GenreId = Track.GenreId Where Genre.GenreId=?"
);
res.json(stmt.all(req.params.id));
});

app.post('/playlists', (req,res) => {
if(!req.body.name){
return res.status(400).json({error: "name is required"});
}
const stmt = db.prepare("INSERT INTO Playlist (Name) VALUES(?)");
const result = stmt.run(req.body.name);
res.status(201).json({
    id: Number(result.lastInsertRowid),
    name: req.body.name,
});
});

//Delete a playlist by ID
app.delete('/playlists/:id', (req, res) => {
    const stmt = db.prepare("DELETE FROM Playlist WHERE PlaylistId = ?");
    const result = stmt.run(req.params.id);

    if (result.changes === 0){
        return res.status(404).json({error: "Playlist not found"});
    }
    
    res.json({message: "Playlist deleted"});
    
})

//Top 5 Customers
app.get('/invoices/top-customers', (req, res) => {
const stmt = db.prepare(
"SELECT Customer.CustomerId, Customer.FirstName, Customer.LastName, Sum(Invoice.Total) FROM Customer JOIN Invoice ON Customer.CustomerId = Invoice.CustomerId GROUP BY Customer.CustomerId, Customer.FirstName, Customer.LastName  ORDER BY Invoice.Total DESC Limit 5"
);
res.json(stmt.all());
});

app.listen(3000, () => {
console.log("Server running on http://localhost:3000");
});