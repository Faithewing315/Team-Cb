import ReactDOM from "react-dom/client";
import Estimation from "./estimation";
import "../../../client/dist/css/common.css"
import { BrowserRouter, Route, Routes } from "react-router-dom";
import JoinRoom, { CreateRoom } from "./home";
import { useEffect, useState } from "react";

const App = () => { // displays page based on functions and url
    
    const [uid, setUid] = useState("");
	const [clickUid, setClickUid] = useState("");
	const [allClick, setallClick] = useState("");
    const [ws, setWs] = useState({} as WebSocket);

    useEffect(() => {
        const connection = new WebSocket("ws://localhost:3030");
        connection.onopen = () => {
			console.log("connection opened to the server...");
		};
		// Handle error
		connection.onerror = () => {
			console.log("WS error");
		};
        // Handle server message
		connection.onmessage = (inMessage: any) => {
			console.log(inMessage.data);
			// Split message into underscores
			const messageParts: string[] = inMessage.data.split("_");
			// index 0 is message type
			const messageType = messageParts[0];
			switch (messageType) {
				case "connected":
					const storedUID = localStorage.getItem("UID")
					if (storedUID == null) {
						setUid("Unspecified");
					} else {
						setUid(storedUID);
					}
					// console.log("Testing");
					break;
				case "update":
					setClickUid(messageParts[1]);
					break;
				case "estimated":
					setallClick(messageParts[1]);
					break;
				default:
					break;
			}
		};
		setWs(connection);
    },[]);
    
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"> /* base url path */
                    <Route path="" element={<JoinRoom />} />
                    <Route path="create-room" element={<CreateRoom />} />
                    <Route path="estimate" element={<Estimation />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
};
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
