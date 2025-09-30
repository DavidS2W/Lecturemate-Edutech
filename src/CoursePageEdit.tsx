import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {getDocs, collection, doc, deleteDoc} from 'firebase/firestore'
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
            let getCourseQuery;

            getCourseQuery = await getDocs(collection(db, "course_db"));
            let courseList = getCourseQuery.docs.map(doc => {
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

    async function deleteCourse(id:string){
        await deleteDoc(doc(db, "course_db", id));
        let newList = courseData.filter((e:any)=> {return e.id !== id});
        setCourseData([...newList]);
    };

    return(
        <div className="coursepage-body">
            <NavBar/>
            <div className="coursepage-header">All of your courses in one spot</div>
            <div className="coursepage-edit-container">
                <button className="coursepage-edit-button" onClick={()=>{navigate("/admin/create")}}>+ New Course</button>
            </div>
            <div className="coursepage-list">
                {courseData.map((course)=>{
                    return(
                        <div className="coursepage-box">
                            <div className="coursepage-box-title" onClick={()=>{navigate(`/admin/${course.id}`)}}>{course.title}</div>
                            <hr className="coursepage-box-line"/>
                            <div className="coursepage-box-desc" onClick={()=>{navigate(`/admin/${course.id}`)}}>{course.desc}</div>
                            <img className="coursepage-box-img" onClick={()=>{navigate(`/admin/${course.id}`)}} src={course.image}/> 
                            <div className="coursepage-button-container">
                                <button className="coursepage-smalledit-button" onClick={()=>{navigate(`/admin/edit/${course.id}`)}}>Edit</button>
                                <button className="coursepage-smalledit-button" onClick={async()=>{await deleteCourse(course.id)}}>Delete</button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

};

export default CoursePage