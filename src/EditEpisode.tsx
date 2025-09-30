import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage'
import {doc, getDoc, updateDoc} from 'firebase/firestore'
import {useNavigate, useParams} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'


function EditEpisodePage(){

    const auth = getAuth();
    const navigate = useNavigate();
    const {courseID, storyID, episodeID} = useParams();

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [buttonState, setButtonState] = useState(true);
    const [imageURL, setImageURL] = useState("");

    const uploadImg = async (course_id: string, story_id: string, episode_id: string) => {
        if (!imgFile) return null; // If no file is selected, return null
        const storage = getStorage();
        const storageRef = ref(storage, `course_img/${course_id}/${story_id}/${episode_id}`); // store under profile_pictures/<uid>
        await uploadBytes(storageRef, imgFile); // Upload the file
        const url = await getDownloadURL(storageRef);
        return url;
    };

    useEffect(()=>{
        async function grabData(){
            const getCourseData = courseID && await getDoc(doc(db, "course_db", courseID));
            const courseData = getCourseData && getCourseData.data();
            if (courseData){
                let story = courseData.stories.find((e:any)=>{return e.id === storyID});
                let episode = story.episodes.find((e:any)=>{return e.id === episodeID});
                setTitle(episode.title);
                setDesc(episode.description);
                setImageURL(episode.image);

                try {
                    const response = await fetch(story.image);
                    const imageBlob = await response.blob();
                    const fileObj = new File([imageBlob], `course_img/${courseID}/${storyID}`, { type: imageBlob.type });

                    setImgFile(fileObj);
                    console.log('File retrieved:', fileObj);
                }catch{
                    setImgFile(null);
                    console.log('error');
                };

            };
        };

        onAuthStateChanged(auth, (user)=>{
            if (user){
                console.log('Logged In');
                grabData();
            }else{
                navigate("/login");
            }
        });
    }, []);

    async function uploadCourse(){
        if(imgFile !== null){
            const url = courseID && storyID && episodeID && await uploadImg(courseID, storyID, episodeID);
            url && setImageURL(url);
        }
        
        let getInitialDoc = courseID && await getDoc(doc(db, "course_db", courseID));
        let initialDoc = getInitialDoc && getInitialDoc.data();
        let initialStoryList =  initialDoc && initialDoc.stories;
        let story = initialStoryList.find((e: any)=> {return e.id === storyID});
        let initialEpisodeList = story.episodes;

        let getEpisode = initialEpisodeList.find((e:any)=>{return e.id === episodeID});
        let questionList = getEpisode.questions
        let newList = initialEpisodeList.filter((e:any)=>{return e.id !== episodeID});

        newList.push({title: title, description: desc, image: imageURL, questions: questionList, id: episodeID});
        story.episodes = newList;

        let newStoryList = initialStoryList.filter((e:any)=>{return e.id !== storyID});
        newStoryList.push(story);
        courseID && await updateDoc(doc(db, "course_db", courseID), {stories: newStoryList});
        navigate(`/admin/${courseID}/${storyID}`);
    };

    function adjustButtonState(){
        let dataPool = [title, desc, imgFile];
        if (dataPool.includes("")){
            setButtonState(true);
        }else{
            setButtonState(false);
        }
    };


    return(
        <div className="createpage-body">
            <NavBar/>
            <div className="createpage-header">Editing this episode: {title}</div>
            <div className="createpage-entry-container">
                <div className="createpage-entry-field">
                    <div className="createpage-entry-field-name">Episode Title:</div>
                    <input className="createpage-entry-field-input" value={title} onChange={(e:any)=>{setTitle(e.target.value); adjustButtonState();}}/>
                </div>
                <div className="createpage-entry-field">
                    <div className="createpage-entry-field-name">Episode Description:</div>
                    <input className="createpage-entry-field-input" value={desc} onChange={(e:any)=>{setDesc(e.target.value); adjustButtonState();}}/>
                </div>
                <div className="createpage-entry-field">
                    <div className="createpage-entry-field-name">Episode Image:</div>
                    <input className="createpage-entry-field-input" type="file" onChange={(e)=> {
                            const file = e.target.files ? e.target.files[0] : null;
                            setImgFile(file);
                            adjustButtonState();
                    }}/>
                </div>
                <div className="createpage-entry-field-final">
                    <button className="createpage-entry-button" disabled={buttonState} onClick={async()=>{await uploadCourse()}}>Update Episode</button>
                </div>
            </div>
        </div>
    )
}

export default EditEpisodePage