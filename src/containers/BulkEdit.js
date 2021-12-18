import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { API } from "aws-amplify";
import { useHistory } from "react-router-dom";
import { onError } from "../libs/errorLib";
import LoaderButton from "../components/LoaderButton";
import "./BulkEdit.css";

export default function BulkEdit() {
  const history = useHistory();
  const [originalText, setOriginalText] = useState("");
  const [newText, setNewText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validateForm() {
    return originalText.length > 0 && newText.length > 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsLoading(true);
    try {
      await bulkTextReplace(originalText, newText)
      history.push("/");
    } catch (e) {
      // TODO: better error handling. What to do if only _some_ notes are successfully updated?
      onError(e);
      setIsLoading(false);
    }
  }

  async function bulkTextReplace(originalText, newText) {
    const notes = await API.get("notes", "/notes");
    const notesToUpdate = notes.filter(note => note.content.includes(originalText));

    await Promise.all(notesToUpdate.map(note => {
      note.content = note.content.replaceAll(originalText, newText);
      // Would ideally be PATCH but was getting CORS errors when testing -- save edited note uses PUT too :/
      return API.put("notes", `/notes/${note.noteId}`, {
        body: note
      });
    }))
  }

    return (
      <div className="BulkEdit">
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Control
              value={originalText}
              type="text"
              placeholder="Original text"
              onChange={(e) => setOriginalText(e.target.value)}
            />

            <Form.Control
              value={newText}
              type="text"
              placeholder="New text"
              onChange={(e) => setNewText(e.target.value)}
            />
            </Form.Group>

            <LoaderButton
              block
              type="submit"
              size="sm"
              variant="primary"
              isLoading={isLoading}
              disabled={!validateForm()}
            >
              Bulk Replace
            </LoaderButton>
          </Form>
        </div>
    );
}