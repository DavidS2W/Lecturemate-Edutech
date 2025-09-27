import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage'
import {doc, getDoc, updateDoc, setDoc} from 'firebase/firestore'
import {useNavigate, useParams} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'


function CreateQuestionPage(){

    const auth = getAuth();
    const navigate = useNavigate();
    const {courseID, storyID, episodeID} = useParams();

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [subquestionTitle, setSubquestionTitle] = useState("");
    const [choice, setChoice] = useState({a: "", b: "", c:"", d:""});
    const [answer, setAnswer] = useState(0);
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [buttonState, setButtonState] = useState(true);
    const [buttonStateTwo, setButtonStateTwo] = useState(true);
    const [subquestions, setSubquestions] = useState<any[]>([]);

    const uploadImg = async (course_id: string, story_id: string, episode_id: string) => {
        if (!imgFile) return null; // If no file is selected, return null
        const storage = getStorage();
        const storageRef = ref(storage, `course_img/${course_id}/${story_id}/${episode_id}`); // store under profile_pictures/<uid>
        await uploadBytes(storageRef, imgFile); // Upload the file
        const url = await getDownloadURL(storageRef);
        return url;
    };

    useEffect(()=>{
        onAuthStateChanged(auth, (user)=>{
            if (user){
                console.log('Logged In');
            }else{
                navigate("/login");
            }
        });
    }, []);

    async function uploadCourse(){
        const questionID = title.toLowerCase().replace(/\s+/g, '_');
        const imageURL = courseID && storyID && episodeID && await uploadImg(courseID, storyID, episodeID);
        await setDoc(doc(db, "question_db", questionID), {content: desc, image:imageURL, title: title, question_list: subquestions, type:"mcq"});

        let getInitialDoc = courseID && await getDoc(doc(db, "course_db", courseID));
        let initialDoc = getInitialDoc && getInitialDoc.data();
        let initialStoryList =  initialDoc && initialDoc.stories;
        let story = initialStoryList.find((e: any) => e.id === storyID);
        console.log(story);
        let initialEpisodeList = story.episodes;
        let episode = initialEpisodeList.find((e:any)=>e.id === episodeID);
        let initialQuestionList = episode.questions;
        initialQuestionList.push(questionID);
        courseID && await updateDoc(doc(db, "course_db", courseID), {questions: initialQuestionList});
        navigate(`/admin/${courseID}/${storyID}/${episodeID}`);
    };

    function adjustButtonState(){
        let dataPool = [title, desc, imgFile];
        if (dataPool.includes("") || dataPool.includes(null)){
            setButtonState(true);
        }else{
            setButtonState(false);
        }
    };

    function adjustButtonStateTwo(){
        let dataPool = [subquestionTitle, choice.a, choice.b, choice.c, choice.d, answer];

        if (dataPool.includes("")){
            setButtonStateTwo(true);
        }else{
            setButtonStateTwo(false);
        }
    };

    function autoSetChoice(field:string, value:string){
        let prevState = choice;
        let newState = {
            ...prevState,
            [field] : value
        };

        setChoice(newState);
    };

    function addSubques(){
        let answerList = [choice.a, choice.b, choice.c, choice.d];
        let subquesData = {content: subquestionTitle, choices: answerList, answer: answerList[answer]};
        let initialList = subquestions;
        initialList.push(subquesData);
        setSubquestions(initialList);
    };

    return(
        <div className="createpage-body">
            <NavBar/>
            <div className="createpage-header">Create a new question</div>
            <div className="createpage-entry-container">
                <div className="createpage-entry-field">
                    <div className="createpage-entry-field-name">Question Title:</div>
                    <input className="createpage-entry-field-input" value={title} onChange={(e:any)=>{setTitle(e.target.value); adjustButtonState();}}/>
                </div>
                <div className="createpage-entry-field">
                    <div className="createpage-entry-field-name">Question content:</div>
                    <input className="createpage-entry-field-input" value={desc} onChange={(e:any)=>{setDesc(e.target.value); adjustButtonState();}}/>
                </div>
                <div className="createpage-entry-field">
                    <div className="createpage-entry-field-name">Question Image:</div>
                    <input className="createpage-entry-field-input" type="file" onChange={(e)=> {
                            const file = e.target.files ? e.target.files[0] : null;
                            setImgFile(file);
                            adjustButtonState();
                    }}/>
                </div>
                <hr className="createpage-line"/>
                
                <div className="createpage-addquestion-container">
                    <div className="createpage-entry-field"><div className="createpage-entry-field-name">Add subquestions</div></div>
                    <div className="createpage-entry-field">
                        <div className="createpage-entry-field-name">Question text:</div>
                        <input className="createpage-entry-field-input" value={subquestionTitle} onChange={(e:any)=>{setSubquestionTitle(e.target.value); adjustButtonStateTwo();}}/>
                    </div>
                    <div className="createpage-entry-field">
                        <div className="createpage-entry-field-name">   Choice A:</div>
                        <input className="createpage-entry-field-input" value={choice.a} onChange={(e:any)=>{autoSetChoice("a", e.target.value); adjustButtonStateTwo();}}/>
                    </div>
                    <div className="createpage-entry-field">
                        <div className="createpage-entry-field-name">   Choice B:</div>
                        <input className="createpage-entry-field-input" value={choice.b} onChange={(e:any)=>{autoSetChoice("b", e.target.value); adjustButtonStateTwo();}}/>
                    </div>
                    <div className="createpage-entry-field">
                        <div className="createpage-entry-field-name">   Choice C:</div>
                        <input className="createpage-entry-field-input" value={choice.c} onChange={(e:any)=>{autoSetChoice("c", e.target.value); adjustButtonStateTwo();}}/>
                    </div>
                    <div className="createpage-entry-field">
                        <div className="createpage-entry-field-name">   Choice D:</div>
                        <input className="createpage-entry-field-input" value={choice.d} onChange={(e:any)=>{autoSetChoice("d", e.target.value); adjustButtonStateTwo();}}/>
                    </div>
                    <div className="createpage-entry-field">
                        <div className="createpage-entry-field-name">Answer:</div>
                        <select
                            className="createpage-entry-dropdown"
                            value={answer}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setAnswer(val);
                            }}
                        >
                            <option value={0}>A</option>
                            <option value={1}>B</option>
                            <option value={2}>C</option>
                            <option value={3}>D</option>
                        </select>
                    </div>
                    <div className="createpage-entry-field-final">
                        <button className="createpage-entry-button" disabled={buttonStateTwo} onClick={async()=>{addSubques()}}>Add subquestion</button>
                    </div>
                </div>
                <div className="createpage-entry-field-final">
                    <button className="createpage-entry-button" disabled={buttonState} onClick={async()=>{await uploadCourse()}}>Create Question</button>
                </div>
            </div>
        </div>
    )
}

export default CreateQuestionPage