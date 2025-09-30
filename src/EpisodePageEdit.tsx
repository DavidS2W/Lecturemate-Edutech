import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {doc, getDoc, setDoc} from 'firebase/firestore'
import {useNavigate, useParams} from 'react-router-dom'
import NavBar from './assets/NavBar.tsx'
import db from './configuration.tsx'
import './App.css'

function EpisodePage(){
    const {courseID, storyID} = useParams();
    const auth = getAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState("Loading..."); 
    const [desc, setDesc] = useState("Loading...");
    const [episodesData, setEpisodesData] = useState([{title: "Loading...", description:"Loading...", image: "/placeholder_img.jpg", id: "loading_id", questions: []}]);
    const [directory, setDirectory] = useState(["Loading", "Loading"]);

    useEffect(()=>{
        onAuthStateChanged(auth, (user)=>{
            if (user){
                console.log('Logged In')
            }else{
                navigate("/login")
            }
        });

        async function getEpisodeList(){
            if (!courseID || !storyID) {
                console.error("courseID or storyID is undefined");
                return;
            }
            let getEpisodeQuery;

            getEpisodeQuery = await getDoc(doc(db, "course_db", courseID));
            let course = getEpisodeQuery.data();

            let storiesList = course && course.stories;

            let story = storiesList.find((e: any) => {return e.id === storyID});

            setTitle(story.title);
            setDesc(story.desc);

            story && setEpisodesData(story.episodes);
            course && setDirectory([course.title, story.title]);

        };

        getEpisodeList();
    }, []);

    async function deleteCourse(id: string){
        let getCourseData = courseID && await getDoc(doc(db, "course_db", courseID));
        let courseData = getCourseData && getCourseData.data();

        let story = courseData && courseData.stories.find((e:any)=>{return e.id === storyID});
        let newEpisodeList = story.episodes.filter((e:any)=>{return e.id !== id});
        let newStoryList = courseData && courseData.stories.filter((e:any)=>{return e.id !== storyID});

        story.episodes = newEpisodeList;
        newStoryList.push(story);
        courseID && await setDoc(doc(db, "course_db", courseID), {stories: newStoryList}, {merge: true});
        setEpisodesData(newEpisodeList);

    };

    return(
        <div className="coursepage-body">
            <NavBar/>
            <div className="coursepage-header"><a href={`/admin`}><b>{directory[0]}</b></a> {'>'} <a href={`/admin/${courseID}`}><b>{directory[1]}</b></a> {'>'} all episodes</div>
            <div className="coursepage-edit-container">
                <button className="coursepage-edit-button" onClick={()=>{navigate(`/admin/create/${courseID}/${storyID}`);}}>+ New Episode</button>
            </div>
            <div className="coursepage-desc">{desc}</div>
            <div className="coursepage-list">
                {episodesData.map((episode)=>{
                    return(
                        <div className="coursepage-box">
                            <div className="coursepage-box-title" onClick={()=>{navigate(`/admin/${courseID}/${storyID}/${episode.id}`)}}>Ep{episodesData.indexOf(episode)+1}: {episode.title}</div>
                            <hr className="coursepage-box-line" onClick={()=>{navigate(`/admin/${courseID}/${storyID}/${episode.id}`)}}/>
                            <img className="coursepage-box-img" src={episode.image} onClick={()=>{navigate(`/admin/${courseID}/${storyID}/${episode.id}`)}}/>
                            <div className="coursepage-box-desc" onClick={()=>{navigate(`/admin/${courseID}/${storyID}/${episode.id}`)}}>{episode.description}</div>
                            <div className="coursepage-button-container">
                                <button className="coursepage-smalledit-button" onClick={()=>{navigate(`/admin/edit/${courseID}/${storyID}/${episode.id}`)}}>Edit</button>
                                <button className="coursepage-smalledit-button" onClick={async()=>{await deleteCourse(episode.id)}}>Delete</button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

};

export default EpisodePage