import { NavLink, useNavigate } from "react-router-dom";
import "../../../client/dist/css/index.css";
const JoinRoom = () => { // index.html
    return (<>
        <div className="index">
            <h1>Got Scrum?</h1>
            <Form type="join" />
            <footer>
                <p>Create your own room for free here: <NavLink to={"/create-room"}>Create New Room</NavLink></p> 
            </footer>

        </div>
    </>);
}
const CreateRoom = () => { // create room page
    return (<>
        <div className="index">
            <h1>Create Room</h1>
            <Form type="create" />
            <footer>
                <p>Join a room for free here: <NavLink to={"/"}>Join Room</NavLink></p>
            </footer>
        </div>
    </>)
}
const Form = (props: { type: string; }) => { // type is either create or join
    let navigate = useNavigate();
    let action: string;
    let nameField: string;
    let UID: string;
    let buttonText: string;

    if (props.type == "join") {
        action = "/estimate";
        nameField = "Name:"
        buttonText = "Estimate!"
    } else if (props.type == "create") {
        action = "/";
        nameField = "Room Name:"
        buttonText = "Submit!"
    } else {
        return null;
    }
    
    return (
        <form onSubmit={(event) => {
            // event.preventDefault(); // Testing method to prevent page refresh on submit
            localStorage.setItem("UID", UID);
            console.log(localStorage.getItem("UID"));
            navigate(action);
        }}>
            <label htmlFor="name">{nameField}</label>
            <input type="text" id="name" name="name" onChange={event => {UID = event.target.value}}required/><br /><br />
            <label htmlFor="roomnum">Room ID:</label>
            <input type="text" id="roomnum" name="roomnum" required /><br /><br />
            <button type="submit">{buttonText}</button>
        </form>
    );
}
export default JoinRoom;
export { CreateRoom }