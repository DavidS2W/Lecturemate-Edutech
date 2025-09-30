import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage'
import {setDoc, doc, getDoc} from 'firebase/firestore'
import {useNavigate, useParams} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'


function EditCoursePage(){

    const auth = getAuth();
    const navigate = useNavigate();
    const storage = getStorage();

    const {courseID} = useParams();

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [stories, setStories] = useState("");
    const [imageURL, setImageURL] = useState("");
    const [buttonState, setButtonState] = useState(true);

    const uploadImg = async (randomSeed: string) => {
        if (!imgFile) return null; // If no file is selected, return null
        const storageRef = ref(storage, `course_img/${randomSeed}`); // store under profile_pictures/<uid>
        await uploadBytes(storageRef, imgFile); // Upload the file
        const url = await getDownloadURL(storageRef);
        console.log(url); // Get the download URL
        return url;
    };

    useEffect(()=>{
        async function grabData(){
            const getCourseData = courseID && await getDoc(doc(db, "course_db", courseID));
            const courseData = getCourseData && getCourseData.data();
            if (courseData){
                setTitle(courseData.title);
                setDesc(courseData.desc);
                setStories(courseData.stories);
                setImageURL(courseData.image);
                try {
                    const response = await fetch(courseData.image);
                    const imageBlob = await response.blob();
                    const fileObj = new File([imageBlob], `course_img/${courseID}`, { type: imageBlob.type });

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
                console.log('Logged In')
                await grabData();
            }else{
                navigate("/login")
            }
        });


        
    }, [])

    async function uploadCourse(){
        if (courseID){
            if(imgFile !== null){
                let url = await uploadImg(courseID);
                url && setImageURL(url);
            }
            
            await setDoc(doc(db, "course_db", courseID), {title: title, desc: desc, image: imageURL, stories: stories, id: courseID});
            navigate(`/admin/`);
        }
    }

    function adjustButtonState(){
        let dataPool = [title, desc, imgFile];
        if (dataPool.includes("")){
            setButtonState(true);
        }else{
            setButtonState(false);
        }
    }


    return(
        <div className="createpage-body">
            <NavBar/>
            <div className="createpage-header">Editing this course {title}</div>
            <div className="createpage-entry-container">
                <div className="createpage-entry-field">
                    <div className="createpage-entry-field-name">Course Title:</div>
                    <input className="createpage-entry-field-input" value={title} onChange={(e:any)=>{setTitle(e.target.value); adjustButtonState();}}/>
                </div>
                <div className="createpage-entry-field">
                    <div className="createpage-entry-field-name">Course Description:</div>
                    <input className="createpage-entry-field-input" value={desc} onChange={(e:any)=>{setDesc(e.target.value); adjustButtonState();}}/>
                </div>
                <div className="createpage-entry-field">
                    <div className="createpage-entry-field-name">Course Image:</div>
                    <input className="createpage-entry-field-input" type="file" onChange={(e)=> {
                            const file = e.target.files ? e.target.files[0] : null;
                            setImgFile(file);
                            adjustButtonState();
                        }}/>
                </div>
                <div className="createpage-entry-field-final">
                    <button className="createpage-entry-button" disabled={buttonState} onClick={async()=>{await uploadCourse()}}>Update Course</button>
                </div>
            </div>
        </div>
    )
}

export default EditCoursePage