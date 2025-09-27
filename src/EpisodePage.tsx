import { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {doc, getDoc} from 'firebase/firestore'
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

            let story = storiesList.find((e: any) => e.id === storyID);

            setTitle(story.title);
            setDesc(story.desc);

            story && setEpisodesData(story.episodes);
            

        };

        getEpisodeList();
    }, [])

    return(
        <div className="coursepage-body">
            <NavBar/>
            <div className="coursepage-header">{title}</div>
            <div className="coursepage-desc">{desc}</div>
            <div className="coursepage-list">
                {episodesData.map((episode)=>{
                    return(
                        <div className="coursepage-box" onClick={()=>{navigate(`/courses/${courseID}/${storyID}/${episode.id}`)}}>
                            <div className="coursepage-box-title">Ep{episodesData.indexOf(episode)+1}: {episode.title}</div>
                            <hr className="coursepage-box-line"/>
                            <img className="coursepage-box-img" src={episode.image}/>
                            <div className="coursepage-box-desc">{episode.description}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

};

export default EpisodePage