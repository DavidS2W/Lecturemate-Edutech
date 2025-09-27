import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {doc, getDoc} from 'firebase/firestore'
import {useNavigate, useParams} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'

function StoryPageEdit(){
    const {courseID} = useParams();
    const auth = getAuth();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState([{title: "Loading...", description:"Loading...", image: "/placeholder_img.jpg", id: "loading_item"}]);

    useEffect(()=>{
        onAuthStateChanged(auth, (user)=>{
            if (user){
                console.log('Logged In')
            }else{
                navigate("/login")
            }
        });

        async function getStoryList(){
            if (!courseID) {
                console.error("courseID is undefined");
                return;
            }
            let getStoryQuery;

            getStoryQuery = await getDoc(doc(db, "course_db", courseID));
            let course = getStoryQuery.data();

            course && setCourseData(course.stories);
            

        };

        getStoryList();
    }, [])

    return(
        <div className="coursepage-body">
            <NavBar/>
            <div className="coursepage-edit-container">
                <button className="coursepage-edit-button" onClick={()=>{navigate(`/admin/create/${courseID}`);}}>+ New Story</button>
            </div>
            <div className="coursepage-header">Explore these stories and learn some English on the side!</div>
            <div className="coursepage-list">
                {courseData.map((story)=>{
                    return(
                        <div className="coursepage-box" onClick={()=>{navigate(`/admin/${courseID}/${story.id}`)}}>
                            <div className="coursepage-box-title">{story.title}</div>
                            <hr className="coursepage-box-line"/>
                            <img className="coursepage-box-img" src={story.image}/>
                            <div className="coursepage-box-desc">{story.description}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

};

export default StoryPageEdit