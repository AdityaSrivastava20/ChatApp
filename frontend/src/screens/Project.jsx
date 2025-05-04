import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios.js";
import { initializeSocket, sendMessage } from "../config/socket.js";
import { UserContext } from "../context/user.context.jsx";

const Project = () => {
  const location = useLocation();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const { user } = useContext(UserContext);
  const messageBoxRef = useRef(null);
  const socketRef = useRef(null);

  const handleUserClick = (id) => {
    setSelectedUserId((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addCollaborators = () => {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
      })
      .catch((err) => console.log(err));
  };

  const send = () => {
    if (!message.trim()) return;

    const newMessage = {
      message,
      sender: user.email,
    };
    sendMessage("project-message", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  useEffect(() => {
    socketRef.current = initializeSocket(project._id);

    const messageHandler = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socketRef.current.on("project-message", messageHandler);

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => setProject(res.data.project));

    axios
      .get("/users/all")
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.log(err));

    return () => {
      socketRef.current.off("project-message", messageHandler);
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="h-screen w-screen flex">
      <section className="left relative flex flex-col h-full min-w-80 bg-slate-300">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100">
          <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
            <i className="ri-add-fill m-1"></i>
            <p>Add Collaborator</p>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2"
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col overflow-hidden">
          <div
            ref={messageBoxRef}
            className="message-box p-2 flex-grow flex flex-col gap-2 overflow-y-auto scrollbar-hidden"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message break-words max-w-56 flex flex-col p-2 w-fit rounded-md ${
                  msg.sender === user.email
                    ? "ml-auto bg-blue-50 text-right"
                    : "bg-white"
                }`}
              >
                <small className="opacity-65 text-xs">{msg.sender}</small>
                <p className="text-sm">{msg.message}</p>
              </div>
            ))}
          </div>

          <div className="inputField w-full flex">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              className="p-2 px-4 border-none outline-none flex-grow"
              type="text"
              placeholder="Enter Message"
            />
            <button onClick={send} className="px-5 bg-slate-950 text-white">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div
          className={`sidePanel flex flex-col gap-2 fixed top-0 left-0 h-full min-w-80 bg-slate-200 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <header className="flex justify-between items-center font-serif font-semibold p-2 px-3 bg-slate-300">
            <h1>Collaborators</h1>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="black-white text-3xl hover:text-gray-600"
            >
              &times;
            </button>
          </header>

          <div className="users flex flex-col gap-2 overflow-y-auto p-2">
            {project.users &&
              project.users.map((user) => (
                <div
                  key={user._id}
                  className="user cursor-pointer hover:bg-slate-300 p-2 flex gap-2 items-center"
                >
                  <div className="aspect-square rounded-full p-5 w-fit h-fit flex items-center justify-center text-white bg-slate-600">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-semibold text-lg">{user.email}</h1>
                </div>
              ))}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
                <i className="ri-close-fill"></i>
              </button>
            </header>

            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`user cursor-pointer hover:bg-slate-200 ${
                    selectedUserId.has(user._id) ? "bg-slate-200" : ""
                  } p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-semibold text-lg">{user.email}</h1>
                </div>
              ))}
            </div>

            <button
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
