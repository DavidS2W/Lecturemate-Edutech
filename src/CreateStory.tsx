import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage'
import {doc, getDoc, updateDoc} from 'firebase/firestore'
import {useNavigate, useParams} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'


function CreateStoryPage(){

    const auth = getAuth();
    const navigate = useNavigate();
    const {courseID} = useParams();

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [buttonState, setButtonState] = useState(true);

    const uploadImg = async (course_id: string, story_id: string) => {
        if (!imgFile) return null; // If no file is selected, return null
        const storage = getStorage();
        const storageRef = ref(storage, `course_img/${course_id}/${story_id}`); // store under profile_pictures/<uid>
        await uploadBytes(storageRef, imgFile); // Upload the file
        const url = await getDownloadURL(storageRef);
        return url;
    };

    useEffect(()=>{
        onAuthStateChanged(auth, (user)=>{
            if (user){
                console.log('Logged In')
            }else{
                navigate("/login")
            }
        });
    }, [])

    async function uploadCourse(){
        const storyID = title.toLowerCase().replace(/\s+/g, '_');
        const imageURL = courseID && await uploadImg(courseID, storyID);
        let getInitialDoc = courseID && await getDoc(doc(db, "course_db", courseID));
        let initialDoc = getInitialDoc && getInitialDoc.data();
        let initialStoryList =  initialDoc && initialDoc.stories;
        initialStoryList.push({title: title, description: desc, image: imageURL, episodes: [], id: storyID});
        courseID && await updateDoc(doc(db, "course_db", courseID), {stories: initialStoryList});
        navigate(`/admin/create/${courseID}/${storyID}`);
    }

    function adjustButtonState(){
        let dataPool = [title, desc, imgFile];
        if (dataPool.includes("") || dataPool.includes(null)){
            setButtonState(true);
        }else{
            setButtonState(false);
        }
    }


    return(
        <div className="createpage-body">
            <NavBar/>
            <div className="createpage-header">Create a new story</div>
            <div className="createpage-entry-container">
                <div className="createpage-entry-field">
                    <div className="createpage-entry-field-name">Story Title:</div>
                    <input className="createpage-entry-field-input" value={title} onChange={(e:any)=>{setTitle(e.target.value); adjustButtonState();}}/>
                </div>
                <div className="createpage-entry-field">
                    <div className="createpage-entry-field-name">Story Description:</div>
                    <input className="createpage-entry-field-input" value={desc} onChange={(e:any)=>{setDesc(e.target.value); adjustButtonState();}}/>
                </div>
                <div className="createpage-entry-field">
                    <div className="createpage-entry-field-name">Story Image:</div>
                    <input className="createpage-entry-field-input" type="file" onChange={(e)=> {
                            const file = e.target.files ? e.target.files[0] : null;
                            setImgFile(file);
                            adjustButtonState();
                    }}/>
                </div>
                <div className="createpage-entry-field-final">
                    <button className="createpage-entry-button" disabled={buttonState} onClick={async()=>{await uploadCourse()}}>Create Story</button>
                </div>
            </div>
        </div>
    )
}

export default CreateStoryPage