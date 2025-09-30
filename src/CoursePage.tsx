import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {getDocs, collection} from 'firebase/firestore'
import {useNavigate} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'

function CoursePage(){
    const auth = getAuth();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState([{title: "Loading...", desc:"Loading...", id:"", image: "/placeholder_img.jpg"}]);

    useEffect(()=>{
        onAuthStateChanged(auth, (user)=>{
            if (user){
                console.log('Logged In')
            }else{
                navigate("/login")
            }
        });

        async function getCourseList(){

            let getCourseQuery = await getDocs(collection(db, "course_db"));
            let courseList = getCourseQuery.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title ?? "No Title",
                    desc: data.desc ?? "No Description",
                    image: data.image ?? "/placeholder_img.jpg"
                };
            });

            setCourseData(courseList);

        };

        getCourseList();
    }, [])

    return(
        <div className="coursepage-body">
            <NavBar/>
            <div className="coursepage-header">All of your courses in one spot</div>
            <div className="coursepage-list">
                {courseData.map((course)=>{
                    return(
                        <div className="coursepage-box" onClick={()=>{navigate(`/courses/${course.id}`)}}>
                            <div className="coursepage-box-title">{course.title}</div>
                            <hr className="coursepage-box-line"/>
                            <img className="coursepage-box-img" src={course.image}/>
                            <div className="coursepage-box-desc">{course.desc}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

};

export default CoursePage