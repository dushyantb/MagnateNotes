package main

import (
	"log"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/contrib/static"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"flag"
)

type Note struct {
        NoteID string `bson:"noteID"`
        NoteData string `bson:"noteData"`
}

type postRequest struct {
    CollectionName     string `form:"collectionName"`
    NoteId string `form:"noteId"` 
    NoteData string `form:"noteData"`   
}

func main() {
	const uri = "<MONGODB URL>"
	session, err := mgo.Dial(uri)
	if err != nil {
		panic(err);
	}

	port := flag.String("port", "8080", "HTTP Port")
	flag.Parse();

	g := gin.Default()

	g.POST("/getNotes", func(c *gin.Context) {
		var noteRequest postRequest
		c.Bind(&noteRequest)

		log.Printf(noteRequest.CollectionName)

		result := []Note{}
		session.DB("").C(noteRequest.CollectionName).Find(nil).All(&result)
		
		c.JSON(200, result)
	})

	g.POST("/saveNote", func(c *gin.Context) {
		var noteRequest postRequest
		c.Bind(&noteRequest)

		err := session.DB("").C(noteRequest.CollectionName).Update(bson.M{"noteID": noteRequest.NoteId}, bson.M{"noteID": noteRequest.NoteId, "noteData": noteRequest.NoteData})
		  if err != nil {
		    err := session.DB("").C(noteRequest.CollectionName).Insert(&Note{noteRequest.NoteId, noteRequest.NoteData})
		    if err != nil {
		    	panic(err);	
		    }
		  }
	})

	g.POST("/deleteNote", func(c *gin.Context) {
		var noteRequest postRequest
		c.Bind(&noteRequest)

		session.DB("").C(noteRequest.CollectionName).Remove(bson.M{"noteID": noteRequest.NoteId})
	})

	g.Use(static.Serve("/", static.LocalFile("web", false)))
    g.Run(":"+ *port)
}