// restful server
import path from "path";
import express, { Express, NextFunction, Request, Response } from "express"
import { UserStory } from "../js/UserStory";
import { CardDataAccess, EstimatedStoryDataAccess, StoryDataAccess } from "../db/dataAccess";
import { Card } from "../js/Cards";
import { HttpStatusCode } from "axios";
import WebSocket from "ws";

const app: Express = express();

//WebSocket server
const WSPort = 3030;
const RESTfulPort = 8080;

const wsServer = new WebSocket.Server({ port: WSPort }, () => {
    console.log("This sever is servething! Huzzah!");
});


class User {
    private uid: string;
    private hasVoted: boolean;

    constructor(newID: string, hasVoted: boolean) {
        this.uid = newID;
        this.hasVoted = false;
    }

    public setVote(hasVoted: boolean) {
        this.hasVoted = hasVoted;
    } 

    public getVote() {
        return this.hasVoted;
    }
}


let users: User[];

const Voted = () => {
    let hasEveryoneVoted = true;

    users.forEach((person) => {
        if (hasEveryoneVoted) {
            hasEveryoneVoted = person.getVote();
        }
    })

    if(hasEveryoneVoted) {
        
    }
}


// Observer Pattern
wsServer.on("connection", (socket: WebSocket) => {
    console.log("Client connected...");

    socket.on("message", (inMessage: string) => {
        console.log(`Message received: ${inMessage}`);
        const messageParts: string[] = String(inMessage).split("_");

        const messageType = messageParts[0];
        switch(messageType) {
            case "voted":
                const uid = messageParts[1];
                const voteValue = messageParts[2];
                console.log(uid);
                console.log(voteValue);
                // update user's status to have voted and thier vote number
                // voted();
                break;
            case "allClick":
                //if everyone clicked the same card then that value should be returned to all users
                wsServer.clients.forEach((inClient: WebSocket) => {
                    inClient.send(`estimated_${uid}`);
                });
                break;
        }
    })
    
    // Create unique identifier to the client
    const uid: string = `uid${new Date().getTime()}`;

    // construct connection message and return generated pid
    const message = `connected_${uid}`;
    console.log(message);
    
    // Send message to client through socket
    socket.send(message);
});






let storyCount = 0;
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "../../client/dist")));
app.use((inRequest: Request, inResponse: Response, inNext: NextFunction) => {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin, X-Requested-With.Content-Type,Accept");
    inNext();
});
app.get("/api/cards", async (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const cards: Card[] = await CardDataAccess.getDataAccess().getCards();
    inResponse.json(cards);
});

app.get("/api/storyQueue", async (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const stories: UserStory[] = await StoryDataAccess.getDataAccess().getStories();
    stories.forEach(story => { if (story.id! > storyCount) storyCount = story.id! + 1 })
    inResponse.json(stories);
});
app.get("/api/estimations", async (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const stories: UserStory[] = await EstimatedStoryDataAccess.getDataAccess().getStories();

    inResponse.json(stories);
})
app.post("/api/deleteStory", async (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const story: UserStory = inRequest.body;
    const numberRemoved: number = await StoryDataAccess.getDataAccess().removeStory(story);
})
app.get("/02beb6f43de7e44d0a24.ttf", (inRequest: Request, inResponse: Response) => {
    inResponse.sendFile(path.join(__dirname, "../../../client/dist/02beb6f43de7e44d0a24.ttf"));
});
app.get("/main.js", (inRequest: Request, inResponse: Response) => {
    inResponse.sendFile(path.join(__dirname, "../../../client/dist/main.js"));
});
app.get("/*", (inRequest: Request, inResponse: Response) => {
    inResponse.sendFile(path.join(__dirname, "../../../client/dist/index.html"));
});

app.post("/api/estimations", async (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const stories = await StoryDataAccess.getDataAccess().getStories();
    stories.sort((a, b) => a.id! - b.id!);
    const story = stories[0];
    if (story != null) {
        story.storyValues = (inRequest.body.value);
        const response: UserStory = await EstimatedStoryDataAccess.getDataAccess().addStory(story);
        StoryDataAccess.getDataAccess().removeStory(story);
        inResponse.json(response);
    } else [
        inResponse.sendStatus(HttpStatusCode.BadRequest)
    ]


});
app.post("/api/storyQueue/", async (inRequest: Request, inResponse: Response) => {
    inResponse.type("json");
    const initStory: UserStory = inRequest.body;
    const story: UserStory = await StoryDataAccess.getDataAccess().addStory(new UserStory(initStory.name, initStory.description, storyCount))
    storyCount++;
    inResponse.json(story);
});
app.listen(RESTfulPort, () => { console.log("Server at: http://localhost:" + RESTfulPort) });
