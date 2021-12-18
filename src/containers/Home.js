import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { Link } from "react-router-dom";
import { BsPencilSquare, BsPaperclip } from "react-icons/bs";
import ListGroup from "react-bootstrap/ListGroup";
import { LinkContainer } from "react-router-bootstrap";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import "./Home.css";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }

      try {
        const notes = await loadNotes();
        setNotes(notes);
      } catch (e) {
        onError(e);
      }

      setIsLoading(false);
    }

    onLoad();
  }, [isAuthenticated]);

  function loadNotes() {
    return API.get("notes", "/notes");
  }

  function renderNotesList(notes) {
    return (
      <>
        <LinkContainer to="/notes/new">
          <ListGroup.Item action className="py-3 text-nowrap text-truncate">
            <BsPencilSquare size={17} />
            <span className="ml-2 font-weight-bold">Create a new note</span>
          </ListGroup.Item>
        </LinkContainer>
        {notes.map(renderNoteItem)}
      </>
    );
  }

  function renderNoteItem(note) {
    const attachment = note.attachment ? <BsPaperclip/> : null;
    return (
      <LinkContainer key={note.noteId} to={`/notes/${note.noteId}`}>
        <ListGroup.Item action>
            <span className="font-weight-bold">
              {note.content}
            </span>
          <br />
          <span className="text-muted">
              Created: {new Date(note.createdAt).toLocaleString()}
            </span>
          <span className="attachment">
                {attachment}
            </span>
        </ListGroup.Item>
      </LinkContainer>
    )
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p className="text-muted">A simple note taking app</p>
        <div className="pt-3">
          <Link to="/login" className="btn btn-info btn-lg mr-3">
            Login
          </Link>
          <Link to="/signup" className="btn btn-success btn-lg">
            Signup
          </Link>
        </div>
      </div>
    );
  }

  function renderNotes() {

    // Simple case-sensitive search. As search gets more complicated (i.e fuzzy search)
    // might be better to extract logic out. If notes is large and performance is slow, consider
    // only searching as a from rather than on keypress and then eventually delegating search to backend.
    const notesToRender = searchTerm.trim() === "" ? notes : notes.filter(note => note.content.includes(searchTerm))

    return (
      <div className="notes">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>
        <div className="search">
          <input placeholder="Search Text" onChange={event => setSearchTerm(event.target.value)} />
        </div>
        <ListGroup>{!isLoading && renderNotesList(notesToRender)}</ListGroup>
      </div>
    );
  }

  return (
    <div className="Home">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
}
