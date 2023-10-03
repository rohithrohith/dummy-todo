const express = require( 'express' )
const bodyParser = require( 'body-parser' )
const mysql = require( 'mysql2' )
const cors = require( 'cors' )
require( 'dotenv' ).config()
require( 'colors' )

const app = express()
const port = 3000

app.use( cors( {
    origin: "*"
} ) )

app.use( bodyParser.json() )

// MySQL database connection configuration
const db = mysql.createConnection( {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
} )


// Connect to the database
db.connect( err => {
    if ( err ) {
        console.log( `[Error] Error connecting to MySQL: ${err.message}`.red )
        return
    }
    console.log( '[MySQL] Connected to MySQL database'.gray )
} )

db.query( `
  CREATE TABLE IF NOT EXISTS todo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    todo_task VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT 0
  )
`, err => {
    if ( err ) {
        console.error( 'Error creating todos table:', err )
    }
} )

// GET all todos
app.get( '/todos', ( req, res ) => {
    db.query( 'SELECT * FROM todo', ( err, results ) => {
        if ( err ) {
            console.log( `[Error] Error retrieving todos: ${err.message}`.red )
            res.status( 500 ).json( { error: 'An error occurred' } )
            return
        }
        res.json( results )
    } )
} )

// POST a new todo
app.post( '/todos', ( req, res ) => {
    const newTodo = req.body
    db.query( 'INSERT INTO todo (todo_task) VALUES (?)', [newTodo.todo_task], ( err, results ) => {
        if ( err ) {
            console.log( `[Error] Error creating todo: ${err.message}`.red )
            res.status( 500 ).json( { error: 'An error occurred' } )
            return
        }
        newTodo.id = results.insertId
        res.status( 201 ).json( newTodo )
    } )
} )

// PUT (update) a todo by ID
app.put( '/todos/:id', ( req, res ) => {
    const id = parseInt( req.params.id )
    const updatedTodo = req.body
    db.query( 'UPDATE todo SET is_completed = ? WHERE id = ?', [!updatedTodo.is_completed, id], ( err, results ) => {
        if ( err ) {
            console.log( `[Error] Error updating todo: ${err.message}`.red )
            res.status( 500 ).json( { error: 'An error occurred' } )
            return
        }
        if ( results.affectedRows === 0 ) {
            res.status( 404 ).json( { message: 'Todo not found' } )
            return
        }
        res.json( updatedTodo )
    } )
} )

// DELETE a todo by ID
app.delete( '/todos/:id', ( req, res ) => {
    const id = parseInt( req.params.id )
    db.query( 'DELETE FROM todo WHERE id = ?', [id], ( err, results ) => {
        if ( err ) {
            console.log( `[Error] Error deleting todo: ${err.message}`.red )
            res.status( 500 ).json( { error: 'An error occurred' } )
            return
        }
        if ( results.affectedRows === 0 ) {
            res.status( 404 ).json( { message: 'Todo not found' } )
            return
        }
        console.log( `To-do with ID '${id}'deleted successfully`.gray )
        res.json( { message: 'Todo deleted successfully' } )
    } )
} )

app.listen( port, () => {
    console.log( `[server] Server is running on port ${port}`.cyan )
} )
