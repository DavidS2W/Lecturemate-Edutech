import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage'
import {doc, getDoc, setDoc} from 'firebase/firestore'
import {useNavigate, useParams} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'


function EditQuestionPage(){

    const auth = getAuth();
    const navigate = useNavigate();
    const {courseID, storyID, episodeID, questionID} = useParams();

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [subquestionTitle, setSubquestionTitle] = useState("");
    const [choice, setChoice] = useState({a: "", b: "", c:"", d:""});
    const [answer, setAnswer] = useState(0);
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [imageURL, setImageURL] = useState("");
    const [buttonState, setButtonState] = useState(true);
    const [buttonStateTwo, setButtonStateTwo] = useState(true);
    const [buttonText, setButtonText] = useState("Add subquestion");
    const [subquestions, setSubquestions] = useState<{content: string, choices: string[], id:string, answer:string}[]>([]);
    const [subquestionID, setSubquestionID] = useState("");


    const uploadImg = async (course_id: string, story_id: string, episode_id: string, question_id:string) => {
        if (!imgFile) return null; // If no file is selected, return null
        const storage = getStorage();
        const storageRef = ref(storage, `course_img/${course_id}/${story_id}/${episode_id}/${question_id}`); // store under profile_pictures/<uid>
        await uploadBytes(storageRef, imgFile); // Upload the file
        const url = await getDownloadURL(storageRef);
        return url;
    };

    useEffect(()=>{
        async function grabData(){
            const getQuestionData = questionID && await getDoc(doc(db, "question_db", questionID));
            const questionData = getQuestionData && getQuestionData.data();

            if (questionData){
                setTitle(questionData.title);
                setDesc(questionData.content);
                setImageURL(questionData.image);
                setSubquestions(questionData.question_list);

                try {
                    const response = await fetch(questionData.image);
                    const imageBlob = await response.blob();
                    const fileObj = new File([imageBlob], `course_img/${courseID}/${storyID}/${episodeID}/${questionID}`, { type: imageBlob.type });

                    setImgFile(fileObj);
                    console.log('File retrieved:', fileObj);
                }catch{
                    setImgFile(null);
                    console.log('error');
                };

            };
        };

        onAuthStateChanged(auth, async(user)=>{
            if (user){
                console.log('Logged In');
                await grabData();
            }else{
                navigate("/login");
            }
        });
    }, []);

    interface QuestionData {
        content: string;
        image: string;
        title: string;
        question_list: {content: string, choices: string[], id:string, answer:string}[];  // Refine to your shape
        type: string;
    }

    async function uploadCourse(){
        const url = courseID && storyID && episodeID && questionID && await uploadImg(courseID, storyID, episodeID, questionID);
        url && setImageURL(url);
        const questionData: QuestionData = {
            content: desc,
            image: imageURL ?? "/placeholder_img.jpg",
            title: title,
            question_list: subquestions ?? [],
            type: "mcq"
        };

        questionID && await setDoc(doc(db, "question_db", questionID), questionData);
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

    function generateRandomString(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 7; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    function editSubques(id: string){
        let subquesData = subquestions.find((e:any)=>{return e.id === id});
        if(subquesData){
            setSubquestionTitle(subquesData.content);
            let choices: string[] = subquesData.choices;
            setChoice({a: choices[0], b: choices[1], c: choices[2], d: choices[3]});
            console.log(choices);
            console.log(subquesData.answer)
            let answerIndex = choices.indexOf(subquesData.answer);
            console.log(answerIndex);
            setAnswer(answerIndex);
            setSubquestionID(id);
            setButtonText("Update subquestion");
        }
        
    };

    function addSubques(){
        if (buttonText !== "Update subquestion"){
            let randomSeed = generateRandomString();
            let answerList = [choice.a, choice.b, choice.c, choice.d];
            let subquesData = {content: subquestionTitle, choices: answerList, answer: answerList[answer], id:randomSeed};
            setSubquestions(prev => {
            const next = [...prev, subquesData];
            return next;
            });
        }else{
            let index = subquestions.findIndex((e:any) => e.id === subquestionID);
            let initialList = subquestions.filter((e:any)=>{return e.id !== subquestionID});
            let answerList = [choice.a, choice.b, choice.c, choice.d];
            let subquesData = {content: subquestionTitle, choices: answerList, answer: answerList[answer], id:subquestionID};
            if (index === 0){
                initialList.splice(0, 0, subquesData);
            }else{
                initialList.splice(index, 0, subquesData);
            }

            setSubquestions([...initialList]);
            setSubquestionID("");
            setButtonText("Add question");
            setSubquestionTitle("");
            setChoice({a:"", b:"", c:"", d:""});
            setAnswer(0);
        }
    };

    function deleteSubques(id:string){
        let newList = subquestions.filter((e:any)=>{return e.id !== id});
        setSubquestions([...newList]);
    }

    return(
        <div className="createpage-body">
            <NavBar/>
            <div className="createpage-header">Editing this question</div>
            <div className="createpage-createquestion-container">
                <div className="createpage-left">
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
                                <button className="createpage-entry-button" disabled={buttonStateTwo} onClick={async()=>{addSubques()}}>{buttonText}</button>
                            </div>
                        </div>
                        <div className="createpage-entry-field-final">
                            <button className="createpage-entry-button" disabled={buttonState} onClick={async()=>{await uploadCourse()}}>Create Question</button>
                        </div>
                    </div>
                </div>
                <div className="createpage-right">
                    <div className="createpage-subquestion-listcontainer">
                        <div className="createpage-entry-field-name">Subquestions added</div>
                        {subquestions.map((e:any, index)=>{
                            return(
                            <div className="createpage-subquestion-list" key={index}>
                                <div className="createpage-subquestion-list-text">{index+1}. {e.content}</div>
                                <div className="createpage-subquestion-list-buttoncontainer">
                                    <button className="createpage-subquestion-list-button" onClick={()=>{editSubques(e.id)}}>Edit</button>
                                    <button className="createpage-subquestion-list-button" onClick={()=>{deleteSubques(e.id)}}>Delete</button>
                                </div>
                            </div>)
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditQuestionPage