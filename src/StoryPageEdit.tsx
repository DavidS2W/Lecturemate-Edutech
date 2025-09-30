import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {doc, getDoc, setDoc} from 'firebase/firestore'
import {useNavigate, useParams} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'

function StoryPageEdit(){
    const {courseID} = useParams();
    const auth = getAuth();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState([{title: "Loading...", description:"Loading...", image: "/placeholder_img.jpg", id: "loading_item"}]);
    const [directory, setDirectory] = useState(["Loading"]);

    useEffect(()=>{

        async function getStoryList(){
            if (!courseID) {
                console.error("courseID is undefined");
                return;
            }

            let getStoryQuery = await getDoc(doc(db, "course_db", courseID));
            let course = getStoryQuery.data();
            course && console.log(course.stories);

            course && setCourseData(course.stories);
            course && setDirectory([course.title]);

        };

        onAuthStateChanged(auth, async(user)=>{
            if (user){
                console.log('Logged In');
                getStoryList();
            }else{
                navigate("/login")
            }
        });
    }, []);

    async function deleteCourse(id:string){
        let getStoryQuery = courseID && await getDoc(doc(db, "course_db", courseID));
        let storyData = getStoryQuery && getStoryQuery.data();

        let newList = courseData.filter((e:{id: string})=> {return e.id !== id});
        if(storyData){
            storyData.stories = newList;
        }

        courseID && storyData && await setDoc(doc(db, "course_db", courseID), storyData);
        setCourseData([...newList]);
    };

    return(
        <div className="coursepage-body">
            <NavBar/>
            <div className="coursepage-header"><a href={`/admin`}><b>{directory[0]}</b></a>   {'>'}   all stories</div>
            <div className="coursepage-edit-container">
                <button className="coursepage-edit-button" onClick={()=>{navigate(`/admin/create/${courseID}`);}}>+ New Story</button>
            </div>
            <div className="coursepage-list">
                {courseData.map((story)=>{
                    return(
                        <div className="coursepage-box">
                            <div className="coursepage-box-title" onClick={()=>{navigate(`/admin/${courseID}/${story.id}`)}}>{story.title}</div>
                            <hr className="coursepage-box-line" onClick={()=>{navigate(`/admin/${courseID}/${story.id}`)}}/>
                            <img className="coursepage-box-img" src={story.image} onClick={()=>{navigate(`/admin/${courseID}/${story.id}`)}}/>
                            <div className="coursepage-box-desc" onClick={()=>{navigate(`/admin/${courseID}/${story.id}`)}}>{story.description}</div>
                            <div className="coursepage-button-container">
                                <button className="coursepage-smalledit-button" onClick={()=>{navigate(`/admin/edit/${courseID}/${story.id}`)}}>Edit</button>
                                <button className="coursepage-smalledit-button" onClick={async()=>{await deleteCourse(story.id)}}>Delete</button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

};

export default StoryPageEdit